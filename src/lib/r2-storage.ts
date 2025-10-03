/**
 * R2 Storage utilities for handling drawing content and thumbnails
 *
 * Storage Structure:
 * - drawing-content/{userId}/{drawingId}.json - Excalidraw JSON data
 * - drawing-thumbnails/{userId}/{drawingId}.png - PNG thumbnails
 * - drawing-versions/{userId}/{drawingId}/v{n}-{timestamp}.json - Version history (future)
 */

export interface ExcalidrawData {
  type: string
  version: number
  source?: string
  elements: any[]
  appState: Record<string, any>
  files?: Record<string, any>
}

/**
 * Generates the R2 key for drawing content
 */
export function getDrawingContentKey(userId: string, drawingId: string): string {
  return `drawing-content/${userId}/${drawingId}.json`
}

/**
 * Generates the R2 key for drawing thumbnail
 */
export function getDrawingThumbnailKey(userId: string, drawingId: string): string {
  return `drawing-thumbnails/${userId}/${drawingId}.png`
}

/**
 * Uploads drawing content to R2
 * @returns The R2 key (path) where content was stored
 */
export async function uploadDrawingContent(
  bucket: R2Bucket,
  userId: string,
  drawingId: string,
  content: ExcalidrawData
): Promise<string> {
  const key = getDrawingContentKey(userId, drawingId)

  await bucket.put(key, JSON.stringify(content), {
    httpMetadata: {
      contentType: 'application/json',
    },
  })

  return key
}

/**
 * Uploads a thumbnail image to R2
 * @param base64Image Base64-encoded image data (with or without data URI prefix)
 * @returns The R2 key (path) where thumbnail was stored
 */
export async function uploadThumbnail(
  bucket: R2Bucket,
  userId: string,
  drawingId: string,
  base64Image: string
): Promise<string> {
  const key = getDrawingThumbnailKey(userId, drawingId)

  // Remove data URI prefix if present (e.g., "data:image/png;base64,")
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')

  // Convert base64 to binary
  const binaryString = atob(base64Data)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  await bucket.put(key, bytes, {
    httpMetadata: {
      contentType: 'image/png',
    },
  })

  return key
}

/**
 * Retrieves drawing content from R2
 * @param contentUrl The R2 key (path) to the content
 * @returns The parsed Excalidraw data
 */
export async function getDrawingContent(
  bucket: R2Bucket,
  contentUrl: string
): Promise<ExcalidrawData | null> {
  const object = await bucket.get(contentUrl)

  if (!object) {
    return null
  }

  const text = await object.text()
  return JSON.parse(text) as ExcalidrawData
}

/**
 * Deletes all R2 files associated with a drawing
 */
export async function deleteDrawingFiles(
  bucket: R2Bucket,
  userId: string,
  drawingId: string
): Promise<void> {
  const contentKey = getDrawingContentKey(userId, drawingId)
  const thumbnailKey = getDrawingThumbnailKey(userId, drawingId)

  // Delete both files (R2 delete is idempotent, won't error if file doesn't exist)
  await Promise.all([
    bucket.delete(contentKey),
    bucket.delete(thumbnailKey),
  ])
}
