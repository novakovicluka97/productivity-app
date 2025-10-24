'use client'

import React, { useState } from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, format } from 'date-fns'
import { CalendarLayout, type ViewMode } from '@/components/calendar/CalendarLayout'
import { MonthView } from '@/components/calendar/MonthView'
import { WeekView } from '@/components/calendar/WeekView'
import { DayView } from '@/components/calendar/DayView'
import { YearView } from '@/components/calendar/YearView'
import { SessionDetailModal } from '@/components/calendar/SessionDetailModal'
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
 */

export default function TrackerPage() {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')

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
            sessions={sessions}
            onSessionClick={handleSessionClick}
          />
        )
      case 'week':
        return (
          <WeekView
            currentDate={currentDate}
            sessions={sessions}
            onSessionClick={handleSessionClick}
          />
        )
      case 'month':
        return (
          <MonthView
            currentDate={currentDate}
            sessions={sessions}
            onDayClick={handleDayClick}
          />
        )
      case 'year':
        return (
          <YearView
            currentDate={currentDate}
            sessions={sessions}
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
