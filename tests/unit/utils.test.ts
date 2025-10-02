import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock environment variables
vi.mock('cloudflare:workers', () => ({
  env: {
    WEBAUTHN_RP_ID: 'test.example.com',
    WEBAUTHN_APP_NAME: 'Test App'
  }
}))

describe('Utility Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('URL utilities', () => {
    it('should extract hostname from URL correctly', () => {
      const testUrl = 'https://example.com:3000/path'
      const url = new URL(testUrl)

      expect(url.hostname).toBe('example.com')
      expect(url.port).toBe('3000')
      expect(url.pathname).toBe('/path')
    })

    it('should handle localhost URLs', () => {
      const testUrl = 'http://localhost:3000'
      const url = new URL(testUrl)

      expect(url.hostname).toBe('localhost')
      expect(url.port).toBe('3000')
    })
  })

  describe('Environment configuration', () => {
    it('should handle environment variables', () => {
      const mockEnv = {
        WEBAUTHN_RP_ID: 'test.example.com',
        WEBAUTHN_APP_NAME: 'Test App'
      }

      expect(mockEnv.WEBAUTHN_RP_ID).toBe('test.example.com')
      expect(mockEnv.WEBAUTHN_APP_NAME).toBe('Test App')
    })
  })
})