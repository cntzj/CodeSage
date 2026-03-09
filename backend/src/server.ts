import { env } from './config/env';
import { logger } from './config/logger';
import { closePrismaClient } from './config/prisma';
import { closeRedisConnection } from './config/redis';
import { initializeQueues, reviewQueueService } from './queues';
import { createApp } from './app';

const app = createApp();

initializeQueues();

const server = app.listen(env.PORT, () => {
  logger.info('CodeSage backend started', {
    port: env.PORT,
    mode: env.USE_MOCK_DATA ? 'mock' : 'live',
  });
});

async function shutdown() {
  logger.info('Shutting down server...');

  server.close(async () => {
    await reviewQueueService.close();
    await closePrismaClient();
    await closeRedisConnection();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
