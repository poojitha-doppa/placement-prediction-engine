import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import prisma from '../config/db.js';

export interface AuthRequest extends Request {
  user?: any;
}

// Shared mock users cache that can be updated from auth controller
export const mockUsersCache: { users: any[] } = { users: [] };

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

export const authenticateJWT = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, config.jwtSecret) as { sub: string };
    
    const dbAvailable = await isDatabaseAvailable();
    
    if (dbAvailable) {
      // Database mode - fetch user from DB
      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        select: { id: true, email: true, name: true }
      });

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      req.user = user;
    } else {
      // Mock mode - fetch from mock users cache
      const mockUser = mockUsersCache.users.find(u => u.id === decoded.sub);
      
      if (!mockUser) {
        console.error(`❌ Mock user not found for ID: ${decoded.sub}`);
        return res.status(401).json({ error: 'User not found' });
      }

      req.user = { 
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name
      };
      
      console.log(`✅ Auth successful for: ${mockUser.name} (${mockUser.email})`);
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
