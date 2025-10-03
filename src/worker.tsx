import { defineApp, ErrorResponse } from "rwsdk/worker";
import { route, render, prefix } from "rwsdk/router";
import { Document } from "@/app/Document";
import "@/styles/globals.css";
import { Home } from "@/app/pages/Home";
import { setCommonHeaders } from "@/app/headers";
import { authRoutes } from "@/app/pages/auth/routes";
import { testRoutes } from "@/app/pages/test/routes";
import { drawingRoutes } from "@/app/pages/drawing/routes";
import { devRoutes } from "@/app/pages/dev/routes";
import { sessions, setupSessionStore } from "./session/store";
import { Session } from "./session/durableObject";
import { type User, db, setupDb } from "@/db";
import { env } from "cloudflare:workers";
import { isSessionExpired } from "@/auth/session-utils";
export { SessionDurableObject } from "./session/durableObject";

export type AppContext = {
  session: Session | null;
  user: User | null;
};

export default defineApp([
  setCommonHeaders(),
  async ({ ctx, request, response }) => {
    await setupDb(env);
    setupSessionStore(env);

    // Development session bypass: Check for dev session cookie
    const devSessionToken = env.DEV_SESSION_TOKEN;
    const devUsername = env.DEV_USERNAME;
    if (devSessionToken && devUsername) {
      const cookies = request.headers.get("Cookie") || "";
      const devSessionCookie = cookies
        .split(";")
        .find((c) => c.trim().startsWith("dev_session="));
      const devSessionValue = devSessionCookie?.split("=")[1];

      if (devSessionValue === devSessionToken) {
        // Look up dev user by username
        ctx.user = await db.user.findUnique({
          where: { username: devUsername },
        });

        if (ctx.user) {
          // Use persistent dev session for the dev user
          ctx.session = {
            userId: ctx.user.id,
            expiresAt: null, // Never expires
          } as Session;

          // Skip normal session flow
          return;
        }
      }
    }

    // Normal session flow
    try {
      ctx.session = await sessions.load(request);

      // Check if session has expired based on expiresAt field
      if (ctx.session?.expiresAt) {
        const expiresAt = new Date(ctx.session.expiresAt);
        if (isSessionExpired(expiresAt)) {
          // Session expired, remove it and redirect to login
          await sessions.remove(request, response.headers);
          response.headers.set("Location", "/login");

          return new Response(null, {
            status: 302,
            headers: response.headers,
          });
        }
      }
    } catch (error) {
      if (error instanceof ErrorResponse && error.code === 401) {
        await sessions.remove(request, response.headers);
        response.headers.set("Location", "/login");

        return new Response(null, {
          status: 302,
          headers: response.headers,
        });
      }

      throw error;
    }

    if (ctx.session?.userId) {
      ctx.user = await db.user.findUnique({
        where: {
          id: ctx.session.userId,
        },
      });
    }
  },
  render(Document, [
    route("/", [
      ({ ctx }) => {
        if (!ctx.user) {
          return new Response(null, {
            status: 302,
            headers: { Location: "/login" },
          });
        }
      },
      Home,
    ]),
    ...drawingRoutes,
    ...authRoutes,
    ...testRoutes,
    ...devRoutes,
  ]),
]);
