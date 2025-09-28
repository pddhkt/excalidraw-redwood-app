import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { db } from '@/db'

describe('User Model Enhancement', () => {
  beforeEach(async () => {
    // Clean up test data before each test
    await db.credential.deleteMany()
    await db.user.deleteMany()
  })

  afterEach(async () => {
    // Clean up test data after each test
    await db.credential.deleteMany()
    await db.user.deleteMany()
  })

  describe('User Creation', () => {
    it('should create user with default REGISTERED tier', async () => {
      const user = await db.user.create({
        data: {
          username: 'testuser'
        }
      })

      expect(user.tier).toBe('REGISTERED')
      expect(user.username).toBe('testuser')
      expect(user.createdAt).toBeInstanceOf(Date)
      expect(user.lastActivity).toBeInstanceOf(Date)
      expect(user.lastLoginAt).toBeNull()
    })

    it('should create user with explicit GUEST tier', async () => {
      const user = await db.user.create({
        data: {
          username: 'guestuser',
          tier: 'GUEST'
        }
      })

      expect(user.tier).toBe('GUEST')
      expect(user.username).toBe('guestuser')
    })

    it('should create user with TEAM_MEMBER tier', async () => {
      const user = await db.user.create({
        data: {
          username: 'teammember',
          tier: 'TEAM_MEMBER'
        }
      })

      expect(user.tier).toBe('TEAM_MEMBER')
      expect(user.username).toBe('teammember')
    })

    it('should set lastActivity to current time on creation', async () => {
      const beforeCreation = new Date()

      const user = await db.user.create({
        data: {
          username: 'activityuser'
        }
      })

      const afterCreation = new Date()

      expect(user.lastActivity.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime())
      expect(user.lastActivity.getTime()).toBeLessThanOrEqual(afterCreation.getTime())
    })
  })

  describe('User Updates', () => {
    it('should update lastLoginAt timestamp', async () => {
      const user = await db.user.create({
        data: {
          username: 'loginuser'
        }
      })

      expect(user.lastLoginAt).toBeNull()

      const loginTime = new Date()
      const updatedUser = await db.user.update({
        where: { id: user.id },
        data: { lastLoginAt: loginTime }
      })

      expect(updatedUser.lastLoginAt).toEqual(loginTime)
    })

    it('should update lastActivity timestamp', async () => {
      const user = await db.user.create({
        data: {
          username: 'activityuser'
        }
      })

      const originalActivity = user.lastActivity

      // Wait a small amount to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10))

      const newActivityTime = new Date()
      const updatedUser = await db.user.update({
        where: { id: user.id },
        data: { lastActivity: newActivityTime }
      })

      expect(updatedUser.lastActivity).toEqual(newActivityTime)
      expect(updatedUser.lastActivity.getTime()).toBeGreaterThan(originalActivity.getTime())
    })

    it('should update user tier', async () => {
      const user = await db.user.create({
        data: {
          username: 'upgradeuser',
          tier: 'GUEST'
        }
      })

      expect(user.tier).toBe('GUEST')

      const updatedUser = await db.user.update({
        where: { id: user.id },
        data: { tier: 'REGISTERED' }
      })

      expect(updatedUser.tier).toBe('REGISTERED')
    })
  })

  describe('User Tier Validation', () => {
    it('should reject invalid tier values', async () => {
      await expect(
        db.user.create({
          data: {
            username: 'invaliduser',
            tier: 'INVALID_TIER' as any
          }
        })
      ).rejects.toThrow()
    })
  })

  describe('User Queries', () => {
    beforeEach(async () => {
      // Create test users with different tiers
      await db.user.createMany({
        data: [
          { username: 'guest1', tier: 'GUEST' },
          { username: 'guest2', tier: 'GUEST' },
          { username: 'registered1', tier: 'REGISTERED' },
          { username: 'registered2', tier: 'REGISTERED' },
          { username: 'team1', tier: 'TEAM_MEMBER' }
        ]
      })
    })

    it('should find users by tier', async () => {
      const guestUsers = await db.user.findMany({
        where: { tier: 'GUEST' }
      })

      const registeredUsers = await db.user.findMany({
        where: { tier: 'REGISTERED' }
      })

      const teamUsers = await db.user.findMany({
        where: { tier: 'TEAM_MEMBER' }
      })

      expect(guestUsers).toHaveLength(2)
      expect(registeredUsers).toHaveLength(2)
      expect(teamUsers).toHaveLength(1)
    })

    it('should find users with recent activity', async () => {
      const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago

      const activeUsers = await db.user.findMany({
        where: {
          lastActivity: {
            gte: cutoffTime
          }
        }
      })

      // All test users should have recent activity (just created)
      expect(activeUsers.length).toBeGreaterThan(0)
    })
  })
})