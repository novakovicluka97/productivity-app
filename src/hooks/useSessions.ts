/**
 * useSessions Hook
 *
 * React Query hook for fetching and managing sessions data
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  getSessionStats,
} from '@/lib/supabase/sessions'

/**
 * Query options for fetching sessions
 */
export interface SessionQueryOptions {
  startDate?: string
  endDate?: string
  type?: 'session' | 'break'
  limit?: number
  offset?: number
}

/**
 * Query key factory for sessions
 */
export const sessionKeys = {
  all: ['sessions'] as const,
  lists: () => [...sessionKeys.all, 'list'] as const,
  list: (options: SessionQueryOptions) => [...sessionKeys.lists(), options] as const,
  details: () => [...sessionKeys.all, 'detail'] as const,
  detail: (id: string) => [...sessionKeys.details(), id] as const,
  statistics: () => [...sessionKeys.all, 'statistics'] as const,
}

/**
 * Fetch sessions with optional filtering
 */
export function useSessions(options: SessionQueryOptions = {}) {
  return useQuery({
    queryKey: sessionKeys.list(options),
    queryFn: () => getSessions(options),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Fetch a single session by ID
 */
export function useSession(sessionId: string | null) {
  return useQuery({
    queryKey: sessionKeys.detail(sessionId || ''),
    queryFn: () => getSessionById(sessionId!),
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Fetch session statistics for a date range
 */
export function useSessionStatistics(startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...sessionKeys.statistics(), startDate, endDate],
    queryFn: () => getSessionStats(startDate, endDate),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Create a new session
 */
export function useCreateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.all })
    },
  })
}

/**
 * Update an existing session
 */
export function useUpdateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      updateSession(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.all })
      queryClient.setQueryData(sessionKeys.detail(data.id), data)
    },
  })
}

/**
 * Delete a session
 */
export function useDeleteSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.all })
    },
  })
}
