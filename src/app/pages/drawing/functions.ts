"use server"

import { requestInfo } from "rwsdk/worker"
import { db } from "@/db"
import { Drawing, DrawingStatus } from "@/types/drawing"
import { randomUUID } from "node:crypto"

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
