'use client'

import { GoalList } from '@/components/goals/GoalList'
import { AchievementGrid } from '@/components/achievements/AchievementGrid'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Target, Trophy } from 'lucide-react'
import { TopHeader } from '@/components/layout/TopHeader'
import { ProtectedHeaderPortal } from '@/components/layout/ProtectedHeaderPortal'

/**
 * Goals Page
 *
 * Displays user goals and achievements in tabbed layout:
 * - Goals tab: Active and completed goals with progress tracking
 * - Achievements tab: Unlocked and locked achievements
 */

// Mock user achievements data - in production, this would come from Supabase
const mockUserAchievements = [
  { achievement_id: 'first-session', unlocked_at: new Date('2024-01-15').toISOString() },
  { achievement_id: 'getting-started', unlocked_at: new Date('2024-02-01').toISOString() },
  { achievement_id: 'week-streak', unlocked_at: new Date('2024-02-10').toISOString() },
  { achievement_id: 'time-investor-10', unlocked_at: new Date('2024-02-20').toISOString() },
]

export default function GoalsPage() {
  return (
    <>
      <ProtectedHeaderPortal>
        <TopHeader />
      </ProtectedHeaderPortal>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 dark:from-slate-900 dark:via-gray-900 dark:to-slate-900">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Goals & Achievements
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Track your progress and celebrate your wins
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="goals" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="space-y-6">
            <GoalList />
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <AchievementGrid userAchievements={mockUserAchievements} />
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </>
  )
}
