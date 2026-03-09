import { Request, Response } from 'express';

import { env } from '../config/env';

export function healthController(_req: Request, res: Response): void {
  res.json({
    ok: true,
    service: 'codesage-backend',
    mode: env.USE_MOCK_DATA ? 'mock' : 'live',
    timestamp: new Date().toISOString(),
  });
}
