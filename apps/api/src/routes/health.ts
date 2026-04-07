import { testConnection } from '@nilam/db';
import { checkStorage } from '@nilam/shared/storage';
import { Hono } from 'hono';

const health = new Hono().get('/', async (c) => {
  let dbHealthy = false;
  let storageHealthy = false;

  try {
    dbHealthy = await testConnection();
  } catch {
    dbHealthy = false;
  }

  try {
    storageHealthy = await checkStorage();
  } catch {
    storageHealthy = false;
  }

  const healthy = dbHealthy && storageHealthy;
  const status = healthy ? 'ok' : 'degraded';
  const statusCode = healthy ? 200 : 503;

  return c.json(
    {
      status: status as 'ok' | 'degraded',
      db: dbHealthy,
      storage: storageHealthy,
      timestamp: new Date().toISOString(),
    },
    statusCode,
  );
});

export { health };
export default health;
