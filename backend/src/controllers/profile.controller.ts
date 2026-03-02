import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import prisma from '../config/db.js';
import { profileUpdateSchema } from '../utils/validation.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractResumeText } from '../services/resumeExtractor.service.js';
import { parseResumeWithLLM, mergeSkills, ParsedResumeData } from '../services/resumeParser.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory profile store for mock mode - exported for use in analytics
export const mockProfiles: any = {};

// Initialize default profile for test user
const initializeDefaultProfile = () => {
  mockProfiles['default-user-123'] = {
    id: 'profile-default-user-123',
    name: 'Poojitha Doppa',
    email: 'poojithadoppa8@gmail.com',
    college: 'Vellore Institute of Technology',
    branch: 'Computer Science and Engineering',
    year: 2026,
    cgpa: 8.75,
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Data Structures', 'Algorithms', 'System Design', 'SQL', 'MongoDB'],
    targetCompanies: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix'],
    targetRoles: ['Software Engineer', 'Full Stack Developer', 'Backend Developer'],
    availableHoursPerWeek: 25,
    resumeUrl: null,
    githubUsername: 'poojitha-dev',
    leetcodeUsername: 'poojitha_coder',
    codeforcesUsername: 'poojitha_cf'
  };
};

// Initialize on module load
initializeDefaultProfile();

// Check if database is available
const isDatabaseAvailable = async () => {
  try {
    if (!prisma) {
      console.log('⚠️  Prisma client not initialized');
      return false;
    }
    // Use a MongoDB-compatible ping instead of SQL
    await prisma.$connect();
    // Try to access the database
    await prisma.user.findFirst();
    console.log('✅ Database is available and connected');
    return true;
  } catch (error: any) {
    console.log('⚠️  Database not available:', error.message);
    console.log('   Using mock mode instead');
    return false;
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const dbAvailable = await isDatabaseAvailable();

    if (dbAvailable) {
      // Database mode
      console.log(`📖 Fetching profile for user: ${req.user.id}`);
      
      let profile = await prisma.profile.findUnique({
        where: { userId: req.user.id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      });

      // If profile doesn't exist, create it with defaults
      if (!profile) {
        console.log('📝 Profile not found, creating new profile with defaults');
        profile = await prisma.profile.create({
          data: {
            userId: req.user.id,
            skills: [],
            targetCompanies: [],
            targetRoles: [],
            availableHoursPerWeek: 10
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        });
      }

      console.log('✅ Profile fetched successfully');
      
      res.json({
        id: profile.id,
        name: profile.user.name,
        email: profile.user.email,
        college: profile.college,
        branch: profile.branch,
        year: profile.year,
        cgpa: profile.cgpa,
        skills: profile.skills,
        targetCompanies: profile.targetCompanies,
        targetRoles: profile.targetRoles,
        availableHoursPerWeek: profile.availableHoursPerWeek,
        resumeUrl: profile.resumeUrl,
        githubUsername: profile.githubUsername,
        leetcodeUsername: profile.leetcodeUsername,
        codeforcesUsername: profile.codeforcesUsername,
        leetcodeSolved: profile.leetcodeSolved,
        minPackageLPA: profile.minPackageLPA
      });
    } else {
      // Mock mode - return complete profile with demo data
      let profile = mockProfiles[req.user.id];
      
      if (!profile) {
        // Create default profile for any user
        profile = {
          id: `profile-${req.user.id}`,
          name: req.user.name || 'Poojitha Doppa',
          email: req.user.email || 'poojithadoppa8@gmail.com',
          college: 'Vellore Institute of Technology',
          branch: 'Computer Science and Engineering',
          year: 2026,
          cgpa: 8.75,
          skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Data Structures', 'Algorithms', 'System Design', 'SQL', 'MongoDB'],
          targetCompanies: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix'],
          targetRoles: ['Software Engineer', 'Full Stack Developer', 'Backend Developer'],
          availableHoursPerWeek: 25,
          resumeUrl: null,
          githubUsername: 'poojitha-dev',
          leetcodeUsername: 'poojitha_coder',
          codeforcesUsername: 'poojitha_cf',
          leetcodeSolved: 287,
          githubProjects: 12,
          lastUpdated: new Date().toISOString()
        };
        mockProfiles[req.user.id] = profile;
      }

      console.log(`✅ Profile fetched for ${req.user.email}:`, profile.name);
      res.json(profile);
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    console.log('📝 Update profile request received');
    console.log('User ID:', req.user.id);
    console.log('User Email:', req.user.email);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const validatedData = profileUpdateSchema.parse(req.body);
    console.log('✅ Validation passed');
    
    const dbAvailable = await isDatabaseAvailable();

    if (dbAvailable) {
      // Database mode
      console.log('💾 Updating in database mode');
      
      if (validatedData.name) {
        await prisma.user.update({
          where: { id: req.user.id },
          data: { name: validatedData.name }
        });
      }

      // Use upsert to create profile if it doesn't exist or update if it does
      const profile = await prisma.profile.upsert({
        where: { userId: req.user.id },
        update: {
          college: validatedData.college,
          branch: validatedData.branch,
          year: validatedData.year,
          cgpa: validatedData.cgpa,
          skills: validatedData.skills,
          targetCompanies: validatedData.targetCompanies,
          targetRoles: validatedData.targetRoles,
          availableHoursPerWeek: validatedData.availableHoursPerWeek,
          githubUsername: validatedData.githubUsername,
          leetcodeUsername: validatedData.leetcodeUsername,
          codeforcesUsername: validatedData.codeforcesUsername,
          leetcodeSolved: validatedData.leetcodeSolved,
          minPackageLPA: validatedData.minPackageLPA
        },
        create: {
          userId: req.user.id,
          college: validatedData.college,
          branch: validatedData.branch,
          year: validatedData.year,
          cgpa: validatedData.cgpa,
          skills: validatedData.skills || [],
          targetCompanies: validatedData.targetCompanies || [],
          targetRoles: validatedData.targetRoles || [],
          availableHoursPerWeek: validatedData.availableHoursPerWeek || 10,
          githubUsername: validatedData.githubUsername,
          leetcodeUsername: validatedData.leetcodeUsername,
          codeforcesUsername: validatedData.codeforcesUsername,
          leetcodeSolved: validatedData.leetcodeSolved || 0,
          minPackageLPA: validatedData.minPackageLPA
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });
      
      console.log('✅ Profile saved to database successfully');

      res.json({
        message: 'Profile updated successfully',
        profile: {
          id: profile.id,
          name: profile.user.name,
          email: profile.user.email,
          college: profile.college,
          branch: profile.branch,
          year: profile.year,
          cgpa: profile.cgpa,
          skills: profile.skills,
          targetCompanies: profile.targetCompanies,
          targetRoles: profile.targetRoles,
          availableHoursPerWeek: profile.availableHoursPerWeek,
          resumeUrl: profile.resumeUrl,
          githubUsername: profile.githubUsername,
          leetcodeUsername: profile.leetcodeUsername,
          codeforcesUsername: profile.codeforcesUsername,
          leetcodeSolved: profile.leetcodeSolved,
          minPackageLPA: profile.minPackageLPA
        }
      });
    } else {
      // Mock mode
      console.log('📦 Running in mock mode');
      const currentProfile = mockProfiles[req.user.id] || {};
      mockProfiles[req.user.id] = {
        ...currentProfile,
        id: currentProfile.id || `profile-${req.user.id}`,
        name: validatedData.name || req.user.name,
        email: req.user.email,
        college: validatedData.college,
        branch: validatedData.branch,
        year: validatedData.year,
        cgpa: validatedData.cgpa,
        skills: validatedData.skills,
        targetCompanies: validatedData.targetCompanies,
        targetRoles: validatedData.targetRoles,
        availableHoursPerWeek: validatedData.availableHoursPerWeek,
        githubUsername: validatedData.githubUsername,
        leetcodeUsername: validatedData.leetcodeUsername,
        codeforcesUsername: validatedData.codeforcesUsername,
        leetcodeSolved: validatedData.leetcodeSolved,
        minPackageLPA: validatedData.minPackageLPA,
        resumeUrl: currentProfile.resumeUrl || null
      };

      console.log('✅ Profile updated successfully in mock mode');
      console.log('Updated profile:', mockProfiles[req.user.id]);

      res.json({
        message: 'Profile updated successfully',
        profile: mockProfiles[req.user.id]
      });
    }
  } catch (error: any) {
    console.error('❌ Update profile error:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User or profile not found' });
    }
    
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A profile with this data already exists' });
    }
    
    if (error.name === 'ZodError') {
      console.error('Validation errors:', error.errors);
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    
    console.error('Detailed error:', JSON.stringify(error, null, 2));
    res.status(500).json({ 
      error: 'Failed to update profile',
      message: error.message || 'Unknown error occurred'
    });
  }
};

export const uploadResume = async (req: AuthRequest, res: Response) => {
  try {
    console.log('📤 Resume upload request received');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get file path
    const filePath = req.file.path;
    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    
    console.log(`📁 File uploaded: ${req.file.filename}`);
    console.log(`📏 File size: ${(req.file.size / 1024).toFixed(2)} KB`);

    const dbAvailable = await isDatabaseAvailable();
    
    // Step 1: Extract text from resume
    console.log('🔍 Step 1: Extracting text from resume...');
    let extractedText: string;
    try {
      extractedText = await extractResumeText(filePath);
      console.log(`✅ Text extracted: ${extractedText.length} characters`);
    } catch (extractError: any) {
      console.error('❌ Text extraction failed:', extractError.message);
      // Continue without parsing if extraction fails
      if (dbAvailable) {
        await prisma.profile.update({
          where: { userId: req.user.id },
          data: { resumeUrl }
        });
      } else {
        const currentProfile = mockProfiles[req.user.id] || {};
        mockProfiles[req.user.id] = {
          ...currentProfile,
          resumeUrl
        };
      }
      return res.json({
        message: 'Resume uploaded successfully (parsing failed)',
        resumeUrl,
        warning: 'Could not extract text from resume. File saved but not parsed.'
      });
    }

    // Step 2: Parse resume with LLM
    console.log('🤖 Step 2: Parsing resume with LLM...');
    let parsedData: ParsedResumeData;
    try {
      parsedData = await parseResumeWithLLM(extractedText);
      console.log('✅ Resume parsed successfully');
      console.log(`📊 Parsed data: ${parsedData.skills.length} skills, ${parsedData.projects.length} projects`);
    } catch (parseError: any) {
      console.error('❌ LLM parsing failed:', parseError.message);
      // Continue without parsed data if parsing fails
      if (dbAvailable) {
        await prisma.profile.update({
          where: { userId: req.user.id },
          data: { resumeUrl }
        });
      } else {
        const currentProfile = mockProfiles[req.user.id] || {};
        mockProfiles[req.user.id] = {
          ...currentProfile,
          resumeUrl
        };
      }
      return res.json({
        message: 'Resume uploaded successfully (parsing failed)',
        resumeUrl,
        warning: 'Could not parse resume content. File saved but data not extracted.'
      });
    }

    // Step 3: Update database with parsed data
    console.log('💾 Step 3: Saving to database...');
    
    if (dbAvailable) {
      // Get existing profile to merge skills
      const existingProfile = await prisma.profile.findUnique({
        where: { userId: req.user.id }
      });

      const existingSkills = existingProfile?.skills || [];
      
      // Merge skills
      const combinedSkills = mergeSkills(
        existingSkills,
        parsedData.skills,
        parsedData.programming_languages
      );

      // Update profile with resume data
      const updatedProfile = await prisma.profile.update({
        where: { userId: req.user.id },
        data: {
          resumeUrl,
          parsedResume: parsedData as any,
          combinedSkills,
          // Update name and email if empty
          ...(existingProfile?.user && !existingProfile.user.name && parsedData.full_name 
            ? {} 
            : {})
        }
      });
      
      // Update user name and email if provided and empty
      if (parsedData.full_name || parsedData.email) {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        const updateData: any = {};
        
        if (parsedData.full_name && !user?.name) {
          updateData.name = parsedData.full_name;
        }
        
        if (Object.keys(updateData).length > 0) {
          await prisma.user.update({
            where: { id: req.user.id },
            data: updateData
          });
          console.log('✅ Updated user profile with parsed data');
        }
      }

      console.log('✅ Database updated successfully');
      
      res.json({
        message: 'Resume uploaded and parsed successfully',
        resumeUrl,
        parsedData: {
          full_name: parsedData.full_name,
          email: parsedData.email,
          phone: parsedData.phone,
          skills_count: parsedData.skills.length,
          projects_count: parsedData.projects.length,
          education_count: parsedData.education.length,
          combined_skills_count: combinedSkills.length
        }
      });
    } else {
      // Mock mode
      const currentProfile = mockProfiles[req.user.id] || {};
      const existingSkills = currentProfile.skills || [];
      
      const combinedSkills = mergeSkills(
        existingSkills,
        parsedData.skills,
        parsedData.programming_languages
      );
      
      mockProfiles[req.user.id] = {
        ...currentProfile,
        resumeUrl,
        parsedResume: parsedData,
        combinedSkills
      };
      
      console.log('✅ Mock profile updated successfully');
      
      res.json({
        message: 'Resume uploaded and parsed successfully (mock mode)',
        resumeUrl,
        parsedData: {
          full_name: parsedData.full_name,
          email: parsedData.email,
          phone: parsedData.phone,
          skills_count: parsedData.skills.length,
          projects_count: parsedData.projects.length,
          education_count: parsedData.education.length,
          combined_skills_count: combinedSkills.length
        }
      });
    }
  } catch (error: any) {
    console.error('❌ Upload resume error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to upload resume',
      details: error.message 
    });
  }
};
