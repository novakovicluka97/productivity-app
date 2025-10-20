import { Home, Calendar, Layout, BarChart3, Settings, Target, type LucideIcon } from 'lucide-react'

/**
 * Application Route Constants
 *
 * Central location for all route paths and navigation configuration.
 * Used by navigation components and routing logic.
 */

export interface NavigationItem {
  icon: LucideIcon
  label: string
  path: string
  badge?: string | null
  description?: string
}

export const ROUTES = {
  // Public routes
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  VERIFY_EMAIL: '/auth/verify-email',
  RESET_PASSWORD: '/auth/reset-password',
  CALLBACK: '/auth/callback',

  // Protected routes
  HOME: '/app',
  TRACKER: '/tracker',
  TRACKER_DAY: (date: string) => `/tracker/day/${date}`,
  TRACKER_WEEK: '/tracker/week',
  TRACKER_MONTH: '/tracker/month',
  TRACKER_YEAR: '/tracker/year',
  SCHEDULE: '/schedule',
  SCHEDULE_DETAIL: (id: string) => `/schedule/${id}`,
  TEMPLATES: '/templates',
  TEMPLATE_DETAIL: (id: string) => `/templates/${id}`,
  GOALS: '/goals',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
} as const

/**
 * Main navigation menu items
 */
export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    icon: Home,
    label: 'Home',
    path: ROUTES.HOME,
    badge: null,
    description: 'Session-Break timer interface',
  },
  {
    icon: Calendar,
    label: 'Tracker',
    path: ROUTES.TRACKER,
    badge: 'Soon',
    description: 'View your session history',
  },
  {
    icon: Layout,
    label: 'Templates',
    path: ROUTES.TEMPLATES,
    badge: 'Soon',
    description: 'Save and reuse session configurations',
  },
  {
    icon: Target,
    label: 'Goals',
    path: ROUTES.GOALS,
    badge: null,
    description: 'Track goals and achievements',
  },
  {
    icon: BarChart3,
    label: 'Analytics',
    path: ROUTES.ANALYTICS,
    badge: 'Soon',
    description: 'Track your productivity insights',
  },
  {
    icon: Settings,
    label: 'Settings',
    path: ROUTES.SETTINGS,
    badge: null,
    description: 'Manage your preferences',
  },
]

/**
 * Get page title for a given route
 */
export function getPageTitle(pathname: string): string {
  const item = NAVIGATION_ITEMS.find(item => item.path === pathname)
  return item ? `${item.label} | Session-Break` : 'Session-Break'
}
