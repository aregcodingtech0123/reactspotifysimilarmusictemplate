/**
 * User routes: GET /me (protected).
 */
import { Router } from 'express';
import { userController } from './user.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/me', authMiddleware, (req, res, next) => userController.me(req as any, res, next));

export const userRoutes = router;
