import { Router } from 'express';
import { generateRoadmap, getDashboardInsights } from '../controllers/agent.controller.js';
import { authenticateJWT } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const agentLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5,
  message: 'Too many roadmap generation requests. Try again tomorrow.',
  standardHeaders: true,
  legacyHeaders: false
});

const router = Router();

router.post('/generate-roadmap', authenticateJWT, agentLimiter, generateRoadmap);
router.get('/dashboard-insights', authenticateJWT, getDashboardInsights);

export default router;
