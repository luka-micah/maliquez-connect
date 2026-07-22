import { Router } from 'express';
import {
  register, login, logout, refreshToken,
  getProfile, updateProfile,
  forgotPassword, resetPassword,
} from '../controllers/authController.js';
import { registerAgent } from '../controllers/agentController.js';
import { authenticate } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/register-agent', authLimiter, registerAgent);
router.post('/login', authLimiter, login);
router.post('/logout', authenticate, logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;
