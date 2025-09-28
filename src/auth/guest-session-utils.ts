import { createSessionData, type SessionData } from './session-utils'

// Extended session data for guest users
export interface GuestSessionData {
  sessionId: string
  isGuest: true
  createdAt: Date
  expiresAt: Date
  lastActivity: Date
  challenge?: string | null
  userId?: null // Guests don't have userIds
}

// Guest session duration: 2 hours
const GUEST_SESSION_DURATION = 2 * 60 * 60 * 1000 // 2 hours in milliseconds

/**
 * Generates a unique guest session ID
 */
function generateGuestSessionId(): string {
  // Generate a random 32-character hex string
  const randomBytes = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join('')

  return `guest_${randomBytes}`
}

/**
 * Creates a new guest session
 */
export function createGuestSession(): GuestSessionData {
  const now = new Date()
  return {
    sessionId: generateGuestSessionId(),
    isGuest: true,
    createdAt: now,
    expiresAt: new Date(now.getTime() + GUEST_SESSION_DURATION),
    lastActivity: now,
    userId: null,
    challenge: null
  }
}

/**
 * Type guard to check if session data is a guest session
 */
export function isGuestSession(sessionData: any): sessionData is GuestSessionData {
  return (
    sessionData &&
    typeof sessionData.sessionId === 'string' &&
    sessionData.isGuest === true &&
    (sessionData.createdAt instanceof Date || typeof sessionData.createdAt === 'string') &&
    (sessionData.expiresAt instanceof Date || typeof sessionData.expiresAt === 'string') &&
    (sessionData.lastActivity instanceof Date || typeof sessionData.lastActivity === 'string')
  )
}

/**
 * Validates and potentially extends a guest session
 * Returns updated session data if valid, null if expired
 */
export function validateGuestSession(guestSession: any): GuestSessionData | null {
  const now = new Date()

  // Normalize dates (handle both Date objects and string dates)
  const createdAt = guestSession.createdAt instanceof Date ? guestSession.createdAt : new Date(guestSession.createdAt)
  const expiresAt = guestSession.expiresAt instanceof Date ? guestSession.expiresAt : new Date(guestSession.expiresAt)
  const lastActivity = guestSession.lastActivity instanceof Date ? guestSession.lastActivity : new Date(guestSession.lastActivity)

  // Check if session has expired
  if (now >= expiresAt) {
    return null
  }

  // Update last activity
  const updatedSession: GuestSessionData = {
    sessionId: guestSession.sessionId,
    isGuest: true,
    createdAt,
    expiresAt,
    lastActivity: now,
    userId: null,
    challenge: guestSession.challenge || null
  }

  // Check if session should be extended (more than half time has passed)
  const sessionDuration = expiresAt.getTime() - createdAt.getTime()
  const halfDuration = sessionDuration / 2
  const timeElapsed = now.getTime() - createdAt.getTime()

  if (timeElapsed > halfDuration) {
    // Extend session by creating new expiry from current time
    updatedSession.expiresAt = new Date(now.getTime() + GUEST_SESSION_DURATION)
    updatedSession.createdAt = now
  }

  return updatedSession
}

/**
 * Upgrades a guest session to a registered user session
 */
export function upgradeGuestToRegistered(
  guestSession: GuestSessionData,
  userId: string,
  rememberMe: boolean
): SessionData {
  // Create a new registered user session
  return createSessionData(userId, rememberMe)
}

/**
 * Checks if a guest session exists and is valid
 */
export function hasValidGuestSession(sessionData: any): boolean {
  if (!isGuestSession(sessionData)) {
    return false
  }

  return validateGuestSession(sessionData) !== null
}