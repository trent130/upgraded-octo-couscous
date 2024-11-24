const WINDOW_SIZE = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  lockedUntil?: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export function rateLimit(key: string): { allowed: boolean; lockedUntil?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key) || { count: 0, firstRequest: now };

  if (entry.lockedUntil && now < entry.lockedUntil) {
    return { allowed: false, lockedUntil: entry.lockedUntil };
  }

  if (now - entry.firstRequest > WINDOW_SIZE) {
    entry.count = 1;
    entry.firstRequest = now;
  } else {
    entry.count++;
  }

  if (entry.count > MAX_REQUESTS) {
    entry.lockedUntil = now + LOCKOUT_DURATION;
    rateLimitMap.set(key, entry);
    return { allowed: false, lockedUntil: entry.lockedUntil };
  }

  rateLimitMap.set(key, entry);
  return { allowed: true };
}
