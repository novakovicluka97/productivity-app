import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase/client'
import { ACHIEVEMENTS, checkAchievementCriteria, type Achievement } from '@/components/achievements/achievements'
import { useSessionNotifications } from './useNotifications'
import type { Database } from '@/types/supabase'

/**
 * Achievements Management Hook
 *
 * Handles checking, unlocking, and querying user achievements.
 */

type UserAchievement = Database['public']['Tables']['user_achievements']['Row']

/**
 * Get user's unlocked achievements
 */
export function useUserAchievements() {
  const { data: achievements = [], isLoading, error } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const supabase = getSupabaseClient()

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false })

      if (error) throw error
      return data as UserAchievement[]
    },
  })

  return { achievements, isLoading, error }
}

/**
 * Unlock an achievement
 */
export function useUnlockAchievement() {
  const queryClient = useQueryClient()
  const { notifyAchievementUnlocked } = useSessionNotifications()

  const mutation = useMutation({
    mutationFn: async (achievementId: string) => {
      const supabase = getSupabaseClient()

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      // Check if achievement is already unlocked
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', user.id)
        .eq('achievement_id', achievementId)
        .single()

      if (existing) {
        return null // Already unlocked
      }

      // Unlock achievement
      const { data, error } = await supabase
        .from('user_achievements')
        // @ts-ignore - Supabase type inference issue with user_achievements table
        .insert({
          user_id: user.id,
          achievement_id: achievementId,
        })
        .select()
        .single()

      if (error) throw error

      // Get achievement details for notification
      const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId)
      if (achievement) {
        notifyAchievementUnlocked(achievement.name)
      }

      return data as UserAchievement
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
    },
  })

  return mutation
}

/**
 * Check and unlock achievements based on user stats
 */
export function useCheckAchievements() {
  const { mutate: unlockAchievement } = useUnlockAchievement()

  const checkAchievements = async (stats: {
    totalSessions: number
    currentStreak: number
    completionRate: number
    totalTimeSpent: number
  }) => {
    const supabase = getSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    // Get already unlocked achievements
    const { data: unlocked } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user.id)

    // @ts-ignore - Supabase type inference issue with user_achievements table
    const unlockedIds = new Set(unlocked?.map((a) => a.achievement_id) || [])

    // Check each achievement
    for (const achievement of ACHIEVEMENTS) {
      // Skip if already unlocked
      if (unlockedIds.has(achievement.id)) continue

      // Skip milestone achievements (they require special logic)
      if (achievement.criteria.type === 'milestone') continue

      // Check if criteria is met
      if (checkAchievementCriteria(achievement, stats)) {
        unlockAchievement(achievement.id)
      }
    }
  }

  return { checkAchievements }
}

/**
 * Get achievement progress
 */
export function useAchievementProgress(achievementId: string, stats: {
  totalSessions: number
  currentStreak: number
  completionRate: number
  totalTimeSpent: number
}) {
  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId)

  if (!achievement) {
    return { progress: 0, isUnlocked: false }
  }

  let current = 0
  let target = achievement.criteria.threshold

  switch (achievement.criteria.type) {
    case 'sessions':
      current = stats.totalSessions
      break
    case 'streak':
      current = stats.currentStreak
      break
    case 'completion_rate':
      current = stats.completionRate
      break
    case 'time_spent':
      current = stats.totalTimeSpent
      break
  }

  const progress = Math.min(100, (current / target) * 100)
  const isUnlocked = current >= target

  return { progress, isUnlocked, current, target }
}
