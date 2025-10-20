/**
 * Supabase Database Type Definitions
 *
 * This file contains TypeScript types for the Supabase database schema.
 * These types provide full type safety when querying the database.
 *
 * Note: In production, you would generate these types automatically using:
 * npx supabase gen types typescript --project-id your-project-id > src/types/supabase.ts
 *
 * For now, we're defining them manually based on our schema.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string
          user_id: string
          session_date: string
          type: 'session' | 'break'
          duration: number
          time_spent: number
          is_completed: boolean
          content: string | null
          tasks: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_date: string
          type: 'session' | 'break'
          duration: number
          time_spent?: number
          is_completed?: boolean
          content?: string | null
          tasks?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_date?: string
          type?: 'session' | 'break'
          duration?: number
          time_spent?: number
          is_completed?: boolean
          content?: string | null
          tasks?: Json
          created_at?: string
          updated_at?: string
        }
      }
      scheduled_sessions: {
        Row: {
          id: string
          user_id: string
          scheduled_date: string
          configuration: Json
          is_loaded: boolean
          loaded_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          scheduled_date: string
          configuration: Json
          is_loaded?: boolean
          loaded_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          scheduled_date?: string
          configuration?: Json
          is_loaded?: boolean
          loaded_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      session_templates: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          configuration: Json
          is_public: boolean
          usage_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          configuration: Json
          is_public?: boolean
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          configuration?: Json
          is_public?: boolean
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          user_id: string
          theme: 'default' | 'dark' | 'forest' | 'ocean'
          selected_track: string | null
          volume: number
          default_session_duration: number
          default_break_duration: number
          notifications_enabled: boolean
          timezone: string
          has_migrated: boolean
          updated_at: string
        }
        Insert: {
          user_id: string
          theme?: 'default' | 'dark' | 'forest' | 'ocean'
          selected_track?: string | null
          volume?: number
          default_session_duration?: number
          default_break_duration?: number
          notifications_enabled?: boolean
          timezone?: string
          has_migrated?: boolean
          updated_at?: string
        }
        Update: {
          user_id?: string
          theme?: 'default' | 'dark' | 'forest' | 'ocean'
          selected_track?: string | null
          volume?: number
          default_session_duration?: number
          default_break_duration?: number
          notifications_enabled?: boolean
          timezone?: string
          has_migrated?: boolean
          updated_at?: string
        }
      }
      user_analytics: {
        Row: {
          id: string
          user_id: string
          date: string
          total_sessions: number
          completed_sessions: number
          total_time_spent: number
          productivity_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          total_sessions?: number
          completed_sessions?: number
          total_time_spent?: number
          productivity_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          total_sessions?: number
          completed_sessions?: number
          total_time_spent?: number
          productivity_score?: number | null
          created_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          type: string
          metric: string
          target_value: number
          current_value: number
          start_date: string
          end_date: string | null
          is_active: boolean
          is_completed: boolean
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          type: string
          metric: string
          target_value: number
          current_value?: number
          start_date: string
          end_date?: string | null
          is_active?: boolean
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          type?: string
          metric?: string
          target_value?: number
          current_value?: number
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          category: string
          requirement_type: string
          requirement_value: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon: string
          category: string
          requirement_type: string
          requirement_value: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          category?: string
          requirement_type?: string
          requirement_value?: number
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          earned_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
