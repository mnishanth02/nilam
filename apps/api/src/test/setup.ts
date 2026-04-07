import { afterEach, vi } from 'vitest';

import { TEST_DATABASE_PLACEHOLDER } from './db';

process.env.NODE_ENV = 'test';
process.env.VITEST = '1';
process.env.TEST_DATABASE_URL ??= TEST_DATABASE_PLACEHOLDER;
process.env.DATABASE_URL ??= process.env.TEST_DATABASE_URL;
process.env.CORS_ORIGIN ??= 'http://localhost:3000';

// Test setup — Better Auth mocks will be configured here
// External service mocks are configured per test as needed

afterEach(() => {
  vi.clearAllMocks();
});
