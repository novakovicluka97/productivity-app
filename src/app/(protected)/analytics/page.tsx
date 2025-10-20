/**
 * Analytics Dashboard Page
 *
 * Comprehensive analytics view showing:
 * - Key statistics cards
 * - Time series charts
 * - Completion rate visualization
 * - Productivity heatmap
 * - AI-generated insights
 */

'use client'

import React, { useMemo, useState } from 'react'
import { useSessionStatistics } from '@/hooks/useSessions'
import { StatisticsCard } from '@/components/analytics/StatisticsCard'
import { TimeSeriesChart } from '@/components/analytics/TimeSeriesChart'
import { CompletionRateChart } from '@/components/analytics/CompletionRateChart'
import { ProductivityHeatmap } from '@/components/analytics/ProductivityHeatmap'
import { InsightsPanel, type Insight } from '@/components/analytics/InsightsPanel'
import { TopHeader } from '@/components/layout/TopHeader'
import { ProtectedHeaderPortal } from '@/components/layout/ProtectedHeaderPortal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart3,
  Clock,
  CheckCircle2,
  Target,
  TrendingUp,
  Calendar,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'

type DateRange = '7' | '30' | '90' | 'all'

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30')

  // Calculate date range
  const { startDate, endDate } = useMemo(() => {
    const end = endOfDay(new Date())
    let start: Date

    switch (dateRange) {
      case '7':
        start = startOfDay(subDays(end, 7))
        break
      case '30':
        start = startOfDay(subDays(end, 30))
        break
      case '90':
        start = startOfDay(subDays(end, 90))
        break
      case 'all':
        start = startOfDay(new Date('2020-01-01')) // Far back date
        break
    }

    return {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
    }
  }, [dateRange])

  // Fetch statistics
  const { data: stats, isLoading, error } = useSessionStatistics(startDate, endDate)

  // Generate mock time series data (will be replaced with real data from API)
  const timeSeriesData = useMemo(() => {
    if (!stats) return []

    // For now, return empty array - will be populated when backend provides daily breakdown
    // TODO: Implement getSessionsByDay aggregation in backend
    return []
  }, [stats])

  // Generate mock heatmap data (will be replaced with real data from API)
  const heatmapData = useMemo(() => {
    if (!stats) return []

    // For now, return empty array - will be populated when backend provides hourly breakdown
    // TODO: Implement getSessionsByHourAndDay aggregation in backend
    return []
  }, [stats])

  // Generate insights based on statistics
  const insights = useMemo((): Insight[] => {
    if (!stats || stats.totalSessions === 0) return []

    const generatedInsights: Insight[] = []

    // Completion rate insight
    if (stats.completionRate >= 80) {
      generatedInsights.push({
        type: 'achievement',
        icon: 'award',
        title: 'Excellent Completion Rate!',
        description: `You're completing ${stats.completionRate.toFixed(1)}% of your sessions. Keep up the great work!`,
      })
    } else if (stats.completionRate < 50) {
      generatedInsights.push({
        type: 'warning',
        icon: 'alert',
        title: 'Low Completion Rate',
        description: `Only ${stats.completionRate.toFixed(1)}% of sessions completed. Try setting more realistic session durations.`,
      })
    }

    // Total sessions insight
    if (stats.totalSessions >= 50) {
      generatedInsights.push({
        type: 'success',
        icon: 'trending',
        title: 'Productivity Streak',
        description: `You've completed ${stats.totalSessions} sessions! You're building a strong productivity habit.`,
      })
    }

    // Average time insight
    const avgMinutes = Math.round(stats.averageTimePerSession / 60)
    if (avgMinutes > 0) {
      if (avgMinutes >= 25 && avgMinutes <= 30) {
        generatedInsights.push({
          type: 'success',
          icon: 'target',
          title: 'Optimal Session Length',
          description: `Your average session of ${avgMinutes} minutes aligns with the Pomodoro Technique's recommended 25-minute focus periods.`,
        })
      } else if (avgMinutes < 15) {
        generatedInsights.push({
          type: 'info',
          icon: 'clock',
          title: 'Short Sessions',
          description: `Average session length is ${avgMinutes} minutes. Consider longer sessions for deep work tasks.`,
        })
      } else if (avgMinutes > 60) {
        generatedInsights.push({
          type: 'info',
          icon: 'clock',
          title: 'Long Sessions',
          description: `Average session length is ${avgMinutes} minutes. Consider adding more breaks to maintain focus.`,
        })
      }
    }

    // Session type balance
    if (stats.sessionsByType.session > stats.sessionsByType.break * 3) {
      generatedInsights.push({
        type: 'warning',
        icon: 'alert',
        title: 'Take More Breaks',
        description: 'You have significantly more work sessions than breaks. Regular breaks improve productivity and prevent burnout.',
      })
    }

    // Time spent insight
    const totalHours = Math.round(stats.totalTimeSpent / 3600)
    if (totalHours > 20) {
      generatedInsights.push({
        type: 'achievement',
        icon: 'award',
        title: 'Dedicated Focus Time',
        description: `You've logged ${totalHours} hours of focused work. That's impressive dedication!`,
      })
    }

    return generatedInsights
  }, [stats])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-900">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Loading analytics...
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-900">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600 dark:text-red-400" />
          <p className="mt-4 text-lg text-slate-900 dark:text-white">
            Error loading analytics
          </p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {error.message || 'Please try again later'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <ProtectedHeaderPortal>
        <TopHeader />
      </ProtectedHeaderPortal>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 dark:from-slate-900 dark:via-gray-900 dark:to-slate-900">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Analytics Dashboard
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Track your productivity insights and trends
              </p>
            </div>
          </div>

          {/* Date range selector */}
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
              <SelectTrigger className="w-48 border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Statistics Cards - 2 rows of 3 */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatisticsCard
            title="Total Sessions"
            value={stats?.totalSessions || 0}
            icon={BarChart3}
            trend="neutral"
            subtitle="Across all types"
            gradientFrom="from-blue-500"
            gradientTo="to-blue-600"
          />

          <StatisticsCard
            title="Completed Sessions"
            value={stats?.completedSessions || 0}
            icon={CheckCircle2}
            trend={
              stats && stats.completionRate >= 80
                ? 'up'
                : stats && stats.completionRate < 50
                ? 'down'
                : 'neutral'
            }
            changePercentage={stats?.completionRate}
            subtitle="Success rate"
            gradientFrom="from-green-500"
            gradientTo="to-emerald-600"
          />

          <StatisticsCard
            title="Total Time Spent"
            value={`${Math.round((stats?.totalTimeSpent || 0) / 3600)}h`}
            icon={Clock}
            trend="neutral"
            subtitle="Hours of focused work"
            gradientFrom="from-purple-500"
            gradientTo="to-purple-600"
          />

          <StatisticsCard
            title="Work Sessions"
            value={stats?.sessionsByType.session || 0}
            icon={Target}
            trend="neutral"
            subtitle="Focus sessions"
            gradientFrom="from-orange-500"
            gradientTo="to-red-600"
          />

          <StatisticsCard
            title="Break Sessions"
            value={stats?.sessionsByType.break || 0}
            icon={TrendingUp}
            trend="neutral"
            subtitle="Rest periods"
            gradientFrom="from-cyan-500"
            gradientTo="to-blue-600"
          />

          <StatisticsCard
            title="Avg Session Time"
            value={`${Math.round((stats?.averageTimePerSession || 0) / 60)}m`}
            icon={Clock}
            trend="neutral"
            subtitle="Minutes per session"
            gradientFrom="from-pink-500"
            gradientTo="to-rose-600"
          />
        </div>

        {/* Charts - 2 columns */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <TimeSeriesChart
            data={timeSeriesData}
            title="Session Activity Over Time"
            showBreaks={true}
            chartType="area"
          />

          <CompletionRateChart
            completed={stats?.completedSessions || 0}
            incomplete={(stats?.totalSessions || 0) - (stats?.completedSessions || 0)}
            title="Session Completion Rate"
          />
        </div>

        {/* Heatmap and Insights - 2 columns */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ProductivityHeatmap
            data={heatmapData}
            title="Productivity Heatmap"
          />

          <InsightsPanel
            insights={insights}
            title="Productivity Insights"
          />
        </div>
      </div>
    </div>
    </>
  )
}
