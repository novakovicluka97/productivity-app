import { supabase } from './client'
import type { Database } from '@/types/supabase'

type PreferencesRow = Database['public']['Tables']['user_preferences']['Row']
type PreferencesInsert = Database['public']['Tables']['user_preferences']['Insert']
type PreferencesUpdate = Database['public']['Tables']['user_preferences']['Update']

/**
 * User Preferences CRUD Operations
 *
 * Manages user-specific settings including theme, audio, default durations,
 * notifications, and other personalization options.
 */

export interface UserPreferences {
  theme: 'default' | 'dark' | 'forest' | 'ocean'
  selectedTrack: string
  volume: number
  defaultSessionDuration: number
  defaultBreakDuration: number
  notificationsEnabled: boolean
  timezone: string
}

/**
 * Get user preferences
 * Creates default preferences if they don't exist
 */
export async function getUserPreferences(): Promise<UserPreferences> {
  

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('Error fetching user preferences:', error)
    throw error
  }

  if (!data) {
    // No preferences found, create defaults
    return createDefaultPreferences()
  }

  // Type assertion for the data object
  const prefs = data as PreferencesRow

  return {
    theme: prefs.theme || 'default',
    selectedTrack: prefs.selected_track || 'track-01',
    volume: prefs.volume || 70,
    defaultSessionDuration: prefs.default_session_duration || 1500, // 25 minutes
    defaultBreakDuration: prefs.default_break_duration || 300, // 5 minutes
    notificationsEnabled: prefs.notifications_enabled ?? true,
    timezone: prefs.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
}

/**
 * Create default preferences for a new user
 */
export async function createDefaultPreferences(): Promise<UserPreferences> {
  

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const defaultPrefs: PreferencesInsert = {
    user_id: user.id,
    theme: 'default',
    selected_track: 'track-01',
    volume: 70,
    default_session_duration: 1500,
    default_break_duration: 300,
    notifications_enabled: true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('user_preferences')
    .insert(defaultPrefs)
    .select()
    .single()

  if (error) {
    console.error('Error creating default preferences:', error)
    throw error
  }

  return {
    theme: 'default',
    selectedTrack: 'track-01',
    volume: 70,
    defaultSessionDuration: 1500,
    defaultBreakDuration: 300,
    notificationsEnabled: true,
    timezone: defaultPrefs.timezone!,
  }
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  updates: Partial<UserPreferences>
): Promise<UserPreferences> {
  

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Convert from camelCase to snake_case
  const dbUpdates: PreferencesUpdate = {
    updated_at: new Date().toISOString(),
  }

  if (updates.theme !== undefined) dbUpdates.theme = updates.theme
  if (updates.selectedTrack !== undefined) dbUpdates.selected_track = updates.selectedTrack
  if (updates.volume !== undefined) dbUpdates.volume = updates.volume
  if (updates.defaultSessionDuration !== undefined) dbUpdates.default_session_duration = updates.defaultSessionDuration
  if (updates.defaultBreakDuration !== undefined) dbUpdates.default_break_duration = updates.defaultBreakDuration
  if (updates.notificationsEnabled !== undefined) dbUpdates.notifications_enabled = updates.notificationsEnabled
  if (updates.timezone !== undefined) dbUpdates.timezone = updates.timezone

  const { data, error } = await supabase
    .from('user_preferences')
    .update(dbUpdates)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating user preferences:', error)
    throw error
  }

  // Type assertion for the data object
  const prefs = data as PreferencesRow

  return {
    theme: prefs.theme || 'default',
    selectedTrack: prefs.selected_track || 'track-01',
    volume: prefs.volume || 70,
    defaultSessionDuration: prefs.default_session_duration || 1500,
    defaultBreakDuration: prefs.default_break_duration || 300,
    notificationsEnabled: prefs.notifications_enabled ?? true,
    timezone: prefs.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
}

/**
 * Update theme preference
 */
export async function updateTheme(theme: 'default' | 'dark' | 'forest' | 'ocean') {
  return updateUserPreferences({ theme })
}

/**
 * Update audio preferences
 */
export async function updateAudioPreferences(selectedTrack: string, volume: number) {
  return updateUserPreferences({ selectedTrack, volume })
}

/**
 * Update default durations
 */
export async function updateDefaultDurations(
  sessionDuration: number,
  breakDuration: number
) {
  return updateUserPreferences({
    defaultSessionDuration: sessionDuration,
    defaultBreakDuration: breakDuration,
  })
}

/**
 * Toggle notifications
 */
export async function toggleNotifications(enabled: boolean) {
  return updateUserPreferences({ notificationsEnabled: enabled })
}

/**
 * Reset preferences to defaults
 */
export async function resetPreferencesToDefaults() {
  

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Delete existing preferences
  await supabase
    .from('user_preferences')
    .delete()
    .eq('user_id', user.id)

  // Create new defaults
  return createDefaultPreferences()
}
