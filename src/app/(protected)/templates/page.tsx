'use client'

import React, { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { TemplateGrid } from '@/components/templates/TemplateGrid'
import { TemplateEditor } from '@/components/templates/TemplateEditor'
import { TopHeader } from '@/components/layout/TopHeader'
import { ProtectedHeaderPortal } from '@/components/layout/ProtectedHeaderPortal'
import {
  useTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useDuplicateTemplate,
  useIncrementTemplateUsage,
} from '@/hooks/useTemplates'
import { useAuth } from '@/hooks/useAuth'
import type { SessionTemplate } from '@/lib/supabase/types'
import type { TemplateInsert } from '@/lib/supabase/templates'

/**
 * Templates Page
 *
 * Template library interface showing:
 * - Grid of user's templates and public templates
 * - Create new template button
 * - Template actions (apply, edit, duplicate, delete)
 * - Loading and error states
 *
 * Features:
 * - Filter by owned/public templates
 * - Search templates
 * - Apply templates to current session
 * - Edit owned templates
 * - Duplicate any template
 * - Delete owned templates
 */

export default function TemplatesPage() {
  const { user } = useAuth()
  const { data: templates, isLoading, error } = useTemplates()
  const createTemplate = useCreateTemplate()
  const updateTemplate = useUpdateTemplate()
  const deleteTemplate = useDeleteTemplate()
  const duplicateTemplate = useDuplicateTemplate()
  const incrementUsage = useIncrementTemplateUsage()

  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<SessionTemplate | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Handle create new template
  const handleCreateNew = () => {
    setEditingTemplate(null)
    setIsEditorOpen(true)
  }

  // Handle edit template
  const handleEdit = (template: SessionTemplate) => {
    setEditingTemplate(template)
    setIsEditorOpen(true)
  }

  // Handle save (create or update)
  const handleSave = async (templateData: TemplateInsert) => {
    try {
      if (editingTemplate) {
        // Update existing template
        await updateTemplate.mutateAsync({
          id: editingTemplate.id,
          updates: templateData,
        })
      } else {
        // Create new template
        await createTemplate.mutateAsync(templateData)
      }
      setIsEditorOpen(false)
      setEditingTemplate(null)
    } catch (err) {
      console.error('Failed to save template:', err)
      // TODO: Show error toast
    }
  }

  // Handle apply template
  const handleApply = async (template: SessionTemplate) => {
    try {
      setActionLoading(template.id)

      // Increment usage count
      await incrementUsage.mutateAsync(template.id)

      // TODO: Apply template to current session
      // This will be implemented when we integrate with the main app
      console.log('Applying template:', template)

      // For now, just show a success message
      alert(`Template "${template.name}" applied! (Integration with main app coming soon)`)
    } catch (err) {
      console.error('Failed to apply template:', err)
      alert('Failed to apply template')
    } finally {
      setActionLoading(null)
    }
  }

  // Handle duplicate template
  const handleDuplicate = async (template: SessionTemplate) => {
    try {
      setActionLoading(template.id)
      await duplicateTemplate.mutateAsync(template.id)
    } catch (err) {
      console.error('Failed to duplicate template:', err)
      alert('Failed to duplicate template')
    } finally {
      setActionLoading(null)
    }
  }

  // Handle delete template
  const handleDelete = async (template: SessionTemplate) => {
    const confirmed = confirm(
      `Are you sure you want to delete "${template.name}"? This action cannot be undone.`
    )
    if (!confirmed) return

    try {
      setActionLoading(template.id)
      await deleteTemplate.mutateAsync(template.id)
    } catch (err) {
      console.error('Failed to delete template:', err)
      alert('Failed to delete template')
    } finally {
      setActionLoading(null)
    }
  }

  // Error state
  if (error) {
    return (
      <>
        <ProtectedHeaderPortal>
          <TopHeader />
        </ProtectedHeaderPortal>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-900">
          <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-lg dark:border-red-900/30 dark:bg-slate-800">
            <h2 className="mb-2 text-xl font-bold text-red-600 dark:text-red-400">
              Error Loading Templates
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <ProtectedHeaderPortal>
        <TopHeader />
      </ProtectedHeaderPortal>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-900">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Session Templates
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Save and reuse your favorite session configurations. Create custom
                templates or browse community templates.
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-xl disabled:opacity-50"
            >
              <Plus className="h-5 w-5" />
              Create Template
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        {templates && templates.length > 0 && (
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Templates
              </div>
              <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {templates.length}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                My Templates
              </div>
              <div className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                {templates.filter((t) => t.user_id === user?.id).length}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Public Templates
              </div>
              <div className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">
                {templates.filter((t) => t.is_public).length}
              </div>
            </div>
          </div>
        )}

        {/* Template Grid */}
        <TemplateGrid
          templates={templates || []}
          currentUserId={user?.id || null}
          isLoading={isLoading}
          onApply={handleApply}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onCreateNew={handleCreateNew}
        />

        {/* Loading Overlay for Actions */}
        {actionLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="rounded-lg bg-white p-6 shadow-xl dark:bg-slate-800">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          </div>
        )}

        {/* Template Editor Modal */}
        <TemplateEditor
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false)
            setEditingTemplate(null)
          }}
          onSave={handleSave}
          initialData={
            editingTemplate
              ? {
                  name: editingTemplate.name,
                  description: editingTemplate.description,
                  configuration: editingTemplate.configuration,
                  is_public: editingTemplate.is_public,
                }
              : undefined
          }
          mode={editingTemplate ? 'edit' : 'create'}
        />
      </div>
      </div>
    </>
  )
}
