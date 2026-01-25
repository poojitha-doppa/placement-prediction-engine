import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/db.js';
import { config } from '../config/index.js';
import { signupSchema, loginSchema } from '../utils/validation.js';
import { mockUsersCache } from '../middleware/auth.js';

// In-memory store for mock mode
const mockUsers: any[] = [];
const passwordResetTokens: Map<string, { email: string; expires: Date; userId: string }> = new Map();

// Initialize with a default test user for demo purposes
const initializeDefaultUser = async () => {
  if (mockUsers.length === 0) {
    const hashedPassword = await bcrypt.hash('Poojitha@2006', 12);
    const defaultUser = {
      id: 'default-user-123',
      email: 'poojithadoppa8@gmail.com',
      password: hashedPassword,
      name: 'Poojitha Doppa',
      createdAt: new Date()
    };
    mockUsers.push(defaultUser);
    // Update the shared cache
    mockUsersCache.users = mockUsers;
    console.log('✅ Default test user created: poojithadoppa8@gmail.com / Poojitha@2006');
    console.log('   Name: Poojitha Doppa');
  }
};

// Initialize on module load
initializeDefaultUser();

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

export const signup = async (req: Request, res: Response) => {
  try {
    const validatedData = signupSchema.parse(req.body);
    
    const dbAvailable = await isDatabaseAvailable();
    
    if (dbAvailable) {
      // Database mode
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 12);

      const user = await prisma.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          name: validatedData.name,
          profile: {
            create: {
              skills: [],
              targetCompanies: [],
              targetRoles: [],
              availableHoursPerWeek: 10
            }
          }
        },
        select: {
          id: true,
          email: true,
          name: true
        }
      });

      const token = jwt.sign(
        { sub: user.id },
        config.jwtSecret as string,
        { expiresIn: config.jwtExpiresIn } as SignOptions
      );

      res.status(201).json({ user, token });
    } else {
      // Mock mode
      const existingUser = mockUsers.find(u => u.email === validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 12);
      const userId = `mock-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      const user = {
        id: userId,
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name || 'User',
        createdAt: new Date()
      };

      mockUsers.push(user);
      // Update the shared cache
      mockUsersCache.users = mockUsers;

      const token = jwt.sign(
        { sub: user.id },
        config.jwtSecret as string,
        { expiresIn: config.jwtExpiresIn } as SignOptions
      );

      res.status(201).json({ 
        user: { id: user.id, email: user.email, name: user.name },
        token 
      });
    }
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const dbAvailable = await isDatabaseAvailable();

    if (dbAvailable) {
      // Database mode
      const user = await prisma.user.findUnique({
        where: { email: validatedData.email }
      });

      if (!user) {
        console.log(`❌ Login failed: User not found - ${validatedData.email}`);
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!isValidPassword) {
        console.log(`❌ Login failed: Invalid password for ${validatedData.email}`);
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign(
        { sub: user.id },
        config.jwtSecret as string,
        { expiresIn: config.jwtExpiresIn } as SignOptions
      );

      console.log(`✅ Login successful: ${user.email}`);
      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token
      });
    } else {
      // Mock mode - ensure default user exists
      await initializeDefaultUser();
      
      const user = mockUsers.find(u => u.email === validatedData.email);

      if (!user) {
        console.log(`❌ Login failed: User not found - ${validatedData.email}`);
        console.log(`Available users: ${mockUsers.map(u => u.email).join(', ')}`);
        return res.status(401).json({ error: 'Invalid email or password. Try signing up first.' });
      }

      const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!isValidPassword) {
        console.log(`❌ Login failed: Invalid password for ${validatedData.email}`);
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign(
        { sub: user.id },
        config.jwtSecret as string,
        { expiresIn: config.jwtExpiresIn } as SignOptions
      );

      console.log(`✅ Login successful: ${user.email}`);
      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token
      });
    }
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' });
};

export const getCurrentUser = async (req: any, res: Response) => {
  try {
    const dbAvailable = await isDatabaseAvailable();

    if (dbAvailable) {
      // Database mode
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user });
    } else {
      // Mock mode
      const user = mockUsers.find(u => u.id === req.user.id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ 
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt
        }
      });
    }
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Request password reset
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const dbAvailable = await isDatabaseAvailable();
    let user: any = null;

    if (dbAvailable) {
      user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, name: true }
      });
    } else {
      user = mockUsers.find(u => u.email === email);
    }

    // For demo mode: Create temporary user if doesn't exist
    if (!user) {
      // In production, just return success without token
      // For demo, create a temporary account
      const tempUserId = `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const tempUser = {
        id: tempUserId,
        email: email,
        name: 'Temporary User',
        password: '', // No password set yet
        createdAt: new Date()
      };
      
      if (!dbAvailable) {
        // Add to mock users for this session
        mockUsers.push(tempUser);
      }
      
      user = tempUser;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    // Store token
    passwordResetTokens.set(resetToken, {
      email: user.email,
      userId: user.id,
      expires
    });

    // In a real application, send email with reset link
    // For demo purposes, return the token and mock email
    console.log(`
    ═══════════════════════════════════════════════════
    📧 PASSWORD RESET EMAIL (Mock)
    ═══════════════════════════════════════════════════
    To: ${user.email}
    Subject: Reset Your Password
    
    Hi ${user.name || 'User'},
    
    You requested to reset your password. Click the link below to set a new password:
    
    http://localhost:5173/reset-password?token=${resetToken}
    
    This link will expire in 1 hour.
    
    If you didn't request this, please ignore this email.
    ═══════════════════════════════════════════════════
    `);

    res.json({ 
      message: 'If an account exists with this email, a password reset link has been sent.',
      // For demo, include token in response (remove in production)
      resetToken,
      resetLink: `http://localhost:5173/reset-password?token=${resetToken}`
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
};

// Reset password with token
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Verify token
    const tokenData = passwordResetTokens.get(token);

    if (!tokenData) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    if (new Date() > tokenData.expires) {
      passwordResetTokens.delete(token);
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const dbAvailable = await isDatabaseAvailable();

    if (dbAvailable) {
      // Update password in database
      await prisma.user.update({
        where: { id: tokenData.userId },
        data: { password: hashedPassword }
      });
    } else {
      // Update password in mock store
      const user = mockUsers.find(u => u.id === tokenData.userId);
      if (user) {
        user.password = hashedPassword;
      }
    }

    // Delete used token
    passwordResetTokens.delete(token);

    res.json({ message: 'Password reset successfully. You can now login with your new password.' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};
