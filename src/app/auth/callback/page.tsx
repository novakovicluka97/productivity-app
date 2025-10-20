import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AuthCallbackPage() {
  const supabase = await createClient()

  // Exchange the code from URL params for a session
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    console.error('Error in auth callback:', error)
    // Redirect to login with error
    redirect('/auth/login?error=auth_callback_error')
  }

  if (session) {
    // Success! Redirect to app
    redirect('/app')
  }

  // No session yet, might be email confirmation
  // Show a loading/processing page
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4 dark:from-slate-900 dark:via-gray-900 dark:to-slate-900">
      <div className="text-center">
        <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600 dark:border-slate-700 dark:border-t-slate-300"></div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Completing authentication...
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Please wait while we verify your credentials.
        </p>
      </div>
    </div>
  )
}
