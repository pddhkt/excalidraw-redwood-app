import { route } from "rwsdk/router"
import { DrawingList } from "./DrawingList"
import { CreateDrawing } from "./CreateDrawing"
import { EditDrawing } from "./EditDrawing"

/**
 * Drawing-related routes
 * All routes require authentication (enforced by middleware in worker.tsx)
 */
export const drawingRoutes = [
  // List all user's drawings
  route("/drawings", [
    ({ ctx }) => {
      if (!ctx.user) {
        return new Response(null, {
          status: 302,
          headers: { Location: "/login" },
        })
      }
    },
    DrawingList,
  ]),

  // Create new drawing
  route("/drawing/create", [
    ({ ctx }) => {
      if (!ctx.user) {
        return new Response(null, {
          status: 302,
          headers: { Location: "/login" },
        })
      }
    },
    CreateDrawing,
  ]),

  // Edit existing drawing
  route("/drawing/:id", [
    ({ ctx }) => {
      if (!ctx.user) {
        return new Response(null, {
          status: 302,
          headers: { Location: "/login" },
        })
      }
    },
    EditDrawing,
  ]),
]
