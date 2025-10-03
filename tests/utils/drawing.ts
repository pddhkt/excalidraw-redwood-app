import { Page } from '@playwright/test';

/**
 * Test utilities for drawing-related operations
 */

export interface CreateDrawingOptions {
  title?: string;
  description?: string;
  isPublic?: boolean;
  tags?: string[];
}

/**
 * Create a test drawing via API
 * Uses the /test/drawing/create endpoint
 *
 * @param page - Playwright page instance (must be authenticated)
 * @param options - Drawing creation options
 * @returns Created drawing data
 */
export async function createTestDrawing(
  page: Page,
  options: CreateDrawingOptions = {}
) {
  const {
    title = 'Test Drawing',
    description = 'Created by E2E test',
    isPublic = false,
    tags = ['test'],
  } = options;

  const response = await page.request.post('/test/drawing/create', {
    data: {
      title,
      description,
      isPublic,
      tags,
    },
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(`Failed to create test drawing: ${data.error || 'Unknown error'}`);
  }

  console.log(`🎨 Created test drawing: ${data.drawing.id} - "${title}"`);

  return data.drawing;
}

/**
 * Create multiple test drawings
 *
 * @param page - Playwright page instance
 * @param count - Number of drawings to create
 * @param baseOptions - Base options for all drawings
 * @returns Array of created drawings
 */
export async function createMultipleDrawings(
  page: Page,
  count: number,
  baseOptions: CreateDrawingOptions = {}
) {
  const drawings = [];

  for (let i = 0; i < count; i++) {
    const drawing = await createTestDrawing(page, {
      ...baseOptions,
      title: `${baseOptions.title || 'Test Drawing'} ${i + 1}`,
    });
    drawings.push(drawing);
  }

  return drawings;
}

/**
 * Fill out the create drawing form
 *
 * @param page - Playwright page instance
 * @param data - Form data
 */
export async function fillDrawingForm(
  page: Page,
  data: {
    title: string;
    description?: string;
    isPublic?: boolean;
  }
) {
  // Fill title
  await page.fill('input[id="title"]', data.title);

  // Fill description if provided
  if (data.description) {
    await page.fill('textarea[id="description"]', data.description);
  }

  // Toggle privacy if needed
  if (data.isPublic !== undefined) {
    const switchElement = page.locator('#isPublic');
    const isCurrentlyChecked = await switchElement.isChecked();

    if (isCurrentlyChecked !== data.isPublic) {
      await switchElement.click();
    }
  }
}

/**
 * Submit the create drawing form
 *
 * @param page - Playwright page instance
 */
export async function submitDrawingForm(page: Page) {
  await page.click('button[type="submit"]');
}
