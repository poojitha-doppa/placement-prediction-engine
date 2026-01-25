import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/index.js';

let genAI: GoogleGenerativeAI | null = null;
let geminiModel: any = null;

if (config.geminiApiKey) {
  genAI = new GoogleGenerativeAI(config.geminiApiKey);
  geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
  console.log('✅ Gemini AI initialized for roadmap generation');
} else {
  console.log('⚠️  Gemini API key not found. Roadmap generation will use mock data.');
  console.log('   Add GEMINI_API_KEY to your .env file to enable AI-powered roadmaps.');
}

export const generateRoadmapWithAI = async (
  profile: any,
  analytics: any,
  currentRoadmap?: any
) => {
  if (!geminiModel) {
    throw new Error('Gemini API key not configured. Add GEMINI_API_KEY to your .env file.');
  }

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
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    
    console.log('🤖 Gemini AI generated roadmap');
    
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
    
    return roadmapData;
  } catch (error: any) {
    console.error('❌ Gemini AI error:', error.message);
    throw new Error(`Failed to generate roadmap with Gemini: ${error.message}`);
  }
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
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    
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
