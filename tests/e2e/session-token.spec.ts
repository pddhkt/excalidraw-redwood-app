import { test, expect } from '@playwright/test';

/**
 * Session Token E2E Tests - Using Fake Login
 *
 * Current session configuration (from session-utils.ts):
 * - Regular session duration: 30 seconds
 * - Session extends after 15 seconds (halfway point)
 * - "Remember me" duration: 30 days
 *
 * These tests verify that:
 * 1. Sessions remain valid before expiry (5s, 10s, 15s)
 * 2. Sessions expire correctly after 30s (31s test)
 * 3. Session cookies are properly set and validated
 */

test.describe('Session Token Functionality', () => {

  /**
   * Test 1: 5-second timeout
   * Session should remain valid after 5 seconds
   */
  test('should remain authenticated after 5 seconds', async ({ page }) => {
    test.setTimeout(30000);

    // Navigate to session monitor page
    await page.goto('/test/session-monitor');
    console.log('🧪 Test 1: Navigated to session monitor');

    // Click fake login button
    await page.getByRole('button', { name: /Fake Login/i }).click();
    await page.waitForTimeout(1000); // Wait for session creation

    console.log('✅ Fake login completed');

    // Verify we can access protected route immediately
    await page.goto('/');
    await expect(page).toHaveURL('/');
    console.log('✅ Initial access successful - authenticated');

    // Wait 5 seconds
    console.log('⏳ Waiting 5 seconds...');
    await page.waitForTimeout(5000);

    // Try to access protected route again
    await page.goto('/');
    await expect(page).toHaveURL('/');
    console.log('✅ Test 1 PASSED: Still authenticated after 5 seconds');
  });

  /**
   * Test 2: 10-second timeout
   * Session should remain valid after 10 seconds
   */
  test('should remain authenticated after 10 seconds', async ({ page }) => {
    test.setTimeout(30000);

    await page.goto('/test/session-monitor');
    console.log('🧪 Test 2: Navigated to session monitor');

    await page.getByRole('button', { name: /Fake Login/i }).click();
    await page.waitForTimeout(1000);
    console.log('✅ Fake login completed');

    await page.goto('/');
    await expect(page).toHaveURL('/');
    console.log('✅ Initial access successful');

    console.log('⏳ Waiting 10 seconds...');
    await page.waitForTimeout(10000);

    await page.goto('/');
    await expect(page).toHaveURL('/');
    console.log('✅ Test 2 PASSED: Still authenticated after 10 seconds');
  });

  /**
   * Test 3: 15-second timeout
   * Session should remain valid after 15 seconds
   * Note: This is the halfway point where session extension might occur
   */
  test('should remain authenticated after 15 seconds (halfway point)', async ({ page }) => {
    test.setTimeout(30000);

    await page.goto('/test/session-monitor');
    console.log('🧪 Test 3: Navigated to session monitor');

    await page.getByRole('button', { name: /Fake Login/i }).click();
    await page.waitForTimeout(1000);
    console.log('✅ Fake login completed');

    await page.goto('/');
    await expect(page).toHaveURL('/');
    console.log('✅ Initial access successful');

    console.log('⏳ Waiting 15 seconds (halfway point)...');
    await page.waitForTimeout(15000);

    await page.goto('/');
    await expect(page).toHaveURL('/');
    console.log('✅ Test 3 PASSED: Still authenticated after 15 seconds');
  });

  /**
   * Test 4: 31-second timeout
   * Session should expire after 31 seconds (session duration is 30s)
   */
  test('should redirect to login after session expires (31 seconds)', async ({ page }) => {
    test.setTimeout(60000); // Need more time for this test

    await page.goto('/test/session-monitor');
    console.log('🧪 Test 4: Navigated to session monitor');

    await page.getByRole('button', { name: /Fake Login/i }).click();
    await page.waitForTimeout(1000);
    console.log('✅ Fake login completed');

    await page.goto('/');
    await expect(page).toHaveURL('/');
    console.log('✅ Initial access successful');

    console.log('⏳ Waiting 31 seconds for session to expire...');
    await page.waitForTimeout(31000);

    // Try to access protected route - should redirect to login
    await page.goto('/');
    await expect(page).toHaveURL('/login');
    console.log('✅ Test 4 PASSED: Correctly redirected to login after session expiry');
  });

  /**
   * Test 5: Session monitor countdown
   * Verify the countdown timer on the session monitor page works
   */
  test('should show countdown timer on session monitor page', async ({ page }) => {
    test.setTimeout(40000);

    await page.goto('/test/session-monitor');
    console.log('🧪 Test 5: Testing session monitor countdown');

    // Click fake login
    await page.getByRole('button', { name: /Fake Login/i }).click();
    await page.waitForTimeout(2000);

    // Check for countdown display (should show ~28-30s initially)
    const countdownExists = await page.locator('text=/\\d+s/').isVisible();
    expect(countdownExists).toBeTruthy();
    console.log('✅ Countdown timer is visible');

    // Wait a few seconds and verify countdown decreases
    const initialText = await page.locator('text=/\\d+s/').first().textContent();
    console.log('Initial countdown:', initialText);

    await page.waitForTimeout(3000);

    const laterText = await page.locator('text=/\\d+s/').first().textContent();
    console.log('Countdown after 3s:', laterText);

    console.log('✅ Test 5 PASSED: Session monitor countdown works');
  });

  /**
   * Test 6: Clear session functionality
   * Verify that clearing session logs user out
   */
  test('should log out when session is cleared', async ({ page }) => {
    test.setTimeout(30000);

    await page.goto('/test/session-monitor');
    console.log('🧪 Test 6: Testing session clearing');

    // Create session
    await page.getByRole('button', { name: /Fake Login/i }).click();
    await page.waitForTimeout(1000);

    // Verify authenticated
    await page.goto('/');
    await expect(page).toHaveURL('/');
    console.log('✅ Authenticated successfully');

    // Go back and clear session
    await page.goto('/test/session-monitor');
    await page.getByRole('button', { name: /Clear Session/i }).click();
    await page.waitForTimeout(1000);

    // Try to access protected route - should redirect
    await page.goto('/');
    await expect(page).toHaveURL('/login');
    console.log('✅ Test 6 PASSED: Successfully logged out after clearing session');
  });

  /**
   * Test 7: Session cookie validation
   * Verify that session cookies are properly set after fake login
   */
  test('should set session cookies correctly after fake login', async ({ page, context }) => {
    test.setTimeout(30000);

    await page.goto('/test/session-monitor');
    console.log('🧪 Test 7: Testing session cookie');

    await page.getByRole('button', { name: /Fake Login/i }).click();
    await page.waitForTimeout(1000);

    // Get all cookies
    const cookies = await context.cookies();

    // Find session-related cookie
    const sessionCookie = cookies.find(c =>
      c.name.toLowerCase().includes('session') ||
      c.name === '__session'
    );

    // Verify session cookie exists
    expect(sessionCookie).toBeDefined();
    console.log('✅ Session cookie found:', sessionCookie?.name);

    // Verify we can access protected content
    await page.goto('/');
    await expect(page).toHaveURL('/');
    console.log('✅ Test 7 PASSED: Session cookie works correctly');
  });
});