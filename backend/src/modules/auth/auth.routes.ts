/**
 * Auth routes: register (public), login (public), me (protected).
 */
import { Router } from 'express';
import { authController } from './auth.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/register', (req, res, next) => authController.register(req as any, res, next));
router.post('/login', (req, res, next) => authController.login(req as any, res, next));
router.post('/google', (req, res, next) => authController.google(req as any, res, next));
router.get('/me', authMiddleware, (req, res, next) => authController.me(req as any, res, next));

export const authRoutes = router;
