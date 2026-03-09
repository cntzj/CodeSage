import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';

import { env } from '../config/env';

export function verifyGitHubWebhook(req: Request, res: Response, next: NextFunction): void {
  const signature = req.header('x-hub-signature-256');
  if (!signature) {
    res.status(401).json({ message: 'Missing GitHub signature header' });
    return;
  }

  const payload = req.rawBody || JSON.stringify(req.body);
  const digest = `sha256=${crypto
    .createHmac('sha256', env.GITHUB_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')}`;

  const signatureBuffer = Buffer.from(signature);
  const digestBuffer = Buffer.from(digest);
  const isValid =
    signatureBuffer.length === digestBuffer.length &&
    crypto.timingSafeEqual(signatureBuffer, digestBuffer);

  if (!isValid) {
    res.status(401).json({ message: 'Invalid webhook signature' });
    return;
  }

  next();
}
