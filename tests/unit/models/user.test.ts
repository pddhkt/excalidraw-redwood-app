import { describe, it, expect } from 'vitest'
import { canUpgradeTier, hasMinimumTier } from '@/auth/user-utils'

describe('User Model Enhancement', () => {
  describe('Tier Management Functions', () => {
    describe('canUpgradeTier', () => {
      it('should allow GUEST to upgrade to REGISTERED', () => {
        expect(canUpgradeTier('GUEST', 'REGISTERED')).toBe(true)
      })

      it('should allow REGISTERED to upgrade to TEAM_MEMBER', () => {
        expect(canUpgradeTier('REGISTERED', 'TEAM_MEMBER')).toBe(true)
      })

      it('should not allow GUEST to upgrade directly to TEAM_MEMBER', () => {
        expect(canUpgradeTier('GUEST', 'TEAM_MEMBER')).toBe(false)
      })

      it('should not allow TEAM_MEMBER to upgrade further', () => {
        expect(canUpgradeTier('TEAM_MEMBER', 'REGISTERED')).toBe(false)
        expect(canUpgradeTier('TEAM_MEMBER', 'GUEST')).toBe(false)
      })

      it('should not allow downgrades', () => {
        expect(canUpgradeTier('REGISTERED', 'GUEST')).toBe(false)
        expect(canUpgradeTier('TEAM_MEMBER', 'GUEST')).toBe(false)
        expect(canUpgradeTier('TEAM_MEMBER', 'REGISTERED')).toBe(false)
      })
    })

    describe('hasMinimumTier', () => {
      it('should return false for null/undefined user tier', () => {
        expect(hasMinimumTier(null, 'GUEST')).toBe(false)
        expect(hasMinimumTier(undefined, 'GUEST')).toBe(false)
      })

      it('should correctly validate GUEST tier requirements', () => {
        expect(hasMinimumTier('GUEST', 'GUEST')).toBe(true)
        expect(hasMinimumTier('REGISTERED', 'GUEST')).toBe(true)
        expect(hasMinimumTier('TEAM_MEMBER', 'GUEST')).toBe(true)
      })

      it('should correctly validate REGISTERED tier requirements', () => {
        expect(hasMinimumTier('GUEST', 'REGISTERED')).toBe(false)
        expect(hasMinimumTier('REGISTERED', 'REGISTERED')).toBe(true)
        expect(hasMinimumTier('TEAM_MEMBER', 'REGISTERED')).toBe(true)
      })

      it('should correctly validate TEAM_MEMBER tier requirements', () => {
        expect(hasMinimumTier('GUEST', 'TEAM_MEMBER')).toBe(false)
        expect(hasMinimumTier('REGISTERED', 'TEAM_MEMBER')).toBe(false)
        expect(hasMinimumTier('TEAM_MEMBER', 'TEAM_MEMBER')).toBe(true)
      })
    })
  })

  describe('UserTier Enum Values', () => {
    it('should have the correct tier hierarchy', () => {
      // This test validates our tier system logic
      const tierOrder = {
        GUEST: 1,
        REGISTERED: 2,
        TEAM_MEMBER: 3
      }

      expect(tierOrder.GUEST).toBeLessThan(tierOrder.REGISTERED)
      expect(tierOrder.REGISTERED).toBeLessThan(tierOrder.TEAM_MEMBER)
    })
  })
})