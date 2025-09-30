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
import { createSessionData, type SessionData } from "@/auth/session-utils";
import { upgradeGuestToRegistered, isGuestSession } from "@/auth/guest-session-utils";

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
 * Logs out a user by clearing their session
 */
export async function logout() {
  const { response } = requestInfo;
  await sessions.save(response.headers, {});
  return true;
}