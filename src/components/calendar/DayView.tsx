'use client'

import React from 'react'
import { format } from 'date-fns'
import { Clock, CheckCircle2, Circle, FileText } from 'lucide-react'
import type { Database } from '@/types/supabase'

type Session = Database['public']['Tables']['sessions']['Row']

/**
 * Day View Component
 *
 * Detailed breakdown of a single day showing:
 * - All sessions/breaks for the selected day
 * - Full session content with task lists
 * - Duration and time spent
 * - Completion status
 * - Click to edit session
 *
 * Features:
 * - Chronological timeline layout
 * - Expandable content preview
 * - Task list with completion checkboxes
 * - Edit functionality
 */

interface DayViewProps {
  currentDate: Date
  sessions: Session[]
  onSessionClick: (session: Session) => void
}

export function DayView({ currentDate, sessions, onSessionClick }: DayViewProps) {
  const dateKey = format(currentDate, 'yyyy-MM-dd')
  const daySessions = sessions.filter((s) => s.session_date === dateKey)

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatTimeSpent = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) return `${hours}h ${mins}m ${secs}s`
    if (mins > 0) return `${mins}m ${secs}s`
    return `${secs}s`
  }

  return (
    <div className="h-full overflow-auto p-4 sm:p-6">
      <div className="mx-auto max-w-4xl">
        {/* Day Header */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {daySessions.length === 0
              ? 'No sessions recorded'
              : `${daySessions.length} ${daySessions.length === 1 ? 'session' : 'sessions'}`}
          </p>
        </div>

        {/* Sessions Timeline */}
        <div className="space-y-4">
          {daySessions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
              <FileText className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600" />
              <p className="mt-3 text-slate-600 dark:text-slate-400">No sessions for this day</p>
            </div>
          ) : (
            daySessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSessionClick(session)}
                className={`group w-full rounded-xl border p-6 text-left transition-all hover:shadow-lg ${
                  session.type === 'session'
                    ? 'border-blue-200 bg-blue-50/50 hover:bg-blue-50 dark:border-blue-900/30 dark:bg-blue-900/10 dark:hover:bg-blue-900/20'
                    : 'border-green-200 bg-green-50/50 hover:bg-green-50 dark:border-green-900/30 dark:bg-green-900/10 dark:hover:bg-green-900/20'
                }`}
              >
                {/* Header Row */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {/* Completion Status */}
                    {session.is_completed ? (
                      <CheckCircle2
                        className={`h-6 w-6 ${
                          session.type === 'session'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-green-600 dark:text-green-400'
                        }`}
                      />
                    ) : (
                      <Circle
                        className={`h-6 w-6 ${
                          session.type === 'session'
                            ? 'text-blue-300 dark:text-blue-700'
                            : 'text-green-300 dark:text-green-700'
                        }`}
                      />
                    )}

                    {/* Type Badge */}
                    <div>
                      <span
                        className={`text-base font-bold uppercase ${
                          session.type === 'session'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-green-600 dark:text-green-400'
                        }`}
                      >
                        {session.type}
                      </span>
                    </div>
                  </div>

                  {/* Duration Info */}
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(session.duration)}</span>
                  </div>
                </div>

                {/* Time Spent Bar */}
                {session.time_spent > 0 && (
                  <div className="mb-4">
                    <div className="mb-1 flex justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>Time spent: {formatTimeSpent(session.time_spent)}</span>
                      <span>
                        {Math.round((session.time_spent / (session.duration * 60)) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className={`h-full rounded-full ${
                          session.type === 'session'
                            ? 'bg-blue-600 dark:bg-blue-400'
                            : 'bg-green-600 dark:bg-green-400'
                        }`}
                        style={{
                          width: `${Math.min((session.time_spent / (session.duration * 60)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Content Preview */}
                {session.content && (
                  <div className="mb-3 line-clamp-2 text-sm text-slate-700 dark:text-slate-300">
                    <div dangerouslySetInnerHTML={{ __html: session.content }} />
                  </div>
                )}

                {/* Tasks */}
                {(() => {
                  const tasks = Array.isArray(session.tasks) ? session.tasks as any[] : []
                  return tasks.length > 0 && (
                  <div className="space-y-1 rounded-lg bg-white/50 p-3 dark:bg-slate-800/50">
                    <div className="mb-2 text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
                      Tasks ({tasks.filter((t: any) => t.completed).length}/{tasks.length})
                    </div>
                    {tasks.slice(0, 3).map((task: any) => (
                      <div key={task.id} className="flex items-start gap-2 text-sm">
                        {task.completed ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                        ) : (
                          <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-600" />
                        )}
                        <span
                          className={`${
                            task.completed
                              ? 'text-slate-500 line-through dark:text-slate-500'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {task.text}
                        </span>
                      </div>
                    ))}
                    {tasks.length > 3 && (
                      <div className="pt-1 text-xs text-slate-500 dark:text-slate-500">
                        +{tasks.length - 3} more tasks
                      </div>
                    )}
                  </div>
                )})()}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
