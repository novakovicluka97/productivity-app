'use client'

import React, { useState, useMemo } from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, format, parseISO, isWithinInterval } from 'date-fns'
import { CalendarLayout, type ViewMode } from '@/components/calendar/CalendarLayout'
import { MonthView } from '@/components/calendar/MonthView'
import { WeekView } from '@/components/calendar/WeekView'
import { DayView } from '@/components/calendar/DayView'
import { YearView } from '@/components/calendar/YearView'
import { SessionDetailModal } from '@/components/calendar/SessionDetailModal'
import { SearchBar } from '@/components/shared/SearchBar'
import { FilterControls, type FilterState } from '@/components/shared/FilterControls'
import { ExportButton } from '@/components/shared/ExportButton'
import { useSessions } from '@/hooks/useSessions'
import type { Database } from '@/types/supabase'
import { TopHeader } from '@/components/layout/TopHeader'
import { ProtectedHeaderPortal } from '@/components/layout/ProtectedHeaderPortal'

type Session = Database['public']['Tables']['sessions']['Row']

/**
 * Tracker Page
 *
 * Session tracker with multiple calendar views:
 * - Day: Detailed day breakdown with task lists
 * - Week: 7-day timeline with session blocks
 * - Month: Calendar grid with session count badges
 * - Year: Heatmap visualization (GitHub-style)
 *
 * Features:
 * - View mode switcher
 * - Date navigation
 * - Session detail modal
 * - Real-time data from Supabase
 * - Search and filter functionality
 * - Export to CSV/JSON/PDF
 */

export default function TrackerPage() {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: undefined,
    dateTo: undefined,
    type: 'all',
    status: 'all',
    duration: 'all',
  })

  // Calculate date range based on view mode
  const getDateRange = (view: ViewMode, date: Date) => {
    switch (view) {
      case 'day':
        return {
          startDate: format(date, 'yyyy-MM-dd'),
          endDate: format(date, 'yyyy-MM-dd'),
        }
      case 'week':
        return {
          startDate: format(startOfWeek(date), 'yyyy-MM-dd'),
          endDate: format(endOfWeek(date), 'yyyy-MM-dd'),
        }
      case 'month':
        return {
          startDate: format(startOfWeek(startOfMonth(date)), 'yyyy-MM-dd'),
          endDate: format(endOfWeek(endOfMonth(date)), 'yyyy-MM-dd'),
        }
      case 'year':
        return {
          startDate: format(startOfYear(date), 'yyyy-MM-dd'),
          endDate: format(endOfYear(date), 'yyyy-MM-dd'),
        }
    }
  }

  const dateRange = getDateRange(viewMode, currentDate)

  // Fetch sessions for the current date range
  const { data: sessions = [], isLoading, error } = useSessions(dateRange)

  // Filter sessions based on search and filters
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      // Search filter (content + tasks)
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const contentMatch = session.content?.toLowerCase().includes(query)
        const tasks = Array.isArray(session.tasks) ? session.tasks as any[] : []
        const tasksMatch = tasks.some((task: any) =>
          task.text?.toLowerCase().includes(query)
        )
        if (!contentMatch && !tasksMatch) return false
      }

      // Date range filter
      if (filters.dateFrom || filters.dateTo) {
        const sessionDate = parseISO(session.session_date)
        if (filters.dateFrom && filters.dateTo) {
          if (!isWithinInterval(sessionDate, { start: filters.dateFrom, end: filters.dateTo })) {
            return false
          }
        } else if (filters.dateFrom) {
          if (sessionDate < filters.dateFrom) return false
        } else if (filters.dateTo) {
          if (sessionDate > filters.dateTo) return false
        }
      }

      // Type filter
      if (filters.type !== 'all' && session.type !== filters.type) {
        return false
      }

      // Status filter
      if (filters.status !== 'all') {
        if (filters.status === 'completed' && !session.is_completed) return false
        if (filters.status === 'incomplete' && session.is_completed) return false
      }

      // Duration filter (in minutes)
      if (filters.duration !== 'all') {
        if (filters.duration === 'short' && session.duration >= 15) return false
        if (filters.duration === 'medium' && (session.duration < 15 || session.duration > 45)) return false
        if (filters.duration === 'long' && session.duration <= 45) return false
      }

      return true
    })
  }, [sessions, searchQuery, filters])

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session)
    setIsModalOpen(true)
  }

  const handleDayClick = (date: Date) => {
    setCurrentDate(date)
    setViewMode('day')
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedSession(null)
  }

  const handleViewChange = (view: ViewMode) => {
    setViewMode(view)
  }

  const handleDateChange = (date: Date) => {
    setCurrentDate(date)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
  }

  const handleSearchClear = () => {
    setSearchQuery('')
  }

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const handleFiltersClear = () => {
    setFilters({
      dateFrom: undefined,
      dateTo: undefined,
      type: 'all',
      status: 'all',
      duration: 'all',
    })
  }

  const renderView = () => {
    if (isLoading) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading sessions...</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/30 dark:bg-red-900/10">
            <p className="text-red-600 dark:text-red-400">
              Error loading sessions: {error.message}
            </p>
          </div>
        </div>
      )
    }

    switch (viewMode) {
      case 'day':
        return (
          <DayView
            currentDate={currentDate}
            sessions={filteredSessions}
            onSessionClick={handleSessionClick}
          />
        )
      case 'week':
        return (
          <WeekView
            currentDate={currentDate}
            sessions={filteredSessions}
            onSessionClick={handleSessionClick}
          />
        )
      case 'month':
        return (
          <MonthView
            currentDate={currentDate}
            sessions={filteredSessions}
            onDayClick={handleDayClick}
          />
        )
      case 'year':
        return (
          <YearView
            currentDate={currentDate}
            sessions={filteredSessions}
            onDayClick={handleDayClick}
          />
        )
      default:
        return null
    }
  }

  return (
    <>
      <ProtectedHeaderPortal>
        <TopHeader />
      </ProtectedHeaderPortal>
      <CalendarLayout
        currentDate={currentDate}
        viewMode={viewMode}
        onViewChange={handleViewChange}
        onDateChange={handleDateChange}
      >
        {/* Search, Filters, and Export Section */}
        <div className="border-b border-slate-200/50 bg-white/80 backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/80">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            {/* Search and Export Row */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1 sm:max-w-md">
                <SearchBar
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onClear={handleSearchClear}
                />
              </div>
              <ExportButton
                sessions={filteredSessions}
                dateRange={{
                  from: filters.dateFrom,
                  to: filters.dateTo,
                }}
              />
            </div>

            {/* Filters Row */}
            <FilterControls
              filters={filters}
              onChange={handleFiltersChange}
              onClear={handleFiltersClear}
            />

            {/* Results Count */}
            {(searchQuery || filters.type !== 'all' || filters.status !== 'all' || filters.duration !== 'all' || filters.dateFrom || filters.dateTo) && (
              <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                Showing <strong className="font-semibold text-slate-900 dark:text-white">{filteredSessions.length}</strong> of <strong className="font-semibold text-slate-900 dark:text-white">{sessions.length}</strong> sessions
              </div>
            )}
          </div>
        </div>

        {/* View Content */}
        {renderView()}
      </CalendarLayout>

      <SessionDetailModal
        session={selectedSession}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  )
}
