// Simple in-memory rate limiter. Works for single-instance deployments.
// For production at scale, replace with Upstash Redis: https://upstash.com/docs/redis/sdks/ratelimit-ts/overview

interface Window {
  count: number;
  resetAt: number;
}

const store = new Map<string, Window>();

// Clean up stale entries periodically to prevent unbounded memory growth
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, w] of store) {
      if (w.resetAt < now) store.delete(key);
    }
  }, 60_000);
}

export function rateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  let w = store.get(key);

  if (!w || w.resetAt < now) {
    w = { count: 0, resetAt: now + windowMs };
    store.set(key, w);
  }

  w.count++;
  const remaining = Math.max(0, limit - w.count);
  return { allowed: w.count <= limit, remaining };
}
