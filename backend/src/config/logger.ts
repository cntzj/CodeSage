import { mkdirSync } from 'fs';

import { createLogger, format, transports } from 'winston';

import { env } from './env';

const commonFormats = [format.timestamp(), format.errors({ stack: true })];

mkdirSync('logs', { recursive: true });

const devFormat = format.combine(
  ...commonFormats,
  format.colorize(),
  format.printf((info) => {
    const metadata = { ...info, level: undefined, message: undefined, timestamp: undefined };
    return `${info.timestamp} [${info.level}] ${info.message} ${JSON.stringify(metadata)}`;
  }),
);

const prodFormat = format.combine(
  ...commonFormats,
  format.json(),
);

export const logger = createLogger({
  level: env.LOG_LEVEL,
  defaultMeta: { service: 'code-reviewer' },
  format: env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});
