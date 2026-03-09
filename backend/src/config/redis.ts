import IORedis from 'ioredis';

import { env } from './env';
import { logger } from './logger';

let redisConnection: IORedis | null = null;

export function getRedisConnection(): IORedis | null {
  if (env.USE_MOCK_DATA) {
    return null;
  }

  if (!redisConnection) {
    redisConnection = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      lazyConnect: true,
      retryStrategy(times) {
        return Math.min(times * 1000, 10000);
      },
    });

    redisConnection.on('connect', () => {
      logger.info('Redis connected');
    });

    redisConnection.on('error', (error) => {
      logger.error('Redis connection error', { error: error.message });
    });
  }

  return redisConnection;
}

export async function closeRedisConnection(): Promise<void> {
  if (redisConnection) {
    await redisConnection.quit();
    redisConnection = null;
    logger.info('Redis disconnected');
  }
}
