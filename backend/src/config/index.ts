import dotenv from 'dotenv';

dotenv.config();

const defaultJwtSecret = 'default-secret';
const jwtSecret = process.env.JWT_SECRET || defaultJwtSecret;
const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

if (isProduction && jwtSecret === defaultJwtSecret) {
  throw new Error('JWT_SECRET must be set in production.');
}

if (!isProduction && jwtSecret === defaultJwtSecret) {
  console.warn('JWT_SECRET is using the development fallback secret. Set JWT_SECRET in backend/.env before deploying.');
}

export const config = {
  port: parseInt(process.env.PORT || '3000'),
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@placement.local',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  frontendUrl: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:5173',
  nodeEnv,
  isProduction,
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  youtubeApiKey: process.env.YOUTUBE_API_KEY || '',
  encryptionKey: process.env.ENCRYPTION_KEY || '',
  databaseUrl: process.env.DATABASE_URL || ''
};
