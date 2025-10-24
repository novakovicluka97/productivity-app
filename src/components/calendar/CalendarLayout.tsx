'use client'

import React from 'react'
import { LayoutGrid, Rows3, Clock, Flame } from 'lucide-react'
import { DateNavigator } from './DateNavigator'

/**
 * Calendar Layout Component
 *
 * Main container for the calendar/tracker interface with:
 * - View mode switcher (day, week, month, year)
 * - Date navigation controls
 * - Dynamic view rendering based on selected mode
 *
 * View Modes:
 * - Day: Detailed day breakdown with task lists
 * - Week: 7-day timeline with session blocks
 * - Month: Calendar grid with session count badges (default)
 * - Year: Heatmap visualization (GitHub-style)
 */

export type ViewMode = 'day' | 'week' | 'month' | 'year'

interface CalendarLayoutProps {
  currentDate: Date
  viewMode: ViewMode
  onViewChange: (mode: ViewMode) => void
  onDateChange: (date: Date) => void
  children: React.ReactNode
}

export function CalendarLayout({ 
  currentDate, 
  viewMode, 
  onViewChange, 
  onDateChange,
  children 
}: CalendarLayoutProps) {
  const viewModes: { value: ViewMode; label: string; icon: React.ElementType }[] = [
    { value: 'day', label: 'Day', icon: Clock },
    { value: 'week', label: 'Week', icon: Rows3 },
    { value: 'month', label: 'Month', icon: LayoutGrid },
    { value: 'year', label: 'Year', icon: Flame },
  ]

  return (
    <div className="flex h-full flex-col theme-page-bg">
      {/* Header */}
      <div className="border-b border-slate-200/50 bg-white/80 backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/80 forest:border-green-200/50 forest:bg-green-50/80 ocean:border-cyan-200/50 ocean:bg-cyan-50/80">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          {/* Controls Row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Date Navigation */}
            <DateNavigator
              currentDate={currentDate}
              onDateChange={onDateChange}
              viewMode={viewMode}
            />

            {/* View Mode Switcher */}
            <div className="inline-flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              {viewModes.map((mode) => {
                const Icon = mode.icon
                const isActive = viewMode === mode.value

                return (
                  <button
                    key={mode.value}
                    onClick={() => onViewChange(mode.value)}
                    className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                    aria-label={`Switch to ${mode.label} view`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{mode.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* View Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
