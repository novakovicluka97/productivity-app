/**
 * Supabase Templates Operations
 *
 * CRUD operations for the session_templates table
 */

import { supabase } from './client'
import type { SessionTemplate, CardConfiguration } from './types'

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
  

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('User not authenticated')
  }

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
  

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('session_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (error) {
    throw error
  }

  if (data.user_id !== user.id && !data.is_public) {
    throw new Error('Access denied to this template')
  }

  return data as SessionTemplate
}

/**
 * Create a new template
 */
export async function createTemplate(template: TemplateInsert) {
  

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('session_templates')
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
  

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('session_templates')
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
  

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('User not authenticated')
  }

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
  

  const { data: template, error: fetchError } = await supabase
    .from('session_templates')
    .select('usage_count')
    .eq('id', templateId)
    .single()

  if (fetchError) {
    throw fetchError
  }

  const { data, error } = await supabase
    .from('session_templates')
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
  

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  const original = await getTemplate(templateId)

  const { data, error } = await supabase
    .from('session_templates')
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
