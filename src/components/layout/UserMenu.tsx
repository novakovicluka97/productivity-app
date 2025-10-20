'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, Settings, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

/**
 * User Menu Component
 *
 * Displays user information and provides quick actions:
 * - User avatar with first letter of email
 * - Settings link
 * - Logout button
 * - Supports collapsed state (avatar only)
 *
 * Used in Sidebar component at the bottom
 */

interface UserMenuProps {
  isCollapsed?: boolean
}

export function UserMenu({ isCollapsed = false }: UserMenuProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = React.useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      router.push(ROUTES.LOGIN)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (!user) {
    return null
  }

  // Get first letter of email for avatar
  const avatarLetter = user.email?.charAt(0).toUpperCase() || 'U'

  const userButton = (
    <button
      onClick={(e) => {
        e.stopPropagation()
        setIsOpen(!isOpen)
      }}
      className={cn(
        'flex items-center gap-3 rounded-lg text-sm transition-colors hover:bg-white/10 dark:hover:bg-slate-800/50',
        isCollapsed
          ? 'justify-center p-2 w-12 h-12'
          : 'w-full px-3 py-2'
      )}
    >
      {/* Avatar */}
      <div className={cn(
        'flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-semibold text-white shadow-lg shrink-0',
        isCollapsed ? 'h-8 w-8 text-sm' : 'h-10 w-10'
      )}>
        {avatarLetter}
      </div>

      {/* User Info - Hidden when collapsed */}
      {!isCollapsed && (
        <>
          <div className="flex-1 text-left">
            <div className="truncate font-medium text-slate-900 dark:text-white">
              {user.email?.split('@')[0]}
            </div>
            <div className="truncate text-xs text-slate-500 dark:text-slate-400">
              {user.email}
            </div>
          </div>

          {/* Expand Icon */}
          <User className="h-4 w-4 text-slate-400" />
        </>
      )}
    </button>
  )

  return (
    <div className="relative">
      {/* User Info Button with optional tooltip */}
      {isCollapsed ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{userButton}</TooltipTrigger>
            <TooltipContent side="right">
              <p>{user.email}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        userButton
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div
            className={cn(
              'absolute bottom-full z-50 mb-2 overflow-hidden rounded-lg border border-slate-200/50 bg-white/95 shadow-xl backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/95',
              isCollapsed ? 'left-full ml-2' : 'left-0 right-0'
            )}
          >
            {/* Settings Link */}
            <Link
              href={ROUTES.SETTINGS}
              className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="h-4 w-4 text-slate-500" />
              <span className="text-slate-700 dark:text-slate-200">Settings</span>
            </Link>

            {/* Divider */}
            <div className="h-px bg-slate-200 dark:bg-slate-700" />

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4 text-red-500" />
              <span className="text-red-600 dark:text-red-400">Log out</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
