import { Router } from 'express';
import { authenticateJWT, requireAdmin } from '../middleware/auth.js';
import {
  getAdminUsers,
  getAdminUserDetails,
  getPredictionMonitoring,
  getRoadmapTracking,
  getAdminAnalyticsOverview,
  getCompaniesManagement,
  addManagedCompany,
  deleteUserByAdmin
} from '../controllers/admin.controller.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateJWT);
router.use(requireAdmin);

// User Management
router.get('/users', getAdminUsers);
router.get('/users/:userId', getAdminUserDetails);
router.delete('/users/:userId', deleteUserByAdmin);

// Prediction Monitoring
router.get('/predictions', getPredictionMonitoring);

// Roadmap Tracking
router.get('/roadmaps', getRoadmapTracking);

// Analytics Overview
router.get('/analytics', getAdminAnalyticsOverview);

// Companies Management
router.get('/companies', getCompaniesManagement);
router.post('/companies', addManagedCompany);

export default router;
