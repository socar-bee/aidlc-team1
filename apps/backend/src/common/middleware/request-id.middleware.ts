import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request & { requestId?: string }, res: Response, next: NextFunction): void {
    const incoming = (req.headers['x-request-id'] as string | undefined)?.trim();
    const requestId = incoming && incoming.length > 0 ? incoming : uuidv4();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  }
}
