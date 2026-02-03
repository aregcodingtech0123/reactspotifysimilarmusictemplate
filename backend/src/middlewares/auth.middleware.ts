/**
 * JWT auth middleware: validates Bearer token and attaches user to req.
 */
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { prisma } from '../config/db';
import { AppError } from './error.middleware';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Unauthorized: missing or invalid Authorization header'));
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, username: true, email: true },
    });
    if (!user) {
      return next(new AppError(401, 'User not found'));
    }
    req.user = user as AuthUser;
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
}
