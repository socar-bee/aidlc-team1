import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

interface LogPayload {
  requestId?: string;
  method: string;
  url: string;
  statusCode: number;
  latencyMs: number;
  userAgent?: string;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest<Request & { requestId?: string }>();
    const res = ctx.switchToHttp().getResponse<Response>();
    const started = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const payload: LogPayload = {
            requestId: req.requestId,
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            latencyMs: Date.now() - started,
            userAgent: req.headers['user-agent'],
          };
          this.logger.log(JSON.stringify(payload));
        },
        error: () => {
          const payload: LogPayload = {
            requestId: req.requestId,
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode || 500,
            latencyMs: Date.now() - started,
            userAgent: req.headers['user-agent'],
          };
          this.logger.error(JSON.stringify(payload));
        },
      }),
    );
  }
}
