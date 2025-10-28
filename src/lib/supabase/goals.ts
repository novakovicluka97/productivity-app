import { getSupabaseClient } from './client'

async function getSupabaseWithUser() {
  const supabase = getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  return { supabase, user }
}

/**
 * User Goals CRUD Operations
 *
 * Manages user goals including daily, weekly, and custom goals.
 * Tracks progress and completion status.
 */

export type GoalType = 'daily' | 'weekly' | 'monthly' | 'custom'
export type GoalMetric = 'sessions' | 'time' | 'completion_rate' | 'streak'

export interface Goal {
  id: string
  user_id: string
  name: string
  description: string | null
  type: GoalType
  metric: GoalMetric
  target_value: number
  current_value: number
  start_date: string
  end_date: string | null
  is_active: boolean
  is_completed: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface GoalInsert {
  user_id: string
  name: string
  description?: string | null
  type: GoalType
  metric: GoalMetric
  target_value: number
  current_value?: number
  start_date: string
  end_date?: string | null
  is_active?: boolean
}

export interface GoalUpdate {
  name?: string
  description?: string | null
  type?: GoalType
  metric?: GoalMetric
  target_value?: number
  current_value?: number
  start_date?: string
  end_date?: string | null
  is_active?: boolean
  is_completed?: boolean
  completed_at?: string | null
}

/**
 * Get all goals for the current user
 */
export async function getUserGoals(includeCompleted = false): Promise<Goal[]> {
  const { supabase, user } = await getSupabaseWithUser()

  let query = supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (!includeCompleted) {
    query = query.eq('is_completed', false)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching user goals:', error)
    throw error
  }

  return data || []
}

/**
 * Get active goals for the current user
 */
export async function getActiveGoals(): Promise<Goal[]> {
  const { supabase, user } = await getSupabaseWithUser()

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .eq('is_completed', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching active goals:', error)
    throw error
  }

  return data || []
}

/**
 * Get a single goal by ID
 */
export async function getGoalById(goalId: string): Promise<Goal | null> {
  const { supabase, user } = await getSupabaseWithUser()

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('id', goalId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching goal:', error)
    throw error
  }

  return data
}

/**
 * Create a new goal
 */
export async function createGoal(goal: GoalInsert): Promise<Goal> {
  const { supabase, user } = await getSupabaseWithUser()

  const newGoal = {
    ...goal,
    user_id: user.id,
    current_value: goal.current_value || 0,
    is_active: goal.is_active ?? true,
    is_completed: false,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('goals')
    // @ts-ignore - Supabase type inference issue with goals table
    .insert(newGoal)
    .select()
    .single()

  if (error) {
    console.error('Error creating goal:', error)
    throw error
  }

  return data
}

/**
 * Update an existing goal
 */
export async function updateGoal(goalId: string, updates: GoalUpdate): Promise<Goal> {
  const { supabase, user } = await getSupabaseWithUser()

  const updateData = {
    ...updates,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('goals')
    // @ts-ignore - Supabase type inference issue with goals table
    .update(updateData)
    .eq('id', goalId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating goal:', error)
    throw error
  }

  return data
}

/**
 * Update goal progress
 */
export async function updateGoalProgress(goalId: string, currentValue: number): Promise<Goal> {
  const goal = await getGoalById(goalId)

  if (!goal) {
    throw new Error('Goal not found')
  }

  const isCompleted = currentValue >= goal.target_value
  const updates: GoalUpdate = {
    current_value: currentValue,
    is_completed: isCompleted,
    completed_at: isCompleted ? new Date().toISOString() : null,
  }

  return updateGoal(goalId, updates)
}

/**
 * Increment goal progress
 */
export async function incrementGoalProgress(goalId: string, increment = 1): Promise<Goal> {
  const goal = await getGoalById(goalId)

  if (!goal) {
    throw new Error('Goal not found')
  }

  const newValue = goal.current_value + increment
  return updateGoalProgress(goalId, newValue)
}

/**
 * Delete a goal
 */
export async function deleteGoal(goalId: string): Promise<void> {
  const { supabase, user } = await getSupabaseWithUser()

  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting goal:', error)
    throw error
  }
}

/**
 * Check if a goal is met
 */
export async function checkGoalProgress(goalId: string): Promise<{
  isMet: boolean
  progress: number
  remaining: number
}> {
  const goal = await getGoalById(goalId)

  if (!goal) {
    throw new Error('Goal not found')
  }

  const isMet = goal.current_value >= goal.target_value
  const progress = (goal.current_value / goal.target_value) * 100
  const remaining = Math.max(0, goal.target_value - goal.current_value)

  return {
    isMet,
    progress: Math.min(100, progress),
    remaining,
  }
}

/**
 * Get goals by type
 */
export async function getGoalsByType(type: GoalType): Promise<Goal[]> {
  const { supabase, user } = await getSupabaseWithUser()

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', type)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching goals by type:', error)
    throw error
  }

  return data || []
}

/**
 * Archive completed goals
 */
export async function archiveCompletedGoals(): Promise<number> {
  const { supabase, user } = await getSupabaseWithUser()

  const { data, error } = await supabase
    .from('goals')
    // @ts-ignore - Supabase type inference issue with goals table
    .update({ is_active: false })
    .eq('user_id', user.id)
    .eq('is_completed', true)
    .select()

  if (error) {
    console.error('Error archiving completed goals:', error)
    throw error
  }

  return data?.length || 0
}

/**
 * Reset daily goals
 */
export async function resetDailyGoals(): Promise<void> {
  const dailyGoals = await getGoalsByType('daily')

  for (const goal of dailyGoals) {
    await updateGoal(goal.id, {
      current_value: 0,
      is_completed: false,
      completed_at: null,
    })
  }
}

/**
 * Get goal statistics
 */
export async function getGoalStatistics(): Promise<{
  totalGoals: number
  completedGoals: number
  activeGoals: number
  completionRate: number
}> {
  const allGoals = await getUserGoals(true)
  const activeGoals = allGoals.filter((g) => g.is_active && !g.is_completed)
  const completedGoals = allGoals.filter((g) => g.is_completed)

  return {
    totalGoals: allGoals.length,
    completedGoals: completedGoals.length,
    activeGoals: activeGoals.length,
    completionRate: allGoals.length > 0
      ? (completedGoals.length / allGoals.length) * 100
      : 0,
  }
}
