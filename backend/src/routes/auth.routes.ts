import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { signup, login, logout, getCurrentUser, requestPasswordReset, resetPassword } from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts',
    message: 'Please wait a few minutes before trying again.'
  }
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many password reset attempts',
    message: 'Please wait a few minutes before requesting another password reset.'
  }
});

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', authenticateJWT, getCurrentUser);
router.post('/forgot-password', passwordResetLimiter, requestPasswordReset);
router.post('/reset-password', passwordResetLimiter, resetPassword);

export default router;
