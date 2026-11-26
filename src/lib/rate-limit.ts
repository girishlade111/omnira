export interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
  now?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

const DEFAULT_WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_MAX_REQUESTS = 5;
const MAX_TRACKED_KEYS = 5000;

const store = new Map<string, number[]>();

function pruneStore(windowMs: number, now: number): void {
  if (store.size <= MAX_TRACKED_KEYS) {
    return;
  }
  const cutoff = now - windowMs;
  for (const [key, timestamps] of store.entries()) {
    const active = timestamps.filter((ts) => ts > cutoff);
    if (active.length === 0) {
      store.delete(key);
    } else {
      store.set(key, active);
    }
  }
}

/**
 * Checks and records a sliding-window rate limit hit for the given key.
 */
export function checkRateLimit(key: string, options: RateLimitOptions = {}): RateLimitResult {
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const maxRequests = options.maxRequests ?? DEFAULT_MAX_REQUESTS;
  const now = options.now ?? Date.now();
  const cutoff = now - windowMs;

  pruneStore(windowMs, now);

  const existing = store.get(key) ?? [];
  const active = existing.filter((ts) => ts > cutoff);

  if (active.length >= maxRequests) {
    const oldest = active[0];
    const resetAt = oldest + windowMs;
    const retryAfterSeconds = Math.max(1, Math.ceil((resetAt - now) / 1000));
    store.set(key, active);
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      resetAt,
      retryAfterSeconds,
    };
  }

  active.push(now);
  store.set(key, active);

  const oldest = active[0];
  const resetAt = oldest + windowMs;
  return {
    allowed: true,
    limit: maxRequests,
    remaining: Math.max(0, maxRequests - active.length),
    resetAt,
    retryAfterSeconds: 0,
  };
}

/**
 * Extracts a normalized client IP address from incoming request headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) {
      return first;
    }
  }
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) {
    return realIp;
  }
  return '127.0.0.1';
}

/**
 * Clears the in-memory rate-limit store (intended for tests).
 */
export function resetRateLimitStore(): void {
  store.clear();
}
