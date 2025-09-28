import { db } from '@/db'
import type { UserTier } from '@generated/prisma'

/**
 * Updates the lastActivity timestamp for a user
 */
export async function updateLastActivity(userId: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: { lastActivity: new Date() }
  })
}

/**
 * Gets the current tier for a user by ID
 */
export async function getUserTier(userId: string): Promise<UserTier | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { tier: true }
  })

  return user?.tier ?? null
}

/**
 * Validates if a user can upgrade from one tier to another
 */
export function canUpgradeTier(currentTier: UserTier, targetTier: UserTier): boolean {
  // Define valid tier upgrade paths
  const validUpgrades: Record<UserTier, UserTier[]> = {
    GUEST: ['REGISTERED'],
    REGISTERED: ['TEAM_MEMBER'],
    TEAM_MEMBER: [] // Team members cannot upgrade further in Phase 1
  }

  return validUpgrades[currentTier]?.includes(targetTier) ?? false
}

/**
 * Checks if a user meets the minimum tier requirement
 */
export function hasMinimumTier(userTier: UserTier | undefined | null, requiredTier: UserTier): boolean {
  if (!userTier) return false

  // Define tier hierarchy (higher number = higher tier)
  const tierOrder: Record<UserTier, number> = {
    GUEST: 1,
    REGISTERED: 2,
    TEAM_MEMBER: 3
  }

  return tierOrder[userTier] >= tierOrder[requiredTier]
}

/**
 * Updates a user's login timestamp
 */
export async function updateLastLogin(userId: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() }
  })
}

/**
 * Upgrades a user's tier
 */
export async function upgradeTier(userId: string, newTier: UserTier): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { tier: true }
  })

  if (!user) return false

  if (!canUpgradeTier(user.tier, newTier)) {
    return false
  }

  await db.user.update({
    where: { id: userId },
    data: { tier: newTier }
  })

  return true
}