'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
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

  const isMountedRef = useRef(false)
  const handledInitialRedirectRef = useRef(false)
  const pendingRefreshRef = useRef<number | null>(null)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (typeof window !== 'undefined' && pendingRefreshRef.current !== null) {
        window.cancelAnimationFrame(pendingRefreshRef.current)
      }
    }
  }, [])

  const scheduleRefresh = useCallback(() => {
    if (!isMountedRef.current) {
      return
    }

    if (typeof window === 'undefined') {
      router.refresh()
      return
    }

    if (pendingRefreshRef.current !== null) {
      return
    }

    pendingRefreshRef.current = window.requestAnimationFrame(() => {
      pendingRefreshRef.current = null
      router.refresh()
    })
  }, [router])

  const resolveRedirectDestination = useCallback((): string => {
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

    let cancelled = false

    const initialiseSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabaseClient.auth.getSession()

        if (error) throw error
        if (!isMountedRef.current || cancelled) {
          return
        }

        setSession(session)
        setUser(session?.user ?? null)
        handledInitialRedirectRef.current = Boolean(session)
      } catch (err) {
        console.error('Error initializing auth:', err)
        if (isMountedRef.current && !cancelled) {
          setError(err as Error)
        }
      } finally {
        if (isMountedRef.current && !cancelled) {
          setLoading(false)
        }
      }
    }

    initialiseSession()

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, nextSession) => {
      if (!isMountedRef.current) {
        return
      }

      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setLoading(false)

      if (event === 'SIGNED_IN') {
        const destination = resolveRedirectDestination()
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : null
        const shouldRedirect =
          !handledInitialRedirectRef.current || (currentPath && destination !== currentPath)

        handledInitialRedirectRef.current = true

        if (shouldRedirect && destination && destination !== currentPath) {
          router.push(destination)
          scheduleRefresh()
          return
        }
      }

      if (event === 'SIGNED_OUT') {
        handledInitialRedirectRef.current = false
      }

      scheduleRefresh()
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [supabaseClient, resolveRedirectDestination, router, scheduleRefresh])

  const requireSupabaseClient = useCallback((): SupabaseClient<Database> => {
    if (supabaseClient) {
      return supabaseClient
    }

    throw configError ?? new MissingSupabaseEnvError()
  }, [supabaseClient, configError])

  const runAuthOperation = useCallback(
    async <T,>(operation: (client: SupabaseClient<Database>) => Promise<T>) => {
      if (!isMountedRef.current) {
        throw new Error('AuthProvider is unmounted')
      }

      setError(null)
      setLoading(true)

      try {
        const client = requireSupabaseClient()
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
    },
    [requireSupabaseClient]
  )

  const signUp = useCallback(
    async ({ email, password }: SignUpData) => {
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
    },
    [runAuthOperation]
  )

  const signIn = useCallback(
    async ({ email, password }: SignInData) => {
      await runAuthOperation(async (client) => {
        const { error } = await client.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
      })
    },
    [runAuthOperation]
  )

  const signOut = useCallback(async () => {
    await runAuthOperation(async (client) => {
      const { error } = await client.auth.signOut()
      if (error) throw error

      if (isMountedRef.current && typeof window !== 'undefined') {
        handledInitialRedirectRef.current = false
        if (window.location.pathname !== '/app') {
          router.push('/app')
        }
      }
    })
  }, [runAuthOperation, router])

  const resetPassword = useCallback(
    async ({ email }: ResetPasswordData) => {
      await runAuthOperation(async (client) => {
        const { error } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        })

        if (error) throw error
      })
    },
    [runAuthOperation]
  )

  const updatePassword = useCallback(
    async ({ password }: UpdatePasswordData) => {
      await runAuthOperation(async (client) => {
        const { error } = await client.auth.updateUser({
          password,
        })

        if (error) throw error

        if (isMountedRef.current && typeof window !== 'undefined' && window.location.pathname !== '/app') {
          router.push('/app')
        }
      })
    },
    [runAuthOperation, router]
  )

  const signInWithGoogle = useCallback(async () => {
    await runAuthOperation(async (client) => {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    })
  }, [runAuthOperation])

  const signInWithGithub = useCallback(async () => {
    await runAuthOperation(async (client) => {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    })
  }, [runAuthOperation])

  const contextValue = useMemo<AuthContextType>(
    () => ({
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
    }),
    [
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
    ]
  )

  const showConfigurationError =
    !supabaseClient && configError instanceof MissingSupabaseEnvError

  return (
    <AuthContext.Provider value={contextValue}>
      {showConfigurationError ? (
        <div className="p-6 text-sm text-red-600">
          <p className="font-semibold">Supabase configuration is missing.</p>
          <p className="mt-2">
            Add <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your{' '}
            <code className="font-mono">.env.local</code> file and restart the development server.
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
