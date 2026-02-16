/**
 * Global exception filter: consistent API error response format.
 */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? (exception.getResponse() as string | { message?: string | string[] })
        : 'Internal Server Error';
    const msg =
      typeof message === 'string'
        ? message
        : Array.isArray((message as any).message)
          ? (message as any).message[0]
          : (message as any).message ?? 'Internal Server Error';

    if (status >= 500) {
      this.logger.error(`${req.method} ${req.url} ${status}`, exception instanceof Error ? exception.stack : undefined);
    }

    res.status(status).json({
      success: false,
      error: {
        message: msg,
        ...(process.env.NODE_ENV === 'development' &&
          exception instanceof Error && { stack: exception.stack }),
      },
    });
  }
}
