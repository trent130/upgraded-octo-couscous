const WINDOW_SIZE = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5;

interface RateLimitEntry {
  count: number;
  firstRequest: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export function rateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key) || { count: 0, firstRequest: now };

  if (now - entry.firstRequest > WINDOW_SIZE) {
    entry.count = 1;
    entry.firstRequest = now;
  } else {
    entry.count++;
  }

  rateLimitMap.set(key, entry);

  return entry.count <= MAX_REQUESTS;
}
