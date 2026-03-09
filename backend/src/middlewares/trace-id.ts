import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export function traceIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incomingTraceId = req.header('x-trace-id');
  const traceId = incomingTraceId || uuidv4();
  req.traceId = traceId;
  res.setHeader('x-trace-id', traceId);
  next();
}
