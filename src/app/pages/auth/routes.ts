import { route } from "rwsdk/router";
import { Login } from "./Login";
import { sessions } from "@/session/store";

export const authRoutes = [
  route("/login", [Login]),
  route("/logout", async function ({ request, response }) {
    await sessions.remove(request, response.headers);
    response.headers.set("Location", "/");

    return new Response(null, {
      status: 302,
      headers: response.headers,
    });
  }),
  route("/debug/session", async function ({ request }) {
    const session = await sessions.load(request);

    if (!session) {
      return new Response(JSON.stringify({ error: "No session found" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const createdAt = session.createdAt ? new Date(session.createdAt) : null;
    const expiresAt = session.expiresAt ? new Date(session.expiresAt) : null;

    let sessionDurationSeconds = null;
    let timeUntilExpirySeconds = null;
    let isExpired = false;

    if (createdAt && expiresAt) {
      sessionDurationSeconds = Math.floor((expiresAt.getTime() - createdAt.getTime()) / 1000);
      timeUntilExpirySeconds = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);
      isExpired = now >= expiresAt;
    }

    return new Response(JSON.stringify({
      userId: session.userId,
      createdAt: createdAt?.toISOString(),
      expiresAt: expiresAt?.toISOString(),
      currentTime: now.toISOString(),
      sessionDurationSeconds,
      timeUntilExpirySeconds,
      isExpired,
      rememberMe: session.rememberMe,
      expectedDuration: session.rememberMe ? "30 days" : "30 seconds (for testing)"
    }, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  }),
];