'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import { UpdatePasswordForm } from '@/components/auth/UpdatePasswordForm'

function ResetPasswordContent() {
  const [isUpdateMode, setIsUpdateMode] = useState(false)

  useEffect(() => {
    // Check if we have an access token (from email link)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    setIsUpdateMode(!!accessToken)
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4 dark:from-slate-900 dark:via-gray-900 dark:to-slate-900">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Session-Break
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {isUpdateMode ? 'Set your new password' : 'Reset your password'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-lg bg-white/80 p-8 shadow-xl backdrop-blur-sm dark:bg-slate-800/80">
          {isUpdateMode ? <UpdatePasswordForm /> : <ResetPasswordForm />}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Secure password reset powered by Supabase
        </p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4 dark:from-slate-900 dark:via-gray-900 dark:to-slate-900">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600 dark:border-slate-700 dark:border-t-slate-300"></div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
