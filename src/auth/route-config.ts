import type { UserTier } from '@generated/prisma'
import type { Permission, SessionData } from './permissions'
import { getRedirectUrl, type RouteRequirements } from './middleware'

// Route configuration mapping
const ROUTE_CONFIG: Record<string, RouteRequirements> = {
  // Public routes
  '/': {
    requireAuth: false,
    minimumTier: 'GUEST',
    permissions: ['view_public_content']
  },
  '/about': {
    requireAuth: false,
    minimumTier: 'GUEST',
    permissions: ['view_public_content']
  },
  '/login': {
    requireAuth: false,
    minimumTier: 'GUEST',
    permissions: ['view_public_content']
  },
  '/register': {
    requireAuth: false,
    minimumTier: 'GUEST',
    permissions: ['view_public_content']
  },

  // Authenticated routes
  '/dashboard': {
    requireAuth: true,
    minimumTier: 'REGISTERED',
    permissions: ['access_personal_library']
  },
  '/drawing/new': {
    requireAuth: true,
    minimumTier: 'REGISTERED',
    permissions: ['create_drawing']
  },
  '/settings': {
    requireAuth: true,
    minimumTier: 'REGISTERED',
    permissions: ['access_personal_library']
  },
  '/library': {
    requireAuth: true,
    minimumTier: 'REGISTERED',
    permissions: ['access_personal_library']
  },

  // Team routes
  '/team': {
    requireAuth: true,
    minimumTier: 'TEAM_MEMBER',
    permissions: ['manage_team']
  },
  '/team/rooms': {
    requireAuth: true,
    minimumTier: 'TEAM_MEMBER',
    permissions: ['access_team_rooms']
  },
  '/team/settings': {
    requireAuth: true,
    minimumTier: 'TEAM_MEMBER',
    permissions: ['manage_team']
  }
}

// Public route patterns
const PUBLIC_ROUTE_PATTERNS = [
  '/',
  '/about',
  '/login',
  '/register',
  '/public/**'
]

// Default route requirements for unknown routes
const DEFAULT_REQUIREMENTS: RouteRequirements = {
  requireAuth: false,
  minimumTier: 'GUEST',
  permissions: ['view_public_content']
}

/**
 * Get route requirements for a specific path
 */
export function getRouteRequirements(path: string): RouteRequirements {
  // Check exact match first
  if (ROUTE_CONFIG[path]) {
    return ROUTE_CONFIG[path]
  }

  // Check pattern matches
  for (const [routePattern, requirements] of Object.entries(ROUTE_CONFIG)) {
    if (matchesPattern(path, routePattern)) {
      return requirements
    }
  }

  // Check if it's a public route pattern
  if (isPublicRoute(path)) {
    return DEFAULT_REQUIREMENTS
  }

  // For unknown routes, default to public access
  return DEFAULT_REQUIREMENTS
}

/**
 * Check if a route is public (no authentication required)
 */
export function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTE_PATTERNS.some(pattern => {
    if (pattern.endsWith('/**')) {
      const basePath = pattern.slice(0, -3)
      return path.startsWith(basePath)
    }
    return path === pattern
  })
}

/**
 * Get redirect path for a session trying to access a route
 */
export function getRedirectPath(path: string, session: SessionData): string | null {
  const requirements = getRouteRequirements(path)
  return getRedirectUrl(session, requirements, path)
}

/**
 * Check if a path matches a route pattern
 */
function matchesPattern(path: string, pattern: string): boolean {
  if (pattern.endsWith('/**')) {
    const basePath = pattern.slice(0, -3)
    return path.startsWith(basePath)
  }

  if (pattern.includes('*')) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '[^/]*') + '$')
    return regex.test(path)
  }

  return path === pattern
}

/**
 * Get all public routes
 */
export function getPublicRoutes(): string[] {
  return Object.entries(ROUTE_CONFIG)
    .filter(([_, config]) => !config.requireAuth)
    .map(([route, _]) => route)
}

/**
 * Get all protected routes
 */
export function getProtectedRoutes(): string[] {
  return Object.entries(ROUTE_CONFIG)
    .filter(([_, config]) => config.requireAuth)
    .map(([route, _]) => route)
}

/**
 * Get routes by minimum tier requirement
 */
export function getRoutesByTier(tier: UserTier): string[] {
  return Object.entries(ROUTE_CONFIG)
    .filter(([_, config]) => config.minimumTier === tier)
    .map(([route, _]) => route)
}

/**
 * Check if a route requires specific permission
 */
export function routeRequiresPermission(path: string, permission: Permission): boolean {
  const requirements = getRouteRequirements(path)
  return requirements.permissions?.includes(permission) ?? false
}

/**
 * Get human-readable description of route requirements
 */
export function getRouteDescription(path: string): string {
  const requirements = getRouteRequirements(path)

  if (!requirements.requireAuth) {
    return 'Public access'
  }

  if (requirements.minimumTier === 'TEAM_MEMBER') {
    return 'Team member access required'
  }

  if (requirements.minimumTier === 'REGISTERED') {
    return 'Account required'
  }

  return 'Access restricted'
}