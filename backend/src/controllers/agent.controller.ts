import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import prisma from '../config/db.js';
import { generateRoadmapWithAI, generateDashboardInsights } from '../services/llm.service.js';
import { roadmapSchema, insightsResponseSchema } from '../utils/validation.js';

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

export const generateRoadmap = async (req: AuthRequest, res: Response) => {
  const startTime = Date.now();
  let dbAvailable = false;

  try {
    const userId = req.user.id;
    dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      return res.status(503).json({
        error: 'Database unavailable',
        message: 'Roadmaps require MongoDB because they depend on persisted profile and progress data.'
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { user: { select: { name: true, email: true } } }
    });

    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found',
        message: 'Please complete your profile before generating a roadmap.'
      });
    }

    const progressLogs = await prisma.progressLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    const analytics = {
      consistencyScore: progressLogs.length > 0 ? 75 : 0,
      weakAreas: ['Dynamic Programming', 'System Design']
    };

    const currentRoadmap = await prisma.roadmap.findFirst({
      where: { userId, isActive: true },
      include: { weeks: true }
    });

    const roadmapData = await generateRoadmapWithAI(
      { ...profile, name: profile.user.name },
      analytics,
      currentRoadmap
    );

    const validated = roadmapSchema.parse(roadmapData);

    if (currentRoadmap) {
      await prisma.roadmap.update({
        where: { id: currentRoadmap.id },
        data: { isActive: false }
      });
    }

    const newRoadmap = await prisma.roadmap.create({
      data: {
        userId,
        durationWeeks: validated.durationWeeks,
        globalNotes: validated.globalNotes || [],
        weeks: {
          create: validated.weeklyPlan.map((week) => ({
            weekNumber: week.week,
            phase: week.phase,
            focusAreas: week.focusAreas,
            targets: week.targets,
            expectedOutcomes: week.expectedOutcomes,
            reasoning: week.reasoning,
            priorityScore: week.priorityScore,
            estimatedHours: week.estimatedHours
          }))
        }
      },
      include: { weeks: true }
    });

    await prisma.agentLog.create({
      data: {
        userId,
        agentType: 'roadmap_generation',
        inputPrompt: 'Generate roadmap',
        inputData: { profile: profile.id, analytics },
        outputData: validated,
        status: 'success',
        latencyMs: Date.now() - startTime
      }
    });

    res.json({
      roadmap: {
        id: newRoadmap.id,
        durationWeeks: newRoadmap.durationWeeks,
        weeklyPlan: newRoadmap.weeks.map((week) => ({
          week: week.weekNumber,
          phase: week.phase,
          focusAreas: week.focusAreas,
          targets: week.targets,
          expectedOutcomes: week.expectedOutcomes,
          reasoning: week.reasoning,
          priorityScore: week.priorityScore,
          estimatedHours: week.estimatedHours
        })),
        globalNotes: newRoadmap.globalNotes
      },
      message: 'Roadmap generated successfully'
    });
  } catch (error: any) {
    if (dbAvailable) {
      try {
        await prisma.agentLog.create({
          data: {
            userId: req.user.id,
            agentType: 'roadmap_generation',
            inputPrompt: 'Generate roadmap',
            inputData: {},
            outputData: {},
            status: 'error',
            errorMessage: error.message,
            latencyMs: Date.now() - startTime
          }
        });
      } catch (logError: any) {
        console.error('Failed to log roadmap generation error:', logError.message);
      }
    }

    console.error('Generate roadmap error:', error);
    res.status(500).json({ error: 'Failed to generate roadmap', details: error.message });
  }
};

export const getDashboardInsights = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      return res.status(503).json({
        error: 'Database unavailable',
        message: 'Dashboard insights require MongoDB because they are generated from persisted profile and activity data.'
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found',
        message: 'Complete your profile before requesting dashboard insights.'
      });
    }

    const progressLogs = await prisma.progressLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 20
    });

    if (progressLogs.length === 0) {
      return res.status(409).json({
        error: 'Insufficient tracked activity',
        message: 'Log roadmap progress first so dashboard insights can be based on real user activity.'
      });
    }

    const analytics = {
      weeklyProgress: progressLogs.length > 0 ? 65 : 0,
      consistencyScore: 72
    };

    const insights = await generateDashboardInsights(profile, progressLogs, analytics);
    const validated = insightsResponseSchema.parse(insights);

    await Promise.all(
      validated.map((insight) =>
        prisma.optimizationInsight.create({
          data: {
            userId,
            type: 'agent_insight',
            title: insight.title,
            priority: insight.priority === 'high' ? 0.9 : insight.priority === 'medium' ? 0.6 : 0.3,
            data: insight
          }
        })
      )
    );

    res.json({
      insights: validated,
      generatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Get dashboard insights error:', error);
    res.status(500).json({ error: 'Failed to generate insights', details: error.message });
  }
};
