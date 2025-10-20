import { supabase } from './client'
import type { Database } from '@/types/supabase'
import type { Card } from '@/lib/types'

type SessionRow = Database['public']['Tables']['sessions']['Row']
type SessionInsert = Database['public']['Tables']['sessions']['Insert']
type SessionUpdate = Database['public']['Tables']['sessions']['Update']

/**
 * Sessions CRUD Operations
 *
 * These functions handle all database operations for completed session/break cards.
 * Sessions are historical records that have been completed.
 */

/**
 * Create a new session record
 */
export async function createSession(session: Omit<SessionInsert, 'id' | 'created_at' | 'updated_at'>): Promise<SessionRow> {
  const { data, error } = await supabase
    .from('sessions')
    .insert(session as any)
    .select()
    .single()

  if (error) {
    console.error('Error creating session:', error)
    throw error
  }

  return data as SessionRow
}

/**
 * Get all sessions for the current user
 */
export async function getSessions(options?: {
  startDate?: string // ISO date string
  endDate?: string // ISO date string
  type?: 'session' | 'break'
  limit?: number
  offset?: number
}): Promise<SessionRow[]> {
  let query = supabase
    .from('sessions')
    .select('*')
    .order('session_date', { ascending: false })
    .order('created_at', { ascending: false })

  // Apply filters
  if (options?.startDate) {
    query = query.gte('session_date', options.startDate)
  }
  if (options?.endDate) {
    query = query.lte('session_date', options.endDate)
  }
  if (options?.type) {
    query = query.eq('type', options.type)
  }
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching sessions:', error)
    throw error
  }

  return data as SessionRow[]
}

/**
 * Get sessions for a specific date
 */
export async function getSessionsByDate(date: string): Promise<SessionRow[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('session_date', date)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching sessions by date:', error)
    throw error
  }

  return data as SessionRow[]
}

/**
 * Get a single session by ID
 */
export async function getSessionById(id: string): Promise<SessionRow> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching session:', error)
    throw error
  }

  return data as SessionRow
}

/**
 * Update a session
 */
export async function updateSession(id: string, updates: SessionUpdate): Promise<SessionRow> {
  const { data, error } = await supabase
    .from('sessions')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating session:', error)
    throw error
  }

  return data as SessionRow
}

/**
 * Delete a session
 */
export async function deleteSession(id: string) {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting session:', error)
    throw error
  }

  return true
}

/**
 * Delete multiple sessions
 */
export async function deleteSessions(ids: string[]) {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .in('id', ids)

  if (error) {
    console.error('Error deleting sessions:', error)
    throw error
  }

  return true
}

/**
 * Save completed card as a session
 * This is the main function to call when a card is completed
 */
export async function saveCompletedCard(card: Card, sessionDate: string) {
  const session: Omit<SessionInsert, 'id' | 'created_at' | 'updated_at'> = {
    user_id: undefined as any, // Will be set by RLS policy
    session_date: sessionDate,
    type: card.type,
    duration: card.duration,
    time_spent: card.duration - card.timeRemaining,
    is_completed: card.isCompleted,
    content: card.content || null,
    tasks: card.todos ? card.todos.map(todo => ({
      id: todo.id,
      text: todo.text,
      completed: todo.completed,
      createdAt: todo.createdAt.toISOString(),
    })) : null,
  }

  return createSession(session)
}

/**
 * Get session statistics for a date range
 */
export async function getSessionStats(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('sessions')
    .select('type, duration, time_spent, is_completed, session_date')
    .gte('session_date', startDate)
    .lte('session_date', endDate)

  if (error) {
    console.error('Error fetching session stats:', error)
    throw error
  }

  // Calculate statistics
  const totalSessions = data.length
  const completedSessions = data.filter(s => s.is_completed).length
  const totalTimeSpent = data.reduce((sum, s) => sum + (s.time_spent || 0), 0)
  const sessionsByType = {
    session: data.filter(s => s.type === 'session').length,
    break: data.filter(s => s.type === 'break').length,
  }

  return {
    totalSessions,
    completedSessions,
    completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
    totalTimeSpent,
    sessionsByType,
    averageTimePerSession: totalSessions > 0 ? totalTimeSpent / totalSessions : 0,
  }
}

/**
 * Convert session row to Card format (for backward compatibility)
 */
export function sessionToCard(session: SessionRow): Card {
  return {
    id: session.id,
    type: session.type as 'session' | 'break',
    duration: session.duration,
    timeRemaining: session.duration - (session.time_spent || 0),
    isActive: false,
    isCompleted: session.is_completed,
    isSelected: false,
    content: session.content || undefined,
    todos: session.tasks ? (session.tasks as any[]).map(task => ({
      id: task.id,
      text: task.text,
      completed: task.completed,
      createdAt: new Date(task.createdAt),
    })) : undefined,
  }
}
