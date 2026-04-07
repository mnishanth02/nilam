import { auth } from '@nilam/auth/server';
import { ErrorCode } from '@nilam/validators';
import type { Context } from 'hono';
import { createMiddleware } from 'hono/factory';

import { apiError } from '../lib/errors.js';

declare module 'hono' {
  interface ContextVariableMap {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  }
}

export const sessionMiddleware = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set('user', null);
    c.set('session', null);
    return next();
  }

  c.set('user', session.user);
  c.set('session', session.session);
  await next();
});

export const requireAuth = createMiddleware(async (c, next) => {
  const user = c.get('user');

  if (!user) {
    return apiError(c, ErrorCode.UNAUTHORIZED, 'Authentication required');
  }

  await next();
});

export function requireRole(role: 'admin' | 'viewer') {
  return createMiddleware(async (c, next) => {
    const user = c.get('user');

    if (!user) {
      return apiError(c, ErrorCode.UNAUTHORIZED, 'Authentication required');
    }

    // TODO: Implement role check against Better Auth org membership.
    // Fail-safe: deny access until role enforcement is implemented.
    return apiError(c, ErrorCode.FORBIDDEN, `Role '${role}' enforcement not yet implemented`);
  });
}

export function requireResourceOwner(getResourceUserId: (c: Context) => string | Promise<string>) {
  return createMiddleware(async (c, next) => {
    const user = c.get('user');

    if (!user) {
      return apiError(c, ErrorCode.UNAUTHORIZED, 'Authentication required');
    }

    const resourceUserId = await getResourceUserId(c);

    if (user.id !== resourceUserId) {
      return apiError(c, ErrorCode.FORBIDDEN, 'You do not have access to this resource');
    }

    await next();
  });
}
