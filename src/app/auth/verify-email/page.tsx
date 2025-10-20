import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Verify Email | Session-Break',
  description: 'Verify your email address',
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4 dark:from-slate-900 dark:via-gray-900 dark:to-slate-900">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Session-Break
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Email verification
          </p>
        </div>

        {/* Info Card */}
        <div className="rounded-lg bg-white/80 p-8 shadow-xl backdrop-blur-sm dark:bg-slate-800/80">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <svg
                className="h-6 w-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>

            <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
              Check your email
            </h2>

            <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
              We&apos;ve sent you a verification link. Please check your email and click the
              link to verify your account.
            </p>

            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/auth/login">Go to login</Link>
              </Button>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Didn&apos;t receive the email? Check your spam folder or try signing up again.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Having trouble? Contact support for assistance
        </p>
      </div>
    </div>
  )
}
