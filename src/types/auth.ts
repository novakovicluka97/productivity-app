import type { User, Session } from '@supabase/supabase-js'

/**
 * Authentication-related type definitions
 */

export interface AuthUser extends User {
  // Add any custom user properties here
}

export interface AuthSession extends Session {
  // Add any custom session properties here
}

export interface AuthState {
  user: AuthUser | null
  session: AuthSession | null
  loading: boolean
  error: Error | null
}

export interface SignUpData {
  email: string
  password: string
}

export interface SignInData {
  email: string
  password: string
}

export interface ResetPasswordData {
  email: string
}

export interface UpdatePasswordData {
  password: string
}

export interface AuthContextType {
  user: AuthUser | null
  session: AuthSession | null
  loading: boolean
  error: Error | null
  signUp: (data: SignUpData) => Promise<void>
  signIn: (data: SignInData) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (data: ResetPasswordData) => Promise<void>
  updatePassword: (data: UpdatePasswordData) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
}
