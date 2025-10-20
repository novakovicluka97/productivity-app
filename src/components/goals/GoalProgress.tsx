'use client'

import { cn } from '@/lib/utils'

interface GoalProgressProps {
  current: number
  target: number
  className?: string
  showPercentage?: boolean
  showValues?: boolean
}

export function GoalProgress({
  current,
  target,
  className,
  showPercentage = true,
  showValues = true,
}: GoalProgressProps) {
  const percentage = Math.min(100, (current / target) * 100)
  const isComplete = current >= target

  return (
    <div className={cn('space-y-2', className)}>
      {/* Progress bar */}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out',
            isComplete
              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
              : 'bg-gradient-to-r from-blue-500 to-indigo-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Progress info */}
      <div className="flex items-center justify-between text-sm">
        {showValues && (
          <span className="text-muted-foreground">
            {current} / {target}
          </span>
        )}
        {showPercentage && (
          <span
            className={cn(
              'font-medium',
              isComplete ? 'text-green-600 dark:text-green-400' : 'text-foreground'
            )}
          >
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    </div>
  )
}
