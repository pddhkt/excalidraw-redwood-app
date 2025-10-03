import { RequestInfo } from "rwsdk/worker";
import { UserMenu } from "@/app/components/UserMenu";

export function Home({ ctx }: RequestInfo) {
  if (!ctx.user) {
    return null; // This shouldn't happen due to route protection, but TypeScript needs it
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Excalidraw</h1>
          </div>
          <UserMenu user={ctx.user} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Welcome back, {ctx.user.username}!</h2>
          <p className="text-muted-foreground mb-8">
            Start creating amazing diagrams and collaborate with your team.
          </p>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* My Drawings - Navigate to drawings list */}
            <a
              href="/drawings"
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer block"
            >
              <h3 className="font-semibold mb-2">My Drawings</h3>
              <p className="text-sm text-muted-foreground">
                View and manage your saved drawings
              </p>
            </a>

            {/* New Drawing - Navigate to create page */}
            <a
              href="/drawing/create"
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer block"
            >
              <h3 className="font-semibold mb-2">New Drawing</h3>
              <p className="text-sm text-muted-foreground">
                Start a new diagram from scratch
              </p>
            </a>

            {/* Templates - Coming soon */}
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow opacity-50">
              <h3 className="font-semibold mb-2">Templates</h3>
              <p className="text-sm text-muted-foreground">
                Browse diagram templates (coming soon)
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
