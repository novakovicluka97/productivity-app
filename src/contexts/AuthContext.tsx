'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
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
  const isMountedRef = useRef(true)
  const hasHandledSignInRedirectRef = useRef(false)
  const router = useRouter()

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

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
      if (isMountedRef.current) {
        setSupabaseClient(client)
      }
    } catch (err) {
      const supabaseError = err as Error
      console.error('Unable to initialize Supabase client:', supabaseError)
      if (isMountedRef.current) {
        setConfigError(supabaseError)
        setError(supabaseError)
        setLoading(false)
      }
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

        if (!isMountedRef.current) {
          return
        }

        setSession(session)
        setUser(session?.user ?? null)
        if (session) {
          hasHandledSignInRedirectRef.current = true
        }
      } catch (err) {
        console.error('Error initializing auth:', err)
        if (isMountedRef.current) {
          setError(err as Error)
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (!isMountedRef.current) {
        return
      }

      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      if (event === 'SIGNED_IN') {
        const destination = resolveRedirectDestination()
        const shouldRedirect =
          !hasHandledSignInRedirectRef.current || destination !== '/app'

        if (shouldRedirect) {
          router.push(destination)
        }

        hasHandledSignInRedirectRef.current = true
      }

      if (event === 'SIGNED_OUT') {
        hasHandledSignInRedirectRef.current = false
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

  const runAuthOperation = async <T,>(
    operation: (client: SupabaseClient<Database>) => Promise<T>
  ) => {
    if (!isMountedRef.current) {
      throw new Error('AuthProvider is unmounted')
    }

    setError(null)
    setLoading(true)

    try {
      const client = ensureSupabaseClient()
      return await operation(client)
    } catch (err) {
      console.error('Auth operation failed:', err)
      if (isMountedRef.current) {
        setError(err as Error)
      }
      throw err
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }

  const signUp = async ({ email, password }: SignUpData) => {
    await runAuthOperation(async (client) => {
      const { error } = await client.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    })
  }

  const signIn = async ({ email, password }: SignInData) => {
    await runAuthOperation(async (client) => {
      const { error } = await client.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
    })
  }

  const signOut = async () => {
    await runAuthOperation(async (client) => {
      const { error } = await client.auth.signOut()

      if (error) throw error

      if (isMountedRef.current) {
        hasHandledSignInRedirectRef.current = false
        router.push('/app')
      }
    })
  }

  const resetPassword = async ({ email }: ResetPasswordData) => {
    await runAuthOperation(async (client) => {
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error
    })
  }

  const updatePassword = async ({ password }: UpdatePasswordData) => {
    await runAuthOperation(async (client) => {
      const { error } = await client.auth.updateUser({
        password,
      })

      if (error) throw error

      if (isMountedRef.current) {
        router.push('/app')
      }
    })
  }

  const signInWithGoogle = async () => {
    await runAuthOperation(async (client) => {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    })
  }

  const signInWithGithub = async () => {
    await runAuthOperation(async (client) => {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    })
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
