import { Response } from 'express';
import prisma from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';
import { mockUsersCache } from '../middleware/auth.js';
import { mockProfiles } from './profile.controller.js';

type ManagedCompany = {
  name: string;
  requiredSkills: string[];
  minPredictionScore: number;
  createdAt: string;
};

const managedCompanies = new Map<string, ManagedCompany>();

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const isDatabaseAvailable = async () => {
  try {
    if (!prisma) {
      return false;
    }
    await prisma.$connect();
    await prisma.user.findFirst();
    return true;
  } catch {
    return false;
  }
};

const calculateProfileScore = (profile: any): number => {
  const cgpaComponent = clamp((toNumber(profile?.cgpa, 0) / 10) * 45, 0, 45);
  const skillsCount = Array.isArray(profile?.skills) ? profile.skills.length : 0;
  const skillsComponent = clamp(skillsCount * 3, 0, 30);
  const leetcodeComponent = clamp(toNumber(profile?.leetcodeSolved, 0) / 8, 0, 25);
  return Math.round(cgpaComponent + skillsComponent + leetcodeComponent);
};

const calculatePredictionProbability = (profile: any, userMatches: any[]): number => {
  if (userMatches.length > 0) {
    const avg = userMatches.reduce((sum, match) => sum + toNumber(match.successProbability, 0), 0) / userMatches.length;
    return clamp(avg / 100, 0, 1);
  }

  const profileScore = calculateProfileScore(profile);
  return clamp(profileScore / 100, 0, 1);
};

const roadmapProgressFromRoadmap = (roadmap: any) => {
  const weeks = Array.isArray(roadmap?.weeks) ? roadmap.weeks : [];
  const tasks = weeks.flatMap((week: any) => (Array.isArray(week.tasks) ? week.tasks : []));
  const completedTasks = tasks.filter((task: any) => Boolean(task.isCompleted));
  const totalTasks = tasks.length;
  const completedCount = completedTasks.length;
  const pendingCount = Math.max(totalTasks - completedCount, 0);
  const completionPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return {
    totalTasks,
    completedTasks: completedCount,
    pendingTasks: pendingCount,
    completionPercentage
  };
};

const matchesSearch = (input: string, search: string) => input.toLowerCase().includes(search.toLowerCase());

const uniqueStrings = (values: string[]) => Array.from(new Set(values));

const buildMockUsersDataset = () => {
  const users = mockUsersCache.users || [];
  return users.map((user) => {
    const profile = mockProfiles[user.id] || {};
    const predictionProbability = calculatePredictionProbability(profile, []);
    return {
      id: user.id,
      name: user.name || 'User',
      email: user.email,
      college: profile.college || null,
      branch: profile.branch || null,
      skills: Array.isArray(profile.skills) ? profile.skills : [],
      profileScore: calculateProfileScore(profile),
      placementPrediction: predictionProbability,
      predictedStatus: predictionProbability >= 0.7 ? 'placement-ready' : predictionProbability < 0.45 ? 'at-risk' : 'moderate'
    };
  });
};

const toPlacementStatus = (probability: number) => {
  if (probability >= 0.7) return 'placement-ready';
  if (probability < 0.45) return 'at-risk';
  return 'moderate';
};

export const getAdminUsers = async (req: AuthRequest, res: Response) => {
  try {
    const search = String(req.query.search || '').trim().toLowerCase();
    const filter = String(req.query.filter || 'all');

    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      let users = buildMockUsersDataset();

      if (search) {
        users = users.filter((user) => {
          const inSkills = user.skills.some((skill: string) => matchesSearch(skill, search));
          return matchesSearch(user.name, search) || matchesSearch(user.email, search) || inSkills;
        });
      }

      if (filter === 'placement-ready' || filter === 'at-risk') {
        users = users.filter((user) => user.predictedStatus === filter);
      }

      return res.json({ users, total: users.length });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        profile: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const allMatches = await prisma.companyMatch.findMany({
      select: {
        userId: true,
        successProbability: true
      }
    });

    const matchesByUserId = new Map<string, any[]>();
    allMatches.forEach((match) => {
      const current = matchesByUserId.get(match.userId) || [];
      current.push(match);
      matchesByUserId.set(match.userId, current);
    });

    let responseUsers = users.map((user) => {
      const profile: any = user.profile || {};
      const userMatches = matchesByUserId.get(user.id) || [];
      const predictionProbability = calculatePredictionProbability(profile, userMatches);

      return {
        id: user.id,
        name: user.name || 'User',
        email: user.email,
        college: profile?.college || null,
        branch: profile?.branch || null,
        skills: Array.isArray(profile?.skills) ? profile.skills : [],
        profileScore: calculateProfileScore(profile),
        placementPrediction: Number(predictionProbability.toFixed(2)),
        predictedStatus: toPlacementStatus(predictionProbability)
      };
    });

    if (search) {
      responseUsers = responseUsers.filter((user) => {
        const inSkills = user.skills.some((skill: string) => matchesSearch(skill, search));
        return matchesSearch(user.name, search) || matchesSearch(user.email, search) || inSkills;
      });
    }

    if (filter === 'placement-ready' || filter === 'at-risk') {
      responseUsers = responseUsers.filter((user) => user.predictedStatus === filter);
    }

    res.json({ users: responseUsers, total: responseUsers.length });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getAdminUserDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      const user = (mockUsersCache.users || []).find((item) => item.id === userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const profile = mockProfiles[user.id] || {};
      return res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name || 'User'
        },
        profile,
        prediction: {
          placementProbability: Number(calculatePredictionProbability(profile, []).toFixed(2)),
          status: toPlacementStatus(calculatePredictionProbability(profile, []))
        }
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        profile: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const companyMatches = await prisma.companyMatch.findMany({
      where: { userId },
      orderBy: { successProbability: 'desc' }
    });

    const roadmap = await prisma.roadmap.findFirst({
      where: { userId, isActive: true },
      include: {
        weeks: {
          include: {
            tasks: true
          }
        }
      },
      orderBy: { generatedAt: 'desc' }
    });

    const placementProbability = calculatePredictionProbability(user.profile || {}, companyMatches);

    res.json({
      user,
      prediction: {
        placementProbability: Number(placementProbability.toFixed(2)),
        status: toPlacementStatus(placementProbability),
        companyMatches
      },
      roadmapProgress: roadmap ? roadmapProgressFromRoadmap(roadmap) : null
    });
  } catch (error) {
    console.error('Admin get user details error:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
};

export const getPredictionMonitoring = async (_req: AuthRequest, res: Response) => {
  try {
    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      const predictions = buildMockUsersDataset().map((user) => ({
        userId: user.id,
        name: user.name,
        email: user.email,
        placementProbability: user.placementPrediction,
        predictedStatus: user.predictedStatus,
        actualStatus: null
      }));

      return res.json({ predictions, total: predictions.length });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        profile: true
      }
    });

    const allMatches = await prisma.companyMatch.findMany({
      select: {
        userId: true,
        successProbability: true
      }
    });

    const matchesByUserId = new Map<string, any[]>();
    allMatches.forEach((match) => {
      const current = matchesByUserId.get(match.userId) || [];
      current.push(match);
      matchesByUserId.set(match.userId, current);
    });

    const predictions = users.map((user) => {
      const probability = calculatePredictionProbability(user.profile || {}, matchesByUserId.get(user.id) || []);
      return {
        userId: user.id,
        name: user.name || 'User',
        email: user.email,
        placementProbability: Number(probability.toFixed(2)),
        predictedStatus: toPlacementStatus(probability),
        actualStatus: null
      };
    });

    res.json({ predictions, total: predictions.length });
  } catch (error) {
    console.error('Admin prediction monitoring error:', error);
    res.status(500).json({ error: 'Failed to fetch prediction monitoring data' });
  }
};

export const getRoadmapTracking = async (_req: AuthRequest, res: Response) => {
  try {
    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      const roadmaps = (mockUsersCache.users || []).map((user) => ({
        userId: user.id,
        name: user.name || 'User',
        email: user.email,
        completedTasks: 0,
        pendingTasks: 0,
        completionPercentage: 0
      }));

      return res.json({ roadmaps, total: roadmaps.length });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    const roadmaps = await Promise.all(
      users.map(async (user) => {
        const roadmap = await prisma.roadmap.findFirst({
          where: {
            userId: user.id,
            isActive: true
          },
          include: {
            weeks: {
              include: {
                tasks: true
              }
            }
          },
          orderBy: { generatedAt: 'desc' }
        });

        const progress = roadmap ? roadmapProgressFromRoadmap(roadmap) : {
          completedTasks: 0,
          pendingTasks: 0,
          completionPercentage: 0
        };

        return {
          userId: user.id,
          name: user.name || 'User',
          email: user.email,
          ...progress
        };
      })
    );

    res.json({ roadmaps, total: roadmaps.length });
  } catch (error) {
    console.error('Admin roadmap tracking error:', error);
    res.status(500).json({ error: 'Failed to fetch roadmap tracking data' });
  }
};

export const getAdminAnalyticsOverview = async (_req: AuthRequest, res: Response) => {
  try {
    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      const users = buildMockUsersDataset();
      const placementReadyCount = users.filter((user) => user.predictedStatus === 'placement-ready').length;
      const averageProfileScore = users.length > 0
        ? users.reduce((sum, user) => sum + user.profileScore, 0) / users.length
        : 0;

      return res.json({
        totalUsers: users.length,
        averageProfileScore: Number(averageProfileScore.toFixed(2)),
        placedPredictionPercentage: users.length > 0 ? Number(((placementReadyCount / users.length) * 100).toFixed(2)) : 0,
        commonSkillGaps: []
      });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        profile: true
      }
    });

    const allMatches = await prisma.companyMatch.findMany({
      select: {
        userId: true,
        successProbability: true,
        skillGaps: true
      }
    });

    const matchesByUserId = new Map<string, any[]>();
    allMatches.forEach((match) => {
      const current = matchesByUserId.get(match.userId) || [];
      current.push(match);
      matchesByUserId.set(match.userId, current);
    });

    const scored = users.map((user) => {
      const profile = user.profile || {};
      const userMatches = matchesByUserId.get(user.id) || [];
      const predictionProbability = calculatePredictionProbability(profile, userMatches);
      return {
        profileScore: calculateProfileScore(profile),
        predictionProbability
      };
    });

    const totalUsers = scored.length;
    const averageProfileScore = totalUsers > 0
      ? scored.reduce((sum, item) => sum + item.profileScore, 0) / totalUsers
      : 0;
    const placementReadyCount = scored.filter((item) => item.predictionProbability >= 0.7).length;

    const gapFrequency = new Map<string, number>();
    allMatches.forEach((match) => {
      const gaps = Array.isArray(match.skillGaps) ? match.skillGaps : [];
      gaps.forEach((gap) => {
        const current = gapFrequency.get(gap) || 0;
        gapFrequency.set(gap, current + 1);
      });
    });

    const commonSkillGaps = Array.from(gapFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([skill, count]) => ({ skill, count }));

    res.json({
      totalUsers,
      averageProfileScore: Number(averageProfileScore.toFixed(2)),
      placedPredictionPercentage: totalUsers > 0 ? Number(((placementReadyCount / totalUsers) * 100).toFixed(2)) : 0,
      commonSkillGaps
    });
  } catch (error) {
    console.error('Admin analytics overview error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
};

export const getCompaniesManagement = async (_req: AuthRequest, res: Response) => {
  try {
    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      const companies = Array.from(managedCompanies.values());
      return res.json({ companies });
    }

    const matches = await prisma.companyMatch.findMany({
      select: {
        companyName: true,
        userId: true,
        successProbability: true,
        matchedSkills: true,
        skillGaps: true
      }
    });

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        profile: true
      }
    });

    const usersById = new Map(users.map((user) => [user.id, user]));

    const grouped = new Map<string, {
      companyName: string;
      eligibleStudents: Array<{ userId: string; name: string; email: string; predictionScore: number; matchedSkills: string[] }>;
      averagePredictionScore: number;
      requiredSkills: string[];
      totalCandidates: number;
    }>();

    matches.forEach((match) => {
      const existing = grouped.get(match.companyName);
      const user = usersById.get(match.userId);
      const entry = {
        userId: match.userId,
        name: user?.name || 'User',
        email: user?.email || '',
        predictionScore: Number((toNumber(match.successProbability, 0) / 100).toFixed(2)),
        matchedSkills: Array.isArray(match.matchedSkills) ? match.matchedSkills : []
      };

      if (!existing) {
        grouped.set(match.companyName, {
          companyName: match.companyName,
          eligibleStudents: [entry],
          averagePredictionScore: entry.predictionScore,
          requiredSkills: uniqueStrings(Array.isArray(match.skillGaps) ? match.skillGaps : []),
          totalCandidates: 1
        });
        return;
      }

      existing.eligibleStudents.push(entry);
      existing.totalCandidates += 1;
      existing.averagePredictionScore = Number(
        (
          existing.eligibleStudents.reduce((sum, student) => sum + student.predictionScore, 0) /
          existing.eligibleStudents.length
        ).toFixed(2)
      );
      existing.requiredSkills = uniqueStrings([
        ...existing.requiredSkills,
        ...(Array.isArray(match.skillGaps) ? match.skillGaps : [])
      ]);
    });

    const companies = Array.from(grouped.values()).map((company) => {
      company.eligibleStudents.sort((a, b) => b.predictionScore - a.predictionScore);
      return company;
    });

    const extraManaged = Array.from(managedCompanies.values())
      .filter((company) => !grouped.has(company.name))
      .map((company) => ({
        companyName: company.name,
        eligibleStudents: [],
        averagePredictionScore: 0,
        requiredSkills: company.requiredSkills,
        totalCandidates: 0
      }));

    res.json({ companies: [...companies, ...extraManaged] });
  } catch (error) {
    console.error('Admin companies management error:', error);
    res.status(500).json({ error: 'Failed to fetch companies management data' });
  }
};

export const addManagedCompany = async (req: AuthRequest, res: Response) => {
  try {
    const { name, requiredSkills, minPredictionScore } = req.body as {
      name?: string;
      requiredSkills?: string[];
      minPredictionScore?: number;
    };

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const companyName = name.trim();
    const payload: ManagedCompany = {
      name: companyName,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      minPredictionScore: clamp(toNumber(minPredictionScore, 0.6), 0, 1),
      createdAt: new Date().toISOString()
    };

    managedCompanies.set(companyName, payload);

    res.status(201).json({ message: 'Company added successfully', company: payload });
  } catch (error) {
    console.error('Add managed company error:', error);
    res.status(500).json({ error: 'Failed to add company' });
  }
};

export const deleteUserByAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      const userIndex = (mockUsersCache.users || []).findIndex((user) => user.id === userId);
      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
      }

      mockUsersCache.users.splice(userIndex, 1);
      delete mockProfiles[userId];
      return res.json({ message: 'User deleted successfully' });
    }

    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
