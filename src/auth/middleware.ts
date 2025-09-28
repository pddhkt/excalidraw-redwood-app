import type { UserTier } from '@generated/prisma'
import type { Permission, SessionData } from './permissions'
import { sessionHasPermission, sessionMeetsTier, getSessionTier } from './permissions'

// Result types for middleware functions
export interface AuthResult {
  allowed: boolean
  redirectTo?: string
  message?: string
  reason?: string
}

export interface PermissionResult {
  hasPermission: boolean
  reason?: string
}

/**
 * Require authentication middleware
 * Checks if user is authenticated (not a guest)
 */
export function requireAuth(session: SessionData): AuthResult {
  if (!session) {
    return {
      allowed: false,
      redirectTo: '/login',
      message: 'Authentication required',
      reason: 'no_session'
    }
  }

  // Check if it's a guest session
  if ('isGuest' in session && session.isGuest) {
    return {
      allowed: false,
      redirectTo: '/login',
      message: 'Authentication required',
      reason: 'guest_session'
    }
  }

  // Check if it's an authenticated session
  if ('userId' in session && session.userId) {
    return {
      allowed: true
    }
  }

  // Fallback: not authenticated
  return {
    allowed: false,
    redirectTo: '/login',
    message: 'Authentication required',
    reason: 'invalid_session'
  }
}

/**
 * Require minimum tier middleware
 * Returns a function that checks if session meets tier requirement
 */
export function requireTier(minimumTier: UserTier) {
  return (session: SessionData): AuthResult => {
    // First check if authentication is required (for REGISTERED+ tiers)
    if (minimumTier !== 'GUEST') {
      const authResult = requireAuth(session)
      if (!authResult.allowed) {
        return authResult
      }
    }

    // Check tier requirement
    if (!sessionMeetsTier(session, minimumTier)) {
      const currentTier = getSessionTier(session)

      // If guest trying to access registered content, redirect to login
      if (currentTier === 'GUEST' && minimumTier !== 'GUEST') {
        return {
          allowed: false,
          redirectTo: '/login',
          message: 'Authentication required',
          reason: 'authentication_required'
        }
      }

      // If authenticated user needs higher tier, redirect to upgrade
      return {
        allowed: false,
        redirectTo: '/upgrade',
        message: 'Higher tier required',
        reason: 'insufficient_tier'
      }
    }

    return {
      allowed: true
    }
  }
}

/**
 * Require specific permission middleware
 * Returns a function that checks if session has required permission
 */
export function requirePermission(permission: Permission) {
  return (session: SessionData): AuthResult => {
    if (!sessionHasPermission(session, permission)) {
      const sessionTier = getSessionTier(session)

      // If guest lacks permission for non-public content, redirect to login
      if (sessionTier === 'GUEST' && !permission.startsWith('view_public')) {
        return {
          allowed: false,
          redirectTo: '/login',
          message: 'Authentication required',
          reason: 'authentication_required'
        }
      }

      // If authenticated user lacks permission, show unauthorized
      return {
        allowed: false,
        redirectTo: '/unauthorized',
        message: 'Insufficient permissions',
        reason: 'insufficient_permissions'
      }
    }

    return {
      allowed: true
    }
  }
}

/**
 * Combined middleware that checks multiple requirements
 */
export interface RouteRequirements {
  requireAuth?: boolean
  minimumTier?: UserTier
  permissions?: Permission[]
}

export function requireAccess(requirements: RouteRequirements) {
  return (session: SessionData): AuthResult => {
    // Check authentication if required
    if (requirements.requireAuth) {
      const authResult = requireAuth(session)
      if (!authResult.allowed) {
        return authResult
      }
    }

    // Check minimum tier if specified
    if (requirements.minimumTier) {
      const tierResult = requireTier(requirements.minimumTier)(session)
      if (!tierResult.allowed) {
        return tierResult
      }
    }

    // Check permissions if specified
    if (requirements.permissions && requirements.permissions.length > 0) {
      for (const permission of requirements.permissions) {
        const permissionResult = requirePermission(permission)(session)
        if (!permissionResult.allowed) {
          return permissionResult
        }
      }
    }

    return {
      allowed: true
    }
  }
}

/**
 * Utility function to check if session is authenticated
 */
export function isAuthenticated(session: SessionData): boolean {
  const result = requireAuth(session)
  return result.allowed
}

/**
 * Utility function to check if session is guest
 */
export function isGuest(session: SessionData): boolean {
  if (!session) return true
  return 'isGuest' in session && session.isGuest
}

/**
 * Get appropriate redirect URL based on session state and requirements
 */
export function getRedirectUrl(
  session: SessionData,
  requirements: RouteRequirements,
  currentPath: string
): string | null {
  const result = requireAccess(requirements)(session)

  if (result.allowed) {
    return null
  }

  if (result.redirectTo) {
    // Add current path as redirect parameter for login
    if (result.redirectTo === '/login') {
      return `/login?redirect=${encodeURIComponent(currentPath)}`
    }

    // Add tier requirement for upgrade page
    if (result.redirectTo === '/upgrade' && requirements.minimumTier) {
      return `/upgrade?tier=${requirements.minimumTier}`
    }

    return result.redirectTo
  }

  // Default fallback
  return '/unauthorized'
}