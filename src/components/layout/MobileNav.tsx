'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { NAVIGATION_ITEMS } from '@/lib/constants/routes'

/**
 * Mobile Navigation Component
 *
 * Provides mobile-optimized navigation:
 * - Hamburger menu button to toggle sidebar drawer
 * - Bottom navigation bar with primary routes
 * - Touch-friendly tap targets (44px minimum)
 * - Active route highlighting
 *
 * Desktop: Hidden (sidebar is always visible)
 * Mobile: Shows bottom tab bar + hamburger button
 */

interface MobileNavProps {
  onMenuClick: () => void
}

export function MobileNav({ onMenuClick }: MobileNavProps) {
  const pathname = usePathname()

  // Filter to show only primary navigation items (first 4 items)
  const primaryItems = NAVIGATION_ITEMS.slice(0, 4)

  return (
    <>
      {/* Top Hamburger Menu Button - Mobile Only */}
      <div className="fixed left-4 top-4 z-40 lg:hidden">
        <button
          onClick={onMenuClick}
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/80 shadow-lg backdrop-blur-xl transition-colors hover:bg-white dark:bg-slate-900/80 dark:hover:bg-slate-900"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6 text-slate-700 dark:text-slate-300" />
        </button>
      </div>

      {/* Bottom Navigation Bar - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
        <div className="border-t border-slate-200/50 bg-white/95 backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/95">
          <div className="flex items-center justify-around px-2 py-2">
            {primaryItems.map((item) => {
              const isActive = pathname === item.path || pathname.startsWith(item.path + '/')
              const Icon = item.icon

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                  aria-label={item.label}
                >
                  {/* Icon */}
                  <Icon
                    className={`h-6 w-6 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  />

                  {/* Label */}
                  <span className="truncate">{item.label}</span>

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute top-0 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-blue-600 dark:bg-blue-400" />
                  )}

                  {/* Badge */}
                  {item.badge && (
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      !
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}
