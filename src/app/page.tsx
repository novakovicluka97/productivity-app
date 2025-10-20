import { redirect } from 'next/navigation'

/**
 * Root page - redirects to appropriate destination
 * Middleware handles the actual redirect logic:
 * - Logged in users → /app
 * - Logged out users → /auth/login
 */
export default function RootPage() {
  // This will be caught by middleware and redirected
  // But as a fallback, redirect to login
  redirect('/auth/login')
}
