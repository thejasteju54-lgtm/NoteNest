export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  backoffFactor?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: unknown) => boolean;
  onRetry?: (attempt: number, error: unknown) => void;
}

/**
 * Execute an async operation with exponential backoff and jitter.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelayMs = 400,
    backoffFactor = 2,
    maxDelayMs = 3000,
    shouldRetry = () => true,
    onRetry,
  } = options;

  let attempt = 0;
  let delay = initialDelayMs;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      return await fn();
    } catch (err: unknown) {
      if (attempt >= maxAttempts || !shouldRetry(err)) {
        throw err;
      }

      if (onRetry) {
        onRetry(attempt, err);
      }

      // Add full jitter (0 to delay) to spread out retries
      const jitter = Math.random() * (delay * 0.3);
      const sleepDuration = Math.min(maxDelayMs, delay + jitter);
      
      await new Promise((resolve) => setTimeout(resolve, sleepDuration));
      delay = Math.min(maxDelayMs, delay * backoffFactor);
    }
  }

  throw new Error('Retry loop exited unexpectedly without result or exception.');
}
