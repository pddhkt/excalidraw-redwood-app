import { RequestInfo } from "rwsdk/worker"
import { ExcalidrawEditorWrapper } from "@/app/components/drawing/ExcalidrawEditorWrapper"

interface EditDrawingProps extends RequestInfo {
  params: {
    id: string
  }
}

/**
 * EditDrawing page component
 * Displays the Excalidraw editor for a specific drawing
 */
export function EditDrawing({ ctx, params }: EditDrawingProps) {
  if (!ctx.user) {
    return null // This shouldn't happen due to route protection
  }

  const drawingId = params.id

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href="/drawings"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Drawings
          </a>
          <div className="h-4 w-px bg-border" />
          <h1 className="text-lg font-semibold">Edit Drawing</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Auto-saving...
          </span>
        </div>
      </header>

      {/* Editor */}
      <main className="flex-1 overflow-hidden">
        <ExcalidrawEditorWrapper drawingId={drawingId} userId={ctx.user.id} />
      </main>
    </div>
  )
}
