import { NextFunction, Request, Response } from 'express';

import { logger } from '../config/logger';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error('Unhandled request error', {
    traceId: req.traceId,
    message: error.message,
    stack: error.stack,
  });

  res.status(500).json({
    traceId: req.traceId,
    message: error.message || 'Internal Server Error',
  });
}
