import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { saveCompletedCard } from '@/lib/supabase/sessions'
import type { Card } from '@/lib/types'

/**
 * Real-time Sync Hook with Debouncing
 *
 * This hook provides background synchronization of completed cards to Supabase.
 * It batches changes using a debounced queue to reduce API calls.
 *
 * Features:
 * - Debounced updates (5-second interval during active use)
 * - Offline queue with retry logic
 * - Sync status tracking
 * - Automatic cleanup on unmount
 *
 * Usage:
 * ```tsx
 * const { syncCard, syncStatus, retryFailedSync } = useSyncToSupabase()
 *
 * // When a card is completed:
 * await syncCard(completedCard, todayDate)
 * ```
 */

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline'

interface SyncQueueItem {
  card: Card
  sessionDate: string
  timestamp: number
  retryCount: number
}

export function useSyncToSupabase() {
  const { user } = useAuth()
  const syncQueueRef = useRef<SyncQueueItem[]>([])
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isSyncingRef = useRef(false)
  const syncStatusRef = useRef<SyncStatus>('idle')

  /**
   * Schedule a sync operation with debouncing
   */
  const scheduleSync = useCallback(() => {
    // Clear existing timer
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current)
    }

    // Set new timer (5-second debounce)
    syncTimerRef.current = setTimeout(() => {
      processSyncQueue()
    }, 5000)
  }, [])

  /**
   * Add a card to the sync queue
   */
  const queueCard = useCallback((card: Card, sessionDate: string) => {
    if (!user) {
      console.warn('Cannot sync: User not authenticated')
      return
    }

    // Check if card is already in queue
    const existingIndex = syncQueueRef.current.findIndex(
      item => item.card.id === card.id
    )

    if (existingIndex >= 0) {
      // Update existing item
      syncQueueRef.current[existingIndex] = {
        card,
        sessionDate,
        timestamp: Date.now(),
        retryCount: syncQueueRef.current[existingIndex].retryCount,
      }
    } else {
      // Add new item
      syncQueueRef.current.push({
        card,
        sessionDate,
        timestamp: Date.now(),
        retryCount: 0,
      })
    }

    // Schedule sync
    scheduleSync()
  }, [user, scheduleSync])

  /**
   * Process all items in the sync queue
   */
  const processSyncQueue = useCallback(async () => {
    if (isSyncingRef.current || syncQueueRef.current.length === 0) {
      return
    }

    isSyncingRef.current = true
    syncStatusRef.current = 'syncing'

    const itemsToSync = [...syncQueueRef.current]
    const failedItems: SyncQueueItem[] = []

    for (const item of itemsToSync) {
      try {
        await saveCompletedCard(item.card, item.sessionDate)

        // Remove from queue on success
        syncQueueRef.current = syncQueueRef.current.filter(
          queueItem => queueItem.card.id !== item.card.id
        )
      } catch (error) {
        console.error('Error syncing card:', error)

        // Retry logic with exponential backoff
        if (item.retryCount < 3) {
          failedItems.push({
            ...item,
            retryCount: item.retryCount + 1,
          })
        } else {
          console.error('Max retries reached for card:', item.card.id)
          syncStatusRef.current = 'error'
        }
      }
    }

    // Re-queue failed items
    syncQueueRef.current = failedItems

    // Update status
    if (syncQueueRef.current.length === 0) {
      syncStatusRef.current = 'synced'
    } else {
      syncStatusRef.current = 'error'
      // Schedule retry with exponential backoff
      const maxRetryCount = Math.max(...syncQueueRef.current.map(i => i.retryCount))
      const retryDelay = Math.pow(2, maxRetryCount) * 5000 // 5s, 10s, 20s
      setTimeout(() => processSyncQueue(), retryDelay)
    }

    isSyncingRef.current = false
  }, [])

  /**
   * Manually trigger sync (useful for explicit sync requests)
   */
  const syncCard = useCallback(async (card: Card, sessionDate: string) => {
    queueCard(card, sessionDate)

    // For explicit syncs, reduce debounce time
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current)
    }

    syncTimerRef.current = setTimeout(() => {
      processSyncQueue()
    }, 1000) // 1-second for explicit syncs
  }, [queueCard])

  /**
   * Retry failed syncs manually
   */
  const retryFailedSync = useCallback(() => {
    if (syncQueueRef.current.length > 0) {
      processSyncQueue()
    }
  }, [processSyncQueue])

  /**
   * Get current sync status
   */
  const getSyncStatus = useCallback((): SyncStatus => {
    if (!navigator.onLine) {
      return 'offline'
    }
    return syncStatusRef.current
  }, [])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current)
      }
      // Process any remaining items before unmounting
      if (syncQueueRef.current.length > 0) {
        processSyncQueue()
      }
    }
  }, [processSyncQueue])

  /**
   * Listen for online/offline events
   */
  useEffect(() => {
    const handleOnline = () => {
      syncStatusRef.current = 'idle'
      if (syncQueueRef.current.length > 0) {
        processSyncQueue()
      }
    }

    const handleOffline = () => {
      syncStatusRef.current = 'offline'
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [processSyncQueue])

  return {
    syncCard,
    syncStatus: getSyncStatus(),
    retryFailedSync,
    queuedItemsCount: syncQueueRef.current.length,
  }
}
