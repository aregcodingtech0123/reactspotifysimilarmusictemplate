/**
 * Centralized error handling: AppError class and global error middleware.
 */
import { Request, Response, NextFunction } from 'express';
import { isDev } from '../config/env';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    stack?: string;
  };
}

export function errorMiddleware(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log all errors for debugging
  console.error('[Error Middleware]', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    isAppError: err instanceof AppError,
  });

  if (err instanceof AppError) {
    const body: ApiErrorResponse = {
      success: false,
      error: {
        message: err.message,
        ...(err.code && { code: err.code }),
        ...(isDev && err.stack && { stack: err.stack }),
      },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  // Unknown errors: 500, do not leak details in production
  const message = isDev ? (err.message || 'Internal Server Error') : 'Internal Server Error';
  const body: ApiErrorResponse = {
    success: false,
    error: {
      message,
      ...(isDev && err.stack && { stack: err.stack }),
    },
  };
  res.status(500).json(body);
}
