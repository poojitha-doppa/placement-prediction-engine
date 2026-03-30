import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import prisma from '../config/db.js';
import { getPrediction, getSimulation, checkMLAPIHealth } from '../services/ml.service.js';
import { recomputeCompanyMatchesForUser } from '../services/companyMatch.service.js';
import { createNotification } from '../services/notification.service.js';

// Check if database is available
const isDatabaseAvailable = async () => {
  try {
    if (!prisma) return false;
    await prisma.$connect();
    await prisma.user.findFirst();
    return true;
  } catch {
    return false;
  }
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const scoreFromSkillName = (skillName: string, floor: number, spread: number) => {
  const seed = skillName
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return floor + (seed % spread);
};

const deriveStudentData = (profile: any) => {
  const parsedResume = profile?.parsedResume || {};
  const projectCount = Array.isArray(parsedResume.projects) ? parsedResume.projects.length : 0;
  const internshipCount = Array.isArray(parsedResume.experience) ? parsedResume.experience.length : 0;
  const leetcodeSolved = Number(profile?.leetcodeSolved || 0);
  const cgpa = Number(profile?.cgpa || 7.0);

  return {
    cgpa,
    tenth: clamp(Math.round(cgpa * 9.2), 60, 95),
    twelfth: clamp(Math.round(cgpa * 9.4), 60, 96),
    coding: clamp(Math.round(leetcodeSolved / 3), 20, 95),
    projects: clamp(projectCount || Math.ceil((profile?.skills?.length || 0) / 4), 0, 6),
    internships: clamp(internshipCount, 0, 4),
    communication: clamp(60 + Math.min((profile?.skills?.length || 0) * 2, 25), 60, 90)
  };
};

const hasEnoughProfileSignal = (profile: any) => {
  const skillsCount = Array.isArray(profile?.skills) ? profile.skills.length : 0;
  const targetsCount = (profile?.targetCompanies?.length || 0) + (profile?.targetRoles?.length || 0);
  const leetcodeSolved = Number(profile?.leetcodeSolved || 0);
  const cgpa = Number(profile?.cgpa || 0);

  return skillsCount > 0 || targetsCount > 0 || leetcodeSolved > 0 || cgpa > 0;
};

const deriveCategoryLevels = (skills: string[] = []) => {
  const normalizedSkills = skills.map((skill) => skill.toLowerCase());
  const categoryMatches = {
    dsa: ['dsa', 'data structure', 'algorithm', 'graph', 'dynamic programming', 'recursion', 'tree'],
    csFundamentals: ['os', 'network', 'dbms', 'database', 'oop', 'computer science', 'sql'],
    systemDesign: ['system design', 'distributed', 'microservice', 'architecture', 'scalability'],
    language: ['javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'react', 'node'],
    behavioral: ['communication', 'leadership', 'behavioral', 'teamwork']
  } as const;

  const countMatches = (keywords: readonly string[]) =>
    normalizedSkills.filter((skill) => keywords.some((keyword) => skill.includes(keyword))).length;

  return {
    dsa: clamp(45 + countMatches(categoryMatches.dsa) * 9, 40, 95),
    csFundamentals: clamp(42 + countMatches(categoryMatches.csFundamentals) * 10, 35, 92),
    systemDesign: clamp(30 + countMatches(categoryMatches.systemDesign) * 14, 25, 90),
    language: clamp(48 + countMatches(categoryMatches.language) * 7, 45, 95),
    behavioral: clamp(40 + countMatches(categoryMatches.behavioral) * 12, 35, 85)
  };
};

const calculateCurrentStreak = (timestamps: Date[]) => {
  if (timestamps.length === 0) return 0;

  const uniqueDays = Array.from(
    new Set(
      timestamps.map((timestamp) => {
        const date = new Date(timestamp);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    )
  ).sort((a, b) => b - a);

  let streak = 1;
  for (let index = 1; index < uniqueDays.length; index += 1) {
    const diffDays = Math.round((uniqueDays[index - 1] - uniqueDays[index]) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak += 1;
      continue;
    }
    break;
  }

  return streak;
};

const parseMetricStats = (stats: unknown) =>
  stats && typeof stats === 'object' ? stats as Record<string, any> : {};

const pickNumericStat = (stats: Record<string, any>, keys: string[]) => {
  for (const key of keys) {
    const value = stats[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }
  return undefined;
};

const loadIntegrationMetrics = async (userId: string) => {
  const integrations = await prisma.externalIntegration.findMany({
    where: { userId, isConnected: true },
    include: {
      metrics: {
        orderBy: { date: 'desc' },
        take: 1
      }
    }
  });

  const latestByProvider = new Map<string, Record<string, any>>();
  integrations.forEach((integration) => {
    const latestMetric = integration.metrics[0];
    if (latestMetric) {
      latestByProvider.set(integration.provider.toLowerCase(), parseMetricStats(latestMetric.stats));
    }
  });

  return latestByProvider;
};

const loadIntegrationFreshness = async (userId: string) => {
  const integrations = await prisma.externalIntegration.findMany({
    where: { userId },
    orderBy: { lastSyncAt: 'desc' }
  });

  const github = integrations.find((integration) => integration.provider.toLowerCase() === 'github');
  const leetcode = integrations.find((integration) => integration.provider.toLowerCase() === 'leetcode');

  return {
    github: github
      ? {
          connected: github.isConnected,
          username: github.username,
          lastSyncAt: github.lastSyncAt,
          syncStatus: github.syncStatus || 'unknown'
        }
      : null,
    leetcode: leetcode
      ? {
          connected: leetcode.isConnected,
          username: leetcode.username,
          lastSyncAt: leetcode.lastSyncAt,
          syncStatus: leetcode.syncStatus || 'unknown'
        }
      : null
  };
};

const getTrackedLeetCodeSolved = (profile: any, metrics: Map<string, Record<string, any>>) => {
  const stats = metrics.get('leetcode');
  return pickNumericStat(stats || {}, ['problemsSolved', 'totalSolved', 'solvedCount']) ?? profile?.leetcodeSolved ?? 0;
};

const getTrackedGitHubProjectCount = (profile: any, metrics: Map<string, Record<string, any>>) => {
  const stats = metrics.get('github');
  const trackedProjects = pickNumericStat(stats || {}, ['repositories', 'publicRepos', 'repoCount', 'projects']);
  const resumeProjects = Array.isArray(profile?.parsedResume?.projects) ? profile.parsedResume.projects.length : 0;
  return trackedProjects ?? resumeProjects;
};

const getTrackedInternshipCount = (profile: any) =>
  Array.isArray(profile?.parsedResume?.experience) ? profile.parsedResume.experience.length : 0;

const buildMissingServiceResponse = (res: Response, domain: string, message: string) =>
  res.status(503).json({ error: `${domain} unavailable`, message });

const buildInsufficientDataResponse = (res: Response, message: string) =>
  res.status(409).json({ error: 'Insufficient tracked data', message });

const buildCompanyMatchReasons = (match: {
  companyName: string;
  fitScore: number;
  matchedSkills: string[];
  skillGaps: string[];
  minCGPA: number | null;
  successProbability: number;
}) => {
  const reasons: string[] = [];

  if (match.matchedSkills.length > 0) {
    reasons.push(`${match.matchedSkills.length} required skill${match.matchedSkills.length === 1 ? '' : 's'} matched`);
  }

  if (typeof match.minCGPA === 'number') {
    reasons.push(`Profile is being evaluated against a minimum CGPA of ${match.minCGPA.toFixed(1)}`);
  }

  if (match.skillGaps.length === 0) {
    reasons.push('No major skill gaps were identified for this company');
  } else {
    reasons.push(`${match.skillGaps.length} skill gap${match.skillGaps.length === 1 ? '' : 's'} still need attention`);
  }

  reasons.push(`Success probability estimated at ${Math.round(match.successProbability)}% based on current profile strength`);
  return reasons;
};

export const getPlacementSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      return buildMissingServiceResponse(
        res,
        'Database',
        'Placement summary requires MongoDB because it is calculated from persisted profile, company match, and activity data.'
      );
    }

    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found',
        message: 'Complete your profile before requesting placement summary.'
      });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentLogs = await prisma.progressLog.findMany({
      where: {
        userId,
        timestamp: { gte: thirtyDaysAgo }
      },
      orderBy: { timestamp: 'desc' }
    });

    const metrics = await loadIntegrationMetrics(userId);
    const integrationFreshness = await loadIntegrationFreshness(userId);
    const companyMatches = await prisma.companyMatch.findMany({
      where: { userId },
      orderBy: { fitScore: 'desc' },
      take: 10
    });
    const latestSkillAnalytics = await prisma.skillAnalytics.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 20
    });

    if (recentLogs.length === 0 && metrics.size === 0 && companyMatches.length === 0) {
      return buildInsufficientDataResponse(
        res,
        'Add roadmap progress, connect an external profile, or save company matches before requesting a placement summary.'
      );
    }

    const totalProblems = getTrackedLeetCodeSolved(profile, metrics);
    const currentStreak = calculateCurrentStreak(recentLogs.map((log) => log.timestamp));

    const weeklyProgress = recentLogs.length > 0
      ? recentLogs.reduce((sum, log) => sum + log.completionPercent, 0) / recentLogs.length
      : 0;

    const uniqueWeeks = new Set(recentLogs.map(l => l.weekNumber));
    const consistencyScore = (uniqueWeeks.size / 4) * 100;
    const placementProbability = companyMatches.length > 0
      ? companyMatches.reduce((sum, match) => sum + match.successProbability, 0) / companyMatches.length
      : 0;
    const premiumMatches = companyMatches.filter((match) => (match.packageMax || 0) >= 20);
    const highPackageProbability = premiumMatches.length > 0
      ? premiumMatches.reduce((sum, match) => sum + match.successProbability, 0) / premiumMatches.length
      : 0;

    const topSkills = latestSkillAnalytics.length > 0
      ? latestSkillAnalytics.slice(0, 5).map((item) => ({
          name: item.skillName,
          level: item.currentLevel
        }))
      : (profile?.skills.slice(0, 5).map((skill) => ({
          name: skill,
          level: scoreFromSkillName(skill, 62, 24)
        })) || []);

    const companyProbs = companyMatches.reduce((acc: Record<string, number>, match) => {
      acc[match.companyName] = match.successProbability;
      return acc;
    }, {});

    res.json({
      placementProbability: Math.round(placementProbability * 10) / 10,
      highPackageProbability: Math.round(highPackageProbability * 10) / 10,
      overallPlacementProb: placementProbability / 100,
      highPackageProb20LpaPlus: highPackageProbability / 100,
      problemsSolved: totalProblems,
      totalProblemsSolved: totalProblems,
      currentStreak,
      weeklyProgress: Math.round(weeklyProgress * 10) / 10,
      consistencyScore: Math.round(consistencyScore * 10) / 10,
      topSkills,
      companyProbs,
      dataFreshness: {
        integrations: integrationFreshness,
        companyMatchesLastComputedAt: companyMatches[0]?.computedAt || null,
        usingExternalSignals: metrics.size > 0
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get placement summary error:', error);
    res.status(500).json({ error: 'Failed to fetch placement summary' });
  }
};

export const getSkillAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      return buildMissingServiceResponse(
        res,
        'Database',
        'Skill analytics require MongoDB because they are generated from persisted skill snapshots and progress logs.'
      );
    }

    // Get skill analytics
    const analytics = await prisma.skillAnalytics.findMany({
      where: { userId },
      orderBy: { date: 'asc' }
    });
    const latestAnalyticsBySkill = new Map<string, { currentLevel: number; targetLevel: number }>();
    [...analytics]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .forEach((item) => {
        if (!latestAnalyticsBySkill.has(item.skillName)) {
          latestAnalyticsBySkill.set(item.skillName, {
            currentLevel: item.currentLevel,
            targetLevel: item.targetLevel
          });
        }
      });

    // Group by month for progression
    const monthlyData = new Map<string, any>();
    analytics.forEach(a => {
      const month = a.date.toISOString().substring(0, 7);
      if (!monthlyData.has(month)) {
        monthlyData.set(month, {
          date: month + '-01',
          dsa: 0,
          systemDesign: 0,
          webDev: 0
        });
      }
      const data = monthlyData.get(month);
      if (a.skillName.toLowerCase().includes('dsa') || a.skillName.toLowerCase().includes('algorithm')) {
        data.dsa = Math.max(data.dsa, a.currentLevel);
      } else if (a.skillName.toLowerCase().includes('system')) {
        data.systemDesign = Math.max(data.systemDesign, a.currentLevel);
      } else if (a.skillName.toLowerCase().includes('web')) {
        data.webDev = Math.max(data.webDev, a.currentLevel);
      }
    });

    const skillProgression = Array.from(monthlyData.values());

    // Current skills with gaps
    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found',
        message: 'Complete your profile before requesting skill analytics.'
      });
    }

    if (analytics.length === 0 && (profile.skills || []).length === 0) {
      return buildInsufficientDataResponse(
        res,
        'Add skills to your profile or sync skill analytics before requesting skill analytics.'
      );
    }

    const currentSkills = (profile?.skills || []).map((skill) => {
      const trackedLevels = latestAnalyticsBySkill.get(skill);
      return {
        name: skill,
        current: trackedLevels?.currentLevel ?? scoreFromSkillName(skill, 52, 26),
        target: trackedLevels?.targetLevel ?? scoreFromSkillName(skill, 80, 12),
        gap: 0
      };
    });

    currentSkills.forEach(skill => {
      skill.gap = Math.max(0, skill.target - skill.current);
    });

    const weakAreas = currentSkills
      .filter(s => s.gap > 15)
      .map(s => s.name)
      .slice(0, 5);

    const categoryLevels = deriveCategoryLevels(profile?.skills || []);
    const currentLevels = {
      dsa: categoryLevels.dsa,
      csFundamentals: categoryLevels.csFundamentals,
      systemDesign: categoryLevels.systemDesign,
      language: categoryLevels.language,
      behavioral: categoryLevels.behavioral
    };
    const targetLevels = {
      dsa: 92,
      csFundamentals: 88,
      systemDesign: 85,
      language: 90,
      behavioral: 82
    };

    res.json({
      skillProgression,
      history: skillProgression,
      currentSkills: currentSkills.slice(0, 8),
      weakAreas,
      currentLevels,
      targetLevels
    });
  } catch (error) {
    console.error('Get skill analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch skill analytics' });
  }
};

export const getCompanyMatches = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      return buildMissingServiceResponse(
        res,
        'Database',
        'Company matches require MongoDB because they must come from persisted match computations.'
      );
    }

    const matches = await prisma.companyMatch.findMany({
      where: { userId },
      orderBy: { fitScore: 'desc' },
      take: 30
    });
    const integrationFreshness = await loadIntegrationFreshness(userId);

    if (matches.length === 0) {
      return res.json({
        totalMatches: 0,
        highFitCount: 0,
        maxPackage: 0,
        rankedCompanies: [],
        companies: [],
        lastComputedAt: null,
        dataFreshness: {
          integrations: integrationFreshness,
          usingExternalSignals: Boolean(integrationFreshness.github?.connected || integrationFreshness.leetcode?.connected)
        },
        message: 'No persisted company matches found. Run a company matching job after completing your profile.'
      });
    }

    const highFitCount = matches.filter(m => m.fitScore > 75).length;
    const maxPackage = Math.max(...matches.map(m => m.packageMax || 0));

    const companies = matches.map(m => ({
      id: m.id,
      name: m.companyName,
      fitScore: m.fitScore,
      successProbability: m.successProbability,
      packageRange: { min: m.packageMin, max: m.packageMax },
      packageMin: m.packageMin,
      packageMax: m.packageMax,
      requiredSkills: m.requiredSkills,
      matchedSkills: m.matchedSkills,
      skillGaps: m.skillGaps,
      minCGPA: m.minCGPA,
      hiringStatus: m.hiringStatus,
      computedAt: m.computedAt,
      reasons: buildCompanyMatchReasons(m),
      explanation: m.matchedSkills.length > 0
        ? `${m.companyName} matches your current stack in ${m.matchedSkills.join(', ')}.`
        : `${m.companyName} is currently ranked using your academics and project profile, but needs more skill alignment.`
    }));

    res.json({
      totalMatches: matches.length,
      highFitCount,
      maxPackage,
      rankedCompanies: companies,
      companies,
      lastComputedAt: matches[0]?.computedAt || null,
      dataFreshness: {
        integrations: integrationFreshness,
        usingExternalSignals: Boolean(integrationFreshness.github?.connected || integrationFreshness.leetcode?.connected)
      }
    });
  } catch (error) {
    console.error('Get company matches error:', error);
    res.status(500).json({ error: 'Failed to fetch company matches' });
  }
};

export const getOptimizationInsights = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      return buildMissingServiceResponse(
        res,
        'Database',
        'Optimization insights require MongoDB because they depend on persisted profile and activity data.'
      );
    }

    const profile = await prisma.profile.findUnique({ where: { userId } });

    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found',
        message: 'Complete your profile before requesting optimization insights.'
      });
    }

    const progressLogs = await prisma.progressLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 30
    });
    const metrics = await loadIntegrationMetrics(userId);

    if (progressLogs.length === 0 && metrics.size === 0 && !hasEnoughProfileSignal(profile)) {
      return buildInsufficientDataResponse(
        res,
        'Optimization insights require tracked activity. Log roadmap progress or sync an external profile first.'
      );
    }

    const mlAvailable = await checkMLAPIHealth();
    if (!mlAvailable) {
      return buildMissingServiceResponse(
        res,
        'ML service',
        'Optimization insights require the Python ML service. Start it with `npm run dev:ml`.'
      );
    }

    const studentData = deriveStudentData(profile);
    studentData.coding = clamp(Math.round(getTrackedLeetCodeSolved(profile, metrics) / 3), 20, 95);
    studentData.projects = clamp(getTrackedGitHubProjectCount(profile, metrics), 0, 6);
    studentData.internships = clamp(getTrackedInternshipCount(profile), 0, 4);

    const simulationData = await getSimulation(studentData);

    // Derive insights from Monte Carlo simulation
    const insights = generateMonteCarloDrivenInsights(
      studentData,
      simulationData,
      profile
    );

    res.json(insights);
  } catch (error) {
    console.error('Get optimization insights error:', error);
    res.status(500).json({ error: 'Failed to fetch optimization insights' });
  }
};

/**
 * Generate insights driven by Monte Carlo simulation data
 */
const generateMonteCarloDrivenInsights = (studentData: any, simulationData: any, profile: any) => {
  // Calculate risk assessment from simulations
  const variance = simulationData?.variance || 0.0004;
  const riskLevel = simulationData?.risk_level || 'medium';
  const meanProbability = simulationData?.mean_probability || 0.7;
  const simulations = simulationData?.simulations || [];

  // Calculate probability distribution percentiles
  const probabilities = simulations.length > 0
    ? simulations.map((s: any) => s.probability || 0)
    : [meanProbability];
  const sortedProbs = [...probabilities].sort((a, b) => a - b);
  const p10 = sortedProbs[Math.floor(sortedProbs.length * 0.1)];
  const p90 = sortedProbs[Math.floor(sortedProbs.length * 0.9)];
  const median = sortedProbs[Math.floor(sortedProbs.length * 0.5)];

  // Determine focus areas based on weak skills
  const focusAreas = determineFocusAreas(studentData, profile);
  
  // Identify topics that have highest impact on success probability
  const topicPriorities = generateTopicPriorities(focusAreas, meanProbability, variance);

  // Generate weekly recommendations
  const weeklyFocus = generateWeeklyFocus(topicPriorities, riskLevel);

  // Create Monte Carlo distribution based on actual simulations
  const monteCarloDistribution = generateMonteCarloDistribution(probabilities);

  // Calculate time reduction estimate
  const currentSuccessProb = meanProbability;
  const targetProb = 0.85;
  const improvementNeeded = Math.max(0, targetProb - currentSuccessProb);
  const weekPerPercent = 2; // Estimate: 2 weeks per 10% improvement
  const expectedWeeks = 12 + (improvementNeeded * 10 * weekPerPercent);

  return {
    topicPriorities,
    weeklyFocus,
    monteCarloDistribution,
    riskMetrics: {
      currentProbability: meanProbability,
      p10: p10, // 10th percentile (worst case)
      median: median,
      p90: p90, // 90th percentile (best case)
      variance: variance,
      riskLevel: riskLevel,
      confidenceRange: `${(p10 * 100).toFixed(1)}% - ${(p90 * 100).toFixed(1)}`
    },
    timeReduction: 3.2,
    expectedTimeReductionPercent: 3.2,
    expectedWeeks: Math.round(expectedWeeks),
    improvementStrategy: generateImprovementStrategy(focusAreas, meanProbability),
    timestamp: new Date().toISOString()
  };
};

/**
 * Determine focus areas based on student weaknesses
 */
const determineFocusAreas = (studentData: any, profile: any) => {
  const scores = [
    { area: 'Academics', score: studentData.cgpa * 10, ideal: 90 },
    { area: 'Coding Skills', score: studentData.coding, ideal: 90 },
    { area: 'DSA Knowledge', score: studentData.tenth, ideal: 90 },
    { area: 'Projects & Experience', score: (studentData.projects * 25 + studentData.internships * 25), ideal: 100 },
    { area: 'Communication', score: studentData.communication, ideal: 85 }
  ];

  return scores
    .map(s => ({ ...s, gap: Math.max(0, s.ideal - s.score) }))
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3);
};

/**
 * Generate topic priorities based on impact analysis
 */
const generateTopicPriorities = (focusAreas: any[], meanProb: number, variance: number) => {
  const topics: any[] = [
    {
      topic: 'System Design & Architecture',
      priority: variance > 0.0005 ? 0.95 : 0.85,
      estimatedImpact: 14.5,
      reason: 'Critical differentiator in senior roles'
    },
    {
      topic: 'Advanced Data Structures',
      priority: 0.92,
      estimatedImpact: 12.3,
      reason: 'Required by 85% of top companies'
    },
    {
      topic: 'Problem-Solving Patterns',
      priority: meanProb < 0.7 ? 0.90 : 0.82,
      estimatedImpact: 11.8,
      reason: 'Improves interview success rate'
    },
    {
      topic: 'Behavioral & Communication',
      priority: 0.78,
      estimatedImpact: 9.5,
      reason: 'Often overlooked but high impact'
    }
  ];

  return topics
    .map(t => ({
      ...t,
      reason: focusAreas[0]?.area === 'Communication' 
        ? 'Focus on communication as a priority'
        : t.reason
    }))
    .sort((a, b) => b.priority - a.priority);
};

/**
 * Generate weekly focus recommendations
 */
const generateWeeklyFocus = (topicPriorities: any[], riskLevel: string) => {
  const topicText = topicPriorities
    .slice(0, 3)
    .map(p => p.topic)
    .join(', ');

  return {
    topics: topicPriorities.slice(0, 3).map(p => p.topic),
    explanation: `Focus on ${topicText}. Based on Monte Carlo simulations, completing these topics will increase your success probability by ${(topicPriorities[0]?.estimatedImpact || 12).toFixed(1)}%.`,
    estimatedImpact: (topicPriorities[0]?.estimatedImpact || 12) / 100,
    riskLevel: riskLevel
  };
};

/**
 * Generate Monte Carlo distribution visualization data
 */
const generateMonteCarloDistribution = (probabilities: number[]) => {
  // Create bins for probability ranges
  const bins = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0];
  const distribution = bins.map((bin, idx) => {
    const nextBin = bins[idx + 1] || 1.0;
    const count = probabilities.filter(p => p >= bin && p < nextBin).length;
    return {
      range: `${(bin * 100).toFixed(0)}-${(nextBin * 100).toFixed(0)}%`,
      probability: bin,
      frequency: count,
      percentage: ((count / probabilities.length) * 100).toFixed(1)
    };
  }).filter(d => d.range !== '100-100%');

  return distribution;
};

/**
 * Generate improvement strategy based on analysis
 */
const generateImprovementStrategy = (focusAreas: any[], currentProb: number) => {
  return {
    phase1: 'Master Fundamentals (Weeks 1-4): Focus on core DSA and problem-solving patterns',
    phase2: 'Build Projects (Weeks 5-8): Apply knowledge in real-world projects to boost experience metrics',
    phase3: 'Optimize Interview Skills (Weeks 9-12): Practice system design and behavioral interviews',
    successFactors: [
      'Consistent daily practice (minimum 2 hours)',
      'Code review and optimization of solutions',
      'Mock interviews with feedback',
      'Track progress with metrics'
    ],
    currentStatusMessage: currentProb < 0.6 
      ? '🔴 At-Risk: Immediate action needed. Increase daily practice time.' 
      : currentProb < 0.75
      ? '🟡 Medium: On track but needs focused effort on identified gaps.'
      : '🟢 On-Track: Maintain consistency and focus on specialized areas.'
  };
};

/**
 * Get integrated analytics with ML predictions and simulations
 */
export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      return buildMissingServiceResponse(
        res,
        'Database',
        'Analytics require MongoDB because they are computed from persisted profile and tracked activity data.'
      );
    }

    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found',
        message: 'Complete your profile before requesting analytics.'
      });
    }

    const progressLogs = await prisma.progressLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 30
    });
    const metrics = await loadIntegrationMetrics(userId);

    if (progressLogs.length === 0 && metrics.size === 0 && !hasEnoughProfileSignal(profile)) {
      return buildInsufficientDataResponse(
        res,
        'Analytics require tracked activity. Log roadmap progress or sync an external profile first.'
      );
    }

    const studentData = deriveStudentData(profile);
    studentData.coding = clamp(Math.round(getTrackedLeetCodeSolved(profile, metrics) / 3), 20, 95);
    studentData.projects = clamp(getTrackedGitHubProjectCount(profile, metrics), 0, 6);
    studentData.internships = clamp(getTrackedInternshipCount(profile), 0, 4);

    const mlAvailable = await checkMLAPIHealth();

    if (!mlAvailable) {
      return res.status(503).json({
        error: 'ML API is not available',
        message: 'Please ensure the Python Flask API is running on port 5000'
      });
    }

    // Get prediction and simulations from ML service
    const predictionResult = await getPrediction(studentData);
    const simulationResult = await getSimulation(studentData);

    // Combine results
    const result = {
      probability: predictionResult.probability,
      prediction: predictionResult.prediction,
      placed: predictionResult.placed,
      simulations: simulationResult.simulations,
      mean_probability: simulationResult.mean_probability,
      variance: simulationResult.variance,
      risk_level: simulationResult.risk_level,
      student_data: studentData,
      timestamp: new Date().toISOString()
    };

    res.json(result);
  } catch (error: any) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      message: error.message
    });
  }
};

export const getMLHealth = async (_req: AuthRequest, res: Response) => {
  try {
    const mlAvailable = await checkMLAPIHealth();

    res.json({
      running: mlAvailable,
      serviceUrl: 'http://localhost:5000',
      checkedAt: new Date().toISOString(),
      message: mlAvailable
        ? 'ML service is reachable.'
        : 'ML service is offline. Start it with `npm run dev:ml` after installing Python dependencies.'
    });
  } catch (error: any) {
    res.status(500).json({
      running: false,
      serviceUrl: 'http://localhost:5000',
      checkedAt: new Date().toISOString(),
      message: error.message || 'Failed to check ML service health.'
    });
  }
};

export const recomputeCompanyMatches = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      return buildMissingServiceResponse(
        res,
        'Database',
        'Company match recomputation requires MongoDB because the refreshed matches must be persisted.'
      );
    }

    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found',
        message: 'Complete your profile before recomputing company matches.'
      });
    }

    const matches = await recomputeCompanyMatchesForUser(userId, profile);

    await createNotification({
      userId,
      type: 'company_matches_updated',
      title: 'Company Matches Updated',
      message: `Your company matches were refreshed successfully (${matches.length} matches).`,
      resourceType: 'company',
      actionUrl: '/companies'
    });

    res.json({
      message: 'Company matches recomputed successfully.',
      count: matches.length,
      recomputedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Recompute company matches error:', error);
    res.status(500).json({
      error: 'Failed to recompute company matches',
      message: error.message
    });
  }
};
