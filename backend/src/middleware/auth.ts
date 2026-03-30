import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import prisma from '../config/db.js';
import { getRoleForEmail, type UserRole } from '../utils/roles.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
  };
}

// Shared mock users cache that can be updated from auth controller
export const mockUsersCache: { users: any[] } = { users: [] };

// Check if database is available
const isDatabaseAvailable = async () => {
  try {
    if (!prisma) return false;
    await prisma.$connect();
    await prisma.user.findFirst();
    return true;
  } catch (error: any) {
    console.log('⚠️  Auth middleware: Database not available');
    return false;
  }
};

export const resolveAuthenticatedUser = async (token: string) => {
  const decoded = jwt.verify(token, config.jwtSecret) as { sub: string; email?: string; role?: UserRole };
  const dbAvailable = await isDatabaseAvailable();

  if (dbAvailable) {
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, email: true, name: true }
    });
    if (!user) {
      return null;
    }

    return {
      ...user,
      role: decoded.role || getRoleForEmail(user.email)
    };
  }

  const mockUser = mockUsersCache.users.find((u) => u.id === decoded.sub);
  if (!mockUser) {
    return null;
  }

  return {
    id: mockUser.id,
    email: mockUser.email,
    name: mockUser.name,
    role: decoded.role || getRoleForEmail(mockUser.email)
  };
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

    const user = await resolveAuthenticatedUser(token);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const authenticateJWTFromQuery = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = typeof req.query.token === 'string' ? req.query.token : undefined;

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const user = await resolveAuthenticatedUser(token);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Query auth middleware error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  next();
};
