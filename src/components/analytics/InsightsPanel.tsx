/**
 * InsightsPanel Component
 *
 * Displays AI-generated insights and recommendations based on session data
 */

'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import {
  Lightbulb,
  TrendingUp,
  Clock,
  Target,
  Award,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Insight {
  type: 'success' | 'warning' | 'info' | 'achievement'
  icon: 'lightbulb' | 'trending' | 'clock' | 'target' | 'award' | 'alert'
  title: string
  description: string
}

export interface InsightsPanelProps {
  insights: Insight[]
  title?: string
}

const iconMap = {
  lightbulb: Lightbulb,
  trending: TrendingUp,
  clock: Clock,
  target: Target,
  award: Award,
  alert: AlertCircle,
}

const typeStyles = {
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-600 dark:text-green-400',
    title: 'text-green-900 dark:text-green-100',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: 'text-yellow-600 dark:text-yellow-400',
    title: 'text-yellow-900 dark:text-yellow-100',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    title: 'text-blue-900 dark:text-blue-100',
  },
  achievement: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'text-purple-600 dark:text-purple-400',
    title: 'text-purple-900 dark:text-purple-100',
  },
}

export function InsightsPanel({
  insights,
  title = 'Productivity Insights',
}: InsightsPanelProps) {
  return (
    <Card className="border-slate-200 bg-white/80 p-6 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80">
      <div className="mb-6 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h3>
      </div>

      <div className="space-y-4">
        {insights.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mb-3 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <AlertCircle className="h-6 w-6 text-slate-400" />
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Not enough data to generate insights yet.
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
              Complete more sessions to see personalized recommendations.
            </p>
          </div>
        ) : (
          insights.map((insight, index) => {
            const Icon = iconMap[insight.icon]
            const styles = typeStyles[insight.type]

            return (
              <div
                key={index}
                className={cn(
                  'rounded-lg border p-4 transition-all hover:shadow-md',
                  styles.bg,
                  styles.border
                )}
              >
                <div className="flex gap-3">
                  <div className={cn('flex-shrink-0', styles.icon)}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1">
                    <h4 className={cn('mb-1 font-semibold', styles.title)}>
                      {insight.title}
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {insights.length > 0 && (
        <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Insights are generated based on your session history and activity patterns.
            Keep tracking your sessions to get more personalized recommendations.
          </p>
        </div>
      )}
    </Card>
  )
}
