"use server"

import { requestInfo } from "rwsdk/worker"
import { db } from "@/db"
import { Drawing, DrawingStatus } from "@/types/drawing"
import { randomUUID } from "node:crypto"
import { env } from "cloudflare:workers"
import {
  type ExcalidrawData,
  uploadDrawingContent,
  uploadThumbnail,
} from "@/lib/r2-storage"

/**
 * Input data for creating a new drawing
 */
export interface CreateDrawingInput {
  title: string
  description?: string | null
  isPublic?: boolean
  tags?: string[]
}

/**
 * Creates a new drawing with DRAFT status
 *
 * This only creates the metadata record in D1 database.
 * Use saveDrawingContent() to store the actual drawing data in R2.
 *
 * @param data Drawing metadata
 * @returns The created drawing object
 * @throws Error if user is not authenticated
 */
export async function createDrawing(data: CreateDrawingInput): Promise<Drawing> {
  const { ctx } = requestInfo

  // Verify user is authenticated
  if (!ctx.user) {
    throw new Error("Unauthorized: User must be authenticated")
  }

  // Validate input
  if (!data.title || data.title.trim().length === 0) {
    throw new Error("Title is required")
  }

  if (data.title.length > 200) {
    throw new Error("Title must be 200 characters or less")
  }

  if (data.description && data.description.length > 1000) {
    throw new Error("Description must be 1000 characters or less")
  }

  // Generate UUID for the drawing
  const drawingId = randomUUID()

  // Serialize tags to JSON string if provided (SQLite doesn't support arrays)
  const tagsJson = data.tags && data.tags.length > 0
    ? JSON.stringify(data.tags)
    : null

  // Create drawing metadata in database
  const drawing = await db.drawing.create({
    data: {
      id: drawingId,
      userId: ctx.user.id,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      isPublic: data.isPublic ?? false,
      status: DrawingStatus.DRAFT,
      tags: tagsJson,
      contentUrl: null, // No content stored yet
      thumbnailUrl: null, // No thumbnail yet
    },
  })

  // Convert to Drawing interface (parse tags back to array)
  return {
    ...drawing,
    status: drawing.status as DrawingStatus,
    tags: drawing.tags ? JSON.parse(drawing.tags) : undefined,
  }
}

/**
 * Input data for saving drawing content
 */
export interface SaveDrawingContentInput {
  content: ExcalidrawData
  thumbnail?: string  // base64 or data URI
  title?: string
  description?: string
}

/**
 * Result of saving drawing content
 */
export interface SaveDrawingContentResult {
  drawing: Drawing
  contentUrl: string
  thumbnailUrl?: string
}

/**
 * Saves drawing content to R2 and updates metadata in D1
 *
 * This function uploads the Excalidraw JSON content to R2 storage,
 * optionally uploads a thumbnail, and updates the drawing metadata
 * in the D1 database with the R2 URLs and any metadata changes.
 *
 * @param drawingId UUID of the drawing to save
 * @param data Content, optional thumbnail, and optional metadata updates
 * @returns The updated drawing and R2 URLs
 * @throws Error if user is not authenticated, drawing not found, or user doesn't own the drawing
 */
export async function saveDrawingContent(
  drawingId: string,
  data: SaveDrawingContentInput
): Promise<SaveDrawingContentResult> {
  const { ctx } = requestInfo

  // Verify user is authenticated
  if (!ctx.user) {
    throw new Error("Unauthorized: User must be authenticated")
  }

  // Validate drawingId
  if (!drawingId || drawingId.trim().length === 0) {
    throw new Error("Invalid drawingId")
  }

  // Validate content
  if (!data.content) {
    throw new Error("Invalid content: content is required")
  }

  if (!data.content.type || !data.content.elements || !data.content.appState) {
    throw new Error("Invalid content: type, elements, and appState are required")
  }

  // Find the drawing and verify ownership
  const drawing = await db.drawing.findUnique({
    where: { id: drawingId },
  })

  if (!drawing) {
    throw new Error("Drawing not found")
  }

  if (drawing.userId !== ctx.user.id) {
    throw new Error("Forbidden: You don't own this drawing")
  }

  // Get R2 bucket from environment
  const bucket = env.DRAWINGS_BUCKET

  if (!bucket) {
    throw new Error("R2 bucket not configured")
  }

  // Upload content to R2
  const contentUrl = await uploadDrawingContent(
    bucket,
    ctx.user.id,
    drawingId,
    data.content
  )

  // Upload thumbnail to R2 if provided
  let thumbnailUrl: string | undefined

  if (data.thumbnail && data.thumbnail.trim().length > 0) {
    try {
      thumbnailUrl = await uploadThumbnail(
        bucket,
        ctx.user.id,
        drawingId,
        data.thumbnail
      )
    } catch (error) {
      console.error("Failed to upload thumbnail:", error)
      // Continue without thumbnail - don't fail the entire save
    }
  }

  // Prepare update data
  const updateData: any = {
    contentUrl,
    updatedAt: new Date(),
  }

  // Only update thumbnail if we successfully uploaded one
  if (thumbnailUrl) {
    updateData.thumbnailUrl = thumbnailUrl
  }

  // Update title if provided
  if (data.title !== undefined) {
    if (data.title.trim().length === 0) {
      throw new Error("Title cannot be empty")
    }
    if (data.title.length > 200) {
      throw new Error("Title must be 200 characters or less")
    }
    updateData.title = data.title.trim()
  }

  // Update description if provided
  if (data.description !== undefined) {
    if (data.description.length > 1000) {
      throw new Error("Description must be 1000 characters or less")
    }
    updateData.description = data.description.trim() || null
  }

  // Update drawing metadata in database
  const updatedDrawing = await db.drawing.update({
    where: { id: drawingId },
    data: updateData,
  })

  // Convert to Drawing interface
  const result: Drawing = {
    ...updatedDrawing,
    status: updatedDrawing.status as DrawingStatus,
    tags: updatedDrawing.tags ? JSON.parse(updatedDrawing.tags) : undefined,
  }

  return {
    drawing: result,
    contentUrl,
    thumbnailUrl,
  }
}
