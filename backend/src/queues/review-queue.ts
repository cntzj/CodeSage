import { Queue, Worker, Job } from 'bullmq';

import { getRedisConnection } from '../config/redis';
import { logger } from '../config/logger';
import { env } from '../config/env';
import { codeReviewerService, ReviewJobData } from '../services/code-reviewer';

export class ReviewQueueService {
  private queue: Queue<ReviewJobData> | null = null;
  private worker: Worker<ReviewJobData> | null = null;

  initialize(): void {
    const connection = getRedisConnection();

    if (!connection) {
      logger.warn('Redis not configured: Review queue runs in inline mode');
      return;
    }

    this.queue = new Queue<ReviewJobData>('code-review', {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });

    this.worker = new Worker<ReviewJobData>(
      'code-review',
      async (job: Job<ReviewJobData>) => {
        return codeReviewerService.reviewPullRequest(job.data);
      },
      { connection },
    );

    this.worker.on('completed', (job) => {
      logger.info('Review job completed', {
        jobId: job.id,
        prNumber: job.data.prNumber,
      });
    });

    this.worker.on('failed', (job, error) => {
      logger.error('Review job failed', {
        jobId: job?.id,
        error: error.message,
      });
    });
  }

  async addReviewJob(data: ReviewJobData): Promise<void> {
    if (!this.queue) {
      if (env.USE_MOCK_DATA) {
        await codeReviewerService.reviewByLocalPR(data.projectId, data.prNumber);
      } else {
        await codeReviewerService.reviewPullRequest(data);
      }
      return;
    }

    await this.queue.add('review-pr', data, {
      jobId: `${data.projectId}-${data.prNumber}-${Date.now()}`,
    });
  }

  async close(): Promise<void> {
    await this.worker?.close();
    await this.queue?.close();
  }
}

export const reviewQueueService = new ReviewQueueService();
