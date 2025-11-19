'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { MissingSupabaseEnvError } from './errors'

/**
 * Creates a Supabase client for client-side (browser) use
 * This should be used in Client Components and client-side hooks
 *
 * Features:
 * - Automatic token refresh
 * - Persists session to localStorage
 * - Type-safe database operations
 */
let cachedClient: SupabaseClient<Database> | null = null

export function createClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new MissingSupabaseEnvError()
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!cachedClient) {
    cachedClient = createClient()
  }

  return cachedClient
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
