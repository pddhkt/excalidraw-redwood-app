import { test, expect } from '../fixtures/auth';
import { fillDrawingForm, submitDrawingForm } from '../utils/drawing';

/**
 * E2E Tests for Create Drawing Flow
 *
 * Tests the complete flow of creating a new drawing:
 * - Loading the create page
 * - Filling out the form
 * - Validations
 * - Successful creation
 * - Redirection to drawings list
 */

test.describe('Create Drawing Flow', () => {
  // Set timeout to 45s to accommodate 30s session duration
  test.setTimeout(45000);

  test.beforeEach(async ({ authenticatedPage: page }) => {
    // Navigate to create page before each test
    await page.goto('/drawing/create');
  });

  test('should load create drawing page successfully', async ({ authenticatedPage: page }) => {
    // Check page loaded
    await expect(page).toHaveURL('/drawing/create');

    // Check for form elements
    await expect(page.locator('input[id="title"]')).toBeVisible();
    await expect(page.locator('textarea[id="description"]')).toBeVisible();
    await expect(page.locator('#isPublic')).toBeVisible();

    // Check for buttons
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[type="button"]', { hasText: /cancel/i })).toBeVisible();

    // Check for form labels
    await expect(page.locator('label[for="title"]')).toBeVisible();
    await expect(page.locator('label[for="description"]')).toBeVisible();
    await expect(page.locator('label[for="isPublic"]')).toBeVisible();
  });

  test('should create drawing with title only', async ({ authenticatedPage: page }) => {
    // Fill only title (minimum required)
    await fillDrawingForm(page, {
      title: 'Minimal Drawing',
    });

    // Submit form
    await submitDrawingForm(page);

    // Should redirect to drawings list
    await expect(page).toHaveURL('/drawings');

    // Drawing should appear in list
    await expect(page.locator('text=Minimal Drawing')).toBeVisible();
  });

  test('should create drawing with all fields', async ({ authenticatedPage: page }) => {
    // Fill all fields
    await fillDrawingForm(page, {
      title: 'Complete Drawing',
      description: 'This is a test drawing with all fields filled',
      isPublic: true,
    });

    // Submit form
    await submitDrawingForm(page);

    // Should redirect to drawings list
    await expect(page).toHaveURL('/drawings');

    // Drawing should appear in list with correct data
    await expect(page.locator('text=Complete Drawing')).toBeVisible();
    await expect(page.locator('text=This is a test drawing')).toBeVisible();

    // Should show "Public" badge
    await expect(page.locator('text=Public').first()).toBeVisible();
  });

  test('should show validation error for empty title', async ({ authenticatedPage: page }) => {
    // Try to submit without title
    await submitDrawingForm(page);

    // Should show validation error
    await expect(page.locator('text=Title is required')).toBeVisible();

    // Should stay on create page
    await expect(page).toHaveURL('/drawing/create');
  });

  test('should toggle privacy switch correctly', async ({ authenticatedPage: page }) => {
    const switchElement = page.locator('#isPublic');

    // Check initial state (should be unchecked/private)
    await expect(switchElement).not.toBeChecked();
    await expect(page.locator('text=Only you can view this drawing')).toBeVisible();

    // Click to make public
    await switchElement.click();

    // Should show public message
    await expect(page.locator('text=Anyone with the link can view this drawing')).toBeVisible();

    // Click again to make private
    await switchElement.click();

    // Should show private message again
    await expect(page.locator('text=Only you can view this drawing')).toBeVisible();
  });

  test('should navigate back when cancel is clicked', async ({ authenticatedPage: page }) => {
    // Click cancel button
    await page.locator('button[type="button"]', { hasText: /cancel/i }).click();

    // Should redirect to drawings list
    await expect(page).toHaveURL('/drawings');
  });

  test('should create multiple drawings in sequence', async ({ authenticatedPage: page }) => {
    // Create first drawing
    await fillDrawingForm(page, {
      title: 'Drawing One',
      description: 'First test drawing',
    });
    await submitDrawingForm(page);
    await expect(page).toHaveURL('/drawings');

    // Navigate back to create page
    await page.goto('/drawing/create');

    // Create second drawing
    await fillDrawingForm(page, {
      title: 'Drawing Two',
      description: 'Second test drawing',
    });
    await submitDrawingForm(page);
    await expect(page).toHaveURL('/drawings');

    // Both should be visible in list
    await expect(page.locator('text=Drawing One')).toBeVisible();
    await expect(page.locator('text=Drawing Two')).toBeVisible();
  });

  test('should preserve form data after validation error', async ({ authenticatedPage: page }) => {
    const testDescription = 'This description should persist';

    // Fill description but not title
    await page.fill('textarea[id="description"]', testDescription);

    // Try to submit (should fail validation)
    await submitDrawingForm(page);

    // Check validation error appears
    await expect(page.locator('text=Title is required')).toBeVisible();

    // Description should still be there
    await expect(page.locator('textarea[id="description"]')).toHaveValue(testDescription);
  });

  test('should handle long title and description', async ({ authenticatedPage: page }) => {
    const longTitle = 'A'.repeat(200); // Max title length
    const longDescription = 'B'.repeat(1000); // Max description length

    await fillDrawingForm(page, {
      title: longTitle,
      description: longDescription,
    });

    await submitDrawingForm(page);

    // Should create successfully
    await expect(page).toHaveURL('/drawings');
  });

  test('should show error if title exceeds max length', async ({ authenticatedPage: page }) => {
    const tooLongTitle = 'A'.repeat(201); // Over max

    await page.fill('input[id="title"]', tooLongTitle);
    await submitDrawingForm(page);

    // Should show error message
    await expect(page.locator('text=/.*200 characters.*/i')).toBeVisible();
  });

  test('should create private drawing by default', async ({ authenticatedPage: page }) => {
    // Don't toggle privacy switch
    await fillDrawingForm(page, {
      title: 'Private Drawing Test',
    });

    await submitDrawingForm(page);
    await expect(page).toHaveURL('/drawings');

    // Should show "Private" badge
    await expect(page.locator('text=Private Drawing Test')).toBeVisible();
    // Look for Private badge (not Public)
    const privateCard = page.locator('[data-testid="drawing-card"]', {
      has: page.locator('text=Private Drawing Test'),
    });
    await expect(privateCard.locator('text=Private')).toBeVisible();
  });

  test('should have working form accessibility', async ({ authenticatedPage: page }) => {
    // Check ARIA labels and accessibility attributes
    const titleInput = page.locator('input[id="title"]');
    await expect(titleInput).toBeVisible();
    await expect(titleInput).toBeEnabled();

    const descriptionTextarea = page.locator('textarea[id="description"]');
    await expect(descriptionTextarea).toBeVisible();
    await expect(descriptionTextarea).toBeEnabled();

    // Submit button should have text
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toHaveText(/create drawing/i);
  });
});

test.describe('Create Drawing - Loading States', () => {
  test.setTimeout(45000);

  test('should show loading state during submission', async ({ authenticatedPage: page }) => {
    await page.goto('/drawing/create');

    await fillDrawingForm(page, {
      title: 'Loading Test',
    });

    // Click submit
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Should show loading text briefly
    await expect(submitButton).toHaveText(/creating.../i);

    // Eventually should redirect
    await expect(page).toHaveURL('/drawings');
  });
});
