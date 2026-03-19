import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import prisma from '../config/db.js';
import { progressLogSchema, roadmapPreferencesSchema } from '../utils/validation.js';
import { mockProfiles } from './profile.controller.js';
import { CourseRoadmapRequest, generateCourseRoadmapWithAI } from '../services/llm.service.js';
import { getYouTubeRecommendations } from '../services/youtube.service.js';

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

const durationUnitToDays: Record<CourseRoadmapRequest['durationUnit'], number> = {
  days: 1,
  weeks: 7,
  months: 28
};

const calculateDurationWeeks = (preferences: CourseRoadmapRequest) => {
  const totalDays = preferences.durationValue * durationUnitToDays[preferences.durationUnit];
  return Math.max(1, Math.min(52, Math.ceil(totalDays / 7)));
};

// Generate user summary from preferences
const generateUserSummary = (preferences: CourseRoadmapRequest, userProfile: any) => {
  const { courseName, currentLevel, timePerDay, durationValue, durationUnit, experienceNotes, additionalNotes } = preferences;

  const levelDescriptions = {
    beginner: 'starting from the fundamentals',
    intermediate: 'building on some existing familiarity',
    advanced: 'already comfortable with the core concepts',
    expert: 'optimizing for mastery and depth'
  };

  const hoursPerWeek = timePerDay * 7;
  const weeksAvailable = calculateDurationWeeks(preferences);

  const summary = `${userProfile?.name || 'The learner'} wants to complete ${courseName} and is ${levelDescriptions[currentLevel]}. ` +
    `They can invest ${timePerDay} hours per day (${hoursPerWeek} hours per week) and want to finish within ${durationValue} ${durationUnit}. ` +
    `This roadmap is structured for ${weeksAvailable} weeks of focused progression.` +
    (experienceNotes ? ` Prior experience: ${experienceNotes}.` : '') +
    (additionalNotes ? ` Additional preferences: ${additionalNotes}.` : '');

  return summary;
};

const buildMockRoadmap = (preferences: CourseRoadmapRequest) => {
  const durationWeeks = calculateDurationWeeks(preferences);
  const estimatedHours = Math.max(1, Math.round(preferences.timePerDay * 7));
  const phaseSize = Math.max(1, Math.ceil(durationWeeks / 4));
  const phaseLabels = ['Foundation', 'Core Concepts', 'Hands-On Projects', 'Mastery and Review'];
  const course = preferences.courseName;

  const focusPool = [
    `${course} fundamentals`,
    `${course} core concepts`,
    `${course} practical exercises`,
    `${course} debugging and troubleshooting`,
    `${course} project implementation`,
    `${course} optimization`,
    `${course} advanced patterns`,
    `${course} revision and reinforcement`
  ];

  const outcomePool = [
    `Stronger command over ${course} basics`,
    `Improved ability to apply ${course} concepts`,
    `More confidence solving ${course} tasks`,
    `Clearer understanding of practical ${course} workflows`
  ];

  const weeklyPlan = Array.from({ length: durationWeeks }, (_, index) => {
    const weekNumber = index + 1;
    const phase = phaseLabels[Math.min(phaseLabels.length - 1, Math.floor(index / phaseSize))];
    const focusA = focusPool[index % focusPool.length];
    const focusB = focusPool[(index + 2) % focusPool.length];
    const focusC = weekNumber % 3 === 0 ? `${course} mini project` : `${course} review drills`;

    const uniqueActionTarget = weekNumber % 4 === 1
      ? `Solve ${2 + (weekNumber % 3)} focused practice tasks for week ${weekNumber}`
      : weekNumber % 4 === 2
      ? `Implement one practical ${course} feature in a small sandbox project`
      : weekNumber % 4 === 3
      ? `Debug and improve ${1 + (weekNumber % 3)} previous exercises from earlier weeks`
      : `Create a concise revision sheet and self-test for week ${weekNumber}`;

    const milestoneTarget = weekNumber % 3 === 0
      ? `Build a mini project milestone for week ${weekNumber}`
      : `Complete a ${preferences.currentLevel} level checkpoint for week ${weekNumber}`;

    return {
      id: `week-${weekNumber}`,
      week: weekNumber,
      phase,
      focusAreas: [
        focusA,
        focusB,
        weekNumber === durationWeeks ? `${course} final revision and capstone wrap-up` : focusC
      ],
      targets: [
        `Study ${course} for ${preferences.timePerDay} hour(s) per day (${estimatedHours} hours total this week)`,
        uniqueActionTarget,
        milestoneTarget
      ],
      expectedOutcomes: [
        outcomePool[index % outcomePool.length],
        weekNumber === durationWeeks ? `Ready to complete the ${course} learning goal` : 'Clear understanding of this week\'s concepts'
      ],
      reasoning: `Week ${weekNumber} focuses on a distinct ${phase.toLowerCase()} milestone for ${course}, aligned with your ${preferences.timePerDay} hour/day commitment and ${preferences.durationValue} ${preferences.durationUnit} timeline.`,
      priorityScore: Number(Math.max(0.5, 1 - index * 0.02).toFixed(2)),
      estimatedHours,
      progress: 0,
      tasks: []
    };
  });

  return {
    id: `mock-roadmap-${Date.now()}`,
    durationWeeks,
    overallProgress: 0,
    overallCompletion: 0,
    generatedAt: new Date().toISOString(),
    globalNotes: [
      'Keep your daily study slot fixed to maintain momentum.',
      'Do one short recap at the end of every week before moving ahead.',
      'Convert theory into a small deliverable or exercise every week.'
    ],
    weeklyPlan
  };
};

const buildRoadmapResponse = async (
  roadmap: any,
  preferences: CourseRoadmapRequest,
  userProfile: any,
  progressMap?: Map<number, number>
) => {
  const youtubeVideos = await getYouTubeRecommendations(preferences.courseName, preferences.currentLevel);
  const weeklyPlan = roadmap.weeklyPlan
    ? roadmap.weeklyPlan.map((week: any) => ({
        ...week,
        progress: progressMap?.get(week.week) || week.progress || 0,
        completionPercent: progressMap?.get(week.week) || week.progress || 0,
        tasks: week.tasks || []
      }))
    : roadmap.weeks.map((week: any) => ({
        id: week.id,
        week: week.weekNumber,
        phase: week.phase,
        focusAreas: week.focusAreas,
        targets: week.targets,
        expectedOutcomes: week.expectedOutcomes,
        reasoning: week.reasoning,
        priorityScore: week.priorityScore,
        estimatedHours: week.estimatedHours,
        progress: progressMap?.get(week.weekNumber) || 0,
        completionPercent: progressMap?.get(week.weekNumber) || 0,
        tasks: week.tasks || []
      }));

  const overallCompletion = weeklyPlan.length > 0
    ? weeklyPlan.reduce((sum: number, week: any) => sum + (week.progress || 0), 0) / weeklyPlan.length
    : 0;

  return {
    id: roadmap.id,
    durationWeeks: roadmap.durationWeeks,
    overallProgress: Number(overallCompletion.toFixed(2)),
    overallCompletion: Number(overallCompletion.toFixed(2)),
    generatedAt: roadmap.generatedAt || new Date().toISOString(),
    userSummary: generateUserSummary(preferences, userProfile),
    globalNotes: roadmap.globalNotes || [],
    weeklyPlan,
    preferences,
    youtubeVideos,
    aiGenerated: Boolean(roadmap.aiGenerated)
  };
};

const generateRoadmapFromPreferences = async (preferences: CourseRoadmapRequest) => {
  try {
    const aiRoadmap = await generateCourseRoadmapWithAI(preferences);
    return {
      id: `ai-roadmap-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      aiGenerated: true,
      ...aiRoadmap,
      weeklyPlan: aiRoadmap.weeklyPlan.map((week: any) => ({
        ...week,
        progress: 0,
        completionPercent: 0,
        tasks: []
      }))
    };
  } catch (error: any) {
    console.log('⚠️  AI generation failed, using structured fallback:', error.message);
    return {
      aiGenerated: false,
      ...buildMockRoadmap(preferences)
    };
  }
};

export const getRoadmap = async (req: AuthRequest, res: Response) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    const preferences = roadmapPreferences[req.user.id] as CourseRoadmapRequest | undefined;
    const userProfile = mockProfiles[req.user.id] || {};

    if (!preferences) {
      return res.json({
        id: null,
        durationWeeks: 0,
        overallProgress: 0,
        overallCompletion: 0,
        generatedAt: null,
        globalNotes: [],
        weeklyPlan: [],
        preferences: null,
        userSummary: null,
        youtubeVideos: [],
        hasPreferences: false
      });
    }

    if (!dbAvailable) {
      const generatedRoadmap = await generateRoadmapFromPreferences(preferences);
      return res.json(await buildRoadmapResponse(generatedRoadmap, preferences, userProfile));
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
      const generatedRoadmap = await generateRoadmapFromPreferences(preferences);
      const createdRoadmap = await prisma.roadmap.create({
        data: {
          userId: req.user.id,
          durationWeeks: generatedRoadmap.durationWeeks,
          globalNotes: generatedRoadmap.globalNotes || [],
          isActive: true,
          weeks: {
            create: generatedRoadmap.weeklyPlan.map((week: any) => ({
              weekNumber: week.week,
              phase: week.phase || 'Foundation',
              focusAreas: week.focusAreas,
              targets: week.targets,
              expectedOutcomes: week.expectedOutcomes,
              reasoning: week.reasoning,
              priorityScore: week.priorityScore,
              estimatedHours: week.estimatedHours
            }))
          }
        },
        include: {
          weeks: {
            include: { tasks: true },
            orderBy: { weekNumber: 'asc' }
          }
        }
      });

      return res.json(await buildRoadmapResponse(createdRoadmap, preferences, userProfile));
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

    res.json(await buildRoadmapResponse(roadmap, preferences, userProfile, weekProgress));
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

    const finalValidatedData = roadmapPreferencesSchema.parse(req.body) as CourseRoadmapRequest;
    
    // Store preferences in memory (in mock mode)
    roadmapPreferences[req.user.id] = finalValidatedData;

    const dbAvailable = await isDatabaseAvailable();
    if (dbAvailable) {
      await prisma.roadmap.updateMany({
        where: { userId: req.user.id, isActive: true },
        data: { isActive: false }
      });
    }
    
    // Generate user summary
    const userProfile = mockProfiles[req.user.id] || {};
    const summary = generateUserSummary(finalValidatedData, userProfile);
    
    console.log('✅ Preferences saved successfully');
    console.log('📊 User Summary:', summary);
    console.log('🤖 Gemini AI will generate personalized roadmap based on these preferences');

    res.json({
      message: 'Preferences saved successfully. Your personalized course roadmap will be generated using AI and enriched with YouTube videos.',
      summary: summary,
      preferences: finalValidatedData
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
    const preferences = roadmapPreferences[req.user.id] as CourseRoadmapRequest | undefined;
    
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
