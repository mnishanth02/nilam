import { createMiddleware } from 'hono/factory';

declare module 'hono' {
  interface ContextVariableMap {
    accountId: string | null;
  }
}

export const tenantMiddleware = createMiddleware(async (c, next) => {
  const user = c.get('user');

  if (!user) {
    c.set('accountId', null);
    return next();
  }

  c.set('accountId', null);
  await next();
});
