/**
 * User controller: maps HTTP to user service.
 */
import { Response, NextFunction } from 'express';
import { userService } from './user.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import type { ApiSuccessResponse } from '../../types/api.types';
import type { UserPublic } from './user.types';

export const userController = {
  async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }
      const result = await userService.getMe(req.user.id);
      const json: ApiSuccessResponse<UserPublic> = { success: true, data: result };
      res.json(json);
    } catch (e) {
      next(e);
    }
  },
};
