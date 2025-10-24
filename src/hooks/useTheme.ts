'use client'

import { useEffect, useState } from 'react'

export type Theme = 'default' | 'dark' | 'forest' | 'ocean'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('default')
  const [mounted, setMounted] = useState(false)

  // Load theme from localStorage on mount (client-side only)
  useEffect(() => {
    // Guard against SSR
    if (typeof window === 'undefined') return

    const savedTheme = localStorage.getItem('app-theme') as Theme | null
    if (savedTheme === 'dark' || savedTheme === 'default' || savedTheme === 'forest' || savedTheme === 'ocean') {
      setTheme(savedTheme)
    }
    setMounted(true)
  }, [])

  // Apply theme to document root
  useEffect(() => {
    // Guard against SSR and pre-mount
    if (typeof window === 'undefined' || !mounted) return

    const root = document.documentElement

    // Remove all theme classes
    root.classList.remove('dark', 'forest', 'ocean')

    // Apply theme class if not default
    if (theme !== 'default') {
      root.classList.add(theme)
    }

    // Save to localStorage
    localStorage.setItem('app-theme', theme)
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme(prev => prev === 'default' ? 'dark' : 'default')
  }

  const setThemeDirectly = (newTheme: Theme) => {
    setTheme(newTheme)
  }

  return {
    theme,
    setTheme: setThemeDirectly,
    toggleTheme,
    mounted
  }
}
