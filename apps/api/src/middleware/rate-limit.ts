import type { Context, Next } from 'hono';

import { getClientIp } from '../lib/ip';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  keyGenerator?: (c: Context) => string;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitStore {
  entries: Map<string, RateLimitEntry>;
  cleanupInterval: ReturnType<typeof setInterval>;
}

const stores = new Map<string, RateLimitStore>();

function getStore(storeName: string, windowMs: number) {
  const store = stores.get(storeName);
  if (store) {
    return store.entries;
  }

  const entries = new Map<string, RateLimitEntry>();
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of entries) {
      if (now > entry.resetAt) {
        entries.delete(key);
      }
    }
  }, windowMs);

  cleanupInterval.unref?.();

  stores.set(storeName, { entries, cleanupInterval });
  return entries;
}

export function rateLimiter(config: RateLimitConfig) {
  const { windowMs, max, keyGenerator } = config;
  const storeName = `${windowMs}-${max}`;
  const store = getStore(storeName, windowMs);

  return async (c: Context, next: Next) => {
    const key = keyGenerator ? keyGenerator(c) : getClientIp(c);
    const now = Date.now();

    let entry = store.get(key);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(key, entry);
    }

    entry.count += 1;

    c.header('X-RateLimit-Limit', String(max));
    c.header('X-RateLimit-Remaining', String(Math.max(0, max - entry.count)));
    c.header('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > max) {
      c.header('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return c.json(
        {
          error: 'Too many requests',
          retryAfter: Math.ceil((entry.resetAt - now) / 1000),
        },
        429,
      );
    }

    await next();
  };
}

export function resetRateLimitStores() {
  for (const store of stores.values()) {
    clearInterval(store.cleanupInterval);
  }
  stores.clear();
}

export const authRateLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (c) => c.get('user')?.id ?? getClientIp(c),
});

export const generalRateLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 100,
});
