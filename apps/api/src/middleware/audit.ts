import { createMiddleware } from 'hono/factory';

export const auditMiddleware = createMiddleware(async (_c, next) => {
  await next();
});
