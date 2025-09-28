import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createGuestSession,
  isGuestSession,
  upgradeGuestToRegistered,
  validateGuestSession,
  type GuestSessionData
} from '@/auth/guest-session-utils'

describe('Guest Session Management', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  describe('createGuestSession', () => {
    it('should create a guest session with correct structure', () => {
      const now = new Date('2024-01-01T12:00:00Z')
      vi.setSystemTime(now)

      const guestSession = createGuestSession()

      expect(guestSession).toEqual({
        sessionId: expect.any(String),
        isGuest: true,
        createdAt: now,
        expiresAt: new Date('2024-01-01T14:00:00Z'), // 2 hours later
        lastActivity: now
      })
      expect(guestSession.sessionId).toMatch(/^guest_[a-f0-9]{32}$/)
    })

    it('should generate unique session IDs', () => {
      const session1 = createGuestSession()
      const session2 = createGuestSession()

      expect(session1.sessionId).not.toBe(session2.sessionId)
    })
  })

  describe('isGuestSession', () => {
    it('should return true for guest session data', () => {
      const guestSession = createGuestSession()
      expect(isGuestSession(guestSession)).toBe(true)
    })

    it('should return false for regular session data', () => {
      const regularSession = {
        userId: 'user123',
        createdAt: new Date(),
        expiresAt: new Date(),
        rememberMe: false,
        lastActivity: new Date()
      }
      expect(isGuestSession(regularSession)).toBe(false)
    })

    it('should return false for invalid data', () => {
      expect(isGuestSession(null)).toBe(false)
      expect(isGuestSession({})).toBe(false)
      expect(isGuestSession({ isGuest: false })).toBe(false)
    })
  })

  describe('validateGuestSession', () => {
    it('should return valid guest session when not expired', () => {
      const now = new Date('2024-01-01T12:00:00Z')
      vi.setSystemTime(now)

      const guestSession = createGuestSession()

      // Move time forward 1 hour (still valid)
      vi.setSystemTime(new Date('2024-01-01T13:00:00Z'))

      const result = validateGuestSession(guestSession)

      expect(result).not.toBeNull()
      expect(result?.sessionId).toBe(guestSession.sessionId)
      expect(result?.lastActivity).toEqual(new Date('2024-01-01T13:00:00Z'))
    })

    it('should return null for expired guest session', () => {
      const now = new Date('2024-01-01T12:00:00Z')
      vi.setSystemTime(now)

      const guestSession = createGuestSession()

      // Move time forward 3 hours (expired)
      vi.setSystemTime(new Date('2024-01-01T15:00:00Z'))

      const result = validateGuestSession(guestSession)

      expect(result).toBeNull()
    })

    it('should update last activity when validating', () => {
      const now = new Date('2024-01-01T12:00:00Z')
      vi.setSystemTime(now)

      const guestSession = createGuestSession()

      // Move time forward 30 minutes
      const newTime = new Date('2024-01-01T12:30:00Z')
      vi.setSystemTime(newTime)

      const result = validateGuestSession(guestSession)

      expect(result?.lastActivity).toEqual(newTime)
    })
  })

  describe('upgradeGuestToRegistered', () => {
    it('should convert guest session to registered user session', () => {
      const now = new Date('2024-01-01T12:00:00Z')
      vi.setSystemTime(now)

      const guestSession = createGuestSession()
      const userId = 'user123'
      const rememberMe = false

      const result = upgradeGuestToRegistered(guestSession, userId, rememberMe)

      expect(result).toEqual({
        userId: 'user123',
        createdAt: now,
        expiresAt: new Date('2024-01-02T12:00:00Z'), // 24 hours for regular session
        rememberMe: false,
        lastActivity: now
      })
    })

    it('should create remember me session when requested', () => {
      const now = new Date('2024-01-01T12:00:00Z')
      vi.setSystemTime(now)

      const guestSession = createGuestSession()
      const userId = 'user123'
      const rememberMe = true

      const result = upgradeGuestToRegistered(guestSession, userId, rememberMe)

      expect(result).toEqual({
        userId: 'user123',
        createdAt: now,
        expiresAt: new Date('2024-01-31T12:00:00Z'), // 30 days for remember me
        rememberMe: true,
        lastActivity: now
      })
    })
  })

  describe('Guest Session Expiry', () => {
    it('should have 2-hour expiry for guest sessions', () => {
      const now = new Date('2024-01-01T12:00:00Z')
      vi.setSystemTime(now)

      const guestSession = createGuestSession()
      const expectedExpiry = new Date('2024-01-01T14:00:00Z')

      expect(guestSession.expiresAt).toEqual(expectedExpiry)
    })
  })

  describe('Guest Session Activity Tracking', () => {
    it('should extend guest session if more than half time passed', () => {
      const now = new Date('2024-01-01T12:00:00Z')
      vi.setSystemTime(now)

      const guestSession = createGuestSession()

      // Move time forward 1.5 hours (more than half of 2 hours)
      vi.setSystemTime(new Date('2024-01-01T13:30:00Z'))

      const result = validateGuestSession(guestSession)

      // Should be extended by another 2 hours from validation time
      expect(result?.expiresAt).toEqual(new Date('2024-01-01T15:30:00Z'))
    })

    it('should not extend guest session if less than half time passed', () => {
      const now = new Date('2024-01-01T12:00:00Z')
      vi.setSystemTime(now)

      const guestSession = createGuestSession()

      // Move time forward 45 minutes (less than half of 2 hours)
      vi.setSystemTime(new Date('2024-01-01T12:45:00Z'))

      const result = validateGuestSession(guestSession)

      // Should keep original expiry time
      expect(result?.expiresAt).toEqual(new Date('2024-01-01T14:00:00Z'))
    })
  })
})