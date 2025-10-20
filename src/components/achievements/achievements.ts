/**
 * Achievement Definitions
 *
 * Defines all available achievements and their unlock criteria.
 */

export type AchievementCategory = 'sessions' | 'streaks' | 'completion' | 'time' | 'milestones'

export interface Achievement {
  id: string
  name: string
  description: string
  category: AchievementCategory
  icon: string // Emoji icon
  criteria: {
    type: 'sessions' | 'streak' | 'completion_rate' | 'time_spent' | 'milestone'
    threshold: number
  }
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export const ACHIEVEMENTS: Achievement[] = [
  // Session-based achievements
  {
    id: 'first-session',
    name: 'First Steps',
    description: 'Complete your first session',
    category: 'sessions',
    icon: '🎯',
    criteria: { type: 'sessions', threshold: 1 },
    rarity: 'common',
  },
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Complete 10 sessions',
    category: 'sessions',
    icon: '🚀',
    criteria: { type: 'sessions', threshold: 10 },
    rarity: 'common',
  },
  {
    id: 'consistent',
    name: 'Consistent',
    description: 'Complete 50 sessions',
    category: 'sessions',
    icon: '⭐',
    criteria: { type: 'sessions', threshold: 50 },
    rarity: 'rare',
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Complete 100 sessions',
    category: 'sessions',
    icon: '💎',
    criteria: { type: 'sessions', threshold: 100 },
    rarity: 'epic',
  },
  {
    id: 'master',
    name: 'Productivity Master',
    description: 'Complete 500 sessions',
    category: 'sessions',
    icon: '👑',
    criteria: { type: 'sessions', threshold: 500 },
    rarity: 'legendary',
  },

  // Streak-based achievements
  {
    id: 'week-streak',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    category: 'streaks',
    icon: '🔥',
    criteria: { type: 'streak', threshold: 7 },
    rarity: 'common',
  },
  {
    id: 'month-streak',
    name: 'Monthly Momentum',
    description: 'Maintain a 30-day streak',
    category: 'streaks',
    icon: '🌟',
    criteria: { type: 'streak', threshold: 30 },
    rarity: 'rare',
  },
  {
    id: 'quarter-streak',
    name: 'Unstoppable',
    description: 'Maintain a 100-day streak',
    category: 'streaks',
    icon: '⚡',
    criteria: { type: 'streak', threshold: 100 },
    rarity: 'epic',
  },
  {
    id: 'year-streak',
    name: 'Legendary Streak',
    description: 'Maintain a 365-day streak',
    category: 'streaks',
    icon: '🏆',
    criteria: { type: 'streak', threshold: 365 },
    rarity: 'legendary',
  },

  // Completion rate achievements
  {
    id: 'high-achiever',
    name: 'High Achiever',
    description: 'Reach 80% completion rate',
    category: 'completion',
    icon: '🎖️',
    criteria: { type: 'completion_rate', threshold: 80 },
    rarity: 'rare',
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Reach 95% completion rate',
    category: 'completion',
    icon: '💯',
    criteria: { type: 'completion_rate', threshold: 95 },
    rarity: 'epic',
  },
  {
    id: 'flawless',
    name: 'Flawless',
    description: 'Reach 100% completion rate (minimum 20 sessions)',
    category: 'completion',
    icon: '✨',
    criteria: { type: 'completion_rate', threshold: 100 },
    rarity: 'legendary',
  },

  // Time-based achievements
  {
    id: 'time-investor-10',
    name: 'Time Investor',
    description: 'Spend 10 hours in focused sessions',
    category: 'time',
    icon: '⏰',
    criteria: { type: 'time_spent', threshold: 10 * 3600 }, // 10 hours in seconds
    rarity: 'common',
  },
  {
    id: 'time-investor-50',
    name: 'Time Devotee',
    description: 'Spend 50 hours in focused sessions',
    category: 'time',
    icon: '⌛',
    criteria: { type: 'time_spent', threshold: 50 * 3600 }, // 50 hours in seconds
    rarity: 'rare',
  },
  {
    id: 'time-investor-100',
    name: 'Time Master',
    description: 'Spend 100 hours in focused sessions',
    category: 'time',
    icon: '⏳',
    criteria: { type: 'time_spent', threshold: 100 * 3600 }, // 100 hours in seconds
    rarity: 'epic',
  },
  {
    id: 'time-investor-500',
    name: 'Time Legend',
    description: 'Spend 500 hours in focused sessions',
    category: 'time',
    icon: '🕰️',
    criteria: { type: 'time_spent', threshold: 500 * 3600 }, // 500 hours in seconds
    rarity: 'legendary',
  },

  // Milestone achievements
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Complete a session before 6 AM',
    category: 'milestones',
    icon: '🌅',
    criteria: { type: 'milestone', threshold: 1 },
    rarity: 'common',
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Complete a session after 10 PM',
    category: 'milestones',
    icon: '🦉',
    criteria: { type: 'milestone', threshold: 1 },
    rarity: 'common',
  },
  {
    id: 'weekend-warrior',
    name: 'Weekend Warrior',
    description: 'Complete 5 sessions on weekends',
    category: 'milestones',
    icon: '🎮',
    criteria: { type: 'milestone', threshold: 5 },
    rarity: 'rare',
  },
]

/**
 * Get achievement by ID
 */
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id)
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.category === category)
}

/**
 * Get achievements by rarity
 */
export function getAchievementsByRarity(rarity: Achievement['rarity']): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.rarity === rarity)
}

/**
 * Check if achievement criteria is met
 */
export function checkAchievementCriteria(
  achievement: Achievement,
  stats: {
    totalSessions: number
    currentStreak: number
    completionRate: number
    totalTimeSpent: number
  }
): boolean {
  switch (achievement.criteria.type) {
    case 'sessions':
      return stats.totalSessions >= achievement.criteria.threshold
    case 'streak':
      return stats.currentStreak >= achievement.criteria.threshold
    case 'completion_rate':
      return stats.completionRate >= achievement.criteria.threshold
    case 'time_spent':
      return stats.totalTimeSpent >= achievement.criteria.threshold
    default:
      return false
  }
}

/**
 * Get rarity color class
 */
export function getRarityColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common':
      return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20'
    case 'rare':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
    case 'epic':
      return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20'
    case 'legendary':
      return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20'
  }
}
