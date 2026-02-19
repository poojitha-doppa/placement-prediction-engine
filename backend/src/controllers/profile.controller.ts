import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import prisma from '../config/db.js';
import { profileUpdateSchema } from '../utils/validation.js';

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
    if (!prisma) return false;
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const dbAvailable = await isDatabaseAvailable();

    if (dbAvailable) {
      // Database mode
      const profile = await prisma.profile.findUnique({
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

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

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
        codeforcesUsername: profile.codeforcesUsername
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
      if (validatedData.name) {
        await prisma.user.update({
          where: { id: req.user.id },
          data: { name: validatedData.name }
        });
      }

      const profile = await prisma.profile.update({
        where: { userId: req.user.id },
        data: {
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
          codeforcesUsername: validatedData.codeforcesUsername
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
          codeforcesUsername: profile.codeforcesUsername
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
    if (error.name === 'ZodError') {
      console.error('Validation errors:', error.errors);
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const uploadResume = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    const dbAvailable = await isDatabaseAvailable();

    if (dbAvailable) {
      // Database mode
      await prisma.profile.update({
        where: { userId: req.user.id },
        data: { resumeUrl }
      });
    } else {
      // Mock mode
      const currentProfile = mockProfiles[req.user.id] || {};
      mockProfiles[req.user.id] = {
        ...currentProfile,
        resumeUrl
      };
    }

    res.json({
      message: 'Resume uploaded successfully',
      resumeUrl
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
};
