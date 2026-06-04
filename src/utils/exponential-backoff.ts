export interface BackoffOptions {
  attempt: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  jitterFactor?: number;
}

/**
 * Exponential Backoff with Jitter
 *
 * Formula: delay = min(base * 2^attempt + random(0, jitterFactor * base), maxDelay)
 *
 * Solves the "thundering herd" problem: when many clients retry simultaneously
 * after a server failure, jitter spreads retries over time, reducing load spikes.
 */
export function computeExponentialBackoff({
  attempt,
  baseDelayMs = 300,
  maxDelayMs = 5000,
  jitterFactor = 1,
}: BackoffOptions): number {
  const exponential = baseDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * jitterFactor * baseDelayMs;
  return Math.min(exponential + jitter, maxDelayMs);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  options: Omit<BackoffOptions, "attempt"> = {}
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delay = computeExponentialBackoff({ attempt, ...options });
        await sleep(delay);
      }
    }
  }

  throw lastError ?? new Error("Operation failed after retries");
}
