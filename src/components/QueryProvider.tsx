'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * React Query Provider
 *
 * Provides QueryClient to the entire app for server state management
 */

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
