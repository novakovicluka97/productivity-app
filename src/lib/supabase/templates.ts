/**
 * Supabase Templates Operations
 *
 * CRUD operations for the session_templates table
 */

import { getSupabaseClient } from './client'
import type { SessionTemplate, CardConfiguration } from './types'

async function getSupabaseWithUser() {
  const supabase = getSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('User not authenticated')
  }

  return { supabase, user }
}

export interface TemplateInsert {
  name: string
  description: string | null
  configuration: CardConfiguration[]
  is_public: boolean
}

export interface TemplateUpdate {
  name?: string
  description?: string | null
  configuration?: CardConfiguration[]
  is_public?: boolean
}

/**
 * Get all templates for the current user (owned + public)
 */
export async function getTemplates() {
  const { supabase, user } = await getSupabaseWithUser()

  const { data, error } = await supabase
    .from('session_templates')
    .select('*')
    .or(`user_id.eq.${user.id},is_public.eq.true`)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data as SessionTemplate[]
}

/**
 * Get a single template by ID
 */
export async function getTemplate(templateId: string) {
  const { supabase, user } = await getSupabaseWithUser()

  const { data, error } = await supabase
    .from('session_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (error) {
    throw error
  }

  const template = data as SessionTemplate

  if (template.user_id !== user.id && !template.is_public) {
    throw new Error('Access denied to this template')
  }

  return template
}

/**
 * Create a new template
 */
export async function createTemplate(template: TemplateInsert) {
  const { supabase, user } = await getSupabaseWithUser()

  const { data, error } = await supabase
    .from('session_templates')
    // @ts-ignore - Supabase type inference issue with session_templates table
    .insert({
      ...template,
      user_id: user.id,
      usage_count: 0,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as SessionTemplate
}

/**
 * Update template
 */
export async function updateTemplate(templateId: string, updates: TemplateUpdate) {
  const { supabase, user } = await getSupabaseWithUser()

  const { data, error } = await supabase
    .from('session_templates')
    // @ts-ignore - Supabase type inference issue with session_templates table
    .update(updates)
    .eq('id', templateId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as SessionTemplate
}

/**
 * Delete template
 */
export async function deleteTemplate(templateId: string) {
  const { supabase, user } = await getSupabaseWithUser()

  const { error } = await supabase
    .from('session_templates')
    .delete()
    .eq('id', templateId)
    .eq('user_id', user.id)

  if (error) {
    throw error
  }

  return true
}

/**
 * Increment usage count
 */
export async function incrementTemplateUsage(templateId: string) {
  const supabase = getSupabaseClient()

  const { data: templateData, error: fetchError } = await supabase
    .from('session_templates')
    .select('usage_count')
    .eq('id', templateId)
    .single()

  if (fetchError) {
    throw fetchError
  }

  const template = templateData as { usage_count: number }

  const { data, error } = await supabase
    .from('session_templates')
    // @ts-ignore - Supabase type inference issue with session_templates table
    .update({ usage_count: (template.usage_count || 0) + 1 })
    .eq('id', templateId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as SessionTemplate
}

/**
 * Duplicate template
 */
export async function duplicateTemplate(templateId: string) {
  const { supabase, user } = await getSupabaseWithUser()

  const original = await getTemplate(templateId)

  const { data, error } = await supabase
    .from('session_templates')
    // @ts-ignore - Supabase type inference issue with session_templates table
    .insert({
      user_id: user.id,
      name: `${original.name} (Copy)`,
      description: original.description,
      configuration: original.configuration,
      is_public: false,
      usage_count: 0,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as SessionTemplate
}
