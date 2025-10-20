'use client'

import React, { useState, useEffect } from 'react'
import { Settings, Bell, Moon, Clock, Database, Volume2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/hooks/useTheme'
import { useNotifications } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { toggleNotifications } from '@/lib/supabase/preferences'
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
  const { theme, setTheme } = useTheme()
  const { permission, isSupported, isEnabled, requestPermission, showNotification } = useNotifications()
  const [notificationsEnabled, setNotificationsEnabled] = useState(isEnabled)
  const [soundEnabled, setSoundEnabled] = useState(true)

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

  return (
    <>
      <ProtectedHeaderPortal>
        <TopHeader />
      </ProtectedHeaderPortal>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 dark:from-slate-900 dark:via-gray-900 dark:to-slate-900">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Manage your preferences and account
              </p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Account Information */}
          <div className="rounded-lg border border-slate-200/50 bg-white/80 p-6 shadow-lg backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-800/80">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <Settings className="h-5 w-5" />
              Account Information
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <div className="mt-1 rounded-lg bg-slate-50 px-4 py-2 text-slate-900 dark:bg-slate-900/50 dark:text-slate-100">
                  {user?.email || 'Not logged in'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  User ID
                </label>
                <div className="mt-1 rounded-lg bg-slate-50 px-4 py-2 font-mono text-xs text-slate-600 dark:bg-slate-900/50 dark:text-slate-400">
                  {user?.id || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="rounded-lg border border-slate-200/50 bg-white/80 p-6 shadow-lg backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-800/80">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
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
          <div className="rounded-lg border border-slate-200/50 bg-white/80 p-6 shadow-lg backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-800/80">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <Clock className="h-5 w-5" />
              Default Durations
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Session Duration (minutes)
                </label>
                <input
                  type="number"
                  defaultValue={45}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-900/50 dark:text-white"
                  min={1}
                  max={180}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Break Duration (minutes)
                </label>
                <input
                  type="number"
                  defaultValue={15}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-900/50 dark:text-white"
                  min={1}
                  max={60}
                />
              </div>
              <button className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105">
                Save Preferences
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-lg border border-slate-200/50 bg-white/80 p-6 shadow-lg backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-800/80">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
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
          <div className="rounded-lg border border-slate-200/50 bg-white/80 p-6 shadow-lg backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-800/80">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <Database className="h-5 w-5" />
              Data Management
            </h2>
            <div className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Export your data or clear local cache. Your data in Supabase will remain intact.
              </p>
              <div className="flex gap-3">
                <button className="rounded-lg border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20">
                  Export Data
                </button>
                <button className="rounded-lg border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
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
