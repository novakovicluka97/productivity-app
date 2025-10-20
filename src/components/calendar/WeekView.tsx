'use client'

import React from 'react'
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isToday, isSameDay } from 'date-fns'
import { Clock, CheckCircle2, Circle } from 'lucide-react'
import type { Database } from '@/types/supabase'

type Session = Database['public']['Tables']['sessions']['Row']

/**
 * Week View Component
 *
 * 7-day timeline showing:
 * - All days of the week (Sunday to Saturday)
 * - Session blocks for each day with visual indicators
 * - Session duration and completion status
 * - Click to view session details
 *
 * Features:
 * - Timeline layout with sessions stacked vertically
 * - Color-coded blocks (blue for sessions, green for breaks)
 * - Completion indicators (checkmark for completed)
 * - Duration display
 */

interface WeekViewProps {
  currentDate: Date
  sessions: Session[]
  onSessionClick: (session: Session) => void
}

export function WeekView({ currentDate, sessions, onSessionClick }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate)
  const weekEnd = endOfWeek(currentDate)
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Group sessions by date
  const sessionsByDate = sessions.reduce((acc, session) => {
    const dateKey = session.session_date
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(session)
    return acc
  }, {} as Record<string, Session[]>)

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="h-full overflow-auto p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Week Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {days.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const daySessions = sessionsByDate[dateKey] || []
            const isDayToday = isToday(day)

            return (
              <div
                key={dateKey}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
              >
                {/* Day Header */}
                <div
                  className={`border-b px-4 py-3 ${
                    isDayToday
                      ? 'border-blue-200 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-900/20'
                      : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900'
                  }`}
                >
                  <div className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
                    {format(day, 'EEE')}
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      isDayToday
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {format(day, 'd')}
                  </div>
                </div>

                {/* Sessions List */}
                <div className="space-y-2 p-3">
                  {daySessions.length === 0 ? (
                    <div className="py-6 text-center text-sm text-slate-400 dark:text-slate-600">
                      No sessions
                    </div>
                  ) : (
                    daySessions.map((session) => {
                      // Type-safe task handling (tasks is stored as Json in Supabase)
                      const tasksArray = Array.isArray(session.tasks)
                        ? (session.tasks as Array<{ id: string; text: string; completed: boolean; created_at: string }>)
                        : []

                      return (
                        <button
                          key={session.id}
                          onClick={() => onSessionClick(session)}
                          className={`group w-full rounded-lg border p-3 text-left transition-all hover:shadow-md ${
                            session.type === 'session'
                              ? 'border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-900/30 dark:bg-blue-900/20 dark:hover:bg-blue-900/30'
                              : 'border-green-200 bg-green-50 hover:bg-green-100 dark:border-green-900/30 dark:bg-green-900/20 dark:hover:bg-green-900/30'
                          }`}
                        >
                          {/* Session Type Badge */}
                          <div className="mb-2 flex items-center justify-between">
                            <span
                              className={`text-xs font-semibold uppercase ${
                                session.type === 'session'
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-green-600 dark:text-green-400'
                              }`}
                            >
                              {session.type}
                            </span>
                            {session.is_completed ? (
                              <CheckCircle2
                                className={`h-4 w-4 ${
                                  session.type === 'session'
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-green-600 dark:text-green-400'
                                }`}
                              />
                            ) : (
                              <Circle
                                className={`h-4 w-4 ${
                                  session.type === 'session'
                                    ? 'text-blue-300 dark:text-blue-700'
                                    : 'text-green-300 dark:text-green-700'
                                }`}
                              />
                            )}
                          </div>

                          {/* Duration */}
                          <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                            <Clock className="h-3 w-3" />
                            <span>{formatDuration(session.duration)}</span>
                          </div>

                          {/* Task Count (if has tasks) */}
                          {tasksArray.length > 0 && (
                            <div className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                              {tasksArray.filter((t) => t.completed).length}/{tasksArray.length}{' '}
                              tasks
                            </div>
                          )}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
