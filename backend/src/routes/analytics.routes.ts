import { Router } from 'express';
import {
  getRoadmap,
  getManualRoadmap,
  logProgress,
  getProgressHistory,
  regenerateRoadmap,
  saveManualRoadmap,
  saveRoadmapPreferences,
  getRoadmapPreferences
} from '../controllers/roadmap.controller.js';
import { 
  getPlacementSummary, 
  getSkillAnalytics, 
  getCompanyMatches, 
  recomputeCompanyMatches,
  getOptimizationInsights,
  getAnalytics,
  getMLHealth
} from '../controllers/analytics.controller.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

// Roadmap routes
router.get('/roadmap', authenticateJWT, getRoadmap);
router.get('/roadmap/manual', authenticateJWT, getManualRoadmap);
router.post('/roadmap/manual', authenticateJWT, saveManualRoadmap);
router.post('/roadmap/regenerate', authenticateJWT, regenerateRoadmap);
router.post('/roadmap/progress', authenticateJWT, logProgress);
router.get('/roadmap/progress-history', authenticateJWT, getProgressHistory);
router.post('/roadmap/preferences', authenticateJWT, saveRoadmapPreferences);
router.get('/roadmap/preferences', authenticateJWT, getRoadmapPreferences);

// Analytics routes
router.get('/placement-summary', authenticateJWT, getPlacementSummary);
router.get('/skill-analytics', authenticateJWT, getSkillAnalytics);
router.get('/company-matches', authenticateJWT, getCompanyMatches);
router.post('/company-matches/recompute', authenticateJWT, recomputeCompanyMatches);
router.get('/optimization-insights', authenticateJWT, getOptimizationInsights);
router.get('/analytics', authenticateJWT, getAnalytics);
router.get('/ml-health', authenticateJWT, getMLHealth);

export default router;
