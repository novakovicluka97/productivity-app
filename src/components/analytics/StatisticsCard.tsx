/**
 * StatisticsCard Component
 *
 * Displays a single metric with icon, value, trend indicator, and change percentage
 */

'use client'

import React from 'react'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface StatisticsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  changePercentage?: number
  subtitle?: string
  gradientFrom?: string
  gradientTo?: string
}

export function StatisticsCard({
  title,
  value,
  icon: Icon,
  trend = 'neutral',
  changePercentage,
  subtitle,
  gradientFrom = 'from-blue-500',
  gradientTo = 'to-purple-600',
}: StatisticsCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400'
      case 'down':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-slate-600 dark:text-slate-400'
    }
  }

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null

  return (
    <Card className="relative overflow-hidden border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80">
      {/* Gradient background accent */}
      <div
        className={cn(
          'absolute right-0 top-0 h-full w-2 bg-gradient-to-b opacity-80',
          gradientFrom,
          gradientTo
        )}
      />

      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {title}
            </p>
            {subtitle && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                {subtitle}
              </p>
            )}
          </div>
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br shadow-md',
              gradientFrom,
              gradientTo
            )}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {value}
            </p>
          </div>

          {changePercentage !== undefined && TrendIcon && (
            <div className={cn('flex items-center gap-1 text-sm font-medium', getTrendColor())}>
              <TrendIcon className="h-4 w-4" />
              <span>{Math.abs(changePercentage)}%</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
