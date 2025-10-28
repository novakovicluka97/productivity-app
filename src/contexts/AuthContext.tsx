'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { useRouter } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase/client'
import { MissingSupabaseEnvError } from '@/lib/supabase/errors'
import type {
  AuthContextType,
  AuthUser,
  AuthSession,
  SignUpData,
  SignInData,
  ResetPasswordData,
  UpdatePasswordData,
} from '@/types/auth'
import type { Database } from '@/types/supabase'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient<Database> | null>(null)
  const [configError, setConfigError] = useState<Error | null>(null)
  const router = useRouter()

  const resolveRedirectDestination = useCallback(() => {
    if (typeof window === 'undefined') {
      return '/app'
    }

    const stored = window.sessionStorage.getItem('redirectAfterLogin')
    if (stored) {
      window.sessionStorage.removeItem('redirectAfterLogin')
      return stored
    }

    const params = new URLSearchParams(window.location.search)
    return params.get('redirectedFrom') ?? '/app'
  }, [])

  useEffect(() => {
    try {
      const client = getSupabaseClient()
      setSupabaseClient(client)
    } catch (err) {
      const supabaseError = err as Error
      console.error('Unable to initialize Supabase client:', supabaseError)
      setConfigError(supabaseError)
      setError(supabaseError)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!supabaseClient) {
      return
    }

    // Get initial session
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabaseClient.auth.getSession()

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
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      if (event === 'SIGNED_IN') {
        const destination = resolveRedirectDestination()
        router.push(destination)
      }

      // Refresh the router to update Server Components
      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabaseClient, router, resolveRedirectDestination])

  const ensureSupabaseClient = () => {
    if (!supabaseClient) {
      throw configError ?? new MissingSupabaseEnvError()
    }

    return supabaseClient
  }

  const signUp = async ({ email, password }: SignUpData) => {
    try {
      setError(null)
      setLoading(true)

      const client = ensureSupabaseClient()

      const { data, error } = await client.auth.signUp({
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

      const client = ensureSupabaseClient()

      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
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

      const client = ensureSupabaseClient()

      const { error } = await client.auth.signOut()

      if (error) throw error

      // Session will be cleared by onAuthStateChange listener
      router.push('/app')
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

      const client = ensureSupabaseClient()

      const { error } = await client.auth.resetPasswordForEmail(email, {
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

      const client = ensureSupabaseClient()

      const { error } = await client.auth.updateUser({
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

      const client = ensureSupabaseClient()

      const { error } = await client.auth.signInWithOAuth({
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

      const client = ensureSupabaseClient()

      const { error } = await client.auth.signInWithOAuth({
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

  const showConfigurationError =
    !supabaseClient && configError instanceof MissingSupabaseEnvError

  return (
    <AuthContext.Provider value={value}>
      {showConfigurationError ? (
        <div className="p-6 text-sm text-red-600">
          <p className="font-semibold">Supabase configuration is missing.</p>
          <p className="mt-2">
            Add <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your
            <code className="font-mono">.env.local</code> file and restart the development
            server.
          </p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
