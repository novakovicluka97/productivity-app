'use client'

import { useEffect } from 'react'
import { useSettingsStore, type Theme } from '@/stores/settingsStore'

/**
 * Theme Hook using Zustand
 *
 * This hook provides theme management using the Settings Store.
 * NO MORE localStorage hooks or complex effects!
 */
export function useThemeWithStore() {
  const theme = useSettingsStore((state) => state.theme)
  const mounted = useSettingsStore((state) => state.mounted)
  const setTheme = useSettingsStore((state) => state.setTheme)
  const toggleTheme = useSettingsStore((state) => state.toggleTheme)
  const setMounted = useSettingsStore((state) => state.setMounted)

  // Apply theme on mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement

      // Remove all theme classes
      root.classList.remove('dark', 'forest', 'ocean')

      // Apply current theme
      if (theme !== 'default') {
        root.classList.add(theme)
      }

      // Mark as mounted
      if (!mounted) {
        setMounted(true)
      }
    }
  }, [theme, mounted, setMounted])

  return {
    theme,
    setTheme,
    toggleTheme,
    mounted
  }
}
