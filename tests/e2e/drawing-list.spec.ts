import { test, expect } from '../fixtures/auth';
import { createTestDrawing, createMultipleDrawings } from '../utils/drawing';

/**
 * E2E Tests for Drawing List Page
 *
 * Tests the drawings list view:
 * - Empty state
 * - Displaying drawings in grid
 * - Drawing cards
 * - Navigation to create page
 * - Filtering and sorting (future)
 */

test.describe('Drawing List Page', () => {
  test.setTimeout(45000);

  test('should show empty state when no drawings exist', async ({ authenticatedPage: page }) => {
    await page.goto('/drawings');

    // Check empty state is visible
    await expect(page.locator('text=No drawings yet')).toBeVisible();
    await expect(page.locator('text=You haven\'t created any drawings yet')).toBeVisible();

    // Should have "Create" button in empty state
    await expect(page.locator('text=Create Your First Drawing')).toBeVisible();
  });

  test('should display drawing count correctly', async ({ authenticatedPage: page }) => {
    // Create test drawing
    await createTestDrawing(page, {
      title: 'Count Test Drawing',
    });

    await page.goto('/drawings');

    // Should show count
    await expect(page.locator('text=1 drawing')).toBeVisible();
  });

  test('should display multiple drawings count', async ({ authenticatedPage: page }) => {
    // Create multiple drawings
    await createMultipleDrawings(page, 3, {
      title: 'Drawing',
    });

    await page.goto('/drawings');

    // Should show plural count
    await expect(page.locator('text=3 drawings')).toBeVisible();
  });

  test('should display drawing cards in grid', async ({ authenticatedPage: page }) => {
    // Create test drawings
    await createTestDrawing(page, {
      title: 'Grid Test 1',
      description: 'First test drawing',
    });

    await createTestDrawing(page, {
      title: 'Grid Test 2',
      description: 'Second test drawing',
    });

    await page.goto('/drawings');

    // Check both cards are visible
    await expect(page.locator('text=Grid Test 1')).toBeVisible();
    await expect(page.locator('text=Grid Test 2')).toBeVisible();

    // Check descriptions are visible
    await expect(page.locator('text=First test drawing')).toBeVisible();
    await expect(page.locator('text=Second test drawing')).toBeVisible();
  });

  test('should show privacy badges correctly', async ({ authenticatedPage: page }) => {
    // Create public drawing
    await createTestDrawing(page, {
      title: 'Public Drawing',
      isPublic: true,
    });

    // Create private drawing
    await createTestDrawing(page, {
      title: 'Private Drawing',
      isPublic: false,
    });

    await page.goto('/drawings');

    // Find cards
    const publicCard = page.locator('[data-testid="drawing-card"]', {
      has: page.locator('text=Public Drawing'),
    });

    const privateCard = page.locator('[data-testid="drawing-card"]', {
      has: page.locator('text=Private Drawing'),
    });

    // Check badges
    await expect(publicCard.locator('text=Public')).toBeVisible();
    await expect(privateCard.locator('text=Private')).toBeVisible();
  });

  test('should have "Create New Drawing" button in header', async ({ authenticatedPage: page }) => {
    await page.goto('/drawings');

    // Check for create button
    const createButton = page.locator('text=Create New Drawing');
    await expect(createButton).toBeVisible();
  });

  test('should navigate to create page when clicking create button', async ({ authenticatedPage: page }) => {
    await page.goto('/drawings');

    // Click create button
    await page.locator('text=Create New Drawing').click();

    // Should navigate to create page
    await expect(page).toHaveURL('/drawing/create');
  });

  test('should navigate to create page from empty state', async ({ authenticatedPage: page }) => {
    await page.goto('/drawings');

    // Click create button in empty state
    await page.locator('text=Create Your First Drawing').click();

    // Should navigate to create page
    await expect(page).toHaveURL('/drawing/create');
  });

  test('should show drawing cards as clickable', async ({ authenticatedPage: page }) => {
    // Create test drawing
    const drawing = await createTestDrawing(page, {
      title: 'Clickable Card Test',
    });

    await page.goto('/drawings');

    // Find the card
    const card = page.locator('[data-testid="drawing-card"]', {
      has: page.locator('text=Clickable Card Test'),
    });

    // Check card exists and is clickable
    await expect(card).toBeVisible();
    await expect(card).toHaveCSS('cursor', 'pointer');
  });

  test('should show placeholder for drawings without thumbnails', async ({ authenticatedPage: page }) => {
    // Create drawing (no thumbnail by default)
    await createTestDrawing(page, {
      title: 'No Thumbnail',
    });

    await page.goto('/drawings');

    // Should show placeholder icon
    const card = page.locator('[data-testid="drawing-card"]', {
      has: page.locator('text=No Thumbnail'),
    });

    await expect(card.locator('[data-testid="thumbnail-placeholder"]')).toBeVisible();
  });

  test('should display page header correctly', async ({ authenticatedPage: page }) => {
    await page.goto('/drawings');

    // Check header elements
    await expect(page.locator('text=My Drawings').first()).toBeVisible();
    await expect(page.locator('text=Your Drawings')).toBeVisible();
  });

  test('should show user menu in header', async ({ authenticatedPage: page }) => {
    await page.goto('/drawings');

    // User menu should be visible (shows username)
    await expect(page.locator('text=test-user')).toBeVisible();
  });

  test('should display drawings in correct order (most recent first)', async ({ authenticatedPage: page }) => {
    // Create drawings with slight delay to ensure different timestamps
    await createTestDrawing(page, { title: 'Oldest Drawing' });
    await page.waitForTimeout(100);

    await createTestDrawing(page, { title: 'Middle Drawing' });
    await page.waitForTimeout(100);

    await createTestDrawing(page, { title: 'Newest Drawing' });

    await page.goto('/drawings');

    // Get all drawing titles
    const cards = page.locator('[data-testid="drawing-card"]');
    const firstCard = cards.first();

    // Newest should be first
    await expect(firstCard).toContainText('Newest Drawing');
  });

  test('should display all drawing info on cards', async ({ authenticatedPage: page }) => {
    await createTestDrawing(page, {
      title: 'Info Test Drawing',
      description: 'Test description',
      isPublic: true,
    });

    await page.goto('/drawings');

    const card = page.locator('[data-testid="drawing-card"]').first();

    // Check all info is present
    await expect(card.locator('text=Info Test Drawing')).toBeVisible();
    await expect(card.locator('text=Test description')).toBeVisible();
    await expect(card.locator('text=Public')).toBeVisible();

    // Should have a date (updated at)
    // Date format: "MMM dd, yyyy"
    await expect(card.locator('text=/\\w{3} \\d{2}, \\d{4}/')).toBeVisible();
  });

  test('should handle many drawings in grid', async ({ authenticatedPage: page }) => {
    // Create 8 drawings
    await createMultipleDrawings(page, 8, {
      title: 'Grid Drawing',
    });

    await page.goto('/drawings');

    // All 8 should be visible
    const cards = page.locator('[data-testid="drawing-card"]');
    await expect(cards).toHaveCount(8);

    // Check count display
    await expect(page.locator('text=8 drawings')).toBeVisible();
  });
});

test.describe('Drawing List - Responsive Design', () => {
  test.setTimeout(45000);

  test('should display correctly on mobile', async ({ authenticatedPage: page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await createTestDrawing(page, {
      title: 'Mobile Test',
    });

    await page.goto('/drawings');

    // Drawing should be visible
    await expect(page.locator('text=Mobile Test')).toBeVisible();

    // Create button should be visible
    await expect(page.locator('text=Create New Drawing')).toBeVisible();
  });

  test('should display grid layout on desktop', async ({ authenticatedPage: page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Create multiple drawings
    await createMultipleDrawings(page, 4, {
      title: 'Desktop Drawing',
    });

    await page.goto('/drawings');

    // Grid should be visible with multiple columns
    const grid = page.locator('.grid');
    await expect(grid).toBeVisible();
  });
});

test.describe('Drawing List - Navigation', () => {
  test.setTimeout(45000);

  test('should navigate to home page when clicking logo', async ({ authenticatedPage: page }) => {
    await page.goto('/drawings');

    // Click header logo/title
    await page.locator('text=Excalidraw').first().click();

    // Should navigate to home
    await expect(page).toHaveURL('/');
  });
});
