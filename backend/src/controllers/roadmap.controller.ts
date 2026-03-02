import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import prisma from '../config/db.js';
import { progressLogSchema, roadmapPreferencesSchema } from '../utils/validation.js';
import { mockProfiles } from './profile.controller.js';

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

// Store for roadmap preferences
const roadmapPreferences: any = {};

// Generate user summary from preferences
const generateUserSummary = (preferences: any, userProfile: any) => {
  const { learningPurpose, specificGoals, currentLevel, timePerDay, urgency, weakAreas, targetDate } = preferences;
  
  const levelDescriptions = {
    beginner: 'starting their coding journey',
    intermediate: 'with some programming experience',
    advanced: 'with a strong technical foundation',
    expert: 'who is interview-ready and seeking final polish'
  };

  const urgencyDescriptions = {
    relaxed: 'prefers a steady, manageable pace',
    moderate: 'aims for consistent progress',
    urgent: 'needs accelerated learning due to tight deadlines'
  };

  const hoursPerWeek = timePerDay * 7;
  const weeksAvailable = targetDate ? 
    Math.max(1, Math.ceil((new Date(targetDate).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000))) : 16;

  const summary = `${userProfile?.name || 'The student'} is ${levelDescriptions[currentLevel as keyof typeof levelDescriptions]} ` +
    `and ${urgencyDescriptions[urgency as keyof typeof urgencyDescriptions]}. ` +
    `Their primary goal is: "${learningPurpose}". ` +
    `They are targeting ${specificGoals.slice(0, 3).join(', ')}${specificGoals.length > 3 ? ', and more' : ''}. ` +
    `With ${timePerDay} hours available daily (${hoursPerWeek} hours/week) over the next ${weeksAvailable} weeks, ` +
    `they need focused attention on ${weakAreas.length > 0 ? weakAreas.slice(0, 3).join(', ') : 'comprehensive skill development'}. ` +
    (targetDate ? `Timeline: Completion target by ${new Date(targetDate).toLocaleDateString()}.` : '');

  return summary;
};

// Mock roadmap data with preferences
const generateMockRoadmap = (userId: string, preferences?: any) => {
  const userProfile = mockProfiles[userId] || {};
  const prefs = preferences || roadmapPreferences[userId] || {};
  
  // Calculate intensity based on time and urgency
  const timePerDay = prefs.timePerDay || 2;
  const urgency = prefs.urgency || 'moderate';
  const currentLevel = prefs.currentLevel || 'intermediate';
  const weakAreas = prefs.weakAreas || [];
  const specificGoals = prefs.specificGoals || [];
  
  const intensityMultiplier = urgency === 'urgent' ? 1.5 : urgency === 'relaxed' ? 0.7 : 1;
  const problemsPerWeek = Math.floor(timePerDay * 5 * intensityMultiplier);
  const hoursPerWeek = timePerDay * 7;
  
  // Define phase focus based on user level and weak areas
  const getPhaseFocus = (weekNum: number) => {
    if (currentLevel === 'beginner') {
      if (weekNum <= 4) return { phase: 'Foundation', areas: ['Arrays', 'Strings', 'Basic Math', 'Sorting'] };
      if (weekNum <= 8) return { phase: 'Core DSA', areas: ['LinkedList', 'Stacks', 'Queues', 'Recursion'] };
      if (weekNum <= 12) return { phase: 'Intermediate', areas: ['Trees', 'Hashing', 'Binary Search', 'Graphs'] };
      return { phase: 'Interview Prep', areas: ['Dynamic Programming', 'Mock Interviews', 'System Design Basics'] };
    } else if (currentLevel === 'intermediate') {
      if (weekNum <= 4) return { phase: 'DSA Mastery', areas: ['Advanced Trees', 'Graphs', 'DP Patterns'] };
      if (weekNum <= 8) return { phase: 'Problem Solving', areas: ['Greedy', 'Backtracking', 'Bit Manipulation'] };
      if (weekNum <= 12) return { phase: 'System Design', areas: ['LLD', 'HLD', 'Scalability', 'Databases'] };
      return { phase: 'Mock & Polish', areas: ['Company-Specific', 'Behavioral', 'Final Prep'] };
    } else {
      if (weekNum <= 4) return { phase: 'Advanced Topics', areas: ['Complex DP', 'Graph Algorithms', 'Advanced DS'] };
      if (weekNum <= 8) return { phase: 'System Design Deep-Dive', areas: ['Distributed Systems', 'Scalability', 'Real Projects'] };
      if (weekNum <= 12) return { phase: 'Company Prep', areas: ['Company-Specific Patterns', 'Product Design'] };
      return { phase: 'Final Sprint', areas: ['Mock Interviews', 'Resume', 'Negotiations'] };
    }
  };

  // Generate personalized weeks
  const weeks = Array.from({ length: 16 }, (_, i) => {
    const weekNum = i + 1;
    const phaseFocus = getPhaseFocus(weekNum);
    
    // Include weak areas in early weeks
    const focusAreas = weekNum <= 8 && weakAreas.length > 0 
      ? [...phaseFocus.areas.slice(0, 2), ...weakAreas.slice(0, 2)]
      : phaseFocus.areas;

    // Generate targets based on goals
    const targets = [
      `Solve ${problemsPerWeek + weekNum} problems`,
      ...specificGoals.slice(0, 2).map(goal => `Progress on: ${goal}`),
      'Complete all assigned tasks',
      'Review and revise concepts'
    ];

    return {
      id: `week-${weekNum}`,
      week: weekNum,
      phase: phaseFocus.phase,
      focusAreas: focusAreas.slice(0, 4),
      targets: targets.slice(0, 5),
      expectedOutcomes: [
        'Strengthen problem-solving skills',
        'Master key concepts',
        weekNum % 4 === 0 ? 'Complete phase milestone' : 'Build momentum'
      ],
      estimatedHours: Math.round(hoursPerWeek),
      progress: 0,
      tasks: [
        { 
          id: `task-${weekNum}-1`, 
          title: `Master ${focusAreas[0] || 'Core Concepts'}`, 
          description: 'Deep dive into theory and practice', 
          estimatedHours: Math.round(hoursPerWeek * 0.4), 
          isCompleted: false 
        },
        { 
          id: `task-${weekNum}-2`, 
          title: `Solve ${problemsPerWeek} problems`, 
          description: 'Practice problems on focused topics', 
          estimatedHours: Math.round(hoursPerWeek * 0.5), 
          isCompleted: false 
        },
        { 
          id: `task-${weekNum}-3`, 
          title: 'Review and document learnings', 
          description: 'Consolidate knowledge and track progress', 
          estimatedHours: Math.round(hoursPerWeek * 0.1), 
          isCompleted: false 
        }
      ]
    };
  });

  // Generate summary if preferences exist
  const summary = prefs.learningPurpose ? generateUserSummary(prefs, userProfile) : null;

  return {
    id: 'mock-roadmap',
    durationWeeks: 16,
    overallProgress: 0,
    overallCompletion: 0,
    generatedAt: new Date().toISOString(),
    userSummary: summary,
    globalNotes: [
      'Stay consistent with daily practice',
      `Dedicate ${timePerDay} hours daily`,
      urgency === 'urgent' ? 'Maintain high intensity - deadline approaching!' : 'Pace yourself and avoid burnout',
      ...specificGoals.slice(0, 2)
    ],
    weeklyPlan: weeks,
    preferences: prefs
  };
};

export const getRoadmap = async (req: AuthRequest, res: Response) => {
  try {
    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      // Return mock roadmap with user preferences
      const preferences = roadmapPreferences[req.user.id];
      return res.json(generateMockRoadmap(req.user.id, preferences));
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

export const saveRoadmapPreferences = async (req: AuthRequest, res: Response) => {
  try {
    console.log('📝 Saving roadmap preferences');
    console.log('User ID:', req.user.id);
    console.log('Preferences:', JSON.stringify(req.body, null, 2));

    const validatedData = roadmapPreferencesSchema.parse(req.body);
    
    // Store preferences in memory (in mock mode)
    roadmapPreferences[req.user.id] = validatedData;
    
    // Generate user summary
    const userProfile = mockProfiles[req.user.id] || {};
    const summary = generateUserSummary(validatedData, userProfile);
    
    console.log('✅ Preferences saved');
    console.log('User Summary:', summary);

    res.json({
      message: 'Preferences saved successfully',
      summary: summary,
      preferences: validatedData
    });
  } catch (error: any) {
    console.error('❌ Save preferences error:', error);
    if (error.name === 'ZodError') {
      console.error('Validation errors:', error.errors);
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save preferences' });
  }
};

export const getRoadmapPreferences = async (req: AuthRequest, res: Response) => {
  try {
    const preferences = roadmapPreferences[req.user.id];
    
    if (!preferences) {
      return res.status(404).json({ error: 'No preferences found', hasPreferences: false });
    }

    const userProfile = mockProfiles[req.user.id] || {};
    const summary = generateUserSummary(preferences, userProfile);

    res.json({
      hasPreferences: true,
      preferences,
      summary
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
};
