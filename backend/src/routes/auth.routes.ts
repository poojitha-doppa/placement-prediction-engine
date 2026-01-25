import { Router } from 'express';
import { signup, login, logout, getCurrentUser, requestPasswordReset, resetPassword } from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticateJWT, getCurrentUser);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router;
