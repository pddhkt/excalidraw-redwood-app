"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/Card"
import { Input } from "@/app/components/ui/Input"
import { Label } from "@/app/components/ui/Label"
import { Textarea } from "@/app/components/ui/textarea"
import { Switch } from "@/app/components/ui/switch"
import { Button } from "@/app/components/ui/Button"
import type { CreateDrawingFormProps, CreateDrawingFormData } from "@/types/drawing"

export const CreateDrawingForm = React.forwardRef<HTMLDivElement, CreateDrawingFormProps>(
  ({ onSubmit, onCancel, initialData, loading = false, className }, ref) => {
    const [formData, setFormData] = React.useState<CreateDrawingFormData>({
      title: initialData?.title || "",
      description: initialData?.description || "",
      isPublic: initialData?.isPublic ?? false,
    })

    const [errors, setErrors] = React.useState<Partial<Record<keyof CreateDrawingFormData, string>>>({})

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()

      // Simple validation
      const newErrors: Partial<Record<keyof CreateDrawingFormData, string>> = {}

      if (!formData.title.trim()) {
        newErrors.title = "Title is required"
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      setErrors({})
      await onSubmit?.(formData)
    }

    const handleCancel = () => {
      setFormData({
        title: "",
        description: "",
        isPublic: false,
      })
      setErrors({})
      onCancel?.()
    }

    return (
      <Card ref={ref} className={cn("w-full border-0 shadow-none", className)}>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Create New Drawing</CardTitle>
            <CardDescription>
              Start a new Excalidraw diagram. Add a title and description to help you find it later.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter drawing title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={loading}
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? "title-error" : undefined}
              />
              {errors.title && (
                <p id="title-error" className="text-sm text-destructive">
                  {errors.title}
                </p>
              )}
            </div>

            {/* Description Textarea */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add a description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={loading}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Help others understand what this drawing is about
              </p>
            </div>

            {/* Privacy Toggle */}
            <div className="flex items-center justify-between space-x-2 pt-2 mt-2">
              <div className="flex-1 space-y-1">
                <Label htmlFor="isPublic" className="cursor-pointer">
                  Make this drawing public
                </Label>
                <p className="text-sm text-muted-foreground">
                  {formData.isPublic
                    ? "Anyone with the link can view this drawing"
                    : "Only you can view this drawing"}
                </p>
              </div>
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                disabled={loading}
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              {loading ? "Creating..." : "Create Drawing"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    )
  }
)

CreateDrawingForm.displayName = "CreateDrawingForm"
