/**
 * OpenRouter LLM Service for Resume Parsing
 * Uses DeepSeek R1 Free model to extract structured data from resumes
 */

import axios from 'axios';
import { config } from '../config/index.js';

// OpenRouter API Configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'deepseek/deepseek-r1:free';

/**
 * Resume parsed data structure
 */
export interface ParsedResumeData {
  full_name: string;
  email: string;
  phone: string;
  skills: string[];
  programming_languages: string[];
  projects: string[];
  education: string[];
  certifications: string[];
  internships: string[];
}

/**
 * System prompt for resume parsing
 */
const SYSTEM_PROMPT = `You are a professional resume parsing system.
Extract structured information from the resume text.

Return ONLY valid JSON in this exact format:

{
  "full_name": "",
  "email": "",
  "phone": "",
  "skills": [],
  "programming_languages": [],
  "projects": [],
  "education": [],
  "certifications": [],
  "internships": []
}

IMPORTANT RULES:
- If a field is missing, return empty string or empty array
- For skills and programming_languages, extract ALL technical skills mentioned
- For projects, include project names and brief descriptions
- For education, include degree, institution, and year
- For certifications, include certificate name and issuing organization
- For internships, include company name, role, and duration
- Do not include any markdown formatting
- Do not include any explanations
- Return ONLY valid JSON that can be parsed directly
- Ensure all strings are properly escaped`;

/**
 * Parse resume text using OpenRouter LLM
 * @param resumeText - Extracted text from resume
 * @returns Structured resume data
 */
export async function parseResumeWithLLM(resumeText: string): Promise<ParsedResumeData> {
  try {
    console.log('🤖 Starting LLM-based resume parsing...');
    console.log(`📝 Resume text length: ${resumeText.length} characters`);
    
    // Check if API key is available
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.warn('⚠️  OPENROUTER_API_KEY not found. Using fallback parsing.');
      return fallbackParsing(resumeText);
    }
    
    // Truncate resume text if too long (max 10000 chars to avoid token limits)
    const truncatedText = resumeText.length > 10000 
      ? resumeText.substring(0, 10000) + '...'
      : resumeText;
    
    // Prepare API request
    const requestBody = {
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: `Parse this resume and extract information:\n\n${truncatedText}`
        }
      ],
      temperature: 0.1,
      max_tokens: 2000
    };
    
    console.log(`🌐 Sending request to OpenRouter (${MODEL})...`);
    
    // Make API call with timeout
    const response = await axios.post(OPENROUTER_API_URL, requestBody, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://placement-prediction.com',
        'X-Title': 'Placement Prediction Platform'
      },
      timeout: 30000 // 30 second timeout
    });
    
    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error('Invalid response from OpenRouter API');
    }
    
    const rawContent = response.data.choices[0].message.content;
    console.log('✅ Received response from OpenRouter');
    console.log('📄 Raw response preview:', rawContent.substring(0, 200));
    
    // Clean and parse the JSON response
    const parsedData = cleanAndParseJSON(rawContent);
    
    // Validate and normalize the parsed data
    const validatedData = validateParsedData(parsedData);
    
    console.log('✅ Successfully parsed resume with LLM');
    console.log(`📊 Extracted: ${validatedData.skills.length} skills, ${validatedData.projects.length} projects`);
    
    return validatedData;
    
  } catch (error: any) {
    console.error('❌ LLM parsing error:', error.message);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('OpenRouter API Error:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('No response from OpenRouter API');
      }
    }
    
    // Fall back to basic parsing
    console.log('⚠️  Falling back to basic parsing...');
    return fallbackParsing(resumeText);
  }
}

/**
 * Clean and parse JSON from LLM response
 * Handles markdown code blocks and other formatting issues
 */
function cleanAndParseJSON(rawContent: string): any {
  try {
    // Remove markdown code blocks
    let cleaned = rawContent
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    // Find JSON object (between first { and last })
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    
    // Parse JSON
    const parsed = JSON.parse(cleaned);
    return parsed;
    
  } catch (error: any) {
    console.error('❌ JSON parsing error:', error.message);
    console.error('Raw content:', rawContent.substring(0, 500));
    throw new Error('Failed to parse LLM response as JSON');
  }
}

/**
 * Validate and normalize parsed data
 */
function validateParsedData(data: any): ParsedResumeData {
  return {
    full_name: data.full_name || '',
    email: data.email || '',
    phone: data.phone || '',
    skills: Array.isArray(data.skills) ? data.skills.filter((s: any) => typeof s === 'string') : [],
    programming_languages: Array.isArray(data.programming_languages) 
      ? data.programming_languages.filter((s: any) => typeof s === 'string') 
      : [],
    projects: Array.isArray(data.projects) ? data.projects.filter((s: any) => typeof s === 'string') : [],
    education: Array.isArray(data.education) ? data.education.filter((s: any) => typeof s === 'string') : [],
    certifications: Array.isArray(data.certifications) 
      ? data.certifications.filter((s: any) => typeof s === 'string') 
      : [],
    internships: Array.isArray(data.internships) 
      ? data.internships.filter((s: any) => typeof s === 'string') 
      : []
  };
}

/**
 * Fallback parsing using regex patterns (when LLM is not available)
 */
function fallbackParsing(text: string): ParsedResumeData {
  console.log('🔄 Using fallback regex-based parsing...');
  
  const result: ParsedResumeData = {
    full_name: '',
    email: '',
    phone: '',
    skills: [],
    programming_languages: [],
    projects: [],
    education: [],
    certifications: [],
    internships: []
  };
  
  // Extract email
  const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
  if (emailMatch) {
    result.email = emailMatch[1];
  }
  
  // Extract phone
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) {
    result.phone = phoneMatch[0];
  }
  
  // Extract name (first line usually)
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length > 0) {
    result.full_name = lines[0].trim();
  }
  
  // Extract common technical skills
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'MongoDB',
    'SQL', 'AWS', 'Docker', 'Git', 'TypeScript', 'Express', 'Angular',
    'Vue', 'Django', 'Flask', 'PostgreSQL', 'Redis', 'Kubernetes'
  ];
  
  const textLower = text.toLowerCase();
  result.skills = commonSkills.filter(skill => 
    textLower.includes(skill.toLowerCase())
  );
  
  console.log('✅ Fallback parsing completed');
  console.log(`📊 Extracted: ${result.skills.length} skills (basic extraction)`);
  
  return result;
}

/**
 * Merge parsed skills with existing profile skills
 * Removes duplicates and normalizes to lowercase
 */
export function mergeSkills(existingSkills: string[], parsedSkills: string[], programmingLanguages: string[]): string[] {
  // Combine all skills
  const allSkills = [
    ...existingSkills,
    ...parsedSkills,
    ...programmingLanguages
  ];
  
  // Normalize and deduplicate
  const uniqueSkills = [...new Set(
    allSkills
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0)
      .map(skill => skill.toLowerCase())
  )];
  
  console.log(`🔗 Merged skills: ${existingSkills.length} + ${parsedSkills.length} + ${programmingLanguages.length} = ${uniqueSkills.length} unique skills`);
  
  return uniqueSkills;
}
