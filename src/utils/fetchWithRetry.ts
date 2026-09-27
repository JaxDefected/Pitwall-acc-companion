/**
 * Retry wrapper for async operations with exponential backoff.
 * Designed for Firebase reads/writes that may fail on mobile
 * due to momentary connection drops.
 *
 * @param fn - Async function to execute
 * @param retries - Number of retry attempts (default 3)
 * @param baseDelay - Base delay in ms between retries (default 1000)
 * @returns The resolved value from fn
 * @throws The last error after all retries are exhausted
 */
export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === retries) throw error;
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  // Unreachable, but satisfies TypeScript
  throw new Error("fetchWithRetry: unreachable");
}
