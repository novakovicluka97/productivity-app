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

/**
 * Goals Management Hook
 *
 * Provides React Query powered CRUD operations for user goals
 * with automatic cache management and optimistic updates.
 */

export function useGoals(includeCompleted = false) {
  const queryClient = useQueryClient()

  const { data: goals = [], isLoading, error } = useQuery({
    queryKey: ['goals', includeCompleted],
    queryFn: () => getUserGoals(includeCompleted),
  })

  return {
    goals,
    isLoading,
    error,
  }
}

export function useActiveGoals() {
  const { data: goals = [], isLoading, error } = useQuery({
    queryKey: ['goals', 'active'],
    queryFn: getActiveGoals,
  })

  return {
    goals,
    isLoading,
    error,
  }
}

export function useGoal(goalId: string | null) {
  const { data: goal, isLoading, error } = useQuery({
    queryKey: ['goal', goalId],
    queryFn: () => goalId ? getGoalById(goalId) : null,
    enabled: !!goalId,
  })

  return {
    goal,
    isLoading,
    error,
  }
}

export function useGoalsByType(type: GoalType) {
  const { data: goals = [], isLoading, error } = useQuery({
    queryKey: ['goals', 'type', type],
    queryFn: () => getGoalsByType(type),
  })

  return {
    goals,
    isLoading,
    error,
  }
}

export function useGoalStatistics() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['goals', 'statistics'],
    queryFn: getGoalStatistics,
  })

  return {
    stats,
    isLoading,
    error,
  }
}

export function useCreateGoal() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (goal: GoalInsert) => createGoal(goal),
    onSuccess: () => {
      // Invalidate all goal queries
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })

  return mutation
}

export function useUpdateGoal() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ goalId, updates }: { goalId: string; updates: GoalUpdate }) =>
      updateGoal(goalId, updates),
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

  const mutation = useMutation({
    mutationFn: (goalId: string) => deleteGoal(goalId),
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

  const mutation = useMutation({
    mutationFn: ({ goalId, currentValue }: { goalId: string; currentValue: number }) =>
      updateGoalProgress(goalId, currentValue),
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

  const mutation = useMutation({
    mutationFn: ({ goalId, increment = 1 }: { goalId: string; increment?: number }) =>
      incrementGoalProgress(goalId, increment),
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
  const { data: progress, isLoading, error } = useQuery({
    queryKey: ['goal', goalId, 'progress'],
    queryFn: () => goalId ? checkGoalProgress(goalId) : null,
    enabled: !!goalId,
  })

  return {
    progress,
    isLoading,
    error,
  }
}

export function useArchiveCompletedGoals() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: archiveCompletedGoals,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })

  return mutation
}

export function useResetDailyGoals() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: resetDailyGoals,
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
