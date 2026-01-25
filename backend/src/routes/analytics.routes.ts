import { Router } from 'express';
import { getRoadmap, logProgress, getProgressHistory } from '../controllers/roadmap.controller.js';
import { 
  getPlacementSummary, 
  getSkillAnalytics, 
  getCompanyMatches, 
  getOptimizationInsights 
} from '../controllers/analytics.controller.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

// Roadmap routes
router.get('/roadmap', authenticateJWT, getRoadmap);
router.post('/roadmap/progress', authenticateJWT, logProgress);
router.get('/roadmap/progress-history', authenticateJWT, getProgressHistory);

// Analytics routes
router.get('/placement-summary', authenticateJWT, getPlacementSummary);
router.get('/skill-analytics', authenticateJWT, getSkillAnalytics);
router.get('/company-matches', authenticateJWT, getCompanyMatches);
router.get('/optimization-insights', authenticateJWT, getOptimizationInsights);

export default router;
