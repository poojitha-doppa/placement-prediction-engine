import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import prisma from '../config/db.js';
import { generateRoadmapWithAI, generateDashboardInsights } from '../services/llm.service.js';
import { roadmapSchema, insightsResponseSchema } from '../utils/validation.js';

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

// Generate mock roadmap when AI is not available
const generateMockRoadmap = (userId: string) => {
  const phases = ['Foundation', 'Core Skills', 'Advanced Topics', 'Interview Prep'];
  const weeklyPlan = Array.from({ length: 16 }, (_, i) => ({
    week: i + 1,
    phase: phases[Math.floor(i / 4)],
    focusAreas: ['Data Structures', 'Algorithms', 'Problem Solving'],
    targets: [
      `Complete ${10 + i * 2} coding problems`,
      'Review key concepts',
      'Practice mock interviews'
    ],
    expectedOutcomes: [
      'Improved problem-solving speed',
      'Better understanding of patterns'
    ],
    reasoning: 'Progressive skill building approach',
    priorityScore: 0.8 - (i * 0.02),
    estimatedHours: 12
  }));

  return {
    id: `mock-roadmap-${userId}`,
    durationWeeks: 16,
    weeklyPlan,
    globalNotes: [
      'Practice consistently every day',
      'Focus on understanding patterns, not memorization',
      'Track your progress weekly'
    ],
    overallProgress: 0
  };
};

export const generateRoadmap = async (req: AuthRequest, res: Response) => {
  const startTime = Date.now();
  
  try {
    const userId = req.user.id;
    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      // Mock mode - use AI with mock profile data
      const mockProfile = {
        name: req.user.name || 'User',
        email: req.user.email,
        college: 'Your College',
        branch: 'Computer Science',
        year: 2026,
        cgpa: 8.0,
        skills: ['JavaScript', 'Python', 'React'],
        targetCompanies: ['Google', 'Microsoft', 'Amazon'],
        targetRoles: ['Software Engineer', 'Full Stack Developer'],
        availableHoursPerWeek: 15
      };

      const mockAnalytics = {
        consistencyScore: 70,
        weakAreas: ['Dynamic Programming', 'System Design']
      };

      try {
        // Try to generate with AI
        const roadmapData = await generateRoadmapWithAI(mockProfile, mockAnalytics, null);
        
        return res.json({
          roadmap: {
            id: `mock-${Date.now()}`,
            durationWeeks: roadmapData.durationWeeks,
            weeklyPlan: roadmapData.weeklyPlan,
            globalNotes: roadmapData.globalNotes,
            overallProgress: 0
          },
          message: '✨ AI-powered roadmap generated successfully! (Mock mode - not saved)',
          note: 'Connect a database to save your roadmap'
        });
      } catch (aiError: any) {
        // If AI fails, return mock roadmap
        console.log('⚠️  AI generation failed, using mock roadmap:', aiError.message);
        return res.json({
          roadmap: generateMockRoadmap(userId),
          message: 'Mock roadmap generated (AI not configured)',
          note: 'Add GEMINI_API_KEY to .env for AI-powered roadmaps'
        });
      }
    }

    // Database mode - original logic
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { user: { select: { name: true, email: true } } }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found. Please complete your profile first.' });
    }

    // Get analytics
    const progressLogs = await prisma.progressLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    const analytics = {
      consistencyScore: progressLogs.length > 0 ? 75 : 0,
      weakAreas: ['Dynamic Programming', 'System Design']
    };

    // Get current roadmap if exists
    const currentRoadmap = await prisma.roadmap.findFirst({
      where: { userId, isActive: true },
      include: { weeks: true }
    });

    // Generate with AI
    const roadmapData = await generateRoadmapWithAI(
      { ...profile, name: profile.user.name },
      analytics,
      currentRoadmap
    );

    // Validate
    const validated = roadmapSchema.parse(roadmapData);

    // Deactivate old roadmap
    if (currentRoadmap) {
      await prisma.roadmap.update({
        where: { id: currentRoadmap.id },
        data: { isActive: false }
      });
    }

    // Create new roadmap
    const newRoadmap = await prisma.roadmap.create({
      data: {
        userId,
        durationWeeks: validated.durationWeeks,
        globalNotes: validated.globalNotes || [],
        weeks: {
          create: validated.weeklyPlan.map(week => ({
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

    // Log agent call
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
        weeklyPlan: newRoadmap.weeks.map(w => ({
          week: w.weekNumber,
          phase: w.phase,
          focusAreas: w.focusAreas,
          targets: w.targets,
          expectedOutcomes: w.expectedOutcomes,
          reasoning: w.reasoning,
          priorityScore: w.priorityScore,
          estimatedHours: w.estimatedHours
        })),
        globalNotes: newRoadmap.globalNotes
      },
      message: 'Roadmap generated successfully'
    });
  } catch (error: any) {
    // Log error
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

    console.error('Generate roadmap error:', error);
    res.status(500).json({ error: 'Failed to generate roadmap', details: error.message });
  }
};

export const getDashboardInsights = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;

    // Get data
    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    const progressLogs = await prisma.progressLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 20
    });

    const analytics = {
      weeklyProgress: progressLogs.length > 0 ? 65 : 0,
      consistencyScore: 72
    };

    // Generate insights
    const insights = await generateDashboardInsights(profile, progressLogs, analytics);

    // Validate
    const validated = insightsResponseSchema.parse(insights);

    // Store insights
    await Promise.all(
      validated.map(insight =>
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
    res.status(500).json({ error: 'Failed to generate insights' });
  }
};
