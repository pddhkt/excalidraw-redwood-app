import { route } from "rwsdk/router";
import TestHelper from "./TestHelper";
import { SessionMonitor } from "./SessionMonitor";
import { sessions } from "@/session/store";
import { db } from "@/db";
import { createSessionData } from "@/auth/session-utils";

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
];