import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateSessionExpiry,
  isSessionExpired,
  shouldExtendSession,
  updateSessionActivity,
  createSessionData,
  isValidSessionData,
  type SessionData,
} from '@/auth/session-utils';

describe('Session Utils', () => {
  beforeEach(() => {
    // Reset date mocks before each test
    vi.restoreAllMocks();
  });

  describe('calculateSessionExpiry', () => {
    it('should return expiry 30 seconds from now for regular session', () => {
      const now = new Date('2025-09-30T12:00:00.000Z');
      vi.setSystemTime(now);

      const expiry = calculateSessionExpiry(false);
      const expectedExpiry = new Date('2025-09-30T12:00:30.000Z'); // 30 seconds later

      expect(expiry.getTime()).toBe(expectedExpiry.getTime());
    });

    it('should return expiry 30 days from now for remember me session', () => {
      const now = new Date('2025-09-30T12:00:00.000Z');
      vi.setSystemTime(now);

      const expiry = calculateSessionExpiry(true);
      const expectedExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      expect(expiry.getTime()).toBe(expectedExpiry.getTime());
    });
  });

  describe('isSessionExpired', () => {
    it('should return false if session has not expired', () => {
      const now = new Date('2025-09-30T12:00:00.000Z');
      vi.setSystemTime(now);

      const expiresAt = new Date('2025-09-30T12:00:30.000Z'); // 30 seconds in future

      expect(isSessionExpired(expiresAt)).toBe(false);
    });

    it('should return true if session has expired', () => {
      const now = new Date('2025-09-30T12:00:30.000Z');
      vi.setSystemTime(now);

      const expiresAt = new Date('2025-09-30T12:00:00.000Z'); // 30 seconds in past

      expect(isSessionExpired(expiresAt)).toBe(true);
    });

    it('should return true if session expires at exact current time', () => {
      const now = new Date('2025-09-30T12:00:30.000Z');
      vi.setSystemTime(now);

      const expiresAt = new Date('2025-09-30T12:00:30.000Z'); // Exact same time

      expect(isSessionExpired(expiresAt)).toBe(true);
    });
  });

  describe('shouldExtendSession', () => {
    it('should return false if less than half session duration has passed', () => {
      const now = new Date('2025-09-30T12:00:10.000Z');
      vi.setSystemTime(now);

      const createdAt = new Date('2025-09-30T12:00:00.000Z'); // Created 10s ago
      const expiresAt = new Date('2025-09-30T12:00:30.000Z'); // Expires in 20s (30s total)

      // 10s elapsed out of 30s = 33.3%, less than 50%
      expect(shouldExtendSession(createdAt, expiresAt)).toBe(false);
    });

    it('should return true if more than half session duration has passed', () => {
      const now = new Date('2025-09-30T12:00:16.000Z');
      vi.setSystemTime(now);

      const createdAt = new Date('2025-09-30T12:00:00.000Z'); // Created 16s ago
      const expiresAt = new Date('2025-09-30T12:00:30.000Z'); // Expires in 14s (30s total)

      // 16s elapsed out of 30s = 53.3%, more than 50%
      expect(shouldExtendSession(createdAt, expiresAt)).toBe(true);
    });

    it('should return false at exactly halfway point', () => {
      const now = new Date('2025-09-30T12:00:15.000Z');
      vi.setSystemTime(now);

      const createdAt = new Date('2025-09-30T12:00:00.000Z'); // Created 15s ago
      const expiresAt = new Date('2025-09-30T12:00:30.000Z'); // Expires in 15s (30s total)

      // 15s elapsed out of 30s = 50%, not more than 50%
      expect(shouldExtendSession(createdAt, expiresAt)).toBe(false);
    });
  });

  describe('createSessionData', () => {
    it('should create session with correct structure and 30s expiry', () => {
      const now = new Date('2025-09-30T12:00:00.000Z');
      vi.setSystemTime(now);

      const sessionData = createSessionData('user-123', false);

      expect(sessionData.userId).toBe('user-123');
      expect(sessionData.rememberMe).toBe(false);
      expect(sessionData.createdAt.getTime()).toBe(now.getTime());
      expect(sessionData.lastActivity.getTime()).toBe(now.getTime());
      expect(sessionData.expiresAt.getTime()).toBe(new Date('2025-09-30T12:00:30.000Z').getTime());
    });

    it('should create session with 30 day expiry when rememberMe is true', () => {
      const now = new Date('2025-09-30T12:00:00.000Z');
      vi.setSystemTime(now);

      const sessionData = createSessionData('user-123', true);

      expect(sessionData.rememberMe).toBe(true);
      const expectedExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      expect(sessionData.expiresAt.getTime()).toBe(expectedExpiry.getTime());
    });
  });

  describe('updateSessionActivity', () => {
    it('should update lastActivity without extending session if less than half duration passed', () => {
      const startTime = new Date('2025-09-30T12:00:00.000Z');
      const currentTime = new Date('2025-09-30T12:00:10.000Z'); // 10s later (33% of 30s)
      vi.setSystemTime(currentTime);

      const sessionData: SessionData = {
        userId: 'user-123',
        createdAt: startTime,
        expiresAt: new Date('2025-09-30T12:00:30.000Z'),
        rememberMe: false,
        lastActivity: startTime,
      };

      const updated = updateSessionActivity(sessionData);

      // Should update lastActivity
      expect(updated.lastActivity.getTime()).toBe(currentTime.getTime());

      // Should NOT extend session (createdAt and expiresAt unchanged)
      expect(updated.createdAt.getTime()).toBe(startTime.getTime());
      expect(updated.expiresAt.getTime()).toBe(sessionData.expiresAt.getTime());
    });

    it('should extend session when more than half duration has passed', () => {
      const startTime = new Date('2025-09-30T12:00:00.000Z');
      const currentTime = new Date('2025-09-30T12:00:16.000Z'); // 16s later (53% of 30s)
      vi.setSystemTime(currentTime);

      const sessionData: SessionData = {
        userId: 'user-123',
        createdAt: startTime,
        expiresAt: new Date('2025-09-30T12:00:30.000Z'),
        rememberMe: false,
        lastActivity: startTime,
      };

      const updated = updateSessionActivity(sessionData);

      // Should update lastActivity
      expect(updated.lastActivity.getTime()).toBe(currentTime.getTime());

      // Should extend session - new createdAt and expiresAt
      expect(updated.createdAt.getTime()).toBe(currentTime.getTime());
      expect(updated.expiresAt.getTime()).toBe(new Date('2025-09-30T12:00:46.000Z').getTime()); // 30s from currentTime
    });
  });

  describe('isValidSessionData', () => {
    it('should return true for valid session data', () => {
      const sessionData: SessionData = {
        userId: 'user-123',
        createdAt: new Date(),
        expiresAt: new Date(),
        rememberMe: false,
        lastActivity: new Date(),
      };

      expect(isValidSessionData(sessionData)).toBe(true);
    });

    it('should return false if userId is missing', () => {
      const sessionData = {
        createdAt: new Date(),
        expiresAt: new Date(),
        rememberMe: false,
        lastActivity: new Date(),
      };

      expect(isValidSessionData(sessionData)).toBe(false);
    });

    it('should return false if dates are not Date objects', () => {
      const sessionData = {
        userId: 'user-123',
        createdAt: '2025-09-30T12:00:00.000Z', // String instead of Date
        expiresAt: new Date(),
        rememberMe: false,
        lastActivity: new Date(),
      };

      expect(isValidSessionData(sessionData)).toBe(false);
    });

    it('should return false if rememberMe is not boolean', () => {
      const sessionData = {
        userId: 'user-123',
        createdAt: new Date(),
        expiresAt: new Date(),
        rememberMe: 'true', // String instead of boolean
        lastActivity: new Date(),
      };

      expect(isValidSessionData(sessionData)).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(isValidSessionData(null)).toBeFalsy();
      expect(isValidSessionData(undefined)).toBeFalsy();
    });
  });

  describe('Session timeout scenarios', () => {
    it('should still be valid after 5 seconds', () => {
      const startTime = new Date('2025-09-30T12:00:00.000Z');
      const checkTime = new Date('2025-09-30T12:00:05.000Z'); // 5s later
      vi.setSystemTime(checkTime);

      const sessionData = createSessionData('user-123', false);
      vi.setSystemTime(startTime);
      const session = createSessionData('user-123', false);
      vi.setSystemTime(checkTime);

      expect(isSessionExpired(session.expiresAt)).toBe(false);
    });

    it('should still be valid after 10 seconds', () => {
      const startTime = new Date('2025-09-30T12:00:00.000Z');
      vi.setSystemTime(startTime);
      const session = createSessionData('user-123', false);

      const checkTime = new Date('2025-09-30T12:00:10.000Z'); // 10s later
      vi.setSystemTime(checkTime);

      expect(isSessionExpired(session.expiresAt)).toBe(false);
    });

    it('should still be valid after 15 seconds (halfway point)', () => {
      const startTime = new Date('2025-09-30T12:00:00.000Z');
      vi.setSystemTime(startTime);
      const session = createSessionData('user-123', false);

      const checkTime = new Date('2025-09-30T12:00:15.000Z'); // 15s later
      vi.setSystemTime(checkTime);

      expect(isSessionExpired(session.expiresAt)).toBe(false);
    });

    it('should be expired after 31 seconds', () => {
      const startTime = new Date('2025-09-30T12:00:00.000Z');
      vi.setSystemTime(startTime);
      const session = createSessionData('user-123', false);

      const checkTime = new Date('2025-09-30T12:00:31.000Z'); // 31s later
      vi.setSystemTime(checkTime);

      expect(isSessionExpired(session.expiresAt)).toBe(true);
    });
  });
});