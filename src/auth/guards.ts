import type { SessionData, Permission } from './permissions'
import { sessionHasPermission, sessionMeetsTier, getSessionTier } from './permissions'
import { getRouteRequirements } from './route-config'

// Result types for guard functions
export interface GuardResult {
  canAccess: boolean
  redirectTo?: string
  reason?: string
  message?: string
}

export interface PermissionGuardResult {
  hasPermission: boolean
  reason?: string
  message?: string
}

/**
 * Main authentication guard
 * Checks if a session can access a specific route
 */
export async function authGuard(route: string, session: SessionData): Promise<GuardResult> {
  const requirements = getRouteRequirements(route)

  // Check authentication requirement
  if (requirements.requireAuth) {
    if (!session) {
      return {
        canAccess: false,
        redirectTo: `/login?redirect=${encodeURIComponent(route)}`,
        reason: 'authentication_required',
        message: 'You must be logged in to access this page'
      }
    }

    // Check if it's a guest session
    if ('isGuest' in session && session.isGuest === true) {
      return {
        canAccess: false,
        redirectTo: `/login?redirect=${encodeURIComponent(route)}`,
        reason: 'authentication_required',
        message: 'You must be logged in to access this page'
      }
    }

    // Ensure it's a valid authenticated session
    if (!('userId' in session) || !session.userId) {
      return {
        canAccess: false,
        redirectTo: `/login?redirect=${encodeURIComponent(route)}`,
        reason: 'authentication_required',
        message: 'You must be logged in to access this page'
      }
    }
  }

  // Check minimum tier requirement
  if (requirements.minimumTier && !sessionMeetsTier(session, requirements.minimumTier)) {
    const currentTier = getSessionTier(session)

    // If guest trying to access registered+ content, redirect to login
    if (currentTier === 'GUEST' && requirements.minimumTier !== 'GUEST') {
      return {
        canAccess: false,
        redirectTo: `/login?redirect=${encodeURIComponent(route)}`,
        reason: 'authentication_required',
        message: 'You must be logged in to access this page'
      }
    }

    // If authenticated user needs higher tier, redirect to upgrade
    return {
      canAccess: false,
      redirectTo: `/upgrade?tier=${requirements.minimumTier}`,
      reason: 'insufficient_tier',
      message: `You need ${requirements.minimumTier} tier to access this page`
    }
  }

  // Check permissions if specified
  if (requirements.permissions && requirements.permissions.length > 0) {
    for (const permission of requirements.permissions) {
      if (!sessionHasPermission(session, permission)) {
        const currentTier = getSessionTier(session)

        // If guest lacks permission, redirect to login
        if (currentTier === 'GUEST') {
          return {
            canAccess: false,
            redirectTo: `/login?redirect=${encodeURIComponent(route)}`,
            reason: 'authentication_required',
            message: 'You must be logged in to access this page'
          }
        }

        // If authenticated user lacks permission, show unauthorized
        return {
          canAccess: false,
          redirectTo: '/unauthorized',
          reason: 'insufficient_permissions',
          message: 'You do not have permission to access this page'
        }
      }
    }
  }

  return {
    canAccess: true
  }
}

/**
 * Permission-specific guard
 * Checks if a session has a specific permission
 */
export async function permissionGuard(permission: Permission, session: SessionData): Promise<PermissionGuardResult> {
  if (!sessionHasPermission(session, permission)) {
    const currentTier = getSessionTier(session)

    if (currentTier === 'GUEST') {
      return {
        hasPermission: false,
        reason: 'authentication_required',
        message: 'You must be logged in to perform this action'
      }
    }

    return {
      hasPermission: false,
      reason: 'insufficient_permissions',
      message: 'You do not have permission to perform this action'
    }
  }

  return {
    hasPermission: true
  }
}

/**
 * Tier-specific guard
 * Checks if a session meets a minimum tier requirement
 */
export async function tierGuard(minimumTier: import('@generated/prisma').UserTier, session: SessionData): Promise<GuardResult> {
  if (!sessionMeetsTier(session, minimumTier)) {
    const currentTier = getSessionTier(session)

    if (currentTier === 'GUEST' && minimumTier !== 'GUEST') {
      return {
        canAccess: false,
        redirectTo: '/login',
        reason: 'authentication_required',
        message: 'You must be logged in to access this feature'
      }
    }

    return {
      canAccess: false,
      redirectTo: '/upgrade',
      reason: 'insufficient_tier',
      message: `You need ${minimumTier} tier to access this feature`
    }
  }

  return {
    canAccess: true
  }
}

/**
 * Composite guard that checks multiple conditions
 */
export interface GuardConditions {
  requireAuth?: boolean
  minimumTier?: import('@generated/prisma').UserTier
  permissions?: Permission[]
  customCheck?: (session: SessionData) => boolean
}

export async function compositeGuard(conditions: GuardConditions, session: SessionData): Promise<GuardResult> {
  // Check authentication
  if (conditions.requireAuth) {
    if (!session || ('isGuest' in session && session.isGuest === true)) {
      return {
        canAccess: false,
        redirectTo: '/login',
        reason: 'authentication_required',
        message: 'Authentication required'
      }
    }
  }

  // Check tier
  if (conditions.minimumTier) {
    const tierResult = await tierGuard(conditions.minimumTier, session)
    if (!tierResult.canAccess) {
      return tierResult
    }
  }

  // Check permissions
  if (conditions.permissions && conditions.permissions.length > 0) {
    for (const permission of conditions.permissions) {
      const permResult = await permissionGuard(permission, session)
      if (!permResult.hasPermission) {
        return {
          canAccess: false,
          redirectTo: permResult.reason === 'authentication_required' ? '/login' : '/unauthorized',
          reason: permResult.reason,
          message: permResult.message
        }
      }
    }
  }

  // Check custom condition
  if (conditions.customCheck && !conditions.customCheck(session)) {
    return {
      canAccess: false,
      redirectTo: '/unauthorized',
      reason: 'custom_check_failed',
      message: 'Access denied'
    }
  }

  return {
    canAccess: true
  }
}