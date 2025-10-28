'use client'

import React from 'react'
import { FileStack, ChevronDown } from 'lucide-react'
import { useTemplates, useIncrementTemplateUsage } from '@/hooks/useTemplates'
import { Card } from '@/lib/types'
import type { SessionTemplate } from '@/lib/supabase/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { isSupabaseConfigured } from '@/lib/supabase/client'

interface TemplateDropdownProps {
  onApplyTemplate: (cards: Card[]) => void
}

/**
 * Template Dropdown Component
 *
 * Displays a dropdown menu with all saved templates.
 * When a template is selected, it applies the configuration
 * immediately by replacing all existing cards.
 */
export function TemplateDropdown({ onApplyTemplate }: TemplateDropdownProps) {
  const { user, loading } = useAuth()
  const supabaseConfigured = isSupabaseConfigured()
  const { data: templates, isLoading } = useTemplates()
  const incrementUsage = useIncrementTemplateUsage()

  if (!supabaseConfigured) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="theme-btn-secondary"
      >
        <FileStack className="h-4 w-4 mr-2" />
        Templates unavailable
      </Button>
    )
  }

  if (loading) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="theme-btn-secondary"
      >
        <FileStack className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    )
  }

  if (!user) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="theme-btn-secondary"
      >
        <FileStack className="h-4 w-4 mr-2" />
        Sign in to use templates
      </Button>
    )
  }

  const convertTemplateToCards = (template: SessionTemplate): Card[] => {
    return template.configuration.map((config, index) => ({
      id: (index + 1).toString(),
      type: config.type,
      duration: config.duration * 60, // Convert minutes to seconds
      timeRemaining: config.duration * 60,
      isActive: false,
      isCompleted: false,
      isSelected: index === 0, // Select first card
      content: config.content,
      todos: config.tasks?.map(task => ({
        id: task.id,
        text: task.text,
        completed: task.completed,
        createdAt: new Date(task.created_at)
      }))
    }))
  }

  const handleTemplateSelect = async (template: SessionTemplate) => {
    try {
      // Convert template configuration to cards
      const cards = convertTemplateToCards(template)

      // Apply the template (replaces all existing cards)
      onApplyTemplate(cards)

      // Increment usage count
      await incrementUsage.mutateAsync(template.id)

      console.log('Template applied:', template.name)
    } catch (error) {
      console.error('Error applying template:', error)
    }
  }

  if (isLoading) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="theme-btn-secondary"
      >
        <FileStack className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    )
  }

  if (!templates || templates.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="theme-btn-secondary"
      >
        <FileStack className="h-4 w-4 mr-2" />
        No templates yet
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="theme-btn-secondary"
        >
          <FileStack className="h-4 w-4 mr-2" />
          Load Template
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 theme-card p-2">
        <DropdownMenuLabel className="text-xs font-semibold theme-text">
          Saved Templates
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {templates.map((template) => (
          <DropdownMenuItem
            key={template.id}
            onClick={() => handleTemplateSelect(template)}
            className="flex flex-col items-start gap-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 forest:hover:bg-green-100 ocean:hover:bg-cyan-100 rounded-lg p-2"
          >
            <div className="font-medium theme-heading text-sm">
              {template.name}
            </div>
            {template.description && (
              <div className="text-xs theme-text line-clamp-2">
                {template.description}
              </div>
            )}
            <div className="flex items-center gap-2 text-xs theme-text mt-1">
              <span>{template.configuration.length} cards</span>
              <span>•</span>
              <span>Used {template.usage_count} times</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
