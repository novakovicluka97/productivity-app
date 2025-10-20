'use client'

import React from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns'
import type { Database } from '@/types/supabase'

type Session = Database['public']['Tables']['sessions']['Row']

/**
 * Month View Component
 *
 * Calendar grid showing:
 * - All days of the month with overflow days
 * - Session count badges on days with sessions
 * - Today highlight
 * - Click to view day details
 *
 * Features:
 * - 7-column grid (Sunday to Saturday)
 * - Session count badge (blue for sessions, green for breaks)
 * - Hover effects for interactive days
 * - Current month emphasis
 */

interface MonthViewProps {
  currentDate: Date
  sessions: Session[]
  onDayClick: (date: Date) => void
}

export function MonthView({ currentDate, sessions, onDayClick }: MonthViewProps) {
  // Get all days to display (including overflow from prev/next month)
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Group sessions by date
  const sessionsByDate = sessions.reduce((acc, session) => {
    const dateKey = session.session_date // Already in YYYY-MM-DD format
    if (!acc[dateKey]) {
      acc[dateKey] = { sessionCount: 0, breakCount: 0 }
    }
    if (session.type === 'session') {
      acc[dateKey].sessionCount++
    } else {
      acc[dateKey].breakCount++
    }
    return acc
  }, {} as Record<string, { sessionCount: number; breakCount: number }>)

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="h-full overflow-auto p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Calendar Grid */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
            {weekDays.map((day) => (
              <div
                key={day}
                className="border-r border-slate-200 py-3 text-center text-xs font-semibold uppercase text-slate-600 last:border-r-0 dark:border-slate-700 dark:text-slate-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const dateKey = format(day, 'yyyy-MM-dd')
              const dayStats = sessionsByDate[dateKey] || { sessionCount: 0, breakCount: 0 }
              const hasActivity = dayStats.sessionCount > 0 || dayStats.breakCount > 0
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isDayToday = isToday(day)

              return (
                <button
                  key={index}
                  onClick={() => onDayClick(day)}
                  disabled={!hasActivity}
                  className={`relative min-h-[80px] border-b border-r border-slate-200 p-2 text-left transition-colors last:border-r-0 dark:border-slate-700 sm:min-h-[100px] sm:p-3 ${
                    isCurrentMonth
                      ? 'bg-white dark:bg-slate-800'
                      : 'bg-slate-50 dark:bg-slate-900'
                  } ${
                    hasActivity
                      ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700'
                      : 'cursor-default'
                  }`}
                >
                  {/* Day Number */}
                  <div
                    className={`mb-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                      isDayToday
                        ? 'bg-blue-600 text-white'
                        : isCurrentMonth
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    {format(day, 'd')}
                  </div>

                  {/* Session Badges */}
                  {hasActivity && (
                    <div className="flex flex-wrap gap-1">
                      {dayStats.sessionCount > 0 && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                          {dayStats.sessionCount}
                          <span className="ml-1 hidden sm:inline">
                            {dayStats.sessionCount === 1 ? 'session' : 'sessions'}
                          </span>
                        </span>
                      )}
                      {dayStats.breakCount > 0 && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-600 dark:bg-green-900/30 dark:text-green-400">
                          {dayStats.breakCount}
                          <span className="ml-1 hidden sm:inline">
                            {dayStats.breakCount === 1 ? 'break' : 'breaks'}
                          </span>
                        </span>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
