/**
 * ProductivityHeatmap Component
 *
 * GitHub-style heatmap showing productivity by hour and day of week
 */

'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface HeatmapData {
  hour: number // 0-23
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  count: number
}

export interface ProductivityHeatmapProps {
  data: HeatmapData[]
  title?: string
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function ProductivityHeatmap({
  data,
  title = 'Productivity Heatmap',
}: ProductivityHeatmapProps) {
  // Find max count for normalization
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  // Get count for specific hour and day
  const getCount = (hour: number, day: number) => {
    const item = data.find((d) => d.hour === hour && d.dayOfWeek === day)
    return item?.count || 0
  }

  // Get color intensity based on count
  const getColorClass = (count: number) => {
    const intensity = count / maxCount

    if (count === 0) {
      return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
    }

    if (intensity <= 0.25) {
      return 'bg-blue-200 dark:bg-blue-900 border-blue-300 dark:border-blue-800'
    }
    if (intensity <= 0.5) {
      return 'bg-blue-400 dark:bg-blue-700 border-blue-500 dark:border-blue-600'
    }
    if (intensity <= 0.75) {
      return 'bg-blue-600 dark:bg-blue-500 border-blue-700 dark:border-blue-400'
    }
    return 'bg-blue-800 dark:bg-blue-300 border-blue-900 dark:border-blue-200'
  }

  // Format hour for display
  const formatHour = (hour: number) => {
    if (hour === 0) return '12a'
    if (hour < 12) return `${hour}a`
    if (hour === 12) return '12p'
    return `${hour - 12}p`
  }

  return (
    <Card className="border-slate-200 bg-white/80 p-6 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80">
      <h3 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>

      <div className="space-y-4">
        {/* Legend */}
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="h-4 w-4 rounded border bg-slate-100 dark:bg-slate-800" />
            <div className="h-4 w-4 rounded border bg-blue-200 dark:bg-blue-900" />
            <div className="h-4 w-4 rounded border bg-blue-400 dark:bg-blue-700" />
            <div className="h-4 w-4 rounded border bg-blue-600 dark:bg-blue-500" />
            <div className="h-4 w-4 rounded border bg-blue-800 dark:bg-blue-300" />
          </div>
          <span>More</span>
        </div>

        {/* Heatmap grid */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="grid gap-1" style={{ gridTemplateColumns: 'auto repeat(24, 1fr)' }}>
              {/* Header row - Hours */}
              <div className="h-8" /> {/* Empty corner */}
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="flex h-8 items-center justify-center text-xs text-slate-600 dark:text-slate-400"
                >
                  {hour % 3 === 0 ? formatHour(hour) : ''}
                </div>
              ))}

              {/* Data rows - Days */}
              {DAYS.map((day, dayIndex) => (
                <React.Fragment key={day}>
                  {/* Day label */}
                  <div className="flex h-8 items-center pr-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                    {day}
                  </div>

                  {/* Hour cells */}
                  {HOURS.map((hour) => {
                    const count = getCount(hour, dayIndex)
                    return (
                      <div
                        key={`${day}-${hour}`}
                        className="group relative h-8"
                      >
                        <div
                          className={cn(
                            'h-full w-full rounded border transition-all hover:scale-110 hover:shadow-md',
                            getColorClass(count)
                          )}
                        />

                        {/* Tooltip */}
                        <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-sm shadow-lg backdrop-blur-sm group-hover:block dark:border-slate-700 dark:bg-slate-800/95">
                          <p className="font-medium text-slate-900 dark:text-white">
                            {day} {formatHour(hour)}
                          </p>
                          <p className="text-slate-600 dark:text-slate-400">
                            {count} session{count !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-200 pt-4 dark:border-slate-700">
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Most Productive Hour
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              {data.length > 0
                ? formatHour(
                    data.reduce((max, curr) =>
                      curr.count > max.count ? curr : max
                    ).hour
                  )
                : 'N/A'}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Most Productive Day
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              {data.length > 0
                ? DAYS[
                    data.reduce((max, curr) =>
                      curr.count > max.count ? curr : max
                    ).dayOfWeek
                  ]
                : 'N/A'}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Peak Sessions
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              {data.length > 0 ? maxCount : 0}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
