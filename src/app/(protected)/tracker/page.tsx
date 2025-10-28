'use client'

import React, { useState, lazy, Suspense } from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, format } from 'date-fns'
import { CalendarLayout, type ViewMode } from '@/components/calendar/CalendarLayout'
import { useSessions } from '@/hooks/useSessions'
import type { Database } from '@/types/supabase'
import { TopHeader } from '@/components/layout/TopHeader'
import { ProtectedHeaderPortal } from '@/components/layout/ProtectedHeaderPortal'
import { useAuth } from '@/hooks/useAuth'
import { isSupabaseConfigured } from '@/lib/supabase/client'

// Lazy load heavy calendar components
const MonthView = lazy(() => import('@/components/calendar/MonthView').then(m => ({ default: m.MonthView })))
const WeekView = lazy(() => import('@/components/calendar/WeekView').then(m => ({ default: m.WeekView })))
const DayView = lazy(() => import('@/components/calendar/DayView').then(m => ({ default: m.DayView })))
const YearView = lazy(() => import('@/components/calendar/YearView').then(m => ({ default: m.YearView })))
const SessionDetailModal = lazy(() => import('@/components/calendar/SessionDetailModal').then(m => ({ default: m.SessionDetailModal })))

type Session = Database['public']['Tables']['sessions']['Row']

// Loading fallback component
const ViewLoadingFallback = () => (
  <div className="flex h-full items-center justify-center">
    <div className="text-center">
      <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      <p className="text-slate-600 dark:text-slate-400">Loading view...</p>
    </div>
  </div>
)

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
  const { user, loading: authLoading } = useAuth()
  const supabaseConfigured = isSupabaseConfigured()

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
  const canQuerySessions = supabaseConfigured && !!user && !authLoading

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
    if (!supabaseConfigured) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-700/50 dark:bg-slate-900">
            <p className="font-semibold text-slate-800 dark:text-slate-100">Supabase configuration missing</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Add <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to use the tracker.
            </p>
          </div>
        </div>
      )
    }

    if (authLoading) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-slate-600 dark:text-slate-400">Checking your account...</p>
          </div>
        </div>
      )
    }

    if (!user) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-700/50 dark:bg-slate-900">
            <p className="font-semibold text-slate-800 dark:text-slate-100">Sign in to see your tracker</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              The tracker syncs completed sessions from your account. Sign in to review your progress.
            </p>
          </div>
        </div>
      )
    }

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
          <Suspense fallback={<ViewLoadingFallback />}>
            <DayView
              currentDate={currentDate}
              sessions={sessions}
              onSessionClick={handleSessionClick}
            />
          </Suspense>
        )
      case 'week':
        return (
          <Suspense fallback={<ViewLoadingFallback />}>
            <WeekView
              currentDate={currentDate}
              sessions={sessions}
              onSessionClick={handleSessionClick}
            />
          </Suspense>
        )
      case 'month':
        return (
          <Suspense fallback={<ViewLoadingFallback />}>
            <MonthView
              currentDate={currentDate}
              sessions={sessions}
              onDayClick={handleDayClick}
            />
          </Suspense>
        )
      case 'year':
        return (
          <Suspense fallback={<ViewLoadingFallback />}>
            <YearView
              currentDate={currentDate}
              sessions={sessions}
              onDayClick={handleDayClick}
            />
          </Suspense>
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

      {canQuerySessions && (
        <Suspense fallback={null}>
          <SessionDetailModal
            session={selectedSession}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        </Suspense>
      )}
    </>
  )
}
