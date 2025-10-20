'use client'

import { useAuth as useAuthContext } from '@/contexts/AuthContext'

/**
 * Hook to access authentication state and methods
 *
 * Returns:
 * - user: Current authenticated user (null if not logged in)
 * - session: Current session
 * - loading: Authentication loading state
 * - error: Authentication error if any
 * - signUp: Function to create new account
 * - signIn: Function to log in
 * - signOut: Function to log out
 * - resetPassword: Function to request password reset
 * - updatePassword: Function to update password
 * - signInWithGoogle: Function to sign in with Google OAuth
 * - signInWithGithub: Function to sign in with GitHub OAuth
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, signIn, signOut } = useAuth()
 *
 *   if (!user) {
 *     return <button onClick={() => signIn({ email, password })}>Log in</button>
 *   }
 *
 *   return <button onClick={signOut}>Log out</button>
 * }
 * ```
 */
export function useAuth() {
  return useAuthContext()
}
