'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { NAVIGATION_ITEMS } from '@/lib/constants/routes'
import { UserMenu } from './UserMenu'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

/**
 * Sidebar Navigation Component
 *
 * Main navigation sidebar with:
 * - Navigation menu items with icons
 * - Active route highlighting
 * - "Coming Soon" badges
 * - Collapsible design (icon-only when collapsed)
 * - User menu at bottom
 *
 * Responsive:
 * - Desktop: Collapsible sidebar (64px collapsed, 280px expanded)
 * - Mobile: Drawer overlay (full width)
 */

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  isMobile?: boolean
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function Sidebar({
  isOpen = true,
  onClose,
  isMobile = false,
  isCollapsed = true,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname()

  const sidebarClasses = isMobile
    ? `fixed inset-y-0 left-0 z-50 w-full transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`
    : cn(
        'flex flex-col h-full transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-72'
      )

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={sidebarClasses}>
        <div
          className="flex h-full flex-col gap-y-5 overflow-y-auto border-r border-slate-200/50 bg-white/80 px-3 pb-4 backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/80 cursor-pointer transition-all"
          onClick={!isMobile ? onToggleCollapse : undefined}
          aria-label={!isMobile ? (isCollapsed ? 'Expand sidebar' : 'Collapse sidebar') : undefined}
          role={!isMobile ? 'button' : undefined}
        >
          {/* Mobile Close Button */}
          {isMobile && (
            <div className="flex h-16 shrink-0 items-center justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onClose?.()
                }}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <TooltipProvider>
                  <ul role="list" className="space-y-1">
                    {NAVIGATION_ITEMS.map((item) => {
                      const isActive =
                        pathname === item.path ||
                        pathname.startsWith(item.path + '/')
                      const Icon = item.icon

                      const linkContent = (
                        <Link
                          href={item.path}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (isMobile) {
                              onClose?.()
                            }
                          }}
                          className={cn(
                            'group flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-semibold leading-6 transition-colors',
                            isActive
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                              : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50',
                            isCollapsed && !isMobile ? 'justify-center' : ''
                          )}
                        >
                          <Icon
                            className={cn(
                              'h-5 w-5 shrink-0',
                              isActive
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                            )}
                          />
                          {(!isCollapsed || isMobile) && (
                            <>
                              <span>{item.label}</span>
                              {/* Badge */}
                              {item.badge && (
                                <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}
                        </Link>
                      )

                      return (
                        <li key={item.path}>
                          {isCollapsed && !isMobile ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                {linkContent}
                              </TooltipTrigger>
                              <TooltipContent side="right">
                                <p>{item.label}</p>
                                {item.badge && (
                                  <p className="text-xs text-slate-500">
                                    {item.badge}
                                  </p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            linkContent
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </TooltipProvider>
              </li>

              {/* User Menu */}
              <li className="mt-auto">
                <UserMenu isCollapsed={isCollapsed && !isMobile} />
              </li>
            </ul>
          </nav>
        </div>
      </aside>
    </>
  )
}
