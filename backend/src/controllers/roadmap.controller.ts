import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import prisma from '../config/db.js';
import { manualRoadmapSchema, progressLogSchema, roadmapPreferencesSchema } from '../utils/validation.js';
import { CourseRoadmapRequest, generateCourseRoadmapWithAI } from '../services/llm.service.js';
import { getYouTubeRecommendations } from '../services/youtube.service.js';
import { createNotification } from '../services/notification.service.js';

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

const durationUnitToDays: Record<CourseRoadmapRequest['durationUnit'], number> = {
  days: 1,
  weeks: 7,
  months: 28
};

const calculateDurationWeeks = (preferences: CourseRoadmapRequest) => {
  const totalDays = preferences.durationValue * durationUnitToDays[preferences.durationUnit];
  return Math.max(1, Math.min(52, Math.ceil(totalDays / 7)));
};

const parseStoredPreferences = (value: unknown): CourseRoadmapRequest | undefined => {
  const parsed = roadmapPreferencesSchema.safeParse(value);
  return parsed.success ? parsed.data as CourseRoadmapRequest : undefined;
};

const parseStoredManualRoadmap = (value: unknown) => {
  const parsed = manualRoadmapSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
};

const getPersistedPreferences = async (userId: string) => {
  const record = await prisma.optimizationInsight.findFirst({
    where: {
      userId,
      type: 'roadmap_preferences'
    },
    orderBy: {
      generatedAt: 'desc'
    }
  });

  return parseStoredPreferences(record?.data);
};

const getPersistedManualRoadmap = async (userId: string) => {
  const record = await prisma.optimizationInsight.findFirst({
    where: {
      userId,
      type: 'manual_roadmap'
    },
    orderBy: {
      generatedAt: 'desc'
    }
  });

  if (!record) {
    return null;
  }

  const parsed = parseStoredManualRoadmap(record.data);
  if (!parsed) {
    return null;
  }

  return {
    ...parsed,
    id: record.id,
    generatedAt: record.generatedAt.toISOString()
  };
};

const getSummaryProfile = async (userId: string) => {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });

  if (!profile) {
    return {};
  }

  return {
    ...profile,
    name: profile.user?.name,
    email: profile.user?.email
  };
};

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

  return `${userProfile?.name || 'The learner'} wants to complete ${courseName} and is ${levelDescriptions[currentLevel]}. ` +
    `They can invest ${timePerDay} hours per day (${hoursPerWeek} hours per week) and want to finish within ${durationValue} ${durationUnit}. ` +
    `This roadmap is structured for ${weeksAvailable} weeks of focused progression.` +
    (experienceNotes ? ` Prior experience: ${experienceNotes}.` : '') +
    (additionalNotes ? ` Additional preferences: ${additionalNotes}.` : '');
};

const getSystemSignals = async (userId: string) => {
  const [profile, companyMatches, insights] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.companyMatch.findMany({
      where: { userId },
      orderBy: { fitScore: 'desc' },
      take: 5
    }),
    prisma.optimizationInsight.findMany({
      where: {
        userId,
        type: {
          in: ['agent_insight', 'roadmap_preferences']
        }
      },
      orderBy: { generatedAt: 'desc' },
      take: 5
    })
  ]);

  return {
    profile,
    companyMatches,
    insights
  };
};

const buildSystemNotes = async (userId: string) => {
  const [{ profile, companyMatches }, progressLogs] = await Promise.all([
    getSystemSignals(userId),
    prisma.progressLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 6
    })
  ]);
  const notes: string[] = [];

  if (profile?.targetCompanies?.length) {
    notes.push(`Target companies considered: ${profile.targetCompanies.slice(0, 5).join(', ')}`);
  }

  if (companyMatches.length > 0) {
    const topMatch = companyMatches[0];
    notes.push(`Top current company match: ${topMatch.companyName} (${Math.round(topMatch.fitScore)}% fit)`);
    if (topMatch.skillGaps.length > 0) {
      notes.push(`Highest-priority skill gaps: ${topMatch.skillGaps.slice(0, 3).join(', ')}`);
    }
  }

  if (typeof profile?.leetcodeSolved === 'number') {
    notes.push(`Current tracked LeetCode count: ${profile.leetcodeSolved}`);
  }

  if (profile?.skills?.length) {
    notes.push(`Current merged skill profile includes: ${profile.skills.slice(0, 6).join(', ')}`);
  }

  if (progressLogs.length > 0) {
    const averageProgress = progressLogs.reduce((sum, log) => sum + log.completionPercent, 0) / progressLogs.length;
    if (averageProgress < 45) {
      notes.push('Recent roadmap progress is behind plan, so this roadmap prioritizes faster confidence-building milestones.');
    } else if (averageProgress >= 75) {
      notes.push('Recent roadmap progress is strong, so this roadmap can safely increase difficulty and interview focus.');
    }
  }

  return notes;
};

const buildDeterministicRoadmapFallback = (preferences: CourseRoadmapRequest) => {
  const durationWeeks = calculateDurationWeeks(preferences);
  const course = preferences.courseName;
  const hoursPerWeek = Math.max(1, Math.round(preferences.timePerDay * 7));

  const phases = [
    'Foundation',
    'Core Concepts',
    'Practice and Projects',
    'Revision and Interview Readiness'
  ];

  const focusSeeds = [
    `${course} fundamentals`,
    `${course} syntax and core constructs`,
    `${course} hands-on exercises`,
    `${course} debugging techniques`,
    `${course} intermediate problem solving`,
    `${course} mini project development`,
    `${course} optimization patterns`,
    `${course} revision and interview preparation`
  ];

  const weeklyPlan = Array.from({ length: durationWeeks }, (_, index) => {
    const week = index + 1;
    const phaseIndex = Math.min(phases.length - 1, Math.floor((index / durationWeeks) * phases.length));

    return {
      week,
      phase: phases[phaseIndex],
      focusAreas: [
        focusSeeds[index % focusSeeds.length],
        focusSeeds[(index + 2) % focusSeeds.length],
        week === durationWeeks ? `${course} final revision` : `${course} applied practice`
      ],
      targets: [
        `Study ${course} for ${preferences.timePerDay} hour(s) per day (${hoursPerWeek} hours total this week)`,
        `Complete ${2 + (week % 3)} measurable tasks related to week ${week} topics`,
        week % 2 === 0
          ? `Build or refine one mini-project milestone for week ${week}`
          : `Solve a focused practice set covering this week's ${course} topics`
      ],
      expectedOutcomes: [
        `Clear progress on ${course} skills for week ${week}`,
        `A stronger understanding of the week's core concepts`
      ],
      reasoning: `This week builds structured momentum for ${course} based on your selected level and available study time.`,
      priorityScore: Number(Math.max(0.65, 1 - index * 0.02).toFixed(2)),
      estimatedHours: hoursPerWeek
    };
  });

  return {
    durationWeeks,
    weeklyPlan,
    globalNotes: [
      'This roadmap was generated using the built-in fallback planner because the AI provider was unavailable.',
      'You can still track progress, regenerate later, and refine the plan after external services recover.',
      'Use progress logs and company-gap data to keep improving recommendations.'
    ],
    aiGenerated: false
  };
};

const getAdaptiveRoadmapGuidance = async (userId: string, weekNumber: number, completionPercent: number) => {
  const recentLogs = await prisma.progressLog.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' },
    take: 8
  });

  const averageProgress = recentLogs.length > 0
    ? recentLogs.reduce((sum, log) => sum + log.completionPercent, 0) / recentLogs.length
    : completionPercent;

  if (completionPercent < 40 || averageProgress < 45) {
    return {
      shouldRegenerate: true,
      message: `Week ${weekNumber} progress is lower than expected. Regenerating the roadmap can rebalance the next weeks around your current pace.`,
      actionLabel: 'Regenerate roadmap'
    };
  }

  if (completionPercent >= 85 && averageProgress >= 75) {
    return {
      shouldRegenerate: true,
      message: `Your recent roadmap progress is ahead of schedule. Regenerating the roadmap can raise the difficulty and shift more focus toward company-specific preparation.`,
      actionLabel: 'Generate a harder plan'
    };
  }

  return {
    shouldRegenerate: false,
    message: 'Progress logged successfully.',
    actionLabel: null
  };
};

const buildRoadmapResponse = async (
  roadmap: any,
  preferences: CourseRoadmapRequest,
  userProfile: any,
  roadmapType: 'system' | 'manual',
  progressMap?: Map<number, number>
) => {
  const globalNotes = roadmap.globalNotes || [];
  const inferredAiGenerated = typeof roadmap.aiGenerated === 'boolean'
    ? roadmap.aiGenerated
    : !globalNotes.some((note: string) =>
        note.toLowerCase().includes('built-in fallback planner') ||
        note.toLowerCase().includes('ai provider was unavailable')
      );

  let youtubeVideos: any[] = [];
  try {
    youtubeVideos = await getYouTubeRecommendations(preferences.courseName, preferences.currentLevel);
  } catch (error: any) {
    console.warn('Could not fetch YouTube recommendations:', error.message);
  }

  const weeklyPlan = roadmap.weeklyPlan
    ? roadmap.weeklyPlan.map((week: any) => ({
        ...week,
        progress: progressMap?.get(week.week) || week.progress || week.completionPercent || 0,
        completionPercent: progressMap?.get(week.week) || week.progress || week.completionPercent || 0,
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
    roadmapType,
    durationWeeks: roadmap.durationWeeks || weeklyPlan.length,
    overallProgress: Number(overallCompletion.toFixed(2)),
    overallCompletion: Number(overallCompletion.toFixed(2)),
    generatedAt: roadmap.generatedAt || new Date().toISOString(),
    userSummary: generateUserSummary(preferences, userProfile),
    globalNotes,
    weeklyPlan,
    preferences,
    youtubeVideos,
    aiGenerated: inferredAiGenerated,
    title: roadmap.title || (roadmapType === 'manual' ? 'My Manual Roadmap' : 'System Generated Roadmap')
  };
};

const generateRoadmapFromPreferences = async (preferences: CourseRoadmapRequest, userId: string) => {
  let aiRoadmap: any;
  try {
    aiRoadmap = await generateCourseRoadmapWithAI(preferences);
  } catch (error: any) {
    console.warn('Falling back to deterministic roadmap generation:', error.message);
    aiRoadmap = buildDeterministicRoadmapFallback(preferences);
  }
  const systemNotes = await buildSystemNotes(userId);

  return {
    id: `ai-roadmap-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    aiGenerated: Boolean(aiRoadmap.aiGenerated),
    ...aiRoadmap,
    globalNotes: [...(aiRoadmap.globalNotes || []), ...systemNotes].slice(0, 8),
    weeklyPlan: aiRoadmap.weeklyPlan.map((week: any) => ({
      ...week,
      progress: 0,
      completionPercent: 0,
      tasks: []
    }))
  };
};

const createOrFetchSystemRoadmap = async (userId: string, preferences: CourseRoadmapRequest, userProfile: any) => {
  const roadmap = await prisma.roadmap.findFirst({
    where: {
      userId,
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
    const generatedRoadmap = await generateRoadmapFromPreferences(preferences, userId);
    const createdRoadmap = await prisma.roadmap.create({
      data: {
        userId,
        courseName: preferences.courseName,
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

    return buildRoadmapResponse(createdRoadmap, preferences, userProfile, 'system');
  }

  const progressLogs = await prisma.progressLog.findMany({
    where: { userId }
  });

  const weekProgress = new Map<number, number>();
  progressLogs.forEach((log) => {
    const existing = weekProgress.get(log.weekNumber) || 0;
    weekProgress.set(log.weekNumber, Math.max(existing, log.completionPercent));
  });

  return buildRoadmapResponse(roadmap, preferences, userProfile, 'system', weekProgress);
};

const buildManualPreferences = (manualRoadmap: any): CourseRoadmapRequest => ({
  courseName: manualRoadmap.courseName,
  currentLevel: manualRoadmap.currentLevel,
  timePerDay: manualRoadmap.timePerDay,
  durationValue: manualRoadmap.durationValue,
  durationUnit: manualRoadmap.durationUnit
});

export const getRoadmap = async (req: AuthRequest, res: Response) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    if (!dbAvailable) {
      return res.status(503).json({
        error: 'Database unavailable',
        message: 'Roadmap data requires MongoDB because preferences, progress, and generated plans must be persisted.'
      });
    }

    const preferences = await getPersistedPreferences(req.user.id);
    const userProfile = await getSummaryProfile(req.user.id);

    if (!preferences) {
      return res.json({
        id: null,
        roadmapType: 'system',
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

    return res.json(await createOrFetchSystemRoadmap(req.user.id, preferences, userProfile));
  } catch (error: any) {
    console.error('Get roadmap error:', error);
    res.status(500).json({ error: 'Failed to fetch roadmap', details: error.message });
  }
};

export const getManualRoadmap = async (req: AuthRequest, res: Response) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    if (!dbAvailable) {
      return res.status(503).json({
        error: 'Database unavailable',
        message: 'Manual roadmap data requires MongoDB because plans must be persisted.'
      });
    }

    const manualRoadmap = await getPersistedManualRoadmap(req.user.id);
    if (!manualRoadmap) {
      return res.json({
        id: null,
        roadmapType: 'manual',
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

    const userProfile = await getSummaryProfile(req.user.id);
    return res.json(
      await buildRoadmapResponse(
        manualRoadmap,
        buildManualPreferences(manualRoadmap),
        userProfile,
        'manual'
      )
    );
  } catch (error: any) {
    console.error('Get manual roadmap error:', error);
    res.status(500).json({ error: 'Failed to fetch manual roadmap', details: error.message });
  }
};

export const saveManualRoadmap = async (req: AuthRequest, res: Response) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    if (!dbAvailable) {
      return res.status(503).json({
        error: 'Database unavailable',
        message: 'Manual roadmap requires MongoDB because plans must be persisted.'
      });
    }

    const manualRoadmap = manualRoadmapSchema.parse(req.body);

    await prisma.optimizationInsight.create({
      data: {
        userId: req.user.id,
        type: 'manual_roadmap',
        title: manualRoadmap.title,
        priority: 1,
        data: JSON.parse(JSON.stringify(manualRoadmap))
      }
    });

    const userProfile = await getSummaryProfile(req.user.id);
    const response = await buildRoadmapResponse(
      {
        ...manualRoadmap,
        id: `manual-${Date.now()}`,
        generatedAt: new Date().toISOString(),
        durationWeeks: manualRoadmap.weeklyPlan.length
      },
      buildManualPreferences(manualRoadmap),
      userProfile,
      'manual'
    );

    // Create notification for manual roadmap saved
    await createNotification({
      userId: req.user.id,
      type: 'roadmap_saved',
      title: 'Manual Roadmap Saved',
      message: `Your manual roadmap "${manualRoadmap.title}" has been saved successfully!`,
      resourceType: 'roadmap',
      actionUrl: '/roadmap',
    });

    res.json({
      message: 'Manual roadmap saved successfully.',
      roadmap: response
    });
  } catch (error: any) {
    console.error('Save manual roadmap error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save manual roadmap', details: error.message });
  }
};

export const logProgress = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = progressLogSchema.parse(req.body);
    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      return res.status(503).json({
        error: 'Database unavailable',
        message: 'Progress logging requires MongoDB so activity can be tracked over time.'
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

    if (validatedData.taskId && validatedData.completionPercent === 100) {
      await prisma.roadmapTask.update({
        where: { id: validatedData.taskId },
        data: {
          isCompleted: true,
          completedAt: new Date()
        }
      });
    }

    const adaptiveGuidance = await getAdaptiveRoadmapGuidance(
      req.user.id,
      validatedData.weekNumber,
      validatedData.completionPercent
    );

    if (validatedData.completionPercent >= 100) {
      await createNotification({
        userId: req.user.id,
        type: 'progress_milestone',
        title: 'Task Milestone Completed',
        message: `Great job! You logged 100% completion for week ${validatedData.weekNumber}.`,
        resourceType: 'roadmap',
        actionUrl: '/roadmap'
      });
    }

    res.json({
      message: adaptiveGuidance.message,
      adaptiveGuidance,
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
    res.status(500).json({ error: 'Failed to log progress', details: error.message });
  }
};

export const getProgressHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      return res.status(503).json({
        error: 'Database unavailable',
        message: 'Progress history requires MongoDB because it is built from persisted activity logs.'
      });
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

    const formattedHistory = history.map((item) => ({
      date: item.timestamp.toISOString().split('T')[0],
      weekNumber: item.weekNumber,
      completionPercent: item.completionPercent,
      hoursSpent: item.hoursSpent
    }));

    res.json({ history: formattedHistory });
  } catch (error: any) {
    console.error('Get progress history error:', error);
    res.status(500).json({ error: 'Failed to fetch progress history', details: error.message });
  }
};

export const saveRoadmapPreferences = async (req: AuthRequest, res: Response) => {
  try {
    const finalValidatedData = roadmapPreferencesSchema.parse(req.body) as CourseRoadmapRequest;
    const dbAvailable = await isDatabaseAvailable();

    if (!dbAvailable) {
      return res.status(503).json({
        error: 'Database unavailable',
        message: 'Roadmap preferences require MongoDB because they must be persisted for roadmap generation and progress tracking.'
      });
    }

    await prisma.optimizationInsight.create({
      data: {
        userId: req.user.id,
        type: 'roadmap_preferences',
        title: 'Roadmap Preferences',
        priority: 1,
        data: JSON.parse(JSON.stringify(finalValidatedData))
      }
    });

    await prisma.roadmap.updateMany({
      where: { userId: req.user.id, isActive: true },
      data: { isActive: false }
    });

    await prisma.profile.upsert({
      where: { userId: req.user.id },
      update: { currentCourseName: finalValidatedData.courseName },
      create: {
        userId: req.user.id,
        currentCourseName: finalValidatedData.courseName,
        skills: [],
        targetCompanies: [],
        targetRoles: [],
        combinedSkills: [],
        availableHoursPerWeek: 10,
        leetcodeSolved: 0
      }
    });

    await createNotification({
      userId: req.user.id,
      type: 'roadmap_preferences_saved',
      title: 'Roadmap Preferences Saved',
      message: `Preferences for ${finalValidatedData.courseName} were saved. You can now regenerate your roadmap.`,
      resourceType: 'roadmap',
      actionUrl: '/roadmap'
    });

    const userProfile = await getSummaryProfile(req.user.id);
    const summary = generateUserSummary(finalValidatedData, userProfile);

    res.json({
      message: 'Preferences saved successfully. Your system roadmap will be generated from persisted profile, analytics, and company gap data.',
      summary,
      preferences: finalValidatedData
    });
  } catch (error: any) {
    console.error('Save preferences error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save preferences', details: error.message });
  }
};

export const getRoadmapPreferences = async (req: AuthRequest, res: Response) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    if (!dbAvailable) {
      return res.status(503).json({
        error: 'Database unavailable',
        message: 'Roadmap preferences require MongoDB because they are loaded from persisted data.'
      });
    }

    const preferences = await getPersistedPreferences(req.user.id);

    if (!preferences) {
      return res.status(404).json({ error: 'No preferences found', hasPreferences: false });
    }

    const userProfile = await getSummaryProfile(req.user.id);
    const summary = generateUserSummary(preferences, userProfile);

    res.json({
      hasPreferences: true,
      preferences,
      summary
    });
  } catch (error: any) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch preferences', details: error.message });
  }
};

export const regenerateRoadmap = async (req: AuthRequest, res: Response) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    if (!dbAvailable) {
      return res.status(503).json({
        error: 'Database unavailable',
        message: 'Adaptive roadmap regeneration requires MongoDB because preferences, progress, and analytics history must be persisted.'
      });
    }

    const preferences = await getPersistedPreferences(req.user.id);
    if (!preferences) {
      return res.status(404).json({
        error: 'Missing preferences',
        message: 'Save roadmap preferences before regenerating the system roadmap.'
      });
    }

    await prisma.roadmap.updateMany({
      where: { userId: req.user.id, isActive: true },
      data: { isActive: false }
    });

    const userProfile = await getSummaryProfile(req.user.id);
    const roadmap = await createOrFetchSystemRoadmap(req.user.id, preferences, userProfile);

    // Create notification for roadmap generation
    await createNotification({
      userId: req.user.id,
      type: 'roadmap_generated',
      title: 'New Roadmap Generated',
      message: `Your new ${preferences.courseName || 'placement'} roadmap has been generated successfully!`,
      resourceId: roadmap.id,
      resourceType: 'roadmap',
      actionUrl: '/roadmap',
    });

    res.json({
      message: 'System roadmap regenerated successfully from your latest profile, analytics, company gaps, and progress.',
      roadmap
    });
  } catch (error: any) {
    console.error('Regenerate roadmap error:', error);
    res.status(500).json({ error: 'Failed to regenerate roadmap', details: error.message });
  }
};
