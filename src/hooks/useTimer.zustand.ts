'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/stores/appStore'
import { useSoundNotification } from './useSoundNotification'

interface UseTimerOptions {
  onTimerComplete?: (completedCardId: string, completedCardType: 'session' | 'break') => void
}

/**
 * Simplified Timer Hook using Zustand
 *
 * This hook only handles the interval/tick logic.
 * All state management is done through Zustand store.
 * No more circular dependencies or complex state synchronization.
 */
export function useTimerWithStore(options: UseTimerOptions = {}) {
  const isPlaying = useAppStore((state) => state.isPlaying)
  const activeCardId = useAppStore((state) => state.activeCardId)
  const tickTimer = useAppStore((state) => state.tickTimer)
  const { playCompletionSound } = useSoundNotification()
  const { onTimerComplete } = options

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastTickRef = useRef<number | null>(null)

  // Timer interval - ticks every 250ms when playing
  useEffect(() => {
    if (isPlaying && activeCardId) {
      // Initialize last tick time
      if (lastTickRef.current === null) {
        lastTickRef.current = Date.now()
      }

      intervalRef.current = setInterval(() => {
        const now = Date.now()
        const lastTick = lastTickRef.current ?? now
        const elapsedSeconds = Math.floor((now - lastTick) / 1000)

        // Only update if at least 1 second has passed
        if (elapsedSeconds <= 0) {
          return
        }

        // Update last tick time
        lastTickRef.current = lastTick + elapsedSeconds * 1000

        // Tick the timer in the store
        const result = tickTimer(elapsedSeconds)

        // Handle completion
        if (result.completed && result.completedCardId && result.completedCardType) {
          // Play sound for session completion
          if (result.completedCardType === 'session') {
            playCompletionSound()
          }

          // Call completion callback
          if (onTimerComplete) {
            onTimerComplete(result.completedCardId, result.completedCardType)
          }

          // Reset last tick
          lastTickRef.current = null
        }
      }, 250)
    } else {
      // Clear interval when not playing
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      lastTickRef.current = null
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isPlaying, activeCardId, tickTimer, playCompletionSound, onTimerComplete])

  // Return utility functions (store methods are accessed directly via useAppStore)
  return {
    // These are just convenience methods that call store actions
    startTimer: useAppStore.getState().startTimer,
    pauseTimer: useAppStore.getState().pauseTimer,
    toggleTimer: useAppStore.getState().toggleTimer
  }
}
