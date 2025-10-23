import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Next.js Middleware for authentication and session management
 *
 * This middleware:
 * 1. Refreshes Supabase auth tokens automatically
 * 2. Protects routes that require authentication
 * 3. Redirects logged-in users away from auth pages
 * 4. Redirects root path to appropriate destination
 *
 * Protected routes: /tracker, /templates, /analytics, /goals, /settings (and their sub-paths)
 * Auth routes: /auth/login, /auth/signup
 * Public routes: /auth/verify-email, /auth/reset-password, /auth/callback
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (if we add them later)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
