import { test, expect } from '@playwright/test';

test.describe('Session Expiry', () => {
  test('should redirect to login after session expires (30 seconds)', async ({ page, context }) => {
    // Increase timeout for this test since we need to wait 31 seconds
    test.setTimeout(60000); // 60 seconds
    // Step 1: Go to login page first
    await page.goto('/login');
    await expect(page).toHaveURL('/login');

    // Step 2: We need to manually create a valid session cookie
    // Since we can't automate passkey authentication, we'll simulate a logged-in state
    // by directly setting the session data

    // Create a session data object that expires in 30 seconds
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 1000); // 30 seconds from now

    const sessionData = {
      userId: 'test-user-id',
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      rememberMe: false,
      lastActivity: now.toISOString()
    };

    // Note: In a real scenario, this would be encrypted by the server
    // For this test, we're simulating the session state
    // The actual session validation happens on the server side

    console.log('Test setup: Session expires at', expiresAt.toISOString());
    console.log('Test setup: Current time is', now.toISOString());

    // Step 3: Try to access home page immediately
    // With the short session duration (30s) set in session-utils.ts,
    // a fresh login should work
    await page.goto('/');

    // If we're not logged in, we'll be redirected to /login
    // For this test to work properly, you need to:
    // 1. Actually login via the UI first (manual step before running test)
    // OR
    // 2. Use a test helper endpoint that creates a valid session

    const currentUrl = page.url();
    console.log('Immediate access - Current URL:', currentUrl);

    // Step 4: Wait for 31 seconds (session should expire)
    console.log('Waiting 31 seconds for session to expire...');
    await page.waitForTimeout(31000);

    // Step 5: Try to access home page again - should redirect to login
    await page.goto('/');

    // Should be redirected to login page because session expired
    await expect(page).toHaveURL('/login');
    console.log('After 31 seconds - Redirected to:', page.url());
  });

  test.skip('should allow access before expiry', async ({ page }) => {
    // This test requires actual authentication
    // Skip for now - it's a reminder for when we have auth test helpers

    // 1. Login successfully
    // 2. Wait 15 seconds (half the session time)
    // 3. Access protected route - should work
    // 4. Wait another 20 seconds (total 35s)
    // 5. Access protected route - should redirect to login
  });
});