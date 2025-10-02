"use server";
import { sessions } from "@/session/store";
import { requestInfo } from "rwsdk/worker";
import { db } from "@/db";
import { createSessionData } from "@/auth/session-utils";

/**
 * Test helper function to create a valid session for E2E testing
 * Only available in development mode
 */
export async function createTestSession(username: string = "test-user", rememberMe: boolean = false) {
  // Only allow in development
  if (!import.meta.env.VITE_IS_DEV_SERVER) {
    throw new Error("Test helpers only available in development");
  }

  const { response } = requestInfo;

  // Create or find test user
  let user = await db.user.findUnique({
    where: { username }
  });

  if (!user) {
    user = await db.user.create({
      data: {
        username,
        tier: 'REGISTERED',
        lastActivity: new Date(),
      }
    });
  }

  // Create session data
  const sessionData = createSessionData(user.id, rememberMe);

  // Save session
  await sessions.save(response.headers, {
    ...sessionData,
    challenge: null,
  });

  return {
    success: true,
    userId: user.id,
    username: user.username,
    expiresAt: sessionData.expiresAt.toISOString(),
    createdAt: sessionData.createdAt.toISOString(),
  };
}

/**
 * Test helper to clear session
 */
export async function clearTestSession() {
  if (!import.meta.env.VITE_IS_DEV_SERVER) {
    throw new Error("Test helpers only available in development");
  }

  const { response } = requestInfo;
  await sessions.save(response.headers, {});

  return { success: true };
}