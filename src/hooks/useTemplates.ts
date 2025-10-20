/**
 * useTemplates Hook
 *
 * React Query hook for fetching and managing templates
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  incrementTemplateUsage,
  duplicateTemplate,
  type TemplateInsert,
  type TemplateUpdate,
} from '@/lib/supabase/templates'

/**
 * Query key factory for templates
 */
export const templateKeys = {
  all: ['templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: () => [...templateKeys.lists()] as const,
  details: () => [...templateKeys.all, 'detail'] as const,
  detail: (id: string) => [...templateKeys.details(), id] as const,
}

/**
 * Fetch all templates
 */
export function useTemplates() {
  return useQuery({
    queryKey: templateKeys.list(),
    queryFn: getTemplates,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Fetch a single template by ID
 */
export function useTemplate(templateId: string | null) {
  return useQuery({
    queryKey: templateKeys.detail(templateId || ''),
    queryFn: () => getTemplate(templateId!),
    enabled: !!templateId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Create a new template
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (template: TemplateInsert) => createTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all })
    },
  })
}

/**
 * Update an existing template
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TemplateUpdate }) =>
      updateTemplate(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all })
      queryClient.setQueryData(templateKeys.detail(data.id), data)
    },
  })
}

/**
 * Delete a template
 */
export function useDeleteTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all })
    },
  })
}

/**
 * Increment template usage count
 */
export function useIncrementTemplateUsage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => incrementTemplateUsage(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all })
      queryClient.setQueryData(templateKeys.detail(data.id), data)
    },
  })
}

/**
 * Duplicate a template
 */
export function useDuplicateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => duplicateTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all })
    },
  })
}
