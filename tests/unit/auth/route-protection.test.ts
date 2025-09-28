import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { UserTier } from '@generated/prisma'

describe('Route Protection System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Route Configuration', () => {
    describe('getRouteRequirements', () => {
      it('should return correct requirements for public routes', async () => {
        const { getRouteRequirements } = await import('@/auth/route-config')

        const homeRoute = getRouteRequirements('/')
        expect(homeRoute).toEqual({
          requireAuth: false,
          minimumTier: 'GUEST',
          permissions: ['view_public_content']
        })

        const aboutRoute = getRouteRequirements('/about')
        expect(aboutRoute).toEqual({
          requireAuth: false,
          minimumTier: 'GUEST',
          permissions: ['view_public_content']
        })
      })

      it('should return correct requirements for authenticated routes', async () => {
        const { getRouteRequirements } = await import('@/auth/route-config')

        const dashboardRoute = getRouteRequirements('/dashboard')
        expect(dashboardRoute).toEqual({
          requireAuth: true,
          minimumTier: 'REGISTERED',
          permissions: ['access_personal_library']
        })

        const drawingRoute = getRouteRequirements('/drawing/new')
        expect(drawingRoute).toEqual({
          requireAuth: true,
          minimumTier: 'REGISTERED',
          permissions: ['create_drawing']
        })
      })

      it('should return correct requirements for team routes', async () => {
        const { getRouteRequirements } = await import('@/auth/route-config')

        const teamRoute = getRouteRequirements('/team')
        expect(teamRoute).toEqual({
          requireAuth: true,
          minimumTier: 'TEAM_MEMBER',
          permissions: ['manage_team']
        })

        const teamRoomRoute = getRouteRequirements('/team/rooms')
        expect(teamRoomRoute).toEqual({
          requireAuth: true,
          minimumTier: 'TEAM_MEMBER',
          permissions: ['access_team_rooms']
        })
      })

      it('should return default requirements for unknown routes', async () => {
        const { getRouteRequirements } = await import('@/auth/route-config')

        const unknownRoute = getRouteRequirements('/unknown/route')
        expect(unknownRoute).toEqual({
          requireAuth: false,
          minimumTier: 'GUEST',
          permissions: ['view_public_content']
        })
      })
    })

    describe('isPublicRoute', () => {
      it('should identify public routes correctly', async () => {
        const { isPublicRoute } = await import('@/auth/route-config')

        expect(isPublicRoute('/')).toBe(true)
        expect(isPublicRoute('/about')).toBe(true)
        expect(isPublicRoute('/login')).toBe(true)
        expect(isPublicRoute('/register')).toBe(true)
        expect(isPublicRoute('/public/drawing/123')).toBe(true)
      })

      it('should identify protected routes correctly', async () => {
        const { isPublicRoute } = await import('@/auth/route-config')

        expect(isPublicRoute('/dashboard')).toBe(false)
        expect(isPublicRoute('/drawing/new')).toBe(false)
        expect(isPublicRoute('/team')).toBe(false)
        expect(isPublicRoute('/settings')).toBe(false)
      })
    })

    describe('getRedirectPath', () => {
      it('should return login path for unauthenticated access', async () => {
        const { getRedirectPath } = await import('@/auth/route-config')

        const result = getRedirectPath('/dashboard', null)
        expect(result).toBe('/login?redirect=/dashboard')
      })

      it('should return upgrade path for insufficient tier', async () => {
        const { getRedirectPath } = await import('@/auth/route-config')

        const session = { userId: 'user123', tier: 'REGISTERED' as UserTier }
        const result = getRedirectPath('/team', session)
        expect(result).toBe('/upgrade?tier=TEAM_MEMBER')
      })

      it('should return null for authorized access', async () => {
        const { getRedirectPath } = await import('@/auth/route-config')

        const session = { userId: 'user123', tier: 'TEAM_MEMBER' as UserTier }
        const result = getRedirectPath('/team', session)
        expect(result).toBeNull()
      })
    })
  })

  describe('Route Guards', () => {
    describe('authGuard', () => {
      it('should allow access to public routes for all users', async () => {
        const { authGuard } = await import('@/auth/guards')

        const guestResult = await authGuard('/', { sessionId: 'guest_123', isGuest: true as const, tier: 'GUEST' as UserTier })
        expect(guestResult.canAccess).toBe(true)

        const userResult = await authGuard('/', { userId: 'user123', tier: 'REGISTERED' })
        expect(userResult.canAccess).toBe(true)

        const nullResult = await authGuard('/', null)
        expect(nullResult.canAccess).toBe(true)
      })

      it('should block unauthenticated access to protected routes', async () => {
        const { authGuard } = await import('@/auth/guards')

        const guestResult = await authGuard('/dashboard', { sessionId: 'guest_123', isGuest: true as const, tier: 'GUEST' as UserTier })
        expect(guestResult.canAccess).toBe(false)
        expect(guestResult.redirectTo).toBe('/login?redirect=/dashboard')
        expect(guestResult.reason).toBe('authentication_required')

        const nullResult = await authGuard('/dashboard', null)
        expect(nullResult.canAccess).toBe(false)
        expect(nullResult.redirectTo).toBe('/login?redirect=/dashboard')
      })

      it('should block insufficient tier access', async () => {
        const { authGuard } = await import('@/auth/guards')

        const session = { userId: 'user123', tier: 'REGISTERED' as UserTier }
        const result = await authGuard('/team', session)

        expect(result.canAccess).toBe(false)
        expect(result.redirectTo).toBe('/upgrade?tier=TEAM_MEMBER')
        expect(result.reason).toBe('insufficient_tier')
      })

      it('should allow appropriate tier access', async () => {
        const { authGuard } = await import('@/auth/guards')

        const registeredSession = { userId: 'user123', tier: 'REGISTERED' as UserTier }
        const dashboardResult = await authGuard('/dashboard', registeredSession)
        expect(dashboardResult.canAccess).toBe(true)

        const teamSession = { userId: 'user456', tier: 'TEAM_MEMBER' as UserTier }
        const teamResult = await authGuard('/team', teamSession)
        expect(teamResult.canAccess).toBe(true)
      })
    })

    describe('permissionGuard', () => {
      it('should check specific permissions for routes', async () => {
        const { permissionGuard } = await import('@/auth/guards')

        const session = { userId: 'user123', tier: 'REGISTERED' as UserTier }

        const allowedResult = await permissionGuard('create_drawing', session)
        expect(allowedResult.hasPermission).toBe(true)

        const deniedResult = await permissionGuard('manage_team', session)
        expect(deniedResult.hasPermission).toBe(false)
        expect(deniedResult.reason).toBe('insufficient_permissions')
      })

      it('should handle guest permissions', async () => {
        const { permissionGuard } = await import('@/auth/guards')

        const guestSession = { sessionId: 'guest_123', isGuest: true as const, tier: 'GUEST' as UserTier }

        const publicResult = await permissionGuard('view_public_content', guestSession)
        expect(publicResult.hasPermission).toBe(true)

        const restrictedResult = await permissionGuard('create_drawing', guestSession)
        expect(restrictedResult.hasPermission).toBe(false)
      })
    })
  })

  describe('Route Access Validation', () => {
    describe('validateRouteAccess', () => {
      it('should perform comprehensive route validation', async () => {
        const { validateRouteAccess } = await import('@/auth/route-validator')

        // Test guest accessing public route
        const guestPublic = await validateRouteAccess('/', {
          sessionId: 'guest_123',
          isGuest: true,
          tier: 'GUEST'
        })
        expect(guestPublic.allowed).toBe(true)

        // Test guest accessing protected route
        const guestProtected = await validateRouteAccess('/dashboard', {
          sessionId: 'guest_123',
          isGuest: true,
          tier: 'GUEST'
        })
        expect(guestProtected.allowed).toBe(false)
        expect(guestProtected.redirectTo).toBe('/login?redirect=/dashboard')

        // Test registered user accessing appropriate route
        const userDashboard = await validateRouteAccess('/dashboard', {
          userId: 'user123',
          tier: 'REGISTERED'
        })
        expect(userDashboard.allowed).toBe(true)

        // Test registered user accessing team route
        const userTeam = await validateRouteAccess('/team', {
          userId: 'user123',
          tier: 'REGISTERED'
        })
        expect(userTeam.allowed).toBe(false)
        expect(userTeam.redirectTo).toBe('/upgrade?tier=TEAM_MEMBER')

        // Test team member accessing team route
        const teamMemberTeam = await validateRouteAccess('/team', {
          userId: 'user456',
          tier: 'TEAM_MEMBER'
        })
        expect(teamMemberTeam.allowed).toBe(true)
      })

      it('should handle edge cases', async () => {
        const { validateRouteAccess } = await import('@/auth/route-validator')

        // Test null session
        const nullSession = await validateRouteAccess('/dashboard', null)
        expect(nullSession.allowed).toBe(false)
        expect(nullSession.redirectTo).toBe('/login?redirect=/dashboard')

        // Test malformed session
        const malformedSession = await validateRouteAccess('/dashboard', {} as any)
        expect(malformedSession.allowed).toBe(false)

        // Test unknown route
        const unknownRoute = await validateRouteAccess('/unknown', {
          userId: 'user123',
          tier: 'REGISTERED'
        })
        expect(unknownRoute.allowed).toBe(true) // Default to public
      })
    })
  })
})