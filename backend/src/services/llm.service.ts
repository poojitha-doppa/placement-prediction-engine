import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/index.js';

export interface CourseRoadmapRequest {
  courseName: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  timePerDay: number;
  durationValue: number;
  durationUnit: 'days' | 'weeks' | 'months';
  experienceNotes?: string;
  additionalNotes?: string;
}

let genAI: GoogleGenerativeAI | null = null;
let geminiModel: any = null;
let activeModelName = 'gemini-1.5-pro';
const MODEL_CANDIDATES = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'];

if (config.geminiApiKey) {
  try {
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
    geminiModel = genAI.getGenerativeModel({ model: activeModelName });
    console.log('✅ Gemini AI initialized successfully for roadmap generation');
    console.log(`🤖 Default model: ${activeModelName}`);
    console.log('🔑 API Key configured: ' + config.geminiApiKey.substring(0, 8) + '...');
  } catch (error: any) {
    console.error('❌ Failed to initialize Gemini AI:', error.message);
    geminiModel = null;
  }
} else {
  console.log('⚠️  Gemini API key not found. Roadmap generation will use mock data.');
  console.log('   Add GEMINI_API_KEY to your .env file to enable AI-powered roadmaps.');
}

export const generateRoadmapWithAI = async (
  profile: any,
  analytics: any,
  currentRoadmap?: any
) => {
  console.log('🚀 Starting AI roadmap generation with Gemini');
  console.log('📊 Profile:', { name: profile.name, college: profile.college, skills: profile.skills?.length || 0 });
  
  if (!geminiModel) {
    console.error('❌ Gemini model not available');
    throw new Error('Gemini API key not configured. Add GEMINI_API_KEY to your .env file.');
  }

  console.log('✅ Gemini model ready, preparing prompt...');

  const prompt = `You are an AI placement preparation coach. Based on the student's profile and analytics, generate a personalized 16-week roadmap.

Profile Information:
- Name: ${profile.name || 'Student'}
- College: ${profile.college || 'Not specified'}
- Branch: ${profile.branch || 'Not specified'}
- Year: ${profile.year || 'Not specified'}
- CGPA: ${profile.cgpa || 'Not specified'}
- Current Skills: ${profile.skills?.join(', ') || 'None listed'}
- Target Companies: ${profile.targetCompanies?.join(', ') || 'None specified'}
- Target Roles: ${profile.targetRoles?.join(', ') || 'None specified'}
- Available Hours per Week: ${profile.availableHoursPerWeek || 10}
- LeetCode Username: ${profile.leetcodeUsername || 'Not provided'}
- GitHub Username: ${profile.githubUsername || 'Not provided'}

Analytics Summary:
${JSON.stringify(analytics, null, 2)}

${currentRoadmap ? `Current Roadmap Progress:\n${JSON.stringify(currentRoadmap, null, 2)}` : 'This is a new roadmap.'}

Task: Generate a comprehensive, personalized 16-week placement preparation roadmap.

Requirements:
1. Divide into 4 phases:
   - Foundation (weeks 1-4): Build core fundamentals
   - Core Skills (weeks 5-8): Strengthen problem-solving abilities
   - Advanced Topics (weeks 9-12): Master advanced concepts and system design
   - Interview Prep (weeks 13-16): Mock interviews, company-specific prep

2. For EACH of the 16 weeks, provide:
   - week: (number 1-16)
   - phase: (Foundation/Core Skills/Advanced Topics/Interview Prep)
   - focusAreas: (array of 2-4 specific topics/skills to focus on)
   - targets: (array of 3-5 specific, measurable goals for the week)
   - expectedOutcomes: (array of 1-3 expected results)
   - reasoning: (string explaining why this week's focus matters)
   - priorityScore: (0.0 to 1.0, higher for more critical weeks)
   - estimatedHours: (realistic hours based on available time)

3. Add globalNotes: (array of 3-5 overall tips for success)

4. Consider:
   - Student's current skill level and gaps
   - Target companies' interview patterns
   - Time constraints (available hours per week)
   - Progressive difficulty increase
   - Balance between DSA, system design, and soft skills

IMPORTANT: Output ONLY valid JSON. No markdown, no explanations, just pure JSON matching this exact schema:

{
  "durationWeeks": 16,
  "weeklyPlan": [
    {
      "week": 1,
      "phase": "Foundation",
      "focusAreas": ["Arrays and Strings", "Basic Recursion"],
      "targets": [
        "Solve 15 easy array problems on LeetCode",
        "Master two-pointer technique",
        "Complete string manipulation basics"
      ],
      "expectedOutcomes": [
        "Comfortable with basic array operations",
        "Understanding of common patterns"
      ],
      "reasoning": "Arrays and strings form the foundation of most coding problems. Mastering these early builds confidence.",
      "priorityScore": 0.95,
      "estimatedHours": 12
    }
  ],
  "globalNotes": [
    "Maintain consistency - practice daily",
    "Focus on understanding patterns, not memorizing solutions",
    "Track progress weekly and adjust as needed"
  ]
}

Generate the complete 16-week roadmap now:`;

  try {
    console.log('📤 Sending request to Gemini AI...');
    const startTime = Date.now();
    const content = await generateWithModelFallback(prompt);
    
    const duration = Date.now() - startTime;
    console.log(`✅ Gemini AI response received in ${duration}ms`);
    console.log(`📏 Response length: ${content.length} characters`);
    
    // Extract JSON from markdown code blocks if present
    let jsonString = content;
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1];
    }
    
    // Clean up any remaining markdown or extra text
    jsonString = jsonString.trim();
    if (!jsonString.startsWith('{')) {
      const startIndex = jsonString.indexOf('{');
      const endIndex = jsonString.lastIndexOf('}');
      if (startIndex !== -1 && endIndex !== -1) {
        jsonString = jsonString.substring(startIndex, endIndex + 1);
      }
    }
    
    const roadmapData = JSON.parse(jsonString);
    
    // Validate the response has required fields
    if (!roadmapData.weeklyPlan || !Array.isArray(roadmapData.weeklyPlan)) {
      throw new Error('Invalid roadmap structure from AI');
    }
    
    console.log('🎯 Successfully parsed AI roadmap:');
    console.log(`   - Duration: ${roadmapData.durationWeeks} weeks`);
    console.log(`   - Weeks planned: ${roadmapData.weeklyPlan.length}`);
    console.log(`   - Global notes: ${roadmapData.globalNotes?.length || 0}`);
    
    return roadmapData;
  } catch (error: any) {
    console.error('❌ Gemini AI error:', error.message);
    if (error.message.includes('JSON')) {
      console.error('❌ Failed to parse JSON response from Gemini');
    }
    throw new Error(`Failed to generate roadmap with Gemini: ${error.message}`);
  }
};

const extractJsonPayload = (content: string) => {
  let jsonString = content.trim();
  const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    jsonString = jsonMatch[1];
  }
  if (!jsonString.startsWith('{')) {
    const startIndex = jsonString.indexOf('{');
    const endIndex = jsonString.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
      jsonString = jsonString.slice(startIndex, endIndex + 1);
    }
  }
  return jsonString;
};

const generateWithModelFallback = async (prompt: string) => {
  if (!genAI) {
    throw new Error('Gemini API key not configured.');
  }

  const preferredModels = [activeModelName, ...MODEL_CANDIDATES.filter((name) => name !== activeModelName)];
  let lastError = 'Unknown Gemini error';

  for (const modelName of preferredModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.35,
          topP: 0.9,
          maxOutputTokens: 8192
        }
      });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      activeModelName = modelName;
      geminiModel = model;
      console.log(`✅ Gemini response generated with model: ${modelName}`);
      return response.text();
    } catch (error: any) {
      lastError = error?.message || 'Unknown Gemini error';
      console.warn(`⚠️ Gemini model ${modelName} failed: ${lastError}`);
    }
  }

  throw new Error(`All Gemini models failed. Last error: ${lastError}`);
};

const isLowQualityCourseRoadmap = (roadmap: any, courseName: string) => {
  if (!roadmap || !Array.isArray(roadmap.weeklyPlan) || roadmap.weeklyPlan.length === 0) {
    return true;
  }

  const allFocusAreas = roadmap.weeklyPlan.flatMap((week: any) => week.focusAreas || []);
  const allTargets = roadmap.weeklyPlan.flatMap((week: any) => week.targets || []);
  const combined = [...allFocusAreas, ...allTargets].map((value) => String(value).toLowerCase());

  const placeholderTokens = ['topic a', 'topic b', 'specific target', 'outcome 1', 'outcome 2'];
  const hasPlaceholders = combined.some((text) => placeholderTokens.some((token) => text.includes(token)));
  if (hasPlaceholders) {
    return true;
  }

  const uniqueFocusCount = new Set(allFocusAreas.map((value: string) => String(value).toLowerCase())).size;
  const minUniqueFocus = Math.max(6, Math.floor(roadmap.weeklyPlan.length * 1.5));
  if (uniqueFocusCount < minUniqueFocus) {
    return true;
  }

  const courseMentions = combined.filter((text) => text.includes(courseName.toLowerCase())).length;
  const minimumMentions = Math.max(3, Math.floor(roadmap.weeklyPlan.length / 3));
  if (courseMentions < minimumMentions) {
    return true;
  }

  return false;
};

const durationUnitToDays: Record<CourseRoadmapRequest['durationUnit'], number> = {
  days: 1,
  weeks: 7,
  months: 28
};

const normalizeTargetHours = (target: string, hoursPerWeek: number) =>
  target.replace(/\b\d+(?:\.\d+)?\s*(?:hours?|hrs?)\b/gi, `${hoursPerWeek} hours`);

const enforceWeekVariety = (
  weeks: any[],
  request: CourseRoadmapRequest,
  hoursPerWeek: number,
  durationWeeks: number
) => {
  const course = request.courseName;
  const focusSeeds = [
    `${course} fundamentals`,
    `${course} syntax and core constructs`,
    `${course} problem-solving drills`,
    `${course} implementation patterns`,
    `${course} debugging techniques`,
    `${course} performance optimization`,
    `${course} architecture and design`,
    `${course} testing and validation`,
    `${course} mini project development`,
    `${course} revision and mastery`
  ];

  const targetSeeds = [
    (week: number) => `Complete ${2 + (week % 4)} focused practice tasks around this week's ${course} topics`,
    (week: number) => `Implement ${week % 2 === 0 ? 'one applied feature' : 'one hands-on exercise'} for week ${week}`,
    (week: number) => `Create a weekly summary with key learnings and blockers for week ${week}`,
    (week: number) => `Review mistakes from previous work and fix at least ${1 + (week % 3)} issues`,
    (week: number) => `Ship a measurable milestone for week ${week} aligned to your current level`,
  ];

  return weeks.map((week: any, index: number) => {
    const weekNumber = index + 1;
    const normalizedTargets = Array.isArray(week.targets)
      ? week.targets.slice(0, 8).map((target: string) => normalizeTargetHours(String(target), hoursPerWeek))
      : [];

    const hasStudyTarget = normalizedTargets.some((target: string) => /hour\(s\) per day|hours total this week|hours this week/i.test(target));
    const mandatoryTimeTarget = `Study ${course} for ${request.timePerDay} hour(s) per day (${hoursPerWeek} hours total this week)`;
    const actionTarget = targetSeeds[index % targetSeeds.length](weekNumber);
    const milestoneTarget = weekNumber % 3 === 0
      ? `Build a mini project milestone for week ${weekNumber}`
      : `Complete a ${request.currentLevel} level checkpoint for week ${weekNumber}`;

    const finalTargets = [
      hasStudyTarget ? normalizedTargets[0] : mandatoryTimeTarget,
      normalizedTargets[1] || actionTarget,
      normalizedTargets[2] || milestoneTarget,
      ...normalizedTargets.slice(3)
    ];

    const baseFocus = Array.isArray(week.focusAreas) ? week.focusAreas.slice(0, 5).map((item: any) => String(item)) : [];
    const fallbackFocus = [
      focusSeeds[index % focusSeeds.length],
      focusSeeds[(index + 3) % focusSeeds.length],
      weekNumber === durationWeeks ? `${course} final revision and capstone wrap-up` : focusSeeds[(index + 6) % focusSeeds.length]
    ];

    const finalFocus = [...baseFocus, ...fallbackFocus]
      .filter(Boolean)
      .map((item) => item.trim())
      .filter((item, idx, arr) => arr.findIndex((x) => x.toLowerCase() === item.toLowerCase()) === idx)
      .slice(0, 5);

    return {
      ...week,
      week: weekNumber,
      phase: week.phase || buildPhaseLabel(index, durationWeeks),
      estimatedHours: hoursPerWeek,
      focusAreas: finalFocus,
      targets: finalTargets,
      expectedOutcomes: Array.isArray(week.expectedOutcomes) && week.expectedOutcomes.length > 0
        ? week.expectedOutcomes.slice(0, 5)
        : [`Clear progress on week ${weekNumber} outcomes for ${course}`],
    };
  });
};

const buildPhaseLabel = (index: number, totalWeeks: number) => {
  const progress = (index + 1) / totalWeeks;
  if (progress <= 0.25) return 'Foundation';
  if (progress <= 0.5) return 'Core Concepts';
  if (progress <= 0.75) return 'Hands-On Projects';
  return 'Mastery and Review';
};

export const generateCourseRoadmapWithAI = async (request: CourseRoadmapRequest) => {
  const totalDays = request.durationValue * durationUnitToDays[request.durationUnit];
  const durationWeeks = Math.max(1, Math.min(52, Math.ceil(totalDays / 7)));
  const hoursPerWeek = Math.max(1, Math.round(request.timePerDay * 7));

  if (!geminiModel && !genAI) {
    throw new Error('Gemini API key not configured. Add GEMINI_API_KEY to your .env file.');
  }

  const prompt = `You are an expert course mentor and curriculum architect. Create a high-quality roadmap for ONE course/topic.

Learner input:
- Course/topic: ${request.courseName}
- Current level: ${request.currentLevel}
- Time available per day: ${request.timePerDay} hours
- Time available per week: ${hoursPerWeek} hours
- Completion window: ${request.durationValue} ${request.durationUnit}
- Experience notes: ${request.experienceNotes || 'None provided'}
- Additional notes: ${request.additionalNotes || 'None provided'}

Instructions:
1. Generate a realistic roadmap lasting exactly ${durationWeeks} weeks.
2. Adapt pace and difficulty to the learner's level and time budget.
3. Focus ONLY on ${request.courseName}; no generic placement prep content.
4. Every week must include concrete and non-repetitive topics.
5. Targets must be actionable and measurable (for example: build X, solve Y, implement Z, revise N).
6. Include mini-project milestones at least every 2-3 weeks.
7. Use progression from fundamentals to applied mastery.
8. Weekly estimated hours should be close to ${hoursPerWeek}.
9. Do not use placeholders such as "Topic A" or "Specific target".
10. Output JSON only.

Required JSON schema:
{
  "durationWeeks": ${durationWeeks},
  "weeklyPlan": [
    {
      "week": 1,
      "phase": "Foundation",
      "focusAreas": ["Topic A", "Topic B"],
      "targets": ["Specific target 1", "Specific target 2"],
      "expectedOutcomes": ["Outcome 1", "Outcome 2"],
      "reasoning": "Why this week matters",
      "priorityScore": 0.9,
      "estimatedHours": ${Math.min(40, hoursPerWeek)}
    }
  ],
  "globalNotes": ["Tip 1", "Tip 2", "Tip 3"]
}`;

  const content = await generateWithModelFallback(prompt);
  let parsed = JSON.parse(extractJsonPayload(content));
  parsed.durationWeeks = durationWeeks;
  parsed.weeklyPlan = enforceWeekVariety((parsed.weeklyPlan || []).slice(0, durationWeeks), request, hoursPerWeek, durationWeeks);

  if (parsed.weeklyPlan.length !== durationWeeks) {
    throw new Error(`Gemini returned ${parsed.weeklyPlan.length} weeks, expected ${durationWeeks}.`);
  }

  if (isLowQualityCourseRoadmap(parsed, request.courseName)) {
    const refinePrompt = `The previous roadmap was too generic. Improve it with concrete, course-specific details.

Course: ${request.courseName}
Level: ${request.currentLevel}
Weeks: ${durationWeeks}
Hours/week: ${hoursPerWeek}

Return JSON only and avoid repeated topics/targets.

Previous roadmap JSON:
${JSON.stringify(parsed)}`;

    const refinedContent = await generateWithModelFallback(refinePrompt);
    const refined = JSON.parse(extractJsonPayload(refinedContent));
    refined.durationWeeks = durationWeeks;
    refined.weeklyPlan = enforceWeekVariety((refined.weeklyPlan || []).slice(0, durationWeeks), request, hoursPerWeek, durationWeeks);

    if (!isLowQualityCourseRoadmap(refined, request.courseName) && refined.weeklyPlan.length === durationWeeks) {
      parsed = refined;
    }
  }

  return parsed;
};

export const generateDashboardInsights = async (
  profile: any,
  progressLogs: any[],
  analytics: any
) => {
  if (!geminiModel) {
    // Return mock insights if no API key
    return [
      {
        type: 'info',
        title: 'Welcome to your dashboard',
        message: 'Keep tracking your progress to get AI-powered insights.',
        recommendedAction: null,
        priority: 'low'
      }
    ];
  }

  const prompt = `You are an AI career coach analyzing a student's placement prep progress.

Profile:
${JSON.stringify(profile, null, 2)}

Recent Progress:
${JSON.stringify(progressLogs.slice(0, 10), null, 2)}

Analytics:
${JSON.stringify(analytics, null, 2)}

Generate 3-5 concise, actionable insights in JSON format:
[
  {
    "type": "warning" | "info" | "success",
    "title": "Short title (5-8 words)",
    "message": "1-2 sentence observation",
    "recommendedAction": "Specific action step (or null)",
    "priority": "high" | "medium" | "low"
  }
]

Focus on consistency trends, skill gaps, and upcoming milestones. Output ONLY valid JSON array.`;

  try {
    const content = await generateWithModelFallback(prompt);
    
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : content;
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error generating dashboard insights:', error);
    return [
      {
        type: 'info',
        title: 'Keep up the good work',
        message: 'Continue tracking your progress for personalized insights.',
        recommendedAction: null,
        priority: 'low'
      }
    ];
  }
};
