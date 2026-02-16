/**
 * Auth service: register, login, Google OAuth, get current user.
 */
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../../config/db';
import { env } from '../../config/env';
import { hashPassword, comparePassword } from '../../utils/password';
import { signToken } from '../../utils/jwt';
import { AppError } from '../../middlewares/error.middleware';
import type { RegisterBody, LoginBody, AuthResponse, MeResponse, GoogleAuthBody } from './auth.types';

export const authService = {
  async register(body: RegisterBody): Promise<AuthResponse> {
    try {
      const existing = await prisma.user.findFirst({
        where: {
          OR: [{ email: body.email }, { username: body.username }],
        },
      });
      if (existing) {
        if (existing.email === body.email) {
          throw new AppError(409, 'Email already registered');
        }
        throw new AppError(409, 'Username already taken');
      }

      const hashed = await hashPassword(body.password);
      const user = await prisma.user.create({
        data: {
          username: body.username,
          email: body.email,
          password: hashed,
        },
      });

      const accessToken = signToken({ sub: user.id, username: user.username });
      return {
        user: { id: user.id, username: user.username, email: user.email },
        accessToken,
        expiresIn: env.jwt.expiresIn,
      };
    } catch (error) {
      // Log database/connection errors
      if (error instanceof AppError) {
        throw error; // Re-throw AppError as-is
      }
      console.error('[Auth Service] Register error:', error);
      // Check for Prisma connection errors
      if (error && typeof error === 'object' && 'code' in error) {
        const prismaError = error as { code?: string; message?: string };
        if (prismaError.code === 'P1001' || prismaError.code === 'P1017') {
          throw new AppError(503, 'Database connection failed. Please check if the database is running.');
        }
        if (prismaError.code === 'P2002') {
          // Unique constraint violation
          throw new AppError(409, 'Email or username already registered');
        }
      }
      throw new AppError(500, 'Registration failed. Please try again later.');
    }
  },

  async login(body: LoginBody): Promise<AuthResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: body.email },
      });
      if (!user || !user.password) {
        throw new AppError(401, 'Invalid email or password');
      }
      const valid = await comparePassword(body.password, user.password);
      if (!valid) {
        throw new AppError(401, 'Invalid email or password');
      }

      const accessToken = signToken({ sub: user.id, username: user.username });
      return {
        user: { id: user.id, username: user.username, email: user.email },
        accessToken,
        expiresIn: env.jwt.expiresIn,
      };
    } catch (error) {
      // Log database/connection errors
      if (error instanceof AppError) {
        throw error; // Re-throw AppError as-is
      }
      console.error('[Auth Service] Login error:', error);
      // Check for Prisma connection errors
      if (error && typeof error === 'object' && 'code' in error) {
        const prismaError = error as { code?: string; message?: string };
        if (prismaError.code === 'P1001' || prismaError.code === 'P1017') {
          throw new AppError(503, 'Database connection failed. Please check if the database is running.');
        }
      }
      throw new AppError(500, 'Login failed. Please try again later.');
    }
  },

  async getMe(userId: string): Promise<MeResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true },
    });
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    return user as MeResponse;
  },

  async googleAuth(body: GoogleAuthBody): Promise<AuthResponse> {
    if (!env.google.clientId) {
      throw new AppError(503, 'Google sign-in is not configured');
    }
    const client = new OAuth2Client(env.google.clientId);
    let payload: { email?: string; name?: string; sub: string };
    try {
      const ticket = await client.verifyIdToken({
        idToken: body.idToken,
        audience: env.google.clientId,
      });
      payload = ticket.getPayload() as { email?: string; name?: string; sub: string };
    } catch {
      throw new AppError(401, 'Invalid Google token');
    }
    if (!payload?.email) {
      throw new AppError(401, 'Google account email not available');
    }
    const email = payload.email;
    const googleId = payload.sub;
    const name = payload.name ?? email.split('@')[0];
    const usernameBase = name.replace(/\s+/g, '_').slice(0, 28);

    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
    });
    if (!user) {
      let username = usernameBase;
      let suffix = 0;
      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${usernameBase}_${++suffix}`.slice(0, 32);
      }
      user = await prisma.user.create({
        data: {
          username,
          email,
          googleId,
          password: null,
        },
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId },
      });
    }

    const accessToken = signToken({ sub: user.id, username: user.username });
    return {
      user: { id: user.id, username: user.username, email: user.email },
      accessToken,
      expiresIn: env.jwt.expiresIn,
    };
  },
};
