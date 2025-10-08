'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react'
import { cn } from '@/lib/utils'

type ToastType = 'info' | 'success' | 'error'

export interface ToastOptions {
  title: string
  description?: string
  type?: ToastType
  duration?: number
}

interface Toast extends Required<Omit<ToastOptions, 'description' | 'duration'>> {
  id: string
  description?: string
  duration: number
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2, 10)
}

const typeStyles: Record<ToastType, string> = {
  info: 'border-blue-300/70 bg-blue-50/95 text-blue-900 dark:border-blue-400/30 dark:bg-blue-900/30 dark:text-blue-100',
  success:
    'border-emerald-300/70 bg-emerald-50/95 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-900/30 dark:text-emerald-100',
  error:
    'border-rose-300/70 bg-rose-50/95 text-rose-900 dark:border-rose-400/30 dark:bg-rose-900/30 dark:text-rose-100'
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (options: ToastOptions) => {
      if (!options.title) {
        return
      }

      const id = generateId()
      const duration = Math.max(options.duration ?? 4000, 0)
      const toast: Toast = {
        id,
        title: options.title,
        description: options.description,
        type: options.type ?? 'info',
        duration
      }

      setToasts(prev => [...prev, toast])

      if (duration > 0) {
        window.setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast]
  )

  const contextValue = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[200] flex w-80 flex-col gap-2"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto rounded-lg border p-3 shadow-lg backdrop-blur-sm transition-all',
              typeStyles[toast.type]
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold leading-tight">{toast.title}</p>
                {toast.description && (
                  <p className="mt-1 text-xs leading-snug opacity-80">{toast.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="ml-2 text-xs font-medium text-current opacity-80 transition hover:opacity-100"
                aria-label="Dismiss notification"
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
