'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getUserGoals,
  getActiveGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  updateGoalProgress,
  incrementGoalProgress,
  checkGoalProgress,
  getGoalsByType,
  archiveCompletedGoals,
  resetDailyGoals,
  getGoalStatistics,
  type Goal,
  type GoalInsert,
  type GoalUpdate,
  type GoalType,
} from '@/lib/supabase/goals'
import { useSessionNotifications } from './useNotifications'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Goals Management Hook
 *
 * Provides React Query powered CRUD operations for user goals
 * with automatic cache management and optimistic updates.
 */

export function useGoals(includeCompleted = false) {
  const { user, loading } = useAuth()

  const {
    data: goals = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['goals', includeCompleted, user?.id],
    queryFn: () => getUserGoals(includeCompleted),
    enabled: !!user && !loading,
  })

  return {
    goals,
    isLoading: loading || isLoading,
    error,
  }
}

export function useActiveGoals() {
  const { user, loading } = useAuth()

  const {
    data: goals = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['goals', 'active', user?.id],
    queryFn: getActiveGoals,
    enabled: !!user && !loading,
  })

  return {
    goals,
    isLoading: loading || isLoading,
    error,
  }
}

export function useGoal(goalId: string | null) {
  const { user, loading } = useAuth()

  const {
    data: goal,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['goal', goalId, user?.id],
    queryFn: () => (goalId ? getGoalById(goalId) : null),
    enabled: !!goalId && !!user && !loading,
  })

  return {
    goal,
    isLoading: loading || isLoading,
    error,
  }
}

export function useGoalsByType(type: GoalType) {
  const { user, loading } = useAuth()

  const {
    data: goals = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['goals', 'type', type, user?.id],
    queryFn: () => getGoalsByType(type),
    enabled: !!user && !loading,
  })

  return {
    goals,
    isLoading: loading || isLoading,
    error,
  }
}

export function useGoalStatistics() {
  const { user, loading } = useAuth()

  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['goals', 'statistics', user?.id],
    queryFn: getGoalStatistics,
    enabled: !!user && !loading,
  })

  return {
    stats,
    isLoading: loading || isLoading,
    error,
  }
}

export function useCreateGoal() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const mutation = useMutation({
    mutationFn: (goal: GoalInsert) => {
      if (!user) {
        throw new Error('Cannot create goal: user is not authenticated')
      }
      return createGoal(goal)
    },
    onSuccess: () => {
      // Invalidate all goal queries
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })

  return mutation
}

export function useUpdateGoal() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const mutation = useMutation({
    mutationFn: ({ goalId, updates }: { goalId: string; updates: GoalUpdate }) => {
      if (!user) {
        throw new Error('Cannot update goal: user is not authenticated')
      }
      return updateGoal(goalId, updates)
    },
    onSuccess: (updatedGoal) => {
      // Invalidate goal queries
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['goal', updatedGoal.id] })
    },
  })

  return mutation
}

export function useDeleteGoal() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const mutation = useMutation({
    mutationFn: (goalId: string) => {
      if (!user) {
        throw new Error('Cannot delete goal: user is not authenticated')
      }
      return deleteGoal(goalId)
    },
    onSuccess: () => {
      // Invalidate goal queries
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })

  return mutation
}

export function useUpdateGoalProgress() {
  const queryClient = useQueryClient()
  const { notifyGoalAchieved } = useSessionNotifications()
  const { user } = useAuth()

  const mutation = useMutation({
    mutationFn: ({ goalId, currentValue }: { goalId: string; currentValue: number }) => {
      if (!user) {
        throw new Error('Cannot update goal progress: user is not authenticated')
      }
      return updateGoalProgress(goalId, currentValue)
    },
    onSuccess: (updatedGoal) => {
      // Check if goal was just completed
      if (updatedGoal.is_completed && updatedGoal.completed_at) {
        const completedTime = new Date(updatedGoal.completed_at).getTime()
        const now = Date.now()
        // If completed within the last 5 seconds, it's a new completion
        if (now - completedTime < 5000) {
          notifyGoalAchieved(updatedGoal.name)
        }
      }

      // Invalidate goal queries
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['goal', updatedGoal.id] })
    },
  })

  return mutation
}

export function useIncrementGoalProgress() {
  const queryClient = useQueryClient()
  const { notifyGoalAchieved } = useSessionNotifications()
  const { user } = useAuth()

  const mutation = useMutation({
    mutationFn: ({ goalId, increment = 1 }: { goalId: string; increment?: number }) => {
      if (!user) {
        throw new Error('Cannot increment goal progress: user is not authenticated')
      }
      return incrementGoalProgress(goalId, increment)
    },
    onSuccess: (updatedGoal) => {
      // Check if goal was just completed
      if (updatedGoal.is_completed && updatedGoal.completed_at) {
        const completedTime = new Date(updatedGoal.completed_at).getTime()
        const now = Date.now()
        if (now - completedTime < 5000) {
          notifyGoalAchieved(updatedGoal.name)
        }
      }

      // Invalidate goal queries
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['goal', updatedGoal.id] })
    },
  })

  return mutation
}

export function useCheckGoalProgress(goalId: string | null) {
  const { user, loading } = useAuth()

  const {
    data: progress,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['goal', goalId, 'progress', user?.id],
    queryFn: () => (goalId ? checkGoalProgress(goalId) : null),
    enabled: !!goalId && !!user && !loading,
  })

  return {
    progress,
    isLoading: loading || isLoading,
    error,
  }
}

export function useArchiveCompletedGoals() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('Cannot archive goals: user is not authenticated')
      }
      return archiveCompletedGoals()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })

  return mutation
}

export function useResetDailyGoals() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('Cannot reset daily goals: user is not authenticated')
      }
      return resetDailyGoals()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })

  return mutation
}

/**
 * Helper hook for goal operations
 */
export function useGoalOperations() {
  const createGoalMutation = useCreateGoal()
  const updateGoalMutation = useUpdateGoal()
  const deleteGoalMutation = useDeleteGoal()
  const updateProgressMutation = useUpdateGoalProgress()
  const incrementProgressMutation = useIncrementGoalProgress()
  const archiveMutation = useArchiveCompletedGoals()
  const resetDailyMutation = useResetDailyGoals()

  return {
    createGoal: createGoalMutation.mutate,
    updateGoal: updateGoalMutation.mutate,
    deleteGoal: deleteGoalMutation.mutate,
    updateProgress: updateProgressMutation.mutate,
    incrementProgress: incrementProgressMutation.mutate,
    archiveCompleted: archiveMutation.mutate,
    resetDaily: resetDailyMutation.mutate,
    isCreating: createGoalMutation.isPending,
    isUpdating: updateGoalMutation.isPending,
    isDeleting: deleteGoalMutation.isPending,
  }
}
