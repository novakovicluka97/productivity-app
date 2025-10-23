import React, { Suspense } from "react"
import Link from "next/link"
import { SignupForm } from "@/components/auth/SignupForm"

export const metadata = {
  title: 'Sign up | Session-Break',
  description: 'Create a new Session-Break account',
}

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4 dark:from-slate-900 dark:via-gray-900 dark:to-slate-900">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Session-Break
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Create your account to get started
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-lg bg-white/80 p-8 shadow-xl backdrop-blur-sm dark:bg-slate-800/80">
          <Suspense fallback={<div className="text-center">Loading...</div>}>
            <SignupForm />
          </Suspense>
        </div>

        {/* Footer */}
        <div className="space-y-3">
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
          <div className="text-center text-sm">
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white/60 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-white dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Continue without signing up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
