import 'express';

declare global {
  namespace Express {
    interface Request {
      traceId?: string;
      rawBody?: string;
    }
  }
}

export {};
