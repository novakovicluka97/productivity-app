'use client'

import { useAuth } from './useAuth'
import type { AuthUser } from '@/types/auth'

/**
 * Hook to access the current authenticated user
 *
 * Returns the current user object or null if not authenticated
 *
 * @example
 * ```tsx
 * function UserProfile() {
 *   const user = useUser()
 *
 *   if (!user) {
 *     return <div>Please log in</div>
 *   }
 *
 *   return (
 *     <div>
 *       <h1>Welcome, {user.email}</h1>
 *       <p>User ID: {user.id}</p>
 *     </div>
 *   )
 * }
 * ```
 */
export function useUser(): AuthUser | null {
  const { user } = useAuth()
  return user
}

/**
 * Hook to check if user is authenticated
 *
 * Returns true if user is logged in, false otherwise
 *
 * @example
 * ```tsx
 * function ProtectedContent() {
 *   const isAuthenticated = useIsAuthenticated()
 *
 *   if (!isAuthenticated) {
 *     return <div>Access denied</div>
 *   }
 *
 *   return <div>Protected content here</div>
 * }
 * ```
 */
export function useIsAuthenticated(): boolean {
  const user = useUser()
  return user !== null
}
