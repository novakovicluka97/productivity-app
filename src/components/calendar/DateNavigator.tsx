'use client'

import React from 'react'
import { format, addDays, addWeeks, addMonths, addYears, startOfToday } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import type { ViewMode } from './CalendarLayout'

/**
 * Date Navigator Component
 *
 * Navigation controls for the calendar:
 * - Previous/Next buttons (adjusts based on view mode)
 * - Current date display
 * - "Today" button to jump to current date
 *
 * Date increments:
 * - Day view: ±1 day
 * - Week view: ±1 week
 * - Month view: ±1 month
 * - Year view: ±1 year
 */

interface DateNavigatorProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  viewMode: ViewMode
}

export function DateNavigator({ currentDate, onDateChange, viewMode }: DateNavigatorProps) {
  const handlePrevious = () => {
    switch (viewMode) {
      case 'day':
        onDateChange(addDays(currentDate, -1))
        break
      case 'week':
        onDateChange(addWeeks(currentDate, -1))
        break
      case 'month':
        onDateChange(addMonths(currentDate, -1))
        break
      case 'year':
        onDateChange(addYears(currentDate, -1))
        break
    }
  }

  const handleNext = () => {
    switch (viewMode) {
      case 'day':
        onDateChange(addDays(currentDate, 1))
        break
      case 'week':
        onDateChange(addWeeks(currentDate, 1))
        break
      case 'month':
        onDateChange(addMonths(currentDate, 1))
        break
      case 'year':
        onDateChange(addYears(currentDate, 1))
        break
    }
  }

  const handleToday = () => {
    onDateChange(startOfToday())
  }

  const getDateDisplay = () => {
    switch (viewMode) {
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy')
      case 'week':
        return format(currentDate, 'MMM d, yyyy')
      case 'month':
        return format(currentDate, 'MMMM yyyy')
      case 'year':
        return format(currentDate, 'yyyy')
      default:
        return ''
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
        aria-label="Previous"
      >
        <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
      </button>

      {/* Current Date Display */}
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-800">
        <CalendarIcon className="h-4 w-4 text-slate-400" />
        <span className="min-w-[140px] text-sm font-medium text-slate-900 dark:text-white sm:min-w-[200px]">
          {getDateDisplay()}
        </span>
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
        aria-label="Next"
      >
        <ChevronRight className="h-5 w-5 text-slate-600 dark:text-slate-400" />
      </button>

      {/* Today Button */}
      <button
        onClick={handleToday}
        className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100 dark:border-blue-900/30 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
      >
        Today
      </button>
    </div>
  )
}
