export interface SessionData {
  userId: string
  createdAt: Date
  expiresAt: Date
  rememberMe: boolean
  lastActivity: Date
  challenge?: string | null
}

// Session duration constants
const REGULAR_SESSION_DURATION = 30 * 1000 // 30 seconds for testing (was: 24 * 60 * 60 * 1000)
const REMEMBER_ME_SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds

/**
 * Calculates session expiry time based on remember me preference
 */
export function calculateSessionExpiry(rememberMe: boolean): Date {
  const now = new Date()
  const duration = rememberMe ? REMEMBER_ME_SESSION_DURATION : REGULAR_SESSION_DURATION
  return new Date(now.getTime() + duration)
}

/**
 * Checks if a session has expired
 */
export function isSessionExpired(expiresAt: Date): boolean {
  return new Date() >= expiresAt
}

/**
 * Determines if a session should be extended based on activity
 * Extends when more than half the session duration has passed
 */
export function shouldExtendSession(createdAt: Date, expiresAt: Date): boolean {
  const now = new Date()
  const sessionDuration = expiresAt.getTime() - createdAt.getTime()
  const halfDuration = sessionDuration / 2
  const timeElapsed = now.getTime() - createdAt.getTime()

  return timeElapsed > halfDuration
}

/**
 * Creates a new session data object
 */
export function createSessionData(userId: string, rememberMe: boolean): SessionData {
  const now = new Date()
  return {
    userId,
    createdAt: now,
    expiresAt: calculateSessionExpiry(rememberMe),
    rememberMe,
    lastActivity: now
  }
}

/**
 * Updates the last activity timestamp and extends session if needed
 */
export function updateSessionActivity(sessionData: SessionData): SessionData {
  const now = new Date()
  const updatedSession = {
    ...sessionData,
    lastActivity: now
  }

  // Extend session if more than half the time has passed
  if (shouldExtendSession(sessionData.createdAt, sessionData.expiresAt)) {
    updatedSession.expiresAt = calculateSessionExpiry(sessionData.rememberMe)
    updatedSession.createdAt = now
  }

  return updatedSession
}

/**
 * Validates if session data is complete and valid
 */
export function isValidSessionData(data: any): data is SessionData {
  return (
    data &&
    typeof data.userId === 'string' &&
    data.createdAt instanceof Date &&
    data.expiresAt instanceof Date &&
    typeof data.rememberMe === 'boolean' &&
    data.lastActivity instanceof Date
  )
}