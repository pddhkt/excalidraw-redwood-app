import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the dependencies first
vi.mock('@/session/store', () => ({
  sessions: {
    load: vi.fn(),
    save: vi.fn()
  }
}))

vi.mock('rwsdk/worker', () => ({
  requestInfo: {
    request: new Request('https://example.com'),
    response: {
      headers: new Headers()
    }
  }
}))

vi.mock('@/auth/guest-session-utils', () => ({
  createGuestSession: vi.fn(),
  isGuestSession: vi.fn(),
  validateGuestSession: vi.fn(),
  upgradeGuestToRegistered: vi.fn()
}))

describe('Guest Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  describe('createGuestSession function', () => {
    it('should create and save a guest session', async () => {
      const { createGuestSession } = await import('@/auth/guest-session-utils')

      vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))

      // Test the utility function directly
      const result = createGuestSession()

      expect(result).toEqual({
        sessionId: expect.any(String),
        isGuest: true,
        createdAt: new Date('2024-01-01T12:00:00Z'),
        expiresAt: new Date('2024-01-01T14:00:00Z'),
        lastActivity: new Date('2024-01-01T12:00:00Z'),
        userId: null,
        challenge: null
      })
      expect(result.sessionId).toMatch(/^guest_[a-f0-9]{32}$/)
    })
  })

  describe('validateSession with guest support', () => {
    it('should validate and return guest session data', async () => {
      const { isGuestSession, validateGuestSession } = await import('@/auth/guest-session-utils')

      const mockGuestSession = {
        sessionId: 'guest_abc123',
        isGuest: true,
        createdAt: new Date('2024-01-01T12:00:00Z'),
        expiresAt: new Date('2024-01-01T14:00:00Z'),
        lastActivity: new Date('2024-01-01T12:00:00Z'),
        userId: null,
        challenge: null
      }

      vi.setSystemTime(new Date('2024-01-01T12:30:00Z'))

      const isGuest = isGuestSession(mockGuestSession)
      expect(isGuest).toBe(true)

      const validatedSession = validateGuestSession(mockGuestSession)
      expect(validatedSession).not.toBeNull()
      expect(validatedSession?.sessionId).toBe('guest_abc123')
      expect(validatedSession?.lastActivity).toEqual(new Date('2024-01-01T12:30:00Z'))
    })

    it('should return null for expired guest session', async () => {
      const { validateGuestSession } = await import('@/auth/guest-session-utils')

      const expiredGuestSession = {
        sessionId: 'guest_abc123',
        isGuest: true,
        createdAt: new Date('2024-01-01T12:00:00Z'),
        expiresAt: new Date('2024-01-01T14:00:00Z'),
        lastActivity: new Date('2024-01-01T12:00:00Z'),
        userId: null,
        challenge: null
      }

      // Set time to after expiry
      vi.setSystemTime(new Date('2024-01-01T15:00:00Z'))

      const result = validateGuestSession(expiredGuestSession)
      expect(result).toBeNull()
    })

    it('should distinguish between guest and regular sessions', async () => {
      const { isGuestSession } = await import('@/auth/guest-session-utils')

      const guestSession = {
        sessionId: 'guest_abc123',
        isGuest: true,
        createdAt: new Date('2024-01-01T12:00:00Z'),
        expiresAt: new Date('2024-01-01T14:00:00Z'),
        lastActivity: new Date('2024-01-01T12:00:00Z'),
        userId: null,
        challenge: null
      }

      const regularSession = {
        userId: 'user123',
        createdAt: new Date('2024-01-01T12:30:00Z'),
        expiresAt: new Date('2024-01-02T12:30:00Z'),
        rememberMe: false,
        lastActivity: new Date('2024-01-01T12:30:00Z')
      }

      expect(isGuestSession(guestSession)).toBe(true)
      expect(isGuestSession(regularSession)).toBe(false)
    })
  })

  describe('Guest session upgrade during registration/login', () => {
    it('should upgrade guest session to registered user session', async () => {
      const { upgradeGuestToRegistered } = await import('@/auth/guest-session-utils')

      const existingGuestSession = {
        sessionId: 'guest_abc123',
        isGuest: true,
        createdAt: new Date('2024-01-01T12:00:00Z'),
        expiresAt: new Date('2024-01-01T14:00:00Z'),
        lastActivity: new Date('2024-01-01T12:00:00Z'),
        userId: null,
        challenge: null
      }

      vi.setSystemTime(new Date('2024-01-01T12:30:00Z'))

      const upgradedSession = upgradeGuestToRegistered(existingGuestSession, 'user123', false)

      expect(upgradedSession).toEqual({
        userId: 'user123',
        createdAt: new Date('2024-01-01T12:30:00Z'),
        expiresAt: new Date('2024-01-02T12:30:00Z'), // 24 hours for regular session
        rememberMe: false,
        lastActivity: new Date('2024-01-01T12:30:00Z')
      })
    })

    it('should upgrade guest session with remember me option', async () => {
      const { upgradeGuestToRegistered } = await import('@/auth/guest-session-utils')

      const existingGuestSession = {
        sessionId: 'guest_abc123',
        isGuest: true,
        createdAt: new Date('2024-01-01T12:00:00Z'),
        expiresAt: new Date('2024-01-01T14:00:00Z'),
        lastActivity: new Date('2024-01-01T12:00:00Z'),
        userId: null,
        challenge: null
      }

      vi.setSystemTime(new Date('2024-01-01T12:30:00Z'))

      const upgradedSession = upgradeGuestToRegistered(existingGuestSession, 'user123', true)

      expect(upgradedSession).toEqual({
        userId: 'user123',
        createdAt: new Date('2024-01-01T12:30:00Z'),
        expiresAt: new Date('2024-01-31T12:30:00Z'), // 30 days for remember me
        rememberMe: true,
        lastActivity: new Date('2024-01-01T12:30:00Z')
      })
    })
  })
})