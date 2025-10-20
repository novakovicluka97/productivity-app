import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Creates a Supabase client for use in Next.js middleware
 * This handles automatic token refresh and session management
 *
 * Usage in middleware.ts:
 * ```ts
 * import { updateSession } from '@/lib/supabase/middleware'
 *
 * export async function middleware(request: NextRequest) {
 *   return await updateSession(request)
 * }
 * ```
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

    // Protected routes - require authentication
    const protectedPaths = ['/app']
    const isProtectedPath = protectedPaths.some(path =>
      request.nextUrl.pathname.startsWith(path)
    )
  
    // Auth routes - redirect to /app if already logged in
    const authPaths = ['/auth/login', '/auth/signup']
    const isAuthPath = authPaths.some(path =>
      request.nextUrl.pathname.startsWith(path)
    )
  
    // Redirect logic
    if (!user && isProtectedPath) {
      // Not logged in, trying to access protected route → redirect to login
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirectedFrom', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  
    if (user && isAuthPath) {
      // Logged in, trying to access auth page → redirect to app
      const url = request.nextUrl.clone()
      url.pathname = '/app'
      return NextResponse.redirect(url)
    }

  // Redirect root to appropriate page
  if (request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = user ? '/app' : '/auth/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
