import { getRedisConnection } from '../config/redis';
import { logger } from '../config/logger';

interface CacheEntry<T> {
  value: T;
  expireAt: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const inMemory = memoryCache.get(key);
    if (inMemory && inMemory.expireAt > Date.now()) {
      return inMemory.value as T;
    }

    const redis = getRedisConnection();
    if (!redis) {
      return null;
    }

    try {
      const value = await redis.get(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch (error) {
      logger.warn('Redis cache get failed', { key, error: String(error) });
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    memoryCache.set(key, {
      value,
      expireAt: Date.now() + ttlSeconds * 1000,
    });

    const redis = getRedisConnection();
    if (!redis) {
      return;
    }

    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (error) {
      logger.warn('Redis cache set failed', { key, error: String(error) });
    }
  }

  async del(key: string): Promise<void> {
    memoryCache.delete(key);
    const redis = getRedisConnection();
    if (!redis) {
      return;
    }

    try {
      await redis.del(key);
    } catch (error) {
      logger.warn('Redis cache delete failed', { key, error: String(error) });
    }
  }

  clearMemory(): void {
    memoryCache.clear();
  }
}

export const cacheService = new CacheService();
