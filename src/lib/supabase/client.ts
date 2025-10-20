'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client for client-side (browser) use
 * This should be used in Client Components and client-side hooks
 *
 * Features:
 * - Automatic token refresh
 * - Persists session to localStorage
 * - Type-safe database operations
 */
export function createClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.\n' +
      'Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

/**
 * Singleton instance of the Supabase client
 * Use this in client components and hooks
 */
export const supabase: SupabaseClient<Database> = createClient()
