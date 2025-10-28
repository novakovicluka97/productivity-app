import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Theme = 'default' | 'dark' | 'forest' | 'ocean'

interface SettingsState {
  // Theme
  theme: Theme
  mounted: boolean

  // Preferences
  defaultSessionDuration: number // in seconds
  defaultBreakDuration: number // in seconds
  notificationsEnabled: boolean
  soundEnabled: boolean

  // Actions
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setMounted: (mounted: boolean) => void

  // Preference actions
  setDefaultSessionDuration: (duration: number) => void
  setDefaultBreakDuration: (duration: number) => void
  setNotificationsEnabled: (enabled: boolean) => void
  setSoundEnabled: (enabled: boolean) => void
  updatePreferences: (prefs: Partial<{
    defaultSessionDuration: number
    defaultBreakDuration: number
    notificationsEnabled: boolean
    soundEnabled: boolean
  }>) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Initial state
      theme: 'default',
      mounted: false,
      defaultSessionDuration: 45 * 60, // 45 minutes
      defaultBreakDuration: 15 * 60, // 15 minutes
      notificationsEnabled: false,
      soundEnabled: true,

      // Theme actions
      setTheme: (theme) => {
        set({ theme })

        // Apply theme to document root
        if (typeof document !== 'undefined') {
          const root = document.documentElement
          root.classList.remove('dark', 'forest', 'ocean')
          if (theme !== 'default') {
            root.classList.add(theme)
          }
        }
      },

      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'default' ? 'dark' : 'default'

          // Apply theme to document root
          if (typeof document !== 'undefined') {
            const root = document.documentElement
            root.classList.remove('dark', 'forest', 'ocean')
            if (newTheme !== 'default') {
              root.classList.add(newTheme)
            }
          }

          return { theme: newTheme }
        })
      },

      setMounted: (mounted) => {
        set({ mounted })
      },

      // Preference actions
      setDefaultSessionDuration: (duration) => {
        set({ defaultSessionDuration: duration })
      },

      setDefaultBreakDuration: (duration) => {
        set({ defaultBreakDuration: duration })
      },

      setNotificationsEnabled: (enabled) => {
        set({ notificationsEnabled: enabled })
      },

      setSoundEnabled: (enabled) => {
        set({ soundEnabled: enabled })
      },

      updatePreferences: (prefs) => {
        set((state) => ({
          ...state,
          ...prefs
        }))
      }
    }),
    {
      name: 'productivity-settings',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        defaultSessionDuration: state.defaultSessionDuration,
        defaultBreakDuration: state.defaultBreakDuration,
        notificationsEnabled: state.notificationsEnabled,
        soundEnabled: state.soundEnabled
      })
    }
  )
)

// Selectors
export const selectTheme = (state: SettingsState) => state.theme
export const selectDefaultDurations = (state: SettingsState) => ({
  sessionDuration: state.defaultSessionDuration,
  breakDuration: state.defaultBreakDuration
})
export const selectNotificationSettings = (state: SettingsState) => ({
  notificationsEnabled: state.notificationsEnabled,
  soundEnabled: state.soundEnabled
})
