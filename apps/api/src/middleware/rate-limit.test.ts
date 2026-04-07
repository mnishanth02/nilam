import { Hono } from 'hono';
import { beforeEach, describe, expect, it } from 'vitest';

import { rateLimiter, resetRateLimitStores } from './rate-limit.js';

describe('rateLimiter', () => {
  let app: Hono;

  beforeEach(() => {
    resetRateLimitStores();

    app = new Hono();
    app.use('*', rateLimiter({ windowMs: 60_000, max: 3 }));
    app.get('/test', (c) => c.json({ ok: true }));
  });

  it('allows requests within limit', async () => {
    const res = await app.request('/test');

    expect(res.status).toBe(200);
    expect(res.headers.get('X-RateLimit-Limit')).toBe('3');
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('2');
  });

  it('blocks requests exceeding limit', async () => {
    for (let i = 0; i < 3; i++) {
      await app.request('/test');
    }

    const res = await app.request('/test');

    expect(res.status).toBe(429);
    await expect(res.json()).resolves.toMatchObject({
      error: 'Too many requests',
    });
  });
});
