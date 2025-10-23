import { getActiveGoals, incrementGoalProgress, type Goal } from '@/lib/supabase/goals'
import { format } from 'date-fns'

/**
 * Goal Update Helpers
 *
 * Utilities for automatically updating user goals based on session completion.
 * This creates the bridge between sessions and goals.
 */

/**
 * Update all relevant goals when a session is completed
 */
export async function updateGoalsForSession(sessionData: {
  type: 'session' | 'break'
  duration: number
  timeSpent: number
  isCompleted: boolean
  sessionDate: string
}): Promise<void> {
  try {
    // Only update goals for completed sessions (not breaks)
    if (sessionData.type !== 'session' || !sessionData.isCompleted) {
      return
    }

    // Get all active goals
    const activeGoals = await getActiveGoals()

    if (activeGoals.length === 0) {
      return
    }

    const today = format(new Date(), 'yyyy-MM-dd')
    const sessionDate = sessionData.sessionDate

    // Process each goal
    for (const goal of activeGoals) {
      // Check if goal is active for this date
      const isWithinDateRange =
        sessionDate >= goal.start_date &&
        (!goal.end_date || sessionDate <= goal.end_date)

      if (!isWithinDateRange) {
        continue
      }

      // Update based on goal metric
      switch (goal.metric) {
        case 'sessions':
          // Increment session count
          await incrementGoalProgress(goal.id, 1)
          break

        case 'time':
          // Add time spent (convert to minutes)
          const minutesSpent = Math.floor(sessionData.timeSpent / 60)
          if (minutesSpent > 0) {
            await incrementGoalProgress(goal.id, minutesSpent)
          }
          break

        case 'completion_rate':
          // This is calculated separately, not incremented
          // Will be handled by a separate analytics job
          break

        case 'streak':
          // Streak tracking requires more complex logic
          // Will be handled by a separate analytics job
          break
      }
    }
  } catch (error) {
    console.error('Error updating goals for session:', error)
    // Don't throw - goal updates should not block session saving
  }
}

/**
 * Check if goals should be reset (daily/weekly)
 * This would typically be called on app mount or as a scheduled job
 */
export async function checkAndResetGoals(): Promise<void> {
  try {
    const activeGoals = await getActiveGoals()
    const today = new Date()
    const todayStr = format(today, 'yyyy-MM-dd')

    for (const goal of activeGoals) {
      // Check if goal has ended
      if (goal.end_date && todayStr > goal.end_date) {
        // Goal period has ended - could mark as inactive
        continue
      }

      // Daily goals reset logic
      if (goal.type === 'daily') {
        // Check if it's a new day since goal was last updated
        const lastUpdate = new Date(goal.updated_at)
        const lastUpdateStr = format(lastUpdate, 'yyyy-MM-dd')

        if (lastUpdateStr < todayStr && !goal.is_completed) {
          // Reset daily goal for new day
          // This would be handled by resetDailyGoals() function
        }
      }
    }
  } catch (error) {
    console.error('Error checking and resetting goals:', error)
  }
}

/**
 * Calculate completion rate for a goal
 */
export function calculateGoalProgress(goal: Goal): {
  percentage: number
  isComplete: boolean
  remaining: number
} {
  const percentage = goal.target_value > 0
    ? Math.min(100, (goal.current_value / goal.target_value) * 100)
    : 0

  const isComplete = goal.current_value >= goal.target_value
  const remaining = Math.max(0, goal.target_value - goal.current_value)

  return {
    percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal
    isComplete,
    remaining,
  }
}

/**
 * Get user-friendly goal type label
 */
export function getGoalTypeLabel(type: Goal['type']): string {
  switch (type) {
    case 'daily':
      return 'Daily'
    case 'weekly':
      return 'Weekly'
    case 'monthly':
      return 'Monthly'
    case 'custom':
      return 'Custom'
    default:
      return type
  }
}

/**
 * Get user-friendly goal metric label
 */
export function getGoalMetricLabel(metric: Goal['metric'], value: number): string {
  switch (metric) {
    case 'sessions':
      return `${value} session${value !== 1 ? 's' : ''}`
    case 'time':
      return `${value} minute${value !== 1 ? 's' : ''}`
    case 'completion_rate':
      return `${value}% completion rate`
    case 'streak':
      return `${value} day${value !== 1 ? 's' : ''} streak`
    default:
      return `${value}`
  }
}
