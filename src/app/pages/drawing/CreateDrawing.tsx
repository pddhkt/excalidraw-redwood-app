import { RequestInfo } from "rwsdk/worker"
import { LayoutContainer } from "@/app/components/layout/LayoutContainer"
import { CreateDrawingFormWrapper } from "@/app/components/drawing/CreateDrawingFormWrapper"

export function CreateDrawing({ ctx }: RequestInfo) {
  if (!ctx.user) {
    return null // This shouldn't happen due to route protection
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <LayoutContainer variant="centered">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Create New Drawing</h1>
            <p className="text-muted-foreground">
              Set up your drawing and start diagramming
            </p>
          </div>
          <CreateDrawingFormWrapper />
        </div>
      </LayoutContainer>
    </div>
  )
}
