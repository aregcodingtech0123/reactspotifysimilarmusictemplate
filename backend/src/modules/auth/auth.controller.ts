/**
 * Auth controller: maps HTTP to auth service and returns consistent API responses.
 */
import { Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import type { RegisterBody, LoginBody, GoogleAuthBody } from './auth.types';
import type { ApiSuccessResponse } from '../../types/api.types';

export const authController = {
  async register(
    req: AuthenticatedRequest & { body: RegisterBody },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await authService.register(req.body);
      const json: ApiSuccessResponse<typeof result> = { success: true, data: result };
      res.status(201).json(json);
    } catch (e) {
      next(e);
    }
  },

  async login(
    req: AuthenticatedRequest & { body: LoginBody },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await authService.login(req.body);
      const json: ApiSuccessResponse<typeof result> = { success: true, data: result };
      res.json(json);
    } catch (e) {
      next(e);
    }
  },

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }
      const result = await authService.getMe(req.user.id);
      const json: ApiSuccessResponse<typeof result> = { success: true, data: result };
      res.json(json);
    } catch (e) {
      next(e);
    }
  },

  async google(
    req: AuthenticatedRequest & { body: GoogleAuthBody },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await authService.googleAuth(req.body);
      const json: ApiSuccessResponse<typeof result> = { success: true, data: result };
      res.json(json);
    } catch (e) {
      next(e);
    }
  },
};
