"use client"

import { useState, useEffect, useCallback } from "react"
import { ExcalidrawEditor } from "./ExcalidrawEditor"
import type { ExcalidrawElement, AppState, BinaryFiles } from "@excalidraw/excalidraw/types/types"

interface ExcalidrawEditorWrapperProps {
  drawingId: string
  userId: string
}

/**
 * ExcalidrawEditorWrapper - Client component wrapper for the editor
 * Handles data loading, saving, and state management
 */
export function ExcalidrawEditorWrapper({ drawingId, userId }: ExcalidrawEditorWrapperProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialData, setInitialData] = useState<{
    elements?: readonly ExcalidrawElement[]
    appState?: Partial<AppState>
    files?: BinaryFiles
  } | null>(null)

  // Load drawing data
  useEffect(() => {
    const loadDrawing = async () => {
      try {
        setIsLoading(true)

        // TODO: Call API to fetch drawing data
        // For now, just simulate loading
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Mock data - in production, this would come from the API
        setInitialData({
          elements: [],
          appState: {
            viewBackgroundColor: '#ffffff',
          },
        })

        setIsLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load drawing')
        setIsLoading(false)
      }
    }

    loadDrawing()
  }, [drawingId])

  // Handle auto-save
  const handleAutoSave = useCallback(
    async (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
      try {
        // TODO: Call API to save drawing data
        console.log('Auto-saving drawing...', {
          drawingId,
          userId,
          elementCount: elements.length,
        })

        // In production, this would call a server function:
        // await saveDrawing({ drawingId, elements, appState, files })
      } catch (err) {
        console.error('Failed to auto-save:', err)
      }
    },
    [drawingId, userId]
  )

  // Handle onChange (for debounced saves, etc.)
  const handleChange = useCallback(
    (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
      // Could implement debounced saving here
      console.log('Drawing changed:', elements.length, 'elements')
    },
    []
  )

  return (
    <ExcalidrawEditor
      initialData={initialData || undefined}
      onChange={handleChange}
      onAutoSave={handleAutoSave}
      autoSaveInterval={30000} // Auto-save every 30 seconds
      isLoading={isLoading}
      error={error || undefined}
      theme="light"
    />
  )
}
