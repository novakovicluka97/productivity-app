import { supabase } from './client'
import type { Database } from '@/types/supabase'
import type { Card } from '@/lib/types'

type ScheduledSessionRow = Database['public']['Tables']['scheduled_sessions']['Row']
type ScheduledSessionInsert = Database['public']['Tables']['scheduled_sessions']['Insert']
type ScheduledSessionUpdate = Database['public']['Tables']['scheduled_sessions']['Update']

/**
 * Scheduled Sessions CRUD Operations
 *
 * These functions handle pre-scheduling sessions and breaks for future dates.
 * When a scheduled date arrives, the configuration is loaded into the main app.
 */

/**
 * Create a new scheduled session
 */
export async function createScheduledSession(
  scheduledDate: string,
  cards: Card[]
) {
  

  const configuration = {
    cards: cards.map(card => ({
      id: card.id,
      type: card.type,
      duration: card.duration,
      content: card.content || null,
      todos: card.todos || [],
    })),
  }

  const { data, error } = await supabase
    .from('scheduled_sessions')
    // @ts-ignore - Supabase type inference issue with scheduled_sessions table
    .insert({
      user_id: undefined as any, // Will be set by RLS policy
      scheduled_date: scheduledDate,
      configuration,
      is_loaded: false,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating scheduled session:', error)
    throw error
  }

  return data
}

/**
 * Get all scheduled sessions for the current user
 */
export async function getScheduledSessions(options?: {
  startDate?: string
  endDate?: string
  includeLoaded?: boolean
  limit?: number
}) {
  

  let query = supabase
    .from('scheduled_sessions')
    .select('*')
    .order('scheduled_date', { ascending: true })

  // Apply filters
  if (options?.startDate) {
    query = query.gte('scheduled_date', options.startDate)
  }
  if (options?.endDate) {
    query = query.lte('scheduled_date', options.endDate)
  }
  if (!options?.includeLoaded) {
    query = query.eq('is_loaded', false)
  }
  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching scheduled sessions:', error)
    throw error
  }

  return data
}

/**
 * Get scheduled session for a specific date
 */
export async function getScheduledSessionByDate(date: string) {
  

  const { data, error } = await supabase
    .from('scheduled_sessions')
    .select('*')
    .eq('scheduled_date', date)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    console.error('Error fetching scheduled session by date:', error)
    throw error
  }

  return data
}

/**
 * Update a scheduled session
 */
export async function updateScheduledSession(
  id: string,
  updates: Partial<ScheduledSessionUpdate>
) {
  

  const { data, error } = await supabase
    .from('scheduled_sessions')
    // @ts-ignore - Supabase type inference issue with scheduled_sessions table
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating scheduled session:', error)
    throw error
  }

  return data
}

/**
 * Mark a scheduled session as loaded
 */
export async function markScheduledSessionAsLoaded(id: string) {
  return updateScheduledSession(id, {
    is_loaded: true,
    loaded_at: new Date().toISOString(),
  })
}

/**
 * Delete a scheduled session
 */
export async function deleteScheduledSession(id: string) {
  

  const { error } = await supabase
    .from('scheduled_sessions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting scheduled session:', error)
    throw error
  }

  return true
}

/**
 * Check if today has an unloaded scheduled session
 * Returns the scheduled session if found, null otherwise
 */
export async function getTodayScheduledSession() {
  const today = new Date().toISOString().split('T')[0]
  return getScheduledSessionByDate(today)
}

/**
 * Load a scheduled session into the app
 * Returns the cards configuration
 */
export async function loadScheduledSession(scheduledSession: ScheduledSessionRow): Promise<Card[]> {
  const configuration = scheduledSession.configuration as any

  // Mark as loaded
  await markScheduledSessionAsLoaded(scheduledSession.id)

  // Convert configuration to Card array
  return configuration.cards.map((cardConfig: any) => ({
    id: cardConfig.id,
    type: cardConfig.type,
    duration: cardConfig.duration,
    timeRemaining: cardConfig.duration,
    isActive: false,
    isCompleted: false,
    isSelected: false,
    content: cardConfig.content || undefined,
    todos: cardConfig.todos || [],
  }))
}

/**
 * Get upcoming scheduled sessions (next 7 days)
 */
export async function getUpcomingScheduledSessions() {
  const today = new Date().toISOString().split('T')[0]
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  const nextWeekStr = nextWeek.toISOString().split('T')[0]

  return getScheduledSessions({
    startDate: today,
    endDate: nextWeekStr,
    includeLoaded: false,
  })
}

/**
 * Check if a date already has a scheduled session
 */
export async function hasScheduledSession(date: string): Promise<boolean> {
  const session = await getScheduledSessionByDate(date)
  return session !== null
}

/**
 * Replace an existing scheduled session with new configuration
 */
export async function replaceScheduledSession(date: string, cards: Card[]) {
  const existing = await getScheduledSessionByDate(date)

  if (existing) {
    // Delete existing
    // @ts-ignore - Supabase type inference issue with scheduled_sessions table
    await deleteScheduledSession(existing.id)
  }

  // Create new
  return createScheduledSession(date, cards)
}
