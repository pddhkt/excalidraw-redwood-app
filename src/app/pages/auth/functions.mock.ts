// Mock auth functions for Storybook
// These mocks simulate the server functions without making real API calls

import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "@simplewebauthn/types";

export async function startPasskeyRegistration(
  username: string
): Promise<PublicKeyCredentialCreationOptionsJSON> {
  console.log('[Mock] startPasskeyRegistration called with username:', username);

  // Return a mock challenge
  return {
    challenge: "mock-challenge-" + Date.now(),
    rp: {
      name: "Excalidraw App",
      id: "localhost",
    },
    user: {
      id: "mock-user-id",
      name: username,
      displayName: username,
    },
    pubKeyCredParams: [
      { alg: -7, type: "public-key" },
      { alg: -257, type: "public-key" },
    ],
    timeout: 60000,
    attestation: "none",
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
  };
}

export async function finishPasskeyRegistration(
  username: string,
  registration: RegistrationResponseJSON
): Promise<boolean> {
  console.log('[Mock] finishPasskeyRegistration called for username:', username);
  console.log('[Mock] Registration data:', registration);

  // Simulate successful registration
  return true;
}

export async function startPasskeyLogin(): Promise<PublicKeyCredentialRequestOptionsJSON> {
  console.log('[Mock] startPasskeyLogin called');

  // Return a mock challenge
  return {
    challenge: "mock-challenge-" + Date.now(),
    timeout: 60000,
    rpId: "localhost",
    userVerification: "preferred",
  };
}

export async function finishPasskeyLogin(
  login: AuthenticationResponseJSON,
  rememberMe: boolean
): Promise<boolean> {
  console.log('[Mock] finishPasskeyLogin called');
  console.log('[Mock] Login data:', login);
  console.log('[Mock] Remember me:', rememberMe);

  // Simulate successful login
  return true;
}

export async function logout(): Promise<void> {
  console.log('[Mock] logout called');
}
