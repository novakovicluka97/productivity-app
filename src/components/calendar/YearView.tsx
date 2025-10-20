'use client'

import React from 'react'
import { startOfYear, endOfYear, eachDayOfInterval, format, isToday, getMonth } from 'date-fns'
import type { Database } from '@/types/supabase'

type Session = Database['public']['Tables']['sessions']['Row']

/**
 * Year View Component
 *
 * GitHub-style heatmap showing:
 * - All days of the year in a grid
 * - Activity intensity based on session count
 * - Hover tooltips with details
 * - Click to view day details
 *
 * Features:
 * - Color intensity scale (0-4+ sessions)
 * - Month labels
 * - Responsive grid layout
 * - Today highlight
 */

interface YearViewProps {
  currentDate: Date
  sessions: Session[]
  onDayClick: (date: Date) => void
}

export function YearView({ currentDate, sessions, onDayClick }: YearViewProps) {
  const yearStart = startOfYear(currentDate)
  const yearEnd = endOfYear(currentDate)
  const days = eachDayOfInterval({ start: yearStart, end: yearEnd })

  // Group sessions by date and count
  const sessionsByDate = sessions.reduce((acc, session) => {
    const dateKey = session.session_date
    if (!acc[dateKey]) {
      acc[dateKey] = 0
    }
    acc[dateKey]++
    return acc
  }, {} as Record<string, number>)

  // Get intensity level (0-4) based on session count
  const getIntensity = (count: number): number => {
    if (count === 0) return 0
    if (count === 1) return 1
    if (count === 2) return 2
    if (count === 3) return 3
    return 4
  }

  // Get color class based on intensity
  const getColorClass = (intensity: number): string => {
    switch (intensity) {
      case 0:
        return 'bg-slate-100 dark:bg-slate-800'
      case 1:
        return 'bg-blue-200 dark:bg-blue-900/40'
      case 2:
        return 'bg-blue-400 dark:bg-blue-700/60'
      case 3:
        return 'bg-blue-600 dark:bg-blue-600/80'
      case 4:
        return 'bg-blue-800 dark:bg-blue-500'
      default:
        return 'bg-slate-100 dark:bg-slate-800'
    }
  }

  // Group days by week
  const weeks: Date[][] = []
  let currentWeek: Date[] = []

  days.forEach((day, index) => {
    const dayOfWeek = day.getDay()

    // Start a new week on Sunday (except for first week)
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek)
      currentWeek = []
    }

    currentWeek.push(day)

    // Last day - push remaining week
    if (index === days.length - 1) {
      weeks.push(currentWeek)
    }
  })

  // Get month labels
  const monthLabels: { month: string; weekIndex: number }[] = []
  let lastMonth = -1

  weeks.forEach((week, weekIndex) => {
    const firstDay = week[0]
    const month = getMonth(firstDay)

    if (month !== lastMonth) {
      monthLabels.push({
        month: format(firstDay, 'MMM'),
        weekIndex,
      })
      lastMonth = month
    }
  })

  return (
    <div className="h-full overflow-auto p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          {/* Legend */}
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {format(currentDate, 'yyyy')} Activity
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 dark:text-slate-400">Less</span>
              {[0, 1, 2, 3, 4].map((intensity) => (
                <div
                  key={intensity}
                  className={`h-3 w-3 rounded-sm ${getColorClass(intensity)}`}
                  title={`${intensity === 0 ? 'No' : intensity === 4 ? '4+' : intensity} sessions`}
                />
              ))}
              <span className="text-xs text-slate-600 dark:text-slate-400">More</span>
            </div>
          </div>

          {/* Month Labels */}
          <div className="relative mb-2 ml-6">
            <div className="flex">
              {monthLabels.map((label, index) => (
                <div
                  key={index}
                  className="text-xs font-medium text-slate-600 dark:text-slate-400"
                  style={{
                    marginLeft: index === 0 ? '0' : `${(label.weekIndex - monthLabels[index - 1].weekIndex) * 16}px`,
                  }}
                >
                  {label.month}
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="overflow-x-auto">
            <div className="inline-flex gap-1">
              {/* Day Labels */}
              <div className="flex flex-col gap-1 pr-2">
                <div className="h-3" /> {/* Spacer for alignment */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <div
                    key={day}
                    className={`flex h-3 items-center text-xs text-slate-600 dark:text-slate-400 ${
                      index % 2 === 0 ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Weeks Grid */}
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {/* Render 7 cells (Sun-Sat) */}
                  {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
                    const day = week.find((d) => d.getDay() === dayOfWeek)

                    if (!day) {
                      // Empty cell for days outside the year
                      return <div key={dayOfWeek} className="h-3 w-3" />
                    }

                    const dateKey = format(day, 'yyyy-MM-dd')
                    const sessionCount = sessionsByDate[dateKey] || 0
                    const intensity = getIntensity(sessionCount)
                    const isDayToday = isToday(day)

                    return (
                      <button
                        key={dayOfWeek}
                        onClick={() => sessionCount > 0 && onDayClick(day)}
                        disabled={sessionCount === 0}
                        className={`group relative h-3 w-3 rounded-sm transition-all ${getColorClass(intensity)} ${
                          isDayToday ? 'ring-2 ring-blue-600 ring-offset-1 dark:ring-blue-400' : ''
                        } ${
                          sessionCount > 0
                            ? 'cursor-pointer hover:ring-2 hover:ring-slate-400 hover:ring-offset-1'
                            : 'cursor-default'
                        }`}
                        title={`${format(day, 'MMM d, yyyy')}: ${sessionCount} ${sessionCount === 1 ? 'session' : 'sessions'}`}
                      >
                        {/* Tooltip */}
                        <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg group-hover:block dark:bg-slate-700">
                          <div className="font-semibold">{format(day, 'MMM d, yyyy')}</div>
                          <div className="text-slate-300 dark:text-slate-400">
                            {sessionCount} {sessionCount === 1 ? 'session' : 'sessions'}
                          </div>
                          {/* Arrow */}
                          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-700" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Statistics Summary */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-200 pt-6 dark:border-slate-700 sm:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {sessions.length}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {Object.keys(sessionsByDate).length}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Active Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {sessions.filter((s) => s.is_completed).length}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {sessions.length > 0
                  ? Math.round((sessions.filter((s) => s.is_completed).length / sessions.length) * 100)
                  : 0}
                %
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Completion Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
