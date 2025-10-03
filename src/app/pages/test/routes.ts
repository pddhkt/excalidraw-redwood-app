import { route } from "rwsdk/router";
import TestHelper from "./TestHelper";
import { SessionMonitor } from "./SessionMonitor";
import { sessions } from "@/session/store";
import { db } from "@/db";
import { createSessionData } from "@/auth/session-utils";
import { createDrawing } from "@/app/pages/drawing/functions";

export const testRoutes = [
  route("/test/helper", [TestHelper]),
  route("/test/session-monitor", [SessionMonitor]),

  // Fake login endpoint - creates session without passkey (dev only)
  route("/test/fake-login", async function ({ request, response }) {
    // Only allow in development
    if (!import.meta.env.VITE_IS_DEV_SERVER) {
      return new Response(JSON.stringify({ error: "Not available" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create or find test user
    let user = await db.user.findUnique({
      where: { username: "test-user" }
    });

    if (!user) {
      user = await db.user.create({
        data: {
          username: "test-user",
          tier: 'REGISTERED',
          lastActivity: new Date(),
        }
      });
    }

    // Create session data with 30 second expiry
    const sessionData = createSessionData(user.id, false);

    // Save session
    await sessions.save(response.headers, {
      ...sessionData,
      challenge: null,
    });

    console.log('🔓 Fake login successful - Session expires in 30 seconds');

    return new Response(JSON.stringify({
      success: true,
      userId: user.id,
      username: user.username,
      expiresAt: sessionData.expiresAt.toISOString(),
      createdAt: sessionData.createdAt.toISOString(),
      message: "Fake login successful - session created"
    }), {
      headers: { "Content-Type": "application/json" },
    });
  }),

  // Clear session endpoint
  route("/test/clear-session", async function ({ request, response }) {
    if (!import.meta.env.VITE_IS_DEV_SERVER) {
      return new Response(JSON.stringify({ error: "Not available" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    await sessions.save(response.headers, {});

    console.log('🗑️  Session cleared');

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }),

  // Test endpoint for creating drawings
  route("/test/drawing/create", async function ({ request, response, ctx }) {
    if (!import.meta.env.VITE_IS_DEV_SERVER) {
      return new Response(JSON.stringify({ error: "Not available" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return new Response(JSON.stringify({
        error: "Invalid JSON",
        message: error instanceof Error ? error.message : "Unknown error"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Call createDrawing server function
    try {
      const drawing = await createDrawing({
        title: body.title,
        description: body.description,
        isPublic: body.isPublic,
        tags: body.tags,
      });

      console.log('🎨 Drawing created:', drawing.id);

      return new Response(JSON.stringify({
        success: true,
        drawing,
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error('❌ Error creating drawing:', error);

      return new Response(JSON.stringify({
        error: "Failed to create drawing",
        message: error instanceof Error ? error.message : "Unknown error"
      }), {
        status: error instanceof Error && error.message.includes("Unauthorized") ? 401 : 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
];