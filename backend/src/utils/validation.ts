import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const profileUpdateSchema = z.object({
  name: z.string().optional(),
  college: z.string().optional(),
  branch: z.string().optional(),
  year: z.number().int().min(2020).max(2030).optional(), // Graduation year
  cgpa: z.number().min(0).max(10).optional(),
  skills: z.array(z.string()).optional(),
  targetCompanies: z.array(z.string()).optional(),
  targetRoles: z.array(z.string()).optional(),
  availableHoursPerWeek: z.number().int().min(1).max(80).optional(),
  githubUsername: z.string().nullable().optional(),
  leetcodeUsername: z.string().nullable().optional(),
  codeforcesUsername: z.string().nullable().optional(),
  leetcodeSolved: z.number().int().min(0).optional(),
  minPackageLPA: z.number().min(0).optional()
});

export const progressLogSchema = z.object({
  weekNumber: z.number().int().min(1).max(52),
  completionPercent: z.number().min(0).max(100),
  taskId: z.string().optional(),
  hoursSpent: z.number().min(0).optional(),
  notes: z.string().optional()
});

export const weekSchema = z.object({
  week: z.number().int().min(1).max(52),
  phase: z.string().min(2).max(80).optional(),
  focusAreas: z.array(z.string()).min(1).max(5),
  targets: z.array(z.string()).min(1).max(8),
  expectedOutcomes: z.array(z.string()).min(1).max(5),
  reasoning: z.string().optional(),
  priorityScore: z.number().min(0).max(1).optional(),
  estimatedHours: z.number().int().min(1).max(40).optional()
});

export const roadmapSchema = z.object({
  durationWeeks: z.number().int().min(1).max(52),
  weeklyPlan: z.array(weekSchema).min(1).max(52),
  globalNotes: z.array(z.string()).optional()
}).refine((value) => value.weeklyPlan.length === value.durationWeeks, {
  message: 'weeklyPlan length must match durationWeeks',
  path: ['weeklyPlan']
});

export const insightSchema = z.object({
  type: z.enum(['warning', 'info', 'success']),
  title: z.string().min(5).max(100),
  message: z.string().min(10).max(500),
  recommendedAction: z.string().nullable().optional(),
  priority: z.enum(['high', 'medium', 'low']).optional()
});

export const insightsResponseSchema = z.array(insightSchema).min(1).max(10);

export const roadmapPreferencesSchema = z.object({
  courseName: z.string().min(2).max(120),
  currentLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  timePerDay: z.number().min(0.5).max(24),
  durationValue: z.number().int().min(1).max(365),
  durationUnit: z.enum(['days', 'weeks', 'months']),
  experienceNotes: z.string().max(500).optional(),
  additionalNotes: z.string().optional()
});
