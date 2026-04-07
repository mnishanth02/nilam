import { expect, test } from '@playwright/test';

test.describe('Public routes', () => {
  test.skip('homepage renders for guests', async ({ page }) => {
    // TODO(nilam): Replace starter homepage assertions with Nilam-specific content checks.
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});
