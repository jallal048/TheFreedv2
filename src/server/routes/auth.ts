// Rutas de autenticación para TheFreed.v1
import { Router } from 'express';
import { register, login, logout, refreshToken, getMe } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { authRateLimitConfig } from '../config/rateLimit';
import rateLimit from 'express-rate-limit';

const router = Router();
const authLimiter = rateLimit(authRateLimitConfig);

// Rutas públicas
router.post('/register', authLimiter, validateRequest, register);
router.post('/login', authLimiter, validateRequest, login);
router.post('/refresh-token', refreshToken);

// Rutas protegidas
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getMe);

export default router;