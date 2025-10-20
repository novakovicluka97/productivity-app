'use client'

import React from 'react'
import { format } from 'date-fns'
import { Clock, Calendar, Copy, Trash2, Edit, Users, Lock } from 'lucide-react'
import type { SessionTemplate } from '@/lib/supabase/types'

/**
 * Template Card Component
 *
 * Individual template preview card showing:
 * - Template name and description
 * - Session/break count summary
 * - Total duration
 * - Usage count
 * - Owner indicator (public/private)
 * - Action buttons (apply, edit, duplicate, delete)
 */

interface TemplateCardProps {
  template: SessionTemplate
  isOwner: boolean
  onApply: (template: SessionTemplate) => void
  onEdit?: (template: SessionTemplate) => void
  onDuplicate: (template: SessionTemplate) => void
  onDelete?: (template: SessionTemplate) => void
}

export function TemplateCard({
  template,
  isOwner,
  onApply,
  onEdit,
  onDuplicate,
  onDelete,
}: TemplateCardProps) {
  const sessionCount = template.configuration.filter((c) => c.type === 'session').length
  const breakCount = template.configuration.filter((c) => c.type === 'break').length
  const totalDuration = template.configuration.reduce((sum, c) => sum + c.duration, 0)

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50 p-4 dark:border-slate-700 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="mb-2 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {template.name}
            </h3>
            {template.description && (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {template.description}
              </p>
            )}
          </div>
          <div className="ml-3 flex items-center gap-1">
            {template.is_public ? (
              <div className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Users className="h-3 w-3" />
                <span>Public</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                <Lock className="h-3 w-3" />
                <span>Private</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Stats Grid */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <div className="mb-1 text-xs font-medium uppercase text-slate-600 dark:text-slate-400">
              Sessions
            </div>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {sessionCount}
            </div>
          </div>
          <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
            <div className="mb-1 text-xs font-medium uppercase text-slate-600 dark:text-slate-400">
              Breaks
            </div>
            <div className="text-xl font-bold text-green-600 dark:text-green-400">
              {breakCount}
            </div>
          </div>
          <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
            <div className="mb-1 text-xs font-medium uppercase text-slate-600 dark:text-slate-400">
              Duration
            </div>
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {formatDuration(totalDuration)}
            </div>
          </div>
        </div>

        {/* Configuration Preview */}
        <div className="mb-4">
          <div className="mb-2 text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
            Configuration
          </div>
          <div className="flex flex-wrap gap-1">
            {template.configuration.map((card, index) => (
              <div
                key={index}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                  card.type === 'session'
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                }`}
              >
                <Clock className="h-3 w-3" />
                <span>{card.duration}m</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-500">
            Used {template.usage_count} {template.usage_count === 1 ? 'time' : 'times'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-500">
            {format(new Date(template.created_at), 'MMM d, yyyy')}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex gap-2">
          <button
            onClick={() => onApply(template)}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <Calendar className="mr-2 inline-block h-4 w-4" />
            Apply
          </button>
          {isOwner && onEdit && (
            <button
              onClick={() => onEdit(template)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              aria-label="Edit template"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onDuplicate(template)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Duplicate template"
          >
            <Copy className="h-4 w-4" />
          </button>
          {isOwner && onDelete && (
            <button
              onClick={() => onDelete(template)}
              className="rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/30 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-900/20"
              aria-label="Delete template"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
