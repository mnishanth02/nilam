import { expect, test } from '@playwright/test';

test.describe('Health check', () => {
  test.skip('GET /api/health returns a valid health payload', async ({ request }) => {
    // TODO(nilam): Expand this smoke test once the standalone API E2E harness is finalized.
    const response = await request.get('/api/health');
    expect([200, 503]).toContain(response.status());
  });
});
