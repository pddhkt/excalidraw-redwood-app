"use server";
import {
  generateRegistrationOptions,
  generateAuthenticationOptions,
  verifyRegistrationResponse,
  verifyAuthenticationResponse,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "@simplewebauthn/server";

import { sessions } from "@/session/store";
import { requestInfo } from "rwsdk/worker";
import { db } from "@/db";
import { env } from "cloudflare:workers";
import { updateLastLogin, updateLastActivity } from "@/auth/user-utils";
import { createSessionData, updateSessionActivity, isSessionExpired, type SessionData } from "@/auth/session-utils";
import { createGuestSession as createGuestSessionData, isGuestSession, validateGuestSession, upgradeGuestToRegistered, type GuestSessionData } from "@/auth/guest-session-utils";
import { sessionHasPermission, getUserPermissions, type Permission } from "@/auth/permissions";

function getWebAuthnConfig(request: Request) {
  const rpID = env.WEBAUTHN_RP_ID ?? new URL(request.url).hostname;
  const rpName = import.meta.env.VITE_IS_DEV_SERVER
    ? "Development App"
    : env.WEBAUTHN_APP_NAME;
  return {
    rpName,
    rpID,
  };
}

export async function startPasskeyRegistration(username: string) {
  const { rpName, rpID } = getWebAuthnConfig(requestInfo.request);
  const { response } = requestInfo;

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: username,
    authenticatorSelection: {
      // Require the authenticator to store the credential, enabling a username-less login experience
      residentKey: "required",
      // Prefer user verification (biometric, PIN, etc.), but allow authentication even if it's not available
      userVerification: "preferred",
    },
  });

  await sessions.save(response.headers, { challenge: options.challenge });

  return options;
}

export async function startPasskeyLogin() {
  const { rpID } = getWebAuthnConfig(requestInfo.request);
  const { response } = requestInfo;

  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "preferred",
    allowCredentials: [],
  });

  await sessions.save(response.headers, { challenge: options.challenge });

  return options;
}

export async function finishPasskeyRegistration(
  username: string,
  registration: RegistrationResponseJSON,
) {
  const { request, response } = requestInfo;
  const { origin } = new URL(request.url);

  const session = await sessions.load(request);
  const challenge = session?.challenge;

  if (!challenge) {
    return false;
  }

  const verification = await verifyRegistrationResponse({
    response: registration,
    expectedChallenge: challenge,
    expectedOrigin: origin,
    expectedRPID: env.WEBAUTHN_RP_ID || new URL(request.url).hostname,
  });

  if (!verification.verified || !verification.registrationInfo) {
    return false;
  }

  const user = await db.user.create({
    data: {
      username,
      tier: 'REGISTERED', // Explicitly set default tier
      lastActivity: new Date(),
    },
  });

  await db.credential.create({
    data: {
      userId: user.id,
      credentialId: verification.registrationInfo.credential.id,
      publicKey: verification.registrationInfo.credential.publicKey,
      counter: verification.registrationInfo.credential.counter,
    },
  });

  // Update login timestamp
  await updateLastLogin(user.id);

  // Check if there's an existing guest session to upgrade
  let sessionData: SessionData;
  if (isGuestSession(session)) {
    // Upgrade guest session to registered user session
    sessionData = upgradeGuestToRegistered(session, user.id, false);
  } else {
    // Create new session for registered user
    sessionData = createSessionData(user.id, false);
  }

  // Save the new authenticated session
  await sessions.save(response.headers, {
    ...sessionData,
    challenge: null,
  });

  return true;
}

export async function finishPasskeyLogin(login: AuthenticationResponseJSON, rememberMe: boolean = false) {
  const { request, response } = requestInfo;
  const { origin } = new URL(request.url);

  const session = await sessions.load(request);
  const challenge = session?.challenge;

  if (!challenge) {
    return false;
  }

  const credential = await db.credential.findUnique({
    where: {
      credentialId: login.id,
    },
  });

  if (!credential) {
    return false;
  }

  const verification = await verifyAuthenticationResponse({
    response: login,
    expectedChallenge: challenge,
    expectedOrigin: origin,
    expectedRPID: env.WEBAUTHN_RP_ID || new URL(request.url).hostname,
    requireUserVerification: false,
    credential: {
      id: credential.credentialId,
      publicKey: credential.publicKey,
      counter: credential.counter,
    },
  });

  if (!verification.verified) {
    return false;
  }

  await db.credential.update({
    where: {
      credentialId: login.id,
    },
    data: {
      counter: verification.authenticationInfo.newCounter,
    },
  });

  const user = await db.user.findUnique({
    where: {
      id: credential.userId,
    },
  });

  if (!user) {
    return false;
  }

  // Update login timestamp and activity
  await updateLastLogin(user.id);
  await updateLastActivity(user.id);

  // Check if there's an existing guest session to upgrade
  let sessionData: SessionData;
  if (isGuestSession(session)) {
    // Upgrade guest session to registered user session
    sessionData = upgradeGuestToRegistered(session, user.id, rememberMe);
  } else {
    // Create enhanced session data with remember me support
    sessionData = createSessionData(user.id, rememberMe);
  }

  await sessions.save(response.headers, {
    ...sessionData,
    challenge: null,
  });

  return true;
}

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
      tier: 'GUEST'
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

/**
 * Check if current session has a specific permission
 */
export async function checkPermission(permission: Permission) {
  const session = await validateSession();
  return sessionHasPermission(session, permission);
}

/**
 * Get all permissions for the current session
 */
export async function getCurrentPermissions() {
  const session = await validateSession();
  return getUserPermissions(session);
}

/**
 * Get current user's tier
 */
export async function getCurrentTier() {
  const session = await validateSession();
  if (!session) return 'GUEST';
  return session.tier || 'GUEST';
}

/**
 * Check if current user can perform an action
 */
export async function canPerformAction(action: string) {
  const session = await validateSession();

  // Define action-to-permission mappings
  const actionPermissions: Record<string, Permission> = {
    'create_drawing': 'create_drawing',
    'save_drawing': 'save_drawing',
    'share_drawing': 'share_drawing',
    'access_library': 'access_personal_library',
    'manage_team': 'manage_team',
    'access_team_rooms': 'access_team_rooms',
    'collaborate': 'collaborate_real_time'
  };

  const requiredPermission = actionPermissions[action];
  if (!requiredPermission) {
    return true; // No specific permission required
  }

  return sessionHasPermission(session, requiredPermission);
}

/**
 * Logs out a user by clearing their session
 */
export async function logout() {
  const { response } = requestInfo;
  await sessions.save(response.headers, {});
  return true;
}
