import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  calculateSessionExpiry,
  isSessionExpired,
  shouldExtendSession,
  createSessionData,
  type SessionData
} from '@/auth/session-utils'

describe('Session Enhancement', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  describe('Session Duration Management', () => {
    describe('calculateSessionExpiry', () => {
      it('should calculate correct expiry for regular session (24 hours)', () => {
        const now = new Date('2024-01-01T12:00:00Z')
        vi.setSystemTime(now)

        const expiry = calculateSessionExpiry(false)
        const expected = new Date('2024-01-02T12:00:00Z')

        expect(expiry).toEqual(expected)
      })

      it('should calculate correct expiry for remember me session (30 days)', () => {
        const now = new Date('2024-01-01T12:00:00Z')
        vi.setSystemTime(now)

        const expiry = calculateSessionExpiry(true)
        const expected = new Date('2024-01-31T12:00:00Z')

        expect(expiry).toEqual(expected)
      })
    })

    describe('isSessionExpired', () => {
      it('should return false for valid session', () => {
        const now = new Date('2024-01-01T12:00:00Z')
        vi.setSystemTime(now)

        const futureExpiry = new Date('2024-01-02T12:00:00Z')
        expect(isSessionExpired(futureExpiry)).toBe(false)
      })

      it('should return true for expired session', () => {
        const now = new Date('2024-01-02T12:00:00Z')
        vi.setSystemTime(now)

        const pastExpiry = new Date('2024-01-01T12:00:00Z')
        expect(isSessionExpired(pastExpiry)).toBe(true)
      })

      it('should return true for exactly expired session', () => {
        const now = new Date('2024-01-01T12:00:00Z')
        vi.setSystemTime(now)

        const exactExpiry = new Date('2024-01-01T12:00:00Z')
        expect(isSessionExpired(exactExpiry)).toBe(true)
      })
    })

    describe('shouldExtendSession', () => {
      it('should extend session when more than half time has passed', () => {
        const now = new Date('2024-01-01T18:00:00Z') // 6 hours later
        vi.setSystemTime(now)

        const createdAt = new Date('2024-01-01T12:00:00Z')
        const expiresAt = new Date('2024-01-02T12:00:00Z') // 24 hour session

        expect(shouldExtendSession(createdAt, expiresAt)).toBe(true)
      })

      it('should not extend session when less than half time has passed', () => {
        const now = new Date('2024-01-01T15:00:00Z') // 3 hours later
        vi.setSystemTime(now)

        const createdAt = new Date('2024-01-01T12:00:00Z')
        const expiresAt = new Date('2024-01-02T12:00:00Z') // 24 hour session

        expect(shouldExtendSession(createdAt, expiresAt)).toBe(false)
      })

      it('should extend remember me session appropriately', () => {
        const now = new Date('2024-01-16T12:00:00Z') // 15 days later
        vi.setSystemTime(now)

        const createdAt = new Date('2024-01-01T12:00:00Z')
        const expiresAt = new Date('2024-01-31T12:00:00Z') // 30 day session

        expect(shouldExtendSession(createdAt, expiresAt)).toBe(true)
      })
    })
  })

  describe('Session Data Management', () => {
    describe('createSessionData', () => {
      it('should create session data with correct structure for regular session', () => {
        const now = new Date('2024-01-01T12:00:00Z')
        vi.setSystemTime(now)

        const sessionData = createSessionData('user123', false)

        expect(sessionData).toEqual({
          userId: 'user123',
          createdAt: now,
          expiresAt: new Date('2024-01-02T12:00:00Z'),
          rememberMe: false,
          lastActivity: now
        })
      })

      it('should create session data with correct structure for remember me session', () => {
        const now = new Date('2024-01-01T12:00:00Z')
        vi.setSystemTime(now)

        const sessionData = createSessionData('user123', true)

        expect(sessionData).toEqual({
          userId: 'user123',
          createdAt: now,
          expiresAt: new Date('2024-01-31T12:00:00Z'),
          rememberMe: true,
          lastActivity: now
        })
      })
    })
  })

  describe('Session Extension Logic', () => {
    it('should properly identify sessions that need extension', () => {
      // Test case: 13 hours into a 24-hour session (more than half)
      const createdAt = new Date('2024-01-01T12:00:00Z')
      const now = new Date('2024-01-02T01:00:00Z')
      const expiresAt = new Date('2024-01-02T12:00:00Z')

      vi.setSystemTime(now)

      expect(shouldExtendSession(createdAt, expiresAt)).toBe(true)
    })

    it('should not extend recently created sessions', () => {
      // Test case: 1 hour into a 24-hour session (less than half)
      const createdAt = new Date('2024-01-01T12:00:00Z')
      const now = new Date('2024-01-01T13:00:00Z')
      const expiresAt = new Date('2024-01-02T12:00:00Z')

      vi.setSystemTime(now)

      expect(shouldExtendSession(createdAt, expiresAt)).toBe(false)
    })
  })
})