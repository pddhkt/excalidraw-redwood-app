"use server";
import { sessionHasPermission, getUserPermissions, type Permission } from "@/auth/permissions";
import { validateSession } from "@/app/pages/session/functions";
import type { UserTier } from "@generated/prisma";

/**
 * Check if current session has a specific permission
 */
export async function checkPermission(permission: Permission) {
  const session = await validateSession();
  return sessionHasPermission(session, permission);
}

/**
 * Get all permissions for the current session
 */
export async function getCurrentPermissions() {
  const session = await validateSession();
  return getUserPermissions(session);
}

/**
 * Get current user's tier
 */
export async function getCurrentTier(): Promise<UserTier> {
  const session = await validateSession();
  if (!session) return 'GUEST';
  return session.tier || 'GUEST';
}

/**
 * Check if current user can perform an action
 */
export async function canPerformAction(action: string) {
  const session = await validateSession();

  // Define action-to-permission mappings
  const actionPermissions: Record<string, Permission> = {
    'create_drawing': 'create_drawing',
    'save_drawing': 'save_drawing',
    'share_drawing': 'share_drawing',
    'access_library': 'access_personal_library',
    'manage_team': 'manage_team',
    'access_team_rooms': 'access_team_rooms',
    'collaborate': 'collaborate_real_time'
  };

  const requiredPermission = actionPermissions[action];
  if (!requiredPermission) {
    return true; // No specific permission required
  }

  return sessionHasPermission(session, requiredPermission);
}