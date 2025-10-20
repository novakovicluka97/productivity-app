'use client'

import React, { useState } from 'react'
import {
  Plus,
  X,
  Clock,
  Coffee,
  Briefcase,
  Save,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { CardConfiguration } from '@/lib/supabase/types'

/**
 * Template Editor Component
 *
 * Modal for creating/editing templates with:
 * - Name and description fields
 * - Public/Private toggle
 * - Configuration builder (add/remove/reorder cards)
 * - Form validation
 * - Save/Cancel actions
 */

interface TemplateEditorProps {
  isOpen: boolean
  onClose: () => void
  onSave: (template: {
    name: string
    description: string | null
    configuration: CardConfiguration[]
    is_public: boolean
  }) => void
  initialData?: {
    name: string
    description: string | null
    configuration: CardConfiguration[]
    is_public: boolean
  }
  mode: 'create' | 'edit'
}

export function TemplateEditor({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
}: TemplateEditorProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [isPublic, setIsPublic] = useState(initialData?.is_public || false)
  const [configuration, setConfiguration] = useState<CardConfiguration[]>(
    initialData?.configuration || []
  )
  const [errors, setErrors] = useState<{ name?: string; configuration?: string }>({})

  const handleAddCard = (type: 'session' | 'break') => {
    const newCard: CardConfiguration = {
      type,
      duration: type === 'session' ? 25 : 5,
    }
    setConfiguration([...configuration, newCard])
  }

  const handleRemoveCard = (index: number) => {
    setConfiguration(configuration.filter((_, i) => i !== index))
  }

  const handleUpdateDuration = (index: number, duration: number) => {
    const updated = [...configuration]
    updated[index] = { ...updated[index], duration }
    setConfiguration(updated)
  }

  const handleMoveCard = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= configuration.length) return

    const updated = [...configuration]
    const temp = updated[index]
    updated[index] = updated[newIndex]
    updated[newIndex] = temp
    setConfiguration(updated)
  }

  const validate = () => {
    const newErrors: { name?: string; configuration?: string } = {}

    if (!name.trim()) {
      newErrors.name = 'Template name is required'
    }

    if (configuration.length === 0) {
      newErrors.configuration = 'At least one card is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) return

    onSave({
      name: name.trim(),
      description: description.trim() || null,
      configuration,
      is_public: isPublic,
    })
  }

  const totalDuration = configuration.reduce((sum, c) => sum + c.duration, 0)
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {mode === 'create' ? 'Create New Template' : 'Edit Template'}
          </DialogTitle>
          <DialogDescription>
            Configure a reusable session template for your productivity workflow.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="template-name">
              Template Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="template-name"
              placeholder="e.g., Deep Work Session"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="template-description">Description (Optional)</Label>
            <textarea
              id="template-description"
              placeholder="Describe when to use this template..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Public Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="template-public"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <Label htmlFor="template-public" className="cursor-pointer">
              Make this template public (share with community)
            </Label>
          </div>

          {/* Configuration Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Configuration</Label>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Total: {formatDuration(totalDuration)}
              </div>
            </div>

            {errors.configuration && (
              <p className="text-sm text-red-500">{errors.configuration}</p>
            )}

            {/* Card List */}
            <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
              {configuration.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">
                  No cards yet. Add a session or break to get started.
                </p>
              ) : (
                <div className="space-y-2">
                  {configuration.map((card, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 rounded-lg border p-3 ${
                        card.type === 'session'
                          ? 'border-blue-200 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-900/20'
                          : 'border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/20'
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          card.type === 'session'
                            ? 'bg-blue-600 text-white'
                            : 'bg-green-600 text-white'
                        }`}
                      >
                        {card.type === 'session' ? (
                          <Briefcase className="h-5 w-5" />
                        ) : (
                          <Coffee className="h-5 w-5" />
                        )}
                      </div>

                      {/* Type */}
                      <div className="flex-1">
                        <div
                          className={`font-medium ${
                            card.type === 'session'
                              ? 'text-blue-900 dark:text-blue-300'
                              : 'text-green-900 dark:text-green-300'
                          }`}
                        >
                          {card.type === 'session' ? 'Session' : 'Break'}
                        </div>
                      </div>

                      {/* Duration Input */}
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          max="120"
                          value={card.duration}
                          onChange={(e) =>
                            handleUpdateDuration(index, parseInt(e.target.value) || 1)
                          }
                          className="w-20 text-center"
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          min
                        </span>
                      </div>

                      {/* Move Buttons */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleMoveCard(index, 'left')}
                          disabled={index === 0}
                          className="rounded-md p-1 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-slate-700"
                          aria-label="Move left"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleMoveCard(index, 'right')}
                          disabled={index === configuration.length - 1}
                          className="rounded-md p-1 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-slate-700"
                          aria-label="Move right"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveCard(index)}
                        className="rounded-md p-1 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/20"
                        aria-label="Remove card"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Card Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleAddCard('session')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 transition-colors hover:border-blue-400 hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:border-blue-800 dark:hover:bg-blue-900/30"
                >
                  <Plus className="h-4 w-4" />
                  Add Session
                </button>
                <button
                  onClick={() => handleAddCard('break')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-dashed border-green-300 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 transition-colors hover:border-green-400 hover:bg-green-100 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400 dark:hover:border-green-800 dark:hover:bg-green-900/30"
                >
                  <Plus className="h-4 w-4" />
                  Add Break
                </button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Save className="mr-2 h-4 w-4" />
            {mode === 'create' ? 'Create Template' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
