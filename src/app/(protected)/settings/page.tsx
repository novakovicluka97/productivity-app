'use client'

import React, { useState, useEffect } from 'react'
import { Settings, Bell, Moon, Clock, Database, Volume2, Check } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useThemeWithStore } from '@/hooks/useTheme.zustand'
import { useNotifications } from '@/hooks/useNotifications'
import { useSettingsStore } from '@/stores/settingsStore'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { toggleNotifications, updateDefaultDurations, getUserPreferences } from '@/lib/supabase/preferences'
import { TopHeader } from '@/components/layout/TopHeader'
import { ProtectedHeaderPortal } from '@/components/layout/ProtectedHeaderPortal'

/**
 * Settings Page
 *
 * User preferences and account settings:
 * - Theme selection
 * - Default session/break durations
 * - Notification preferences
 * - Account information
 * - Data management (export, clear)
 */

export default function SettingsPage() {
  const { user } = useAuth()
  const { theme, setTheme } = useThemeWithStore()
  const { permission, isSupported, isEnabled, requestPermission, showNotification } = useNotifications()

  // Get initial durations from Zustand store
  const storeDurations = useSettingsStore((state) => ({
    sessionDuration: Math.round(state.defaultSessionDuration / 60),
    breakDuration: Math.round(state.defaultBreakDuration / 60)
  }))

  const [notificationsEnabled, setNotificationsEnabled] = useState(isEnabled)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [sessionDuration, setSessionDuration] = useState(storeDurations.sessionDuration)
  const [breakDuration, setBreakDuration] = useState(storeDurations.breakDuration)
  const [isSaving, setIsSaving] = useState(false)
  const [showSavedNotification, setShowSavedNotification] = useState(false)

  // Load user preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await getUserPreferences()
        // Convert seconds to minutes
        setSessionDuration(Math.round(prefs.defaultSessionDuration / 60))
        setBreakDuration(Math.round(prefs.defaultBreakDuration / 60))

        // Update Zustand store
        useSettingsStore.getState().updatePreferences({
          defaultSessionDuration: prefs.defaultSessionDuration,
          defaultBreakDuration: prefs.defaultBreakDuration
        })
      } catch (error) {
        console.error('Error loading preferences:', error)
      }
    }
    loadPreferences()
  }, [])

  const themes = [
    { value: 'default', label: 'Default', gradient: 'from-blue-500 to-purple-600' },
    { value: 'dark', label: 'Dark', gradient: 'from-slate-700 to-slate-900' },
    { value: 'forest', label: 'Forest', gradient: 'from-green-500 to-emerald-600' },
    { value: 'ocean', label: 'Ocean', gradient: 'from-cyan-500 to-blue-600' },
  ] as const

  const handleToggleNotifications = async (enabled: boolean) => {
    setNotificationsEnabled(enabled)
    try {
      await toggleNotifications(enabled)
    } catch (error) {
      console.error('Error updating notification preference:', error)
      setNotificationsEnabled(!enabled) // Revert on error
    }
  }

  const handleRequestPermission = async () => {
    const result = await requestPermission()
    if (result === 'granted') {
      setNotificationsEnabled(true)
      await toggleNotifications(true)
    }
  }

  const handleTestNotification = () => {
    showNotification({
      title: 'Test Notification',
      body: 'Notifications are working correctly!',
    })
  }

  const handleSavePreferences = async () => {
    setIsSaving(true)
    try {
      // Convert minutes to seconds
      const sessionSeconds = sessionDuration * 60
      const breakSeconds = breakDuration * 60

      await updateDefaultDurations(sessionSeconds, breakSeconds)

      // Update Zustand store
      useSettingsStore.getState().updatePreferences({
        defaultSessionDuration: sessionSeconds,
        defaultBreakDuration: breakSeconds
      })

      // Show success notification
      setShowSavedNotification(true)

      // Auto-hide notification after 1 second
      setTimeout(() => {
        setShowSavedNotification(false)
      }, 1000)
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      // Keep button animation for a moment
      setTimeout(() => {
        setIsSaving(false)
      }, 300)
    }
  }

  return (
    <>
      <ProtectedHeaderPortal>
        <TopHeader />
      </ProtectedHeaderPortal>
      <div className="min-h-screen theme-page-bg p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="theme-icon-container h-12 w-12">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold theme-heading">Settings</h1>
              <p className="text-sm theme-text">
                Manage your preferences and account
              </p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Account Information */}
          <div className="theme-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold theme-heading">
              <Settings className="h-5 w-5" />
              Account Information
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium theme-text">
                  Email
                </label>
                <div className="mt-1 theme-input">
                  {user?.email || 'Not logged in'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium theme-text">
                  User ID
                </label>
                <div className="mt-1 theme-input font-mono text-xs">
                  {user?.id || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="theme-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold theme-heading">
              <Moon className="h-5 w-5" />
              Theme
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {themes.map((themeOption) => (
                <button
                  key={themeOption.value}
                  onClick={() => setTheme(themeOption.value)}
                  className={`relative overflow-hidden rounded-lg border-2 p-4 transition-all ${
                    theme === themeOption.value
                      ? 'border-blue-500 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                  }`}
                >
                  <div className={`h-8 rounded bg-gradient-to-r ${themeOption.gradient}`} />
                  <div className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {themeOption.label}
                  </div>
                  {theme === themeOption.value && (
                    <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Default Durations */}
          <div className="theme-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold theme-heading">
              <Clock className="h-5 w-5" />
              Default Durations
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium theme-text">
                  Session Duration (minutes)
                </label>
                <input
                  type="number"
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(Number(e.target.value))}
                  className="mt-1 w-full theme-input focus:outline-none"
                  min={1}
                  max={180}
                />
              </div>
              <div>
                <label className="text-sm font-medium theme-text">
                  Break Duration (minutes)
                </label>
                <input
                  type="number"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(Number(e.target.value))}
                  className="mt-1 w-full theme-input focus:outline-none"
                  min={1}
                  max={60}
                />
              </div>
              <div className="relative">
                <button
                  onClick={handleSavePreferences}
                  disabled={isSaving}
                  className={`theme-btn-primary transition-transform ${
                    isSaving ? 'scale-95' : 'scale-100'
                  }`}
                >
                  {isSaving ? 'Saving...' : 'Save Preferences'}
                </button>
                {showSavedNotification && (
                  <div className="absolute left-full top-1/2 ml-3 flex -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-white shadow-lg animate-in fade-in slide-in-from-left-2">
                    <Check className="h-4 w-4" />
                    Preferences saved!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="theme-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold theme-heading">
              <Bell className="h-5 w-5" />
              Notifications
            </h2>
            <div className="space-y-4">
              {/* Browser support check */}
              {!isSupported && (
                <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                  Browser notifications are not supported in your browser.
                </div>
              )}

              {/* Permission status */}
              {isSupported && permission !== 'granted' && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {permission === 'denied'
                      ? 'Notification permission has been denied. Please enable it in your browser settings.'
                      : 'Enable browser notifications to get updates about your sessions.'}
                  </p>
                  {permission === 'default' && (
                    <Button onClick={handleRequestPermission} className="w-full">
                      <Bell className="mr-2 h-4 w-4" />
                      Enable Notifications
                    </Button>
                  )}
                </div>
              )}

              {/* Notification controls */}
              {isSupported && permission === 'granted' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        Enable Notifications
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        Receive session and break notifications
                      </div>
                    </div>
                    <Switch
                      checked={notificationsEnabled}
                      onCheckedChange={handleToggleNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        Sound Notifications
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        Play sound with notifications
                      </div>
                    </div>
                    <Switch
                      checked={soundEnabled}
                      onCheckedChange={setSoundEnabled}
                      disabled={!notificationsEnabled}
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="outline"
                      onClick={handleTestNotification}
                      disabled={!notificationsEnabled}
                      className="w-full"
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      Test Notification
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Data Management */}
          <div className="theme-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold theme-heading">
              <Database className="h-5 w-5" />
              Data Management
            </h2>
            <div className="space-y-3">
              <p className="text-sm theme-text">
                Export your data or clear local cache. Your data in Supabase will remain intact.
              </p>
              <div className="flex gap-3">
                <button className="theme-btn-secondary">
                  Export Data
                </button>
                <button className="theme-btn-secondary border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20">
                  Clear Cache
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
