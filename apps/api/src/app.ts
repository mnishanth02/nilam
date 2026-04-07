import { auth } from '@nilam/auth/server';
import { ErrorCode } from '@nilam/validators';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from 'inngest/hono';

import { inngest } from './inngest/client.js';
import { allFunctions } from './inngest/functions.js';
import { configureAuthEmailCallbacks } from './lib/auth-email';
import { apiError, globalErrorHandler, validationError } from './lib/errors';
import { initSentry } from './lib/sentry.js';
import { authRateLimiter, generalRateLimiter } from './middleware/rate-limit';
import { auditMiddleware } from './middleware/audit';
import { sessionMiddleware } from './middleware/auth';
import { requestId } from './middleware/request-id';
import { tenantMiddleware } from './middleware/tenant';
import assets from './routes/assets.js';
import auditLog from './routes/audit-log.js';
import dashboard from './routes/dashboard.js';
import documents from './routes/documents.js';
import exportsRoute from './routes/exports.js';
import groups from './routes/groups.js';
import health from './routes/health.js';
import leases from './routes/leases.js';
import notifications from './routes/notifications.js';
import payments from './routes/payments.js';
import persons from './routes/persons.js';
import settings from './routes/settings.js';
import tenants from './routes/tenants.js';
import units from './routes/units.js';

initSentry();
configureAuthEmailCallbacks();

const app = new Hono();
const v1 = new Hono();

app.onError(globalErrorHandler);
app.notFound((c) => apiError(c, ErrorCode.NOT_FOUND, 'Route not found'));

app.use('*', requestId);
app.use(
  '*',
  cors({
    origin: (origin) => {
      const envVar = process.env.CORS_ORIGIN;
      if (!envVar || envVar.trim() === '') {
        if (process.env.NODE_ENV === 'production') {
          return null;
        }
        // In development, only allow localhost origins
        return origin && /^https?:\/\/localhost(:\d+)?$/.test(origin) ? origin : null;
      }

      const allowed = envVar.split(',').map((value) => value.trim());
      return allowed.includes(origin) ? origin : null;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['X-Request-Id'],
    maxAge: 600,
    credentials: true,
  }),
);
app.use('/api/v1/*', sessionMiddleware);
app.use('/api/v1/*', tenantMiddleware);
app.use('/api/v1/*', auditMiddleware);
app.use('/api/v1/*', generalRateLimiter);

app.use('/api/auth/*', authRateLimiter);
app.on(['POST', 'GET'], '/api/auth/**', (c) => auth.handler(c.req.raw));

// Health check
app.route('/api/health', health);

// Inngest webhook handler
app.on(['GET', 'POST', 'PUT'], '/api/inngest', serve({ client: inngest, functions: allFunctions }));

// Domain routes (v1)
v1.route('/groups', groups);
v1.route('/persons', persons);
v1.route('/assets', assets);
v1.route('/units', units);
v1.route('/tenants', tenants);
v1.route('/leases', leases);
v1.route('/payments', payments);
v1.route('/documents', documents);
v1.route('/notifications', notifications);
v1.route('/dashboard', dashboard);
v1.route('/audit-log', auditLog);
v1.route('/exports', exportsRoute);
v1.route('/settings', settings);

app.route('/api/v1', v1);

const server = {
  port: Number(process.env.PORT) || 4000,
  fetch: app.fetch,
};

export type AppType = typeof app;
export { apiError, app, server, validationError };
export default server;
