/**
 * Supabase Database Types
 *
 * Type definitions for database tables and operations
 */

export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: Session
        Insert: SessionInsert
        Update: SessionUpdate
      }
      scheduled_sessions: {
        Row: ScheduledSession
        Insert: ScheduledSessionInsert
        Update: ScheduledSessionUpdate
      }
      session_templates: {
        Row: SessionTemplate
        Insert: SessionTemplateInsert
        Update: SessionTemplateUpdate
      }
      user_preferences: {
        Row: UserPreferences
        Insert: UserPreferencesInsert
        Update: UserPreferencesUpdate
      }
      user_analytics: {
        Row: UserAnalytics
        Insert: UserAnalyticsInsert
        Update: UserAnalyticsUpdate
      }
    }
  }
}

/**
 * Session (historical record)
 */
export interface Session {
  id: string
  user_id: string
  session_date: string // ISO date string
  type: 'session' | 'break'
  duration: number // in minutes
  time_spent: number // in seconds
  is_completed: boolean
  content: string // rich text content
  tasks: Task[] // embedded task list
  created_at: string // ISO timestamp
  updated_at: string // ISO timestamp
}

export type SessionInsert = Omit<Session, 'id' | 'created_at' | 'updated_at'>
export type SessionUpdate = Partial<SessionInsert>

/**
 * Task (embedded in session content)
 */
export interface Task {
  id: string
  text: string
  completed: boolean
  created_at: string
}

/**
 * Scheduled Session (future configuration)
 */
export interface ScheduledSession {
  id: string
  user_id: string
  scheduled_date: string // ISO date string
  configuration: CardConfiguration[]
  is_loaded: boolean
  loaded_at: string | null
  created_at: string
}

export type ScheduledSessionInsert = Omit<ScheduledSession, 'id' | 'created_at'>
export type ScheduledSessionUpdate = Partial<ScheduledSessionInsert>

/**
 * Card Configuration (for scheduled sessions and templates)
 */
export interface CardConfiguration {
  type: 'session' | 'break'
  duration: number // in minutes
  content?: string
  tasks?: Task[]
}

/**
 * Session Template
 */
export interface SessionTemplate {
  id: string
  user_id: string
  name: string
  description: string | null
  configuration: CardConfiguration[]
  is_public: boolean
  usage_count: number
  created_at: string
}

export type SessionTemplateInsert = Omit<SessionTemplate, 'id' | 'created_at' | 'usage_count'>
export type SessionTemplateUpdate = Partial<SessionTemplateInsert>

/**
 * User Preferences
 */
export interface UserPreferences {
  user_id: string // Primary key
  theme: 'default' | 'dark' | 'forest' | 'ocean'
  selected_track: string | null
  volume: number // 0-100
  default_session_duration: number // in minutes
  default_break_duration: number // in minutes
  notifications_enabled: boolean
  timezone: string
  updated_at: string
}

export type UserPreferencesInsert = Omit<UserPreferences, 'updated_at'>
export type UserPreferencesUpdate = Partial<UserPreferencesInsert>

/**
 * User Analytics (aggregated daily stats)
 */
export interface UserAnalytics {
  id: string
  user_id: string
  date: string // ISO date string
  total_sessions: number
  completed_sessions: number
  total_time_spent: number // in seconds
  productivity_score: number // 0-100
}

export type UserAnalyticsInsert = Omit<UserAnalytics, 'id'>
export type UserAnalyticsUpdate = Partial<UserAnalyticsInsert>

/**
 * Query Options
 */
export interface SessionQueryOptions {
  startDate?: string
  endDate?: string
  type?: 'session' | 'break'
  isCompleted?: boolean
  limit?: number
  offset?: number
}

/**
 * Calendar Event (for react-big-calendar)
 */
export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: Session
}

/**
 * Session Statistics
 */
export interface SessionStatistics {
  totalSessions: number
  completedSessions: number
  totalTimeSpent: number // in seconds
  completionRate: number // percentage
  averageSessionDuration: number // in minutes
  sessionsThisWeek: number
  sessionsThisMonth: number
  productivityScore: number // 0-100
}
