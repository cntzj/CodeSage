import { PrismaClient } from '@prisma/client';

import { env } from './env';
import { logger } from './logger';

let prismaClient: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient | null {
  if (env.USE_MOCK_DATA) {
    return null;
  }

  if (!prismaClient) {
    prismaClient = new PrismaClient({
      log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  return prismaClient;
}

export async function closePrismaClient(): Promise<void> {
  if (prismaClient) {
    await prismaClient.$disconnect();
    prismaClient = null;
    logger.info('Prisma disconnected');
  }
}
