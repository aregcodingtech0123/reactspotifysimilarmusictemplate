/**
 * Contact controller: POST /api/contact (optional auth; message + email when not logged in).
 */
import { Request, Response, NextFunction } from 'express';
import { submitContact } from './contact.service';
import { prisma } from '../../config/db';
import { verifyToken } from '../../utils/jwt';
import { AppError } from '../../middlewares/error.middleware';
import type { ApiSuccessResponse } from '../../types/api.types';

export async function contactSubmit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const payload = verifyToken(token);
        const user = await prisma.user.findUnique({
          where: { id: payload.sub },
          select: { id: true },
        });
        if (user) userId = user.id;
      } catch {
        // Invalid or expired token – treat as anonymous
      }
    }

    const body = req.body as { message?: string; email?: string };
    const message = typeof body.message === 'string' ? body.message : '';
    const email = typeof body.email === 'string' ? body.email : '';

    if (!userId && !email?.trim()) {
      throw new AppError(400, 'Email is required when not logged in');
    }

    const result = await submitContact({
      message,
      userId: userId ?? undefined,
      email: email?.trim() || undefined,
    });

    const json: ApiSuccessResponse<{ id: string; createdAt: string }> = {
      success: true,
      data: {
        id: result.id,
        createdAt: result.createdAt.toISOString(),
      },
    };
    res.status(201).json(json);
  } catch (e) {
    next(e);
  }
}
