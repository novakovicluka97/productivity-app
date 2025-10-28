'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const missingConfigMessage =
  'Supabase environment variables are not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'

class SupabaseConfigurationError extends Error {
  constructor() {
    super(missingConfigMessage)
    this.name = 'SupabaseConfigurationError'
  }
}

let browserClient: SupabaseClient<Database> | null = null

function resolveSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new SupabaseConfigurationError()
  }

  return { supabaseUrl, supabaseAnonKey }
}

/**
 * Lazily instantiate a browser Supabase client.
 */
export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (browserClient) {
    return browserClient
  }

  const { supabaseUrl, supabaseAnonKey } = resolveSupabaseConfig()
  browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  return browserClient
}

/**
 * Attempt to create a Supabase client but return null when configuration is missing.
 *
 * This prevents the application from crashing during local development when
 * environment variables are not provided, while still surfacing a helpful
 * warning.
 */
export function tryGetSupabaseBrowserClient(): SupabaseClient<Database> | null {
  try {
    return getSupabaseBrowserClient()
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(missingConfigMessage)
      }
      return null
    }

    throw error
  }
}

export { SupabaseConfigurationError }
