'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type {
  AuthContextType,
  AuthUser,
  AuthSession,
  SignUpData,
  SignInData,
  ResetPasswordData,
  UpdatePasswordData,
} from '@/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) throw error

        setSession(session)
        setUser(session?.user ?? null)
      } catch (err) {
        console.error('Error initializing auth:', err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // Refresh the router to update Server Components
        router.refresh()
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const signUp = async ({ email, password }: SignUpData) => {
    try {
      setError(null)
      setLoading(true)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      // Note: User won't be logged in until they confirm their email
      // Show a message to check email for confirmation link
    } catch (err) {
      console.error('Error signing up:', err)
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signIn = async ({ email, password }: SignInData) => {
    try {
      setError(null)
      setLoading(true)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Session will be set by onAuthStateChange listener
      router.push('/app')
    } catch (err) {
      console.error('Error signing in:', err)
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      setLoading(true)

      const { error } = await supabase.auth.signOut()

      if (error) throw error

      // Session will be cleared by onAuthStateChange listener
      router.push('/auth/login')
    } catch (err) {
      console.error('Error signing out:', err)
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async ({ email }: ResetPasswordData) => {
    try {
      setError(null)
      setLoading(true)

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error
    } catch (err) {
      console.error('Error resetting password:', err)
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async ({ password }: UpdatePasswordData) => {
    try {
      setError(null)
      setLoading(true)

      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) throw error

      router.push('/app')
    } catch (err) {
      console.error('Error updating password:', err)
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setError(null)
      setLoading(true)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (err) {
      console.error('Error signing in with Google:', err)
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signInWithGithub = async () => {
    try {
      setError(null)
      setLoading(true)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (err) {
      console.error('Error signing in with GitHub:', err)
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    signInWithGoogle,
    signInWithGithub,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
