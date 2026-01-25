import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import prisma from '../config/db.js';
import { progressLogSchema } from '../utils/validation.js';

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

// Mock roadmap data
const generateMockRoadmap = (userId: string) => {
  const weeks = Array.from({ length: 16 }, (_, i) => ({
    id: `week-${i + 1}`,
    week: i + 1,
    phase: i < 4 ? 'Foundation' : i < 8 ? 'Intermediate' : i < 12 ? 'Advanced' : 'Interview Prep',
    focusAreas: ['Data Structures', 'Algorithms', 'Problem Solving'],
    targets: [`Complete ${10 + i * 2} problems`, 'Review concepts', 'Practice coding'],
    expectedOutcomes: ['Improved problem-solving', 'Better time complexity understanding'],
    estimatedHours: 20,
    progress: Math.floor(Math.random() * 100),
    tasks: [
      { id: `task-${i}-1`, title: 'Study core concepts', description: 'Review fundamental concepts', estimatedHours: 8, isCompleted: Math.random() > 0.5 },
      { id: `task-${i}-2`, title: 'Solve practice problems', description: 'Complete problem sets', estimatedHours: 10, isCompleted: Math.random() > 0.5 },
      { id: `task-${i}-3`, title: 'Mock interview', description: 'Practice with peers', estimatedHours: 2, isCompleted: Math.random() > 0.5 }
    ]
  }));

  return {
    id: 'mock-roadmap',
    durationWeeks: 16,
    overallProgress: weeks.reduce((sum, w) => sum + w.progress, 0) / weeks.length,
    globalNotes: ['Stay consistent', 'Focus on weak areas', 'Practice daily'],
    weeklyPlan: weeks
  };
};

export const getRoadmap = async (req: AuthRequest, res: Response) => {
  try {
    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      // Return mock roadmap
      return res.json(generateMockRoadmap(req.user.id));
    }

    const roadmap = await prisma.roadmap.findFirst({
      where: {
        userId: req.user.id,
        isActive: true
      },
      include: {
        weeks: {
          include: {
            tasks: true
          },
          orderBy: {
            weekNumber: 'asc'
          }
        }
      }
    });

    if (!roadmap) {
      // Return empty roadmap structure
      return res.json({
        id: null,
        durationWeeks: 16,
        overallProgress: 0,
        globalNotes: [],
        weeklyPlan: []
      });
    }

    // Calculate progress for each week
    const progressLogs = await prisma.progressLog.findMany({
      where: { userId: req.user.id }
    });

    const weekProgress = new Map<number, number>();
    progressLogs.forEach(log => {
      const existing = weekProgress.get(log.weekNumber) || 0;
      weekProgress.set(log.weekNumber, Math.max(existing, log.completionPercent));
    });

    const weeklyPlan = roadmap.weeks.map(week => ({
      id: week.id,
      week: week.weekNumber,
      phase: week.phase,
      focusAreas: week.focusAreas,
      targets: week.targets,
      expectedOutcomes: week.expectedOutcomes,
      estimatedHours: week.estimatedHours,
      progress: weekProgress.get(week.weekNumber) || 0,
      tasks: week.tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        estimatedHours: task.estimatedHours,
        isCompleted: task.isCompleted
      }))
    }));

    const overallProgress = weeklyPlan.reduce((sum, w) => sum + w.progress, 0) / roadmap.weeks.length;

    res.json({
      id: roadmap.id,
      durationWeeks: roadmap.durationWeeks,
      overallProgress: Math.round(overallProgress * 100) / 100,
      globalNotes: roadmap.globalNotes,
      weeklyPlan
    });
  } catch (error) {
    console.error('Get roadmap error:', error);
    res.status(500).json({ error: 'Failed to fetch roadmap' });
  }
};

export const logProgress = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = progressLogSchema.parse(req.body);
    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      // Mock mode - just return success
      return res.json({
        message: 'Progress logged successfully (mock mode)',
        log: {
          id: `log-${Date.now()}`,
          timestamp: new Date()
        }
      });
    }

    const log = await prisma.progressLog.create({
      data: {
        userId: req.user.id,
        weekNumber: validatedData.weekNumber,
        taskId: validatedData.taskId,
        completionPercent: validatedData.completionPercent,
        hoursSpent: validatedData.hoursSpent,
        notes: validatedData.notes
      }
    });

    // Update task completion if taskId provided
    if (validatedData.taskId && validatedData.completionPercent === 100) {
      await prisma.roadmapTask.update({
        where: { id: validatedData.taskId },
        data: {
          isCompleted: true,
          completedAt: new Date()
        }
      });
    }

    res.json({
      message: 'Progress logged successfully',
      log: {
        id: log.id,
        timestamp: log.timestamp
      }
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Log progress error:', error);
    res.status(500).json({ error: 'Failed to log progress' });
  }
};

export const getProgressHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      // Return mock progress history
      const mockHistory = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (30 - i));
        return {
          date: date.toISOString().split('T')[0],
          completionPercent: Math.floor(Math.random() * 40 + 60),
          hoursSpent: Math.floor(Math.random() * 5 + 2)
        };
      });
      return res.json(mockHistory);
    }

    const where: any = { userId: req.user.id };
    
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate as string);
      if (endDate) where.timestamp.lte = new Date(endDate as string);
    }

    const history = await prisma.progressLog.findMany({
      where,
      orderBy: { timestamp: 'asc' },
      select: {
        timestamp: true,
        weekNumber: true,
        completionPercent: true,
        hoursSpent: true
      }
    });

    const formattedHistory = history.map(h => ({
      date: h.timestamp.toISOString().split('T')[0],
      weekNumber: h.weekNumber,
      completionPercent: h.completionPercent,
      hoursSpent: h.hoursSpent
    }));

    res.json({ history: formattedHistory });
  } catch (error) {
    console.error('Get progress history error:', error);
    res.status(500).json({ error: 'Failed to fetch progress history' });
  }
};
