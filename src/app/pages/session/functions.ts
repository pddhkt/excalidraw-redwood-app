"use server";
import { sessions } from "@/session/store";
import { requestInfo } from "rwsdk/worker";
import { db } from "@/db";
import { updateLastActivity } from "@/auth/user-utils";
import { isSessionExpired, updateSessionActivity, type SessionData } from "@/auth/session-utils";
import { createGuestSession as createGuestSessionData, isGuestSession, validateGuestSession, type GuestSessionData } from "@/auth/guest-session-utils";

/**
 * Creates a new guest session for unauthenticated users
 */
export async function createGuestSession(): Promise<GuestSessionData> {
  const { response } = requestInfo;

  const guestSessionData = createGuestSessionData();

  // Save in a format compatible with the session store
  await sessions.save(response.headers, {
    userId: null,
    challenge: null,
    ...guestSessionData
  });

  return guestSessionData;
}

/**
 * Validates and refreshes an existing session
 */
export async function validateSession() {
  const { request, response } = requestInfo;
  const session = await sessions.load(request);

  if (!session) {
    return null;
  }

  // Handle guest sessions
  if (isGuestSession(session)) {
    const validatedGuestSession = validateGuestSession(session);

    if (!validatedGuestSession) {
      // Guest session expired, clear it
      await sessions.save(response.headers, {});
      return null;
    }

    // Save updated guest session
    await sessions.save(response.headers, {
      userId: null,
      challenge: session.challenge || null,
      ...validatedGuestSession
    });

    return {
      sessionId: validatedGuestSession.sessionId,
      isGuest: true,
      tier: 'GUEST' as const
    };
  }

  // Handle authenticated user sessions
  if (!session.userId) {
    return null;
  }

  // Type guard for extended session data
  const hasExtendedData = (s: any): s is SessionData => {
    return s && typeof s.expiresAt === 'string' && typeof s.rememberMe === 'boolean';
  };

  // Check if session has expired
  if (hasExtendedData(session) && isSessionExpired(new Date(session.expiresAt))) {
    await sessions.save(response.headers, {});
    return null;
  }

  // Update session activity and extend if needed
  if (hasExtendedData(session)) {
    const sessionData: SessionData = {
      userId: session.userId,
      createdAt: new Date(session.createdAt),
      expiresAt: new Date(session.expiresAt),
      rememberMe: session.rememberMe,
      lastActivity: new Date(session.lastActivity || session.createdAt),
      challenge: session.challenge
    };

    const updatedSession = updateSessionActivity(sessionData);

    // Update user's last activity in database
    await updateLastActivity(session.userId);

    // Fetch user tier from database
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { tier: true }
    });

    // Save updated session
    await sessions.save(response.headers, {
      ...updatedSession,
      challenge: session.challenge,
    });

    return {
      userId: session.userId,
      tier: user?.tier || 'REGISTERED', // Default to REGISTERED if not found
    };
  }

  // Fetch user tier from database for fallback case
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { tier: true }
  });

  return {
    userId: session.userId,
    tier: user?.tier || 'REGISTERED',
  };
}