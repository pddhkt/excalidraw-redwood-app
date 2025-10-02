import type { SessionData } from './permissions'
import { authGuard, type GuardResult } from './guards'
import { getRouteRequirements, isPublicRoute } from './route-config'

// Result type for route validation
export interface RouteValidationResult {
  allowed: boolean
  redirectTo?: string
  reason?: string
  message?: string
  requirements?: {
    requireAuth: boolean
    minimumTier?: import('@generated/prisma').UserTier
    permissions?: string[]
  }
}

/**
 * Comprehensive route access validation
 * Validates if a session can access a specific route
 */
export async function validateRouteAccess(route: string, session: SessionData): Promise<RouteValidationResult> {
  try {
    // Get route requirements
    const requirements = getRouteRequirements(route)

    // Handle malformed session
    if (session && typeof session !== 'object') {
      return {
        allowed: false,
        redirectTo: `/login?redirect=${encodeURIComponent(route)}`,
        reason: 'invalid_session',
        message: 'Invalid session data'
      }
    }

    // Use auth guard for validation
    const guardResult = await authGuard(route, session)

    // Convert guard result to validation result
    const validationResult: RouteValidationResult = {
      allowed: guardResult.canAccess,
      redirectTo: guardResult.redirectTo,
      reason: guardResult.reason,
      message: guardResult.message,
      requirements: {
        requireAuth: requirements.requireAuth ?? false,
        minimumTier: requirements.minimumTier,
        permissions: requirements.permissions
      }
    }

    return validationResult
  } catch (error) {
    // Handle any unexpected errors
    console.error('Route validation error:', error)

    return {
      allowed: false,
      redirectTo: '/error',
      reason: 'validation_error',
      message: 'An error occurred while validating route access'
    }
  }
}

/**
 * Validate multiple routes for a session
 */
export async function validateMultipleRoutes(
  routes: string[],
  session: SessionData
): Promise<Record<string, RouteValidationResult>> {
  const results: Record<string, RouteValidationResult> = {}

  for (const route of routes) {
    results[route] = await validateRouteAccess(route, session)
  }

  return results
}

/**
 * Get accessible routes for a session
 */
export async function getAccessibleRoutes(
  routes: string[],
  session: SessionData
): Promise<string[]> {
  const accessibleRoutes: string[] = []

  for (const route of routes) {
    const result = await validateRouteAccess(route, session)
    if (result.allowed) {
      accessibleRoutes.push(route)
    }
  }

  return accessibleRoutes
}

/**
 * Get restricted routes for a session
 */
export async function getRestrictedRoutes(
  routes: string[],
  session: SessionData
): Promise<string[]> {
  const restrictedRoutes: string[] = []

  for (const route of routes) {
    const result = await validateRouteAccess(route, session)
    if (!result.allowed) {
      restrictedRoutes.push(route)
    }
  }

  return restrictedRoutes
}

/**
 * Check if a session has access to any route in a list
 */
export async function hasAccessToAnyRoute(
  routes: string[],
  session: SessionData
): Promise<boolean> {
  for (const route of routes) {
    const result = await validateRouteAccess(route, session)
    if (result.allowed) {
      return true
    }
  }

  return false
}

/**
 * Check if a session has access to all routes in a list
 */
export async function hasAccessToAllRoutes(
  routes: string[],
  session: SessionData
): Promise<boolean> {
  for (const route of routes) {
    const result = await validateRouteAccess(route, session)
    if (!result.allowed) {
      return false
    }
  }

  return true
}

/**
 * Get route validation summary for a session
 */
export interface RouteValidationSummary {
  totalRoutes: number
  accessibleRoutes: number
  restrictedRoutes: number
  publicRoutes: number
  authRequiredRoutes: number
  tierRestrictedRoutes: number
  permissionRestrictedRoutes: number
}

export async function getRouteValidationSummary(
  routes: string[],
  session: SessionData
): Promise<RouteValidationSummary> {
  const summary: RouteValidationSummary = {
    totalRoutes: routes.length,
    accessibleRoutes: 0,
    restrictedRoutes: 0,
    publicRoutes: 0,
    authRequiredRoutes: 0,
    tierRestrictedRoutes: 0,
    permissionRestrictedRoutes: 0
  }

  for (const route of routes) {
    const result = await validateRouteAccess(route, session)

    if (result.allowed) {
      summary.accessibleRoutes++
    } else {
      summary.restrictedRoutes++

      // Categorize restriction reasons
      switch (result.reason) {
        case 'authentication_required':
          summary.authRequiredRoutes++
          break
        case 'insufficient_tier':
          summary.tierRestrictedRoutes++
          break
        case 'insufficient_permissions':
          summary.permissionRestrictedRoutes++
          break
      }
    }

    // Check if route is public
    if (isPublicRoute(route)) {
      summary.publicRoutes++
    }
  }

  return summary
}

/**
 * Utility function to check if route requires upgrade
 */
export function routeRequiresUpgrade(validationResult: RouteValidationResult): boolean {
  return validationResult.reason === 'insufficient_tier' &&
         validationResult.redirectTo?.startsWith('/upgrade') === true
}

/**
 * Utility function to check if route requires login
 */
export function routeRequiresLogin(validationResult: RouteValidationResult): boolean {
  return validationResult.reason === 'authentication_required' &&
         validationResult.redirectTo?.startsWith('/login') === true
}

/**
 * Get suggested action for route access
 */
export function getSuggestedAction(validationResult: RouteValidationResult): string {
  if (validationResult.allowed) {
    return 'access_granted'
  }

  if (routeRequiresLogin(validationResult)) {
    return 'login_required'
  }

  if (routeRequiresUpgrade(validationResult)) {
    return 'upgrade_required'
  }

  if (validationResult.reason === 'insufficient_permissions') {
    return 'permission_denied'
  }

  return 'access_denied'
}