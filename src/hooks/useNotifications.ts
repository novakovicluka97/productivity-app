import { useState, useEffect, useCallback } from 'react'
import { getUserPreferences } from '@/lib/supabase/preferences'

/**
 * Browser Notification Hook
 *
 * Handles browser notification permissions, display, and sound notifications.
 * Integrates with user preferences for notification settings.
 */

export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  tag?: string
  silent?: boolean
  requireInteraction?: boolean
}

export type NotificationPermission = 'granted' | 'denied' | 'default'

export interface UseNotificationsReturn {
  permission: NotificationPermission
  isSupported: boolean
  isEnabled: boolean
  requestPermission: () => Promise<NotificationPermission>
  showNotification: (options: NotificationOptions) => void
  playSound: () => void
}

export function useNotifications(): UseNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isEnabled, setIsEnabled] = useState(true)
  const isSupported = typeof window !== 'undefined' && 'Notification' in window

  // Check initial permission status and user preferences
  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission)

      // Load user notification preference
      getUserPreferences()
        .then((prefs) => {
          setIsEnabled(prefs.notificationsEnabled)
        })
        .catch((error) => {
          console.error('Error loading notification preferences:', error)
        })
    }
  }, [isSupported])

  /**
   * Request notification permission from browser
   */
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      console.warn('Notifications not supported in this browser')
      return 'denied'
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return 'denied'
    }
  }, [isSupported])

  /**
   * Play notification sound
   */
  const playSound = useCallback(() => {
    try {
      // Create audio element for notification sound
      const audio = new Audio('/audio/notification.mp3')
      audio.volume = 0.5
      audio.play().catch((error) => {
        console.error('Error playing notification sound:', error)
      })
    } catch (error) {
      console.error('Error creating notification sound:', error)
    }
  }, [])

  /**
   * Show browser notification
   */
  const showNotification = useCallback(
    (options: NotificationOptions) => {
      if (!isSupported) {
        console.warn('Notifications not supported')
        return
      }

      if (!isEnabled) {
        console.log('Notifications disabled by user preference')
        return
      }

      if (permission !== 'granted') {
        console.warn('Notification permission not granted')
        return
      }

      try {
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/icon-192x192.png',
          tag: options.tag,
          silent: options.silent ?? false,
          requireInteraction: options.requireInteraction ?? false,
        })

        // Play sound if not silent
        if (!options.silent) {
          playSound()
        }

        // Auto-close after 5 seconds
        setTimeout(() => {
          notification.close()
        }, 5000)

        notification.onclick = () => {
          window.focus()
          notification.close()
        }
      } catch (error) {
        console.error('Error showing notification:', error)
      }
    },
    [isSupported, isEnabled, permission, playSound]
  )

  return {
    permission,
    isSupported,
    isEnabled,
    requestPermission,
    showNotification,
    playSound,
  }
}

/**
 * Helper hook for common notification types
 */
export function useSessionNotifications() {
  const { showNotification, isEnabled } = useNotifications()

  const notifySessionComplete = useCallback(
    (duration: number) => {
      if (!isEnabled) return

      showNotification({
        title: 'Session Complete!',
        body: `Great work! You completed a ${duration}-minute session.`,
        icon: '/icon-192x192.png',
        tag: 'session-complete',
      })
    },
    [showNotification, isEnabled]
  )

  const notifyBreakComplete = useCallback(
    (duration: number) => {
      if (!isEnabled) return

      showNotification({
        title: 'Break Complete!',
        body: `Break time is over. Ready for another ${duration}-minute session?`,
        icon: '/icon-192x192.png',
        tag: 'break-complete',
      })
    },
    [showNotification, isEnabled]
  )

  const notifyBreakReminder = useCallback(
    (timeRemaining: number) => {
      if (!isEnabled) return

      showNotification({
        title: 'Time for a Break!',
        body: `You've been working for a while. Take a ${timeRemaining}-minute break?`,
        icon: '/icon-192x192.png',
        tag: 'break-reminder',
      })
    },
    [showNotification, isEnabled]
  )

  const notifyGoalAchieved = useCallback(
    (goalName: string) => {
      if (!isEnabled) return

      showNotification({
        title: 'Goal Achieved!',
        body: `Congratulations! You've achieved your goal: ${goalName}`,
        icon: '/icon-192x192.png',
        tag: 'goal-achieved',
        requireInteraction: true,
      })
    },
    [showNotification, isEnabled]
  )

  const notifyAchievementUnlocked = useCallback(
    (achievementName: string) => {
      if (!isEnabled) return

      showNotification({
        title: 'Achievement Unlocked!',
        body: `You've unlocked: ${achievementName}`,
        icon: '/icon-192x192.png',
        tag: 'achievement-unlocked',
        requireInteraction: true,
      })
    },
    [showNotification, isEnabled]
  )

  const notifyDailyGoalReminder = useCallback(() => {
    if (!isEnabled) return

    showNotification({
      title: 'Daily Goal Reminder',
      body: "Don't forget to work on your daily goals!",
      icon: '/icon-192x192.png',
      tag: 'daily-reminder',
    })
  }, [showNotification, isEnabled])

  return {
    notifySessionComplete,
    notifyBreakComplete,
    notifyBreakReminder,
    notifyGoalAchieved,
    notifyAchievementUnlocked,
    notifyDailyGoalReminder,
  }
}
