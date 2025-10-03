import { RequestInfo } from "rwsdk/worker"
import { UserMenu } from "@/app/components/UserMenu"
import { DrawingGrid } from "@/app/components/drawing/DrawingGrid"
import { listUserDrawings } from "./functions"
import { Button } from "@/app/components/ui/Button"

export async function DrawingList({ ctx }: RequestInfo) {
  if (!ctx.user) {
    return null // This shouldn't happen due to route protection
  }

  // Fetch user's drawings
  const drawings = await listUserDrawings()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">My Drawings</h1>
          </div>
          <UserMenu user={ctx.user} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with Create Button */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Your Drawings</h2>
              <p className="text-muted-foreground">
                {drawings.length === 0
                  ? "You haven't created any drawings yet"
                  : `${drawings.length} drawing${drawings.length === 1 ? '' : 's'}`}
              </p>
            </div>
            <a href="/drawing/create">
              <Button size="lg">Create New Drawing</Button>
            </a>
          </div>

          {/* Drawings Grid */}
          {drawings.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">No drawings yet</h3>
                <p className="text-muted-foreground mb-6">
                  Get started by creating your first diagram
                </p>
                <a href="/drawing/create">
                  <Button>Create Your First Drawing</Button>
                </a>
              </div>
            </div>
          ) : (
            <DrawingGrid drawings={drawings} />
          )}
        </div>
      </main>
    </div>
  )
}
