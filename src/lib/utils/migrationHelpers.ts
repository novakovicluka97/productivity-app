import { createSession } from '@/lib/supabase/sessions'
import { createDefaultPreferences } from '@/lib/supabase/preferences'
import type { AppState, Card } from '@/lib/types'

/**
 * LocalStorage Migration Utilities
 *
 * These functions handle migrating existing localStorage data to Supabase
 * on first login after the Phase 2 update.
 */

const STORAGE_KEY = 'productivity-app-state'
const MIGRATION_KEY = 'productivity-app-migrated'

/**
 * Check if user has completed migration
 */
export function hasMigrated(): boolean {
  try {
    return localStorage.getItem(MIGRATION_KEY) === 'true'
  } catch {
    return false
  }
}

/**
 * Mark migration as complete
 */
export function markAsMigrated(): void {
  try {
    localStorage.setItem(MIGRATION_KEY, 'true')
  } catch (error) {
    console.error('Error marking migration as complete:', error)
  }
}

/**
 * Check if there's localStorage data to migrate
 */
export function hasLocalStorageData(): boolean {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data !== null && data !== ''
  } catch {
    return false
  }
}

/**
 * Get localStorage app state
 */
export function getLocalStorageData(): AppState | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return null

    return JSON.parse(data) as AppState
  } catch (error) {
    console.error('Error reading localStorage:', error)
    return null
  }
}

/**
 * Migrate completed cards from localStorage to Supabase
 */
export async function migrateCardsToSupabase(
  cards: Card[],
  sessionDate: string
): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0

  // Filter for completed cards only
  const completedCards = cards.filter(card => card.isCompleted)

  for (const card of completedCards) {
    try {
      await createSession({
        user_id: undefined as any, // Will be set by RLS
        session_date: sessionDate,
        type: card.type,
        duration: card.duration,
        time_spent: card.duration - card.timeRemaining,
        is_completed: card.isCompleted,
        content: card.content || null,
        tasks: card.todos
          ? card.todos.map(todo => ({
              id: todo.id,
              text: todo.text,
              completed: todo.completed,
              createdAt: todo.createdAt.toISOString(),
            }))
          : null,
      })
      success++
    } catch (error) {
      console.error('Error migrating card:', card.id, error)
      failed++
    }
  }

  return { success, failed }
}

/**
 * Perform full migration from localStorage to Supabase
 */
export async function performMigration(): Promise<{
  success: boolean
  cardsImported: number
  cardsFailed: number
  error?: string
}> {
  try {
    // Check if already migrated
    if (hasMigrated()) {
      return {
        success: true,
        cardsImported: 0,
        cardsFailed: 0,
      }
    }

    // Get localStorage data
    const localData = getLocalStorageData()
    if (!localData || !localData.cards || localData.cards.length === 0) {
      // No data to migrate, just mark as migrated
      markAsMigrated()
      return {
        success: true,
        cardsImported: 0,
        cardsFailed: 0,
      }
    }

    // Use today's date for historical records
    const today = new Date().toISOString().split('T')[0]

    // Migrate cards
    const { success, failed } = await migrateCardsToSupabase(
      localData.cards,
      today
    )

    // Create default user preferences
    try {
      await createDefaultPreferences()
    } catch (error) {
      // Preferences might already exist, that's okay
      console.log('Preferences may already exist:', error)
    }

    // Mark migration as complete
    markAsMigrated()

    return {
      success: true,
      cardsImported: success,
      cardsFailed: failed,
    }
  } catch (error) {
    console.error('Migration error:', error)
    return {
      success: false,
      cardsImported: 0,
      cardsFailed: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Validate localStorage data structure
 */
export function validateLocalStorageData(data: any): boolean {
  if (!data || typeof data !== 'object') return false
  if (!Array.isArray(data.cards)) return false
  if (typeof data.isPlaying !== 'boolean') return false

  // Check card structure
  for (const card of data.cards) {
    if (
      typeof card.id !== 'string' ||
      (card.type !== 'session' && card.type !== 'break') ||
      typeof card.duration !== 'number' ||
      typeof card.timeRemaining !== 'number' ||
      typeof card.isActive !== 'boolean' ||
      typeof card.isCompleted !== 'boolean' ||
      typeof card.isSelected !== 'boolean'
    ) {
      return false
    }
  }

  return true
}

/**
 * Export localStorage data as JSON (for backup)
 */
export function exportLocalStorageData(): string | null {
  const data = getLocalStorageData()
  if (!data) return null

  return JSON.stringify(data, null, 2)
}

/**
 * Clear localStorage data (use after successful migration)
 * Note: We keep localStorage as cache layer, so this is optional
 */
export function clearLocalStorageData(): void {
  try {
    // Don't remove the data completely, just mark as migrated
    // localStorage will continue to work as cache layer
    markAsMigrated()
  } catch (error) {
    console.error('Error clearing localStorage:', error)
  }
}

/**
 * Reset migration state (for testing/debugging)
 */
export function resetMigrationState(): void {
  try {
    localStorage.removeItem(MIGRATION_KEY)
  } catch (error) {
    console.error('Error resetting migration state:', error)
  }
}
