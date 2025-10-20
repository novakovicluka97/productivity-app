'use client'

import React from 'react'
import { format } from 'date-fns'
import { X, Clock, CheckCircle2, Circle, Calendar } from 'lucide-react'
import type { Database } from '@/types/supabase'

type Session = Database['public']['Tables']['sessions']['Row']

/**
 * Session Detail Modal Component
 *
 * Modal for viewing and editing session details:
 * - Full session information
 * - Rich text content display
 * - Task list with completion status
 * - Duration and time spent
 * - Edit functionality (future)
 *
 * Features:
 * - Full-screen overlay
 * - Scrollable content
 * - Close on backdrop click
 * - Keyboard navigation (Escape to close)
 */

interface SessionDetailModalProps {
  session: Session | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (session: Session) => void
}

export function SessionDetailModal({ session, isOpen, onClose, onEdit }: SessionDetailModalProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen || !session) return null

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

  const completedTasks = session.tasks?.filter((t) => t.completed).length || 0
  const totalTasks = session.tasks?.length || 0
  const completionPercentage = session.time_spent / (session.duration * 60)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Modal Container */}
      <div className="relative z-10 mx-4 w-full max-w-3xl">
        <div className="max-h-[90vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
          {/* Header */}
          <div
            className={`border-b px-6 py-4 ${
              session.type === 'session'
                ? 'border-blue-200 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-900/20'
                : 'border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/20'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {session.is_completed ? (
                  <CheckCircle2
                    className={`h-8 w-8 ${
                      session.type === 'session'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}
                  />
                ) : (
                  <Circle
                    className={`h-8 w-8 ${
                      session.type === 'session'
                        ? 'text-blue-300 dark:text-blue-700'
                        : 'text-green-300 dark:text-green-700'
                    }`}
                  />
                )}
                <div>
                  <h2
                    className={`text-2xl font-bold uppercase ${
                      session.type === 'session'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}
                  >
                    {session.type}
                  </h2>
                  <div className="mt-1 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(session.session_date), 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="rounded-lg p-2 transition-colors hover:bg-white/50 dark:hover:bg-slate-700/50"
                aria-label="Close modal"
              >
                <X className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[calc(90vh-200px)] overflow-y-auto p-6">
            {/* Duration and Time Spent */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                <div className="mb-1 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span>Planned Duration</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatDuration(session.duration)}
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                <div className="mb-1 text-sm text-slate-600 dark:text-slate-400">Time Spent</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatTimeSpent(session.time_spent)}
                </div>
                <div className="mt-2">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className={`h-full rounded-full ${
                        session.type === 'session'
                          ? 'bg-blue-600 dark:bg-blue-400'
                          : 'bg-green-600 dark:bg-green-400'
                      }`}
                      style={{
                        width: `${Math.min(completionPercentage * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                    {Math.round(completionPercentage * 100)}% completed
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            {session.content && (
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-semibold uppercase text-slate-600 dark:text-slate-400">
                  Content
                </h3>
                <div
                  className="prose prose-sm max-w-none rounded-lg bg-slate-50 p-4 dark:bg-slate-900 dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: session.content }}
                />
              </div>
            )}

            {/* Tasks */}
            {session.tasks && session.tasks.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center justify-between text-sm font-semibold uppercase text-slate-600 dark:text-slate-400">
                  <span>Tasks</span>
                  <span>
                    {completedTasks}/{totalTasks} completed
                  </span>
                </h3>
                <div className="space-y-2 rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                  {session.tasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-3">
                      {task.completed ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
                      ) : (
                        <Circle className="mt-0.5 h-5 w-5 shrink-0 text-slate-400 dark:text-slate-600" />
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
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-700">
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Close
              </button>
              {onEdit && (
                <button
                  onClick={() => onEdit(session)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                    session.type === 'session'
                      ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                      : 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
                  }`}
                >
                  Edit Session
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
