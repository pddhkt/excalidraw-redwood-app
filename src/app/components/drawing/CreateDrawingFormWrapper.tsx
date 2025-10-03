"use client"

import * as React from "react"
import { CreateDrawingForm } from "./CreateDrawingForm"
import { createDrawing } from "@/app/pages/drawing/functions"
import type { CreateDrawingFormData } from "@/types/drawing"

export function CreateDrawingFormWrapper() {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (data: CreateDrawingFormData) => {
    setLoading(true)
    setError(null)

    try {
      const drawing = await createDrawing({
        title: data.title,
        description: data.description || null,
        isPublic: data.isPublic,
      })

      // Navigate to drawings list after successful creation
      window.location.href = "/drawings"
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create drawing")
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Navigate back to drawings list
    window.location.href = "/drawings"
  }

  return (
    <div>
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
      )}
      <CreateDrawingForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  )
}
