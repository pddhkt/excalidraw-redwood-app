import { describe, it, expect, beforeEach, vi } from 'vitest'
import { finishPasskeyLogin, validateSession, logout } from '@/app/pages/user/functions'

// Mock the dependencies
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

vi.mock('@/db', () => ({
  db: {
    credential: {
      findUnique: vi.fn(),
      update: vi.fn()
    },
    user: {
      findUnique: vi.fn()
    }
  }
}))

vi.mock('@simplewebauthn/server', () => ({
  verifyAuthenticationResponse: vi.fn()
}))

vi.mock('@/auth/user-utils', () => ({
  updateLastLogin: vi.fn(),
  updateLastActivity: vi.fn()
}))

describe('Authentication Flow with Remember Me', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  describe('finishPasskeyLogin', () => {
    it('should handle login with remember me option', async () => {
      const { sessions } = await import('@/session/store')
      const { db } = await import('@/db')
      const { verifyAuthenticationResponse } = await import('@simplewebauthn/server')

      // Mock successful authentication
      const mockLoad = sessions.load as any
      const mockSave = sessions.save as any
      mockLoad.mockResolvedValue({ challenge: 'test-challenge' })
      mockSave.mockResolvedValue(undefined)

      const mockCredentialFind = db.credential.findUnique as any
      const mockCredentialUpdate = db.credential.update as any
      const mockUserFind = db.user.findUnique as any

      mockCredentialFind.mockResolvedValue({
        userId: 'user123',
        credentialId: 'cred123',
        publicKey: 'pubkey',
        counter: 1
      })
      mockUserFind.mockResolvedValue({
        id: 'user123',
        username: 'testuser',
        tier: 'REGISTERED'
      })
      mockCredentialUpdate.mockResolvedValue({})

      const mockVerify = verifyAuthenticationResponse as any
      mockVerify.mockResolvedValue({
        verified: true,
        authenticationInfo: { newCounter: 2 }
      })

      const mockLogin = {
        id: 'cred123',
        response: {},
        type: 'public-key'
      }

      const result = await finishPasskeyLogin(mockLogin, true)

      expect(result).toBe(true)
      expect(mockSave).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          userId: 'user123',
          rememberMe: true,
          challenge: null
        })
      )
    })

    it('should handle login without remember me option', async () => {
      const { sessions } = await import('@/session/store')
      const { db } = await import('@/db')
      const { verifyAuthenticationResponse } = await import('@simplewebauthn/server')

      // Mock successful authentication
      const mockLoad = sessions.load as any
      const mockSave = sessions.save as any
      mockLoad.mockResolvedValue({ challenge: 'test-challenge' })
      mockSave.mockResolvedValue(undefined)

      const mockCredentialFind = db.credential.findUnique as any
      const mockCredentialUpdate = db.credential.update as any
      const mockUserFind = db.user.findUnique as any

      mockCredentialFind.mockResolvedValue({
        userId: 'user123',
        credentialId: 'cred123',
        publicKey: 'pubkey',
        counter: 1
      })
      mockUserFind.mockResolvedValue({
        id: 'user123',
        username: 'testuser',
        tier: 'REGISTERED'
      })
      mockCredentialUpdate.mockResolvedValue({})

      const mockVerify = verifyAuthenticationResponse as any
      mockVerify.mockResolvedValue({
        verified: true,
        authenticationInfo: { newCounter: 2 }
      })

      const mockLogin = {
        id: 'cred123',
        response: {},
        type: 'public-key'
      }

      const result = await finishPasskeyLogin(mockLogin, false)

      expect(result).toBe(true)
      expect(mockSave).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          userId: 'user123',
          rememberMe: false,
          challenge: null
        })
      )
    })
  })

  describe('validateSession', () => {
    it('should return null for expired session', async () => {
      const { sessions } = await import('@/session/store')

      const mockLoad = sessions.load as any
      const mockSave = sessions.save as any

      const expiredDate = new Date('2024-01-01T12:00:00Z')
      mockLoad.mockResolvedValue({
        userId: 'user123',
        expiresAt: expiredDate.toISOString(),
        createdAt: new Date('2023-12-31T12:00:00Z').toISOString(),
        rememberMe: false
      })
      mockSave.mockResolvedValue(undefined)

      vi.setSystemTime(new Date('2024-01-02T12:00:00Z'))

      const result = await validateSession()

      expect(result).toBeNull()
      expect(mockSave).toHaveBeenCalledWith(expect.anything(), {})
    })

    it('should return user data for valid session', async () => {
      const { sessions } = await import('@/session/store')

      const mockLoad = sessions.load as any
      const mockSave = sessions.save as any

      const futureDate = new Date('2024-01-02T12:00:00Z')
      mockLoad.mockResolvedValue({
        userId: 'user123',
        expiresAt: futureDate.toISOString(),
        createdAt: new Date('2024-01-01T12:00:00Z').toISOString(),
        rememberMe: false,
        lastActivity: new Date('2024-01-01T12:00:00Z').toISOString()
      })
      mockSave.mockResolvedValue(undefined)

      vi.setSystemTime(new Date('2024-01-01T18:00:00Z'))

      const result = await validateSession()

      expect(result).toEqual({
        userId: 'user123',
        tier: null
      })
    })

    it('should extend session when more than half time has passed', async () => {
      const { sessions } = await import('@/session/store')

      const mockLoad = sessions.load as any
      const mockSave = sessions.save as any

      const now = new Date('2024-01-01T18:00:00Z')
      vi.setSystemTime(now)

      mockLoad.mockResolvedValue({
        userId: 'user123',
        expiresAt: new Date('2024-01-02T12:00:00Z').toISOString(),
        createdAt: new Date('2024-01-01T12:00:00Z').toISOString(),
        rememberMe: false,
        lastActivity: new Date('2024-01-01T12:00:00Z').toISOString()
      })
      mockSave.mockResolvedValue(undefined)

      await validateSession()

      expect(mockSave).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          userId: 'user123',
          expiresAt: expect.any(Date),
          createdAt: now
        })
      )
    })
  })

  describe('logout', () => {
    it('should clear session on logout', async () => {
      const { sessions } = await import('@/session/store')

      const mockSave = sessions.save as any
      mockSave.mockResolvedValue(undefined)

      const result = await logout()

      expect(result).toBe(true)
      expect(mockSave).toHaveBeenCalledWith(expect.anything(), {})
    })
  })
})