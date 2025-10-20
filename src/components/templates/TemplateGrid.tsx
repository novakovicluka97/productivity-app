'use client'

import React from 'react'
import { LayoutGrid, Plus } from 'lucide-react'
import type { SessionTemplate } from '@/lib/supabase/types'
import { TemplateCard } from './TemplateCard'

/**
 * Template Grid Component
 *
 * Grid layout for displaying template cards with:
 * - Responsive grid (1 col mobile, 2 cols tablet, 3 cols desktop)
 * - Loading state with skeleton loaders
 * - Empty state with call-to-action
 * - Current user ID for ownership checks
 */

interface TemplateGridProps {
  templates: SessionTemplate[]
  currentUserId: string | null
  isLoading?: boolean
  onApply: (template: SessionTemplate) => void
  onEdit?: (template: SessionTemplate) => void
  onDuplicate: (template: SessionTemplate) => void
  onDelete?: (template: SessionTemplate) => void
  onCreateNew?: () => void
}

export function TemplateGrid({
  templates,
  currentUserId,
  isLoading = false,
  onApply,
  onEdit,
  onDuplicate,
  onDelete,
  onCreateNew,
}: TemplateGridProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="h-32 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600" />
            <div className="p-4">
              <div className="mb-3 h-4 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mb-4 grid grid-cols-3 gap-3">
                <div className="h-16 rounded-lg bg-slate-100 dark:bg-slate-700" />
                <div className="h-16 rounded-lg bg-slate-100 dark:bg-slate-700" />
                <div className="h-16 rounded-lg bg-slate-100 dark:bg-slate-700" />
              </div>
              <div className="h-12 rounded bg-slate-100 dark:bg-slate-700" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Empty state
  if (templates.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white p-8 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl">
          <LayoutGrid className="h-10 w-10 text-white" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
          No Templates Yet
        </h3>
        <p className="mb-6 max-w-md text-center text-sm text-slate-600 dark:text-slate-400">
          Create your first template to save and reuse session configurations.
          Templates help you quickly set up your perfect work-break rhythm.
        </p>
        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            Create Your First Template
          </button>
        )}
      </div>
    )
  }

  // Grid with templates
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          isOwner={currentUserId === template.user_id}
          onApply={onApply}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
