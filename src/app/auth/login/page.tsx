import React from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { OAuthButtons } from '@/components/auth/OAuthButtons'

export const metadata = {
  title: 'Log in | Session-Break',
  description: 'Log in to your Session-Break account',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4 dark:from-slate-900 dark:via-gray-900 dark:to-slate-900">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Session-Break
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Welcome back! Sign in to your account
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-lg bg-white/80 p-8 shadow-xl backdrop-blur-sm dark:bg-slate-800/80">
          <LoginForm />
          <div className="mt-6">
            <OAuthButtons />
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
