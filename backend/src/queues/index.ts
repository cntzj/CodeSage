import { reviewQueueService } from './review-queue';

export function initializeQueues(): void {
  reviewQueueService.initialize();
}

export { reviewQueueService };
