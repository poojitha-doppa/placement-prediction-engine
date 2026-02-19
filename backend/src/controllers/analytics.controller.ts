import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import prisma from '../config/db.js';
import { mockProfiles } from './profile.controller.js';

// Check if database is available
const isDatabaseAvailable = async () => {
  try {
    if (!prisma) return false;
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
};

// Mock data generator with user's target companies
const generateMockAnalytics = (userId: string, userProfile?: any) => {
  // Get target companies from user profile or use defaults
  const targetCompanies = userProfile?.targetCompanies || mockProfiles[userId]?.targetCompanies || ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix'];
  const targetRoles = userProfile?.targetRoles || mockProfiles[userId]?.targetRoles || ['Software Engineer', 'Full Stack Developer'];
  const userSkills = userProfile?.skills || mockProfiles[userId]?.skills || ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python'];
  
  // Define all possible companies with their details
  const allCompanies: any = {
    'Google': { role: 'Software Engineer', fitScore: 85, successProbability: 72, packageRange: { min: 20, max: 35 }, requiredSkills: ['Data Structures', 'Algorithms', 'System Design'], skillGaps: ['System Design', 'Advanced Algorithms'] },
    'Microsoft': { role: 'Software Development Engineer', fitScore: 82, successProbability: 75, packageRange: { min: 18, max: 32 }, requiredSkills: ['Cloud', 'Azure', 'C#'], skillGaps: ['Cloud Computing', 'Azure'] },
    'Amazon': { role: 'Software Development Engineer', fitScore: 78, successProbability: 68, packageRange: { min: 16, max: 30 }, requiredSkills: ['AWS', 'Distributed Systems'], skillGaps: ['AWS', 'Distributed Systems'] },
    'Meta': { role: 'Software Engineer', fitScore: 75, successProbability: 65, packageRange: { min: 19, max: 34 }, requiredSkills: ['React', 'React Native', 'GraphQL'], skillGaps: ['React Native', 'GraphQL'] },
    'Apple': { role: 'Software Engineer', fitScore: 72, successProbability: 60, packageRange: { min: 17, max: 31 }, requiredSkills: ['Swift', 'iOS', 'Objective-C'], skillGaps: ['Swift', 'iOS', 'Objective-C'] },
    'Netflix': { role: 'Software Engineer', fitScore: 70, successProbability: 62, packageRange: { min: 17, max: 33 }, requiredSkills: ['Microservices', 'Distributed Systems', 'Java'], skillGaps: ['Microservices', 'Java'] },
    'Adobe': { role: 'Full Stack Developer', fitScore: 70, successProbability: 62, packageRange: { min: 15, max: 28 }, requiredSkills: ['JavaScript', 'React', 'Node.js'], skillGaps: ['Advanced UI/UX'] },
    'Salesforce': { role: 'Application Developer', fitScore: 68, successProbability: 58, packageRange: { min: 14, max: 26 }, requiredSkills: ['Apex', 'Salesforce Platform'], skillGaps: ['Salesforce', 'Apex'] },
    'Oracle': { role: 'Software Engineer', fitScore: 65, successProbability: 55, packageRange: { min: 12, max: 24 }, requiredSkills: ['Java', 'SQL', 'Cloud'], skillGaps: ['Java', 'Oracle Cloud'] },
    'Uber': { role: 'Backend Engineer', fitScore: 73, successProbability: 64, packageRange: { min: 16, max: 29 }, requiredSkills: ['Go', 'Microservices', 'Distributed Systems'], skillGaps: ['Go', 'Distributed Systems'] },
    'Airbnb': { role: 'Full Stack Engineer', fitScore: 71, successProbability: 63, packageRange: { min: 16, max: 30 }, requiredSkills: ['React', 'Ruby', 'GraphQL'], skillGaps: ['Ruby', 'GraphQL'] },
    'LinkedIn': { role: 'Software Engineer', fitScore: 74, successProbability: 66, packageRange: { min: 17, max: 31 }, requiredSkills: ['Java', 'Distributed Systems', 'Big Data'], skillGaps: ['Java', 'Big Data'] },
    'Twitter': { role: 'Software Engineer', fitScore: 72, successProbability: 64, packageRange: { min: 16, max: 30 }, requiredSkills: ['Scala', 'Distributed Systems'], skillGaps: ['Scala'] },
    'Spotify': { role: 'Backend Engineer', fitScore: 69, successProbability: 60, packageRange: { min: 15, max: 28 }, requiredSkills: ['Python', 'Microservices', 'Big Data'], skillGaps: ['Big Data'] },
    'Atlassian': { role: 'Software Developer', fitScore: 67, successProbability: 58, packageRange: { min: 14, max: 26 }, requiredSkills: ['Java', 'Spring Boot', 'Microservices'], skillGaps: ['Spring Boot'] },
    'Stripe': { role: 'Software Engineer', fitScore: 76, successProbability: 67, packageRange: { min: 18, max: 32 }, requiredSkills: ['Ruby', 'Scala', 'Distributed Systems'], skillGaps: ['Ruby', 'Scala'] },
    'Shopify': { role: 'Full Stack Developer', fitScore: 68, successProbability: 59, packageRange: { min: 15, max: 27 }, requiredSkills: ['Ruby on Rails', 'React', 'GraphQL'], skillGaps: ['Ruby on Rails'] },
    'PayPal': { role: 'Software Engineer', fitScore: 66, successProbability: 57, packageRange: { min: 14, max: 25 }, requiredSkills: ['Java', 'Node.js', 'Security'], skillGaps: ['Security'] },
    'Snapchat': { role: 'Software Engineer', fitScore: 70, successProbability: 61, packageRange: { min: 16, max: 29 }, requiredSkills: ['Python', 'C++', 'Computer Vision'], skillGaps: ['C++', 'Computer Vision'] },
    'VMware': { role: 'Software Engineer', fitScore: 64, successProbability: 56, packageRange: { min: 13, max: 24 }, requiredSkills: ['C++', 'Virtualization', 'Cloud'], skillGaps: ['C++', 'Virtualization'] }
  };
  
  // Create ranked companies array based on user's target companies
  const rankedCompanies = targetCompanies.map((companyName: string, index: number) => {
    const companyData = allCompanies[companyName] || {
      role: targetRoles[0] || 'Software Engineer',
      fitScore: Math.max(50, 85 - index * 5),
      successProbability: Math.max(45, 72 - index * 5),
      packageRange: { min: 12 + index, max: 25 + index * 2 },
      requiredSkills: ['Programming', 'Problem Solving'],
      skillGaps: ['Advanced Topics']
    };
    
    return {
      id: `${index + 1}`,
      name: companyName,
      role: companyData.role,
      fitScore: companyData.fitScore,
      successProbability: companyData.successProbability,
      packageRange: companyData.packageRange,
      packageMin: companyData.packageRange.min,
      packageMax: companyData.packageRange.max,
      requiredSkills: companyData.requiredSkills,
      matchedSkills: userSkills.slice(0, 3),
      skillGaps: companyData.skillGaps,
      minCGPA: 7.0,
      hiringStatus: index < 3 ? 'Active' : 'Upcoming'
    };
  });
  
  // Create company probability map
  const companyProbs: any = {};
  targetCompanies.forEach((company: string, index: number) => {
    companyProbs[company] = Math.max(55, 75 - index * 3);
  });
  
  return {
    placementSummary: {
      placementProbability: 78.5,
      highPackageProbability: 62.3,
      overallPlacementProb: 0.785,
      highPackageProb20LpaPlus: 0.623,
      problemsSolved: 287,
      totalProblemsSolved: 287,
      currentStreak: 15,
      weeklyProgress: 85.0,
      consistencyScore: 78.5,
      topSkills: userSkills.slice(0, 5).map((skill: string, i: number) => ({
        name: skill,
        level: Math.max(70, 88 - i * 3)
      })),
      companyProbs,
      lastUpdated: new Date().toISOString()
    },
    skillAnalytics: {
      currentSkills: [
        { name: 'Data Structures', current: 85, target: 95, proficiency: 85, gap: 10 },
        { name: 'Algorithms', current: 82, target: 95, proficiency: 82, gap: 13 },
        { name: 'System Design', current: 72, target: 90, proficiency: 72, gap: 18 },
        { name: 'React', current: 88, target: 92, proficiency: 88, gap: 4 },
        { name: 'Node.js', current: 80, target: 88, proficiency: 80, gap: 8 },
        { name: 'TypeScript', current: 82, target: 90, proficiency: 82, gap: 8 },
        { name: 'SQL', current: 75, target: 85, proficiency: 75, gap: 10 },
        { name: 'MongoDB', current: 78, target: 86, proficiency: 78, gap: 8 },
        { name: 'Python', current: 76, target: 84, proficiency: 76, gap: 8 },
        { name: 'Behavioral', current: 70, target: 85, proficiency: 70, gap: 15 }
      ],
      skillProgression: Array.from({ length: 6 }, (_, i) => {
        return {
          week: i * 2,
          date: new Date(Date.now() - (5 - i) * 14 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
          dsa: Math.floor(45 + i * 7),
          csFundamentals: Math.floor(50 + i * 6),
          systemDesign: Math.floor(30 + i * 8),
          language: Math.floor(60 + i * 5),
          behavioral: Math.floor(40 + i * 6)
        };
      }),
      history: Array.from({ length: 6 }, (_, i) => {
        return {
          week: i * 2,
          date: new Date(Date.now() - (5 - i) * 14 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
          dsa: Math.floor(45 + i * 7),
          csFundamentals: Math.floor(50 + i * 6),
          systemDesign: Math.floor(30 + i * 8),
          language: Math.floor(60 + i * 5),
          behavioral: Math.floor(40 + i * 6)
        };
      }),
      currentLevels: {
        dsa: 85,
        csFundamentals: 80,
        systemDesign: 72,
        language: 85,
        behavioral: 70
      },
      targetLevels: {
        dsa: 95,
        csFundamentals: 92,
        systemDesign: 90,
        language: 90,
        behavioral: 85
      },
      weakAreas: ['System Design', 'Dynamic Programming', 'Graph Algorithms', 'Behavioral Interviews']
    },
    companyMatches: {
      totalMatches: rankedCompanies.length,
      highFitCount: rankedCompanies.filter((c: any) => c.fitScore > 75).length,
      maxPackage: Math.max(...rankedCompanies.map((c: any) => c.packageMax)),
      rankedCompanies,
      companies: rankedCompanies
    },
    optimizationInsights: {
      timeReduction: 3.2,
      expectedWeeks: 12.8,
      topPriorityTopics: [
        {
          topic: 'System Design',
          priority: 0.92,
          estimatedImpact: 12.5,
          reasoning: 'Required by 80% of target companies'
        },
        {
          topic: 'Advanced Data Structures',
          priority: 0.88,
          estimatedImpact: 10.2,
          reasoning: 'Critical for coding rounds'
        },
        {
          topic: 'Dynamic Programming',
          priority: 0.85,
          estimatedImpact: 9.8,
          reasoning: 'High weightage in interviews'
        }
      ],
      weeklyFocus: 'Focus on DSA fundamentals and problem-solving patterns',
      monteCarloDistribution: [
        { weeks: 10, probability: 0.05 },
        { weeks: 12, probability: 0.25 },
        { weeks: 14, probability: 0.40 },
        { weeks: 16, probability: 0.25 },
        { weeks: 18, probability: 0.05 }
      ]
    }
  };
};

export const getPlacementSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      // Get user profile to use their data
      const userProfile = mockProfiles[userId];
      const mockData = generateMockAnalytics(userId, userProfile);
      return res.json(mockData.placementSummary);
    }

    // Get profile
    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    // Get progress logs (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentLogs = await prisma.progressLog.findMany({
      where: {
        userId,
        timestamp: { gte: thirtyDaysAgo }
      },
      orderBy: { timestamp: 'desc' }
    });

    // Calculate metrics
    const totalProblems = 450; // Mock - would fetch from external metrics
    const currentStreak = 12; // Mock - calculate from daily logs
    
    // Weekly progress (current week)
    const weeklyProgress = recentLogs.length > 0
      ? recentLogs.reduce((sum, log) => sum + log.completionPercent, 0) / recentLogs.length
      : 0;

    // Consistency score (weeks with activity / total weeks)
    const uniqueWeeks = new Set(recentLogs.map(l => l.weekNumber));
    const consistencyScore = (uniqueWeeks.size / 4) * 100; // Assuming 4 weeks

    // Placement probability calculation
    const skillCoverage = profile?.skills.length || 0;
    const cgpaFactor = (profile?.cgpa || 0) / 10;
    const placementProbability = Math.min(
      (skillCoverage * 5 + cgpaFactor * 40 + consistencyScore * 0.3 + weeklyProgress * 0.2),
      100
    );

    // High package probability
    const highPackageProbability = Math.max(0, placementProbability - 25);

    const topSkills = profile?.skills.slice(0, 5).map(skill => ({
      name: skill,
      level: Math.floor(Math.random() * 30 + 60) // Mock level
    })) || [];

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
      // Get user profile to use their data
      const userProfile = mockProfiles[userId];
      const mockData = generateMockAnalytics(userId, userProfile);
      return res.json(mockData.skillAnalytics);
    }

    // Get skill analytics
    const analytics = await prisma.skillAnalytics.findMany({
      where: { userId },
      orderBy: { date: 'asc' }
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

    const currentSkills = (profile?.skills || []).map(skill => ({
      name: skill,
      current: Math.floor(Math.random() * 30 + 50),
      target: Math.floor(Math.random() * 20 + 80),
      gap: Math.floor(Math.random() * 30)
    }));

    const weakAreas = currentSkills
      .filter(s => s.gap > 15)
      .map(s => s.name)
      .slice(0, 5);

    const defaultProgression = [
      { date: '2025-11-01', dsa: 50, systemDesign: 30, webDev: 70, week: 'Week 1', skills: 40 },
      { date: '2025-12-01', dsa: 65, systemDesign: 45, webDev: 75, week: 'Week 2', skills: 48 }
    ];

    res.json({
      skillProgression: skillProgression.length > 0 ? skillProgression : defaultProgression,
      history: skillProgression.length > 0 ? skillProgression : defaultProgression,
      currentSkills: currentSkills.slice(0, 8),
      weakAreas
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
      // Get user profile to use their target companies
      const userProfile = mockProfiles[userId];
      const mockData = generateMockAnalytics(userId, userProfile);
      return res.json(mockData.companyMatches);
    }

    const matches = await prisma.companyMatch.findMany({
      where: { userId },
      orderBy: { fitScore: 'desc' },
      take: 30
    });

    if (matches.length === 0) {
      // Get user profile to use their target companies
      const profile = await prisma.profile.findUnique({ where: { userId } });
      const mockData = generateMockAnalytics(userId, profile);
      return res.json(mockData.companyMatches);
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
      hiringStatus: m.hiringStatus
    }));

    res.json({
      totalMatches: matches.length,
      highFitCount,
      maxPackage,
      rankedCompanies: companies,
      companies
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
      // Return mock data
      const mockData = generateMockAnalytics(userId);
      return res.json(mockData.optimizationInsights);
    }

    const insights = await prisma.optimizationInsight.findMany({
      where: { userId },
      orderBy: { priority: 'desc' },
      take: 10
    });

    // Mock Monte Carlo distribution
    const monteCarloDistribution = [
      { weeks: 10, probability: 0.05 },
      { weeks: 12, probability: 0.25 },
      { weeks: 14, probability: 0.40 },
      { weeks: 16, probability: 0.25 },
      { weeks: 18, probability: 0.05 }
    ];

    const topPriorityTopics = insights
      .filter(i => i.type === 'topic_priority')
      .map(i => ({
        topic: i.title,
        priority: i.priority,
        estimatedImpact: i.estimatedImpact,
        reasoning: (i.data as any).reasoning || 'High priority for target companies'
      }))
      .slice(0, 5);

    res.json({
      timeReduction: 3.2,
      expectedWeeks: 12.8,
      topPriorityTopics: topPriorityTopics.length > 0 ? topPriorityTopics : [
        {
          topic: 'Dynamic Programming',
          priority: 0.92,
          estimatedImpact: 12.5,
          reasoning: 'Required by 80% of target companies'
        }
      ],
      weeklyFocus: 'Focus on DSA fundamentals and problem-solving patterns',
      monteCarloDistribution
    });
  } catch (error) {
    console.error('Get optimization insights error:', error);
    res.status(500).json({ error: 'Failed to fetch optimization insights' });
  }
};
