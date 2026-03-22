import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import { getIntegrationStatus, syncIntegration } from '../controllers/integration.controller.js';

const router = Router();

router.get('/integrations', authenticateJWT, getIntegrationStatus);
router.post('/integrations/sync', authenticateJWT, syncIntegration);

export default router;
