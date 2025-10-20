'use client'

import { useState } from 'react'
import { AchievementBadge } from './AchievementBadge'
import { ACHIEVEMENTS, getAchievementsByCategory, type AchievementCategory } from './achievements'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Zap, Target, Clock, Star } from 'lucide-react'

interface UserAchievement {
  achievement_id: string
  unlocked_at: string
}

interface AchievementGridProps {
  userAchievements: UserAchievement[]
}

export function AchievementGrid({ userAchievements }: AchievementGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all')

  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievement_id))
  const unlockedCount = userAchievements.length
  const totalCount = ACHIEVEMENTS.length
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100)

  const getAchievementUnlockedAt = (id: string) => {
    const userAch = userAchievements.find((ua) => ua.achievement_id === id)
    return userAch?.unlocked_at
  }

  const filteredAchievements =
    selectedCategory === 'all'
      ? ACHIEVEMENTS
      : getAchievementsByCategory(selectedCategory)

  const getCategoryIcon = (category: AchievementCategory | 'all') => {
    switch (category) {
      case 'sessions':
        return Target
      case 'streaks':
        return Zap
      case 'completion':
        return Trophy
      case 'time':
        return Clock
      case 'milestones':
        return Star
      default:
        return Trophy
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Achievements</h2>
          <p className="text-sm text-muted-foreground">
            {unlockedCount} of {totalCount} unlocked ({completionPercentage}%)
          </p>
        </div>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Overall Progress</CardTitle>
          <CardDescription>Keep completing sessions to unlock more achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {unlockedCount} / {totalCount}
              </span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as typeof selectedCategory)}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all" className="flex items-center gap-1">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">All</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="streaks" className="flex items-center gap-1">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Streaks</span>
          </TabsTrigger>
          <TabsTrigger value="completion" className="flex items-center gap-1">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Completion</span>
          </TabsTrigger>
          <TabsTrigger value="time" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Time</span>
          </TabsTrigger>
          <TabsTrigger value="milestones" className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Milestones</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {filteredAchievements.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                unlocked={unlockedIds.has(achievement.id)}
                unlockedAt={getAchievementUnlockedAt(achievement.id)}
              />
            ))}
          </div>

          {filteredAchievements.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Trophy className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No achievements in this category yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
