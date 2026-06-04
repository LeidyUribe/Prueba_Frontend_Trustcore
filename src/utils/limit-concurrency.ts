export interface LimitConcurrencyOptions {
  /** Max concurrent tasks in the pool (default: 3) */
  concurrency?: number;
  /** Retry failed tasks with exponential backoff */
  retries?: number;
  /** Base delay in ms for backoff (default: 300) */
  baseDelayMs?: number;
  /** Max delay cap in ms (default: 5000) */
  maxDelayMs?: number;
}

export interface ConcurrencyResult<T> {
  /** Results in the same order as input tasks */
  results: T[];
  /** Errors indexed by task position (undefined if task succeeded) */
  errors: (Error | undefined)[];
}

type TaskFactory<T> = () => Promise<T>;

/**
 * Executes async task factories with a configurable concurrency pool.
 * Maintains result order regardless of completion order.
 *
 * Queue: tasks wait in a FIFO queue until a pool slot opens.
 * Backpressure: pool size limits in-flight promises, preventing resource exhaustion.
 */
export async function limitConcurrency<T>(
  tasks: TaskFactory<T>[],
  options: LimitConcurrencyOptions = {}
): Promise<ConcurrencyResult<T>> {
  const {
    concurrency = 3,
    retries = 0,
    baseDelayMs = 300,
    maxDelayMs = 5000,
  } = options;

  const results: T[] = new Array(tasks.length);
  const errors: (Error | undefined)[] = new Array(tasks.length);
  let nextIndex = 0;
  let activeCount = 0;

  return new Promise((resolve) => {
    const runNext = (): void => {
      while (activeCount < concurrency && nextIndex < tasks.length) {
        const currentIndex = nextIndex;
        nextIndex += 1;
        activeCount += 1;

        executeWithRetry(tasks[currentIndex], retries, baseDelayMs, maxDelayMs)
          .then((value) => {
            results[currentIndex] = value;
            errors[currentIndex] = undefined;
          })
          .catch((error: unknown) => {
            errors[currentIndex] =
              error instanceof Error ? error : new Error(String(error));
          })
          .finally(() => {
            activeCount -= 1;

            if (nextIndex >= tasks.length && activeCount === 0) {
              resolve({ results, errors });
            } else {
              runNext();
            }
          });
      }
    };

    if (tasks.length === 0) {
      resolve({ results: [], errors: [] });
      return;
    }

    runNext();
  });
}

async function executeWithRetry<T>(
  task: TaskFactory<T>,
  retries: number,
  baseDelayMs: number,
  maxDelayMs: number
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < retries) {
        const delay = computeBackoffDelay(attempt, baseDelayMs, maxDelayMs);
        await sleep(delay);
      }
    }
  }

  throw lastError ?? new Error("Task failed after retries");
}

function computeBackoffDelay(
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number
): number {
  const exponential = baseDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * baseDelayMs;
  return Math.min(exponential + jitter, maxDelayMs);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
