export interface RetryOptions {
  retries?: number;
  minDelayMs?: number;
  factor?: number;
  shouldRetry?: (error: unknown) => boolean;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const { retries = 3, minDelayMs = 500, factor = 2, shouldRetry = () => true } = options;

  let attempt = 0;
  let delay = minDelayMs;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt += 1;
      const isRetryable = shouldRetry(error);
      if (!isRetryable || attempt > retries) {
        throw error;
      }
      await sleep(delay);
      delay *= factor;
    }
  }
}
