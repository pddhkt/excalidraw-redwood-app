import { test as base, expect } from '@playwright/test';

/**
 * Authentication fixture for Playwright tests
 *
 * Provides an `authenticatedPage` fixture that automatically logs in
 * using the /test/fake-login endpoint before each test.
 *
 * Usage:
 * ```typescript
 * import { test, expect } from '../fixtures/auth';
 *
 * test('my test', async ({ authenticatedPage: page }) => {
 *   // page is already authenticated
 *   await page.goto('/protected-route');
 * });
 * ```
 *
 * Note: Fake login creates sessions with 30-second duration
 */

export const test = base.extend({
  /**
   * Authenticated page fixture
   * Automatically calls /test/fake-login to create a session
   */
  authenticatedPage: async ({ page }, use) => {
    // Call fake-login endpoint to create session
    // This sets the session cookie automatically
    const response = await page.request.get('/test/fake-login');
    const data = await response.json();

    if (!data.success) {
      throw new Error(`Fake login failed: ${data.error || 'Unknown error'}`);
    }

    console.log(`✅ Authenticated as user: ${data.username} (session expires in 30s)`);

    // Provide the authenticated page to the test
    await use(page);

    // Cleanup: Clear session after test (optional)
    try {
      await page.request.get('/test/clear-session');
      console.log('🧹 Session cleared after test');
    } catch (error) {
      // Ignore cleanup errors
      console.warn('⚠️  Failed to clear session:', error);
    }
  },
});

export { expect };
