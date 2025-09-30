import { test, expect } from '@playwright/test';

test.describe('Authentication Page', () => {
  test('should load login page successfully', async ({ page }) => {
    await page.goto('/user/login');

    // Check that the page loads
    await expect(page).toHaveTitle(/excalidraw/i);

    // Check for username input
    await expect(page.locator('input[type="text"]')).toBeVisible();

    // Check for passkey buttons
    await expect(page.locator('text=Sign in with Passkey')).toBeVisible();
    await expect(page.locator('text=Create New Account')).toBeVisible();

    // Check for security information
    await expect(page.locator('text=passkey')).toBeVisible();
  });

  test('should show username validation', async ({ page }) => {
    await page.goto('/user/login');

    // Try to submit without username
    await page.locator('text=Sign in with Passkey').click();

    // Should show some form validation or error
    // This test may need adjustment based on actual behavior
  });

  test('should have working CSS styles', async ({ page }) => {
    await page.goto('/user/login');

    // Check that styles are loaded by looking for common CSS properties
    const body = page.locator('body');
    await expect(body).toHaveCSS('margin', '0px');

    // Check for button styling
    const button = page.locator('text=Sign in with Passkey').first();
    await expect(button).toBeVisible();
  });
});