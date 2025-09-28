import type { UserTier } from '@generated/prisma'

// Define all possible permissions in the system
export type Permission =
  | 'view_public_content'
  | 'view_public_drawings'
  | 'create_drawing'
  | 'save_drawing'
  | 'share_drawing'
  | 'access_personal_library'
  | 'manage_team'
  | 'access_team_rooms'
  | 'collaborate_real_time'
  | 'manage_team_drawings'

// Session types for permission checking
export type SessionData = {
  userId: string
  tier: UserTier
} | {
  sessionId: string
  isGuest: true
  tier: UserTier
} | null

// Permission mappings for each tier
const TIER_PERMISSIONS: Record<UserTier, Permission[]> = {
  GUEST: [
    'view_public_content',
    'view_public_drawings'
  ],
  REGISTERED: [
    'view_public_content',
    'view_public_drawings',
    'create_drawing',
    'save_drawing',
    'share_drawing',
    'access_personal_library'
  ],
  TEAM_MEMBER: [
    'view_public_content',
    'view_public_drawings',
    'create_drawing',
    'save_drawing',
    'share_drawing',
    'access_personal_library',
    'manage_team',
    'access_team_rooms',
    'collaborate_real_time',
    'manage_team_drawings'
  ]
}

// Tier hierarchy for comparison
const TIER_HIERARCHY: Record<UserTier, number> = {
  GUEST: 0,
  REGISTERED: 1,
  TEAM_MEMBER: 2
}

/**
 * Check if a user tier has a specific permission
 */
export function hasPermission(tier: UserTier, permission: Permission): boolean {
  const tierPermissions = TIER_PERMISSIONS[tier]
  return tierPermissions.includes(permission)
}

/**
 * Check if a user meets the minimum tier requirement
 */
export function requireMinimumTier(userTier: UserTier, minimumTier: UserTier): boolean {
  return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[minimumTier]
}

/**
 * Get all permissions for a specific tier
 */
export function getPermissionsForTier(tier: UserTier): Permission[] {
  return [...TIER_PERMISSIONS[tier]]
}

/**
 * Get permissions for a session (handles both authenticated and guest sessions)
 */
export function getUserPermissions(session: SessionData): Permission[] {
  if (!session) {
    return []
  }

  if ('isGuest' in session && session.isGuest) {
    return getPermissionsForTier('GUEST')
  }

  if ('userId' in session && session.userId) {
    return getPermissionsForTier(session.tier)
  }

  return []
}

/**
 * Check if a session has a specific permission
 */
export function sessionHasPermission(session: SessionData, permission: Permission): boolean {
  const permissions = getUserPermissions(session)
  return permissions.includes(permission)
}

/**
 * Get the effective tier for a session
 */
export function getSessionTier(session: SessionData): UserTier {
  if (!session) {
    return 'GUEST'
  }

  if ('isGuest' in session && session.isGuest) {
    return 'GUEST'
  }

  if ('userId' in session && session.userId) {
    return session.tier
  }

  return 'GUEST'
}

/**
 * Check if a session meets minimum tier requirement
 */
export function sessionMeetsTier(session: SessionData, minimumTier: UserTier): boolean {
  const sessionTier = getSessionTier(session)
  return requireMinimumTier(sessionTier, minimumTier)
}

/**
 * Simple route access checker based on patterns
 */
export function canAccessRoute(route: string, session: SessionData): boolean {
  // Public routes - accessible to everyone
  if (route === '/' ||
      route.startsWith('/public') ||
      route.startsWith('/about') ||
      route.startsWith('/login') ||
      route.startsWith('/register')) {
    return true
  }

  // Team routes - require TEAM_MEMBER tier
  if (route.startsWith('/team')) {
    return sessionMeetsTier(session, 'TEAM_MEMBER')
  }

  // Protected routes - require REGISTERED tier
  if (route.startsWith('/dashboard') ||
      route.startsWith('/drawing') ||
      route.startsWith('/settings') ||
      route.startsWith('/library')) {
    return sessionMeetsTier(session, 'REGISTERED')
  }

  // Default: allow access (treat as public)
  return true
}

/**
 * Get required permissions for common actions
 */
export function getActionPermissions(action: string): Permission[] {
  const actionPermissions: Record<string, Permission[]> = {
    'view_home': ['view_public_content'],
    'create_drawing': ['create_drawing'],
    'save_drawing': ['save_drawing'],
    'share_drawing': ['share_drawing'],
    'access_library': ['access_personal_library'],
    'manage_team': ['manage_team'],
    'join_team_room': ['access_team_rooms'],
    'collaborate': ['collaborate_real_time']
  }

  return actionPermissions[action] || []
}

/**
 * Check if a session can perform a specific action
 */
export function canPerformAction(session: SessionData, action: string): boolean {
  const requiredPermissions = getActionPermissions(action)

  if (requiredPermissions.length === 0) {
    return true // No specific permissions required
  }

  return requiredPermissions.every(permission =>
    sessionHasPermission(session, permission)
  )
}