'use client'

import { cn } from '@/lib/utils'

interface TimerDisplayProps {
  time: number // time in seconds
  totalTime?: number // total duration for progress calculation
  className?: string
  showSevenSegment?: boolean // Option to show seven-segment display style
}

export function TimerDisplay({ time, totalTime, className, showSevenSegment = true }: TimerDisplayProps) {
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time % 3600) / 60)
  const seconds = time % 60

  const formatSegment = (num: number) => num.toString().padStart(2, '0')

  // Seven-segment display style (matching timer.png)
  if (showSevenSegment) {
    return (
      <div className={cn("relative inline-block", className)}>
        <div className="flex flex-col items-center">
          {/* Timer Label */}
          <div className="text-sm text-gray-600 mb-3 font-light">Timer</div>

          {/* Seven-Segment Display */}
          <div className="flex items-center justify-center font-mono">
            {hours > 0 && (
              <>
                <span className="text-6xl font-bold text-gray-700 tracking-wider tabular-nums">
                  {formatSegment(hours)}
                </span>
                <span className="text-5xl font-bold text-gray-600 mx-1">:</span>
              </>
            )}
            <span className="text-6xl font-bold text-gray-700 tracking-wider tabular-nums">
              {formatSegment(minutes)}
            </span>
            <span className="text-5xl font-bold text-gray-600 mx-1">:</span>
            <span className="text-6xl font-bold text-gray-700 tracking-wider tabular-nums">
              {formatSegment(seconds)}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Original circular timer display
  const progress = totalTime ? ((totalTime - time) / totalTime) * 100 : 0
  const circumference = 2 * Math.PI * 90 // radius = 90
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className={cn("relative inline-block", className)}>
      {/* Circular Progress Background */}
      <svg
        className="absolute inset-0 w-48 h-48 -rotate-90"
        viewBox="0 0 200 200"
      >
        {/* Background Circle */}
        <circle
          cx="100"
          cy="100"
          r="90"
          stroke="currentColor"
          strokeWidth="12"
          fill="none"
          className="text-gray-100"
        />

        {/* Progress Circle */}
        {totalTime && (
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="url(#gradient)"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        )}

        {/* Gradient Definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Timer Display */}
      <div className="relative flex flex-col items-center justify-center w-48 h-48">
        {/* Digital Timer */}
        <div className="text-center">
          <div className="font-mono text-3xl font-light text-gray-800 tracking-wider">
            {hours > 0 && (
              <>
                <span className="inline-block min-w-[2ch] bg-gradient-to-b from-white to-gray-50 rounded-lg shadow-inner px-2 py-1 mx-0.5">
                  {formatSegment(hours)}
                </span>
                <span className="mx-1 text-gray-400">:</span>
              </>
            )}
            <span className="inline-block min-w-[2ch] bg-gradient-to-b from-white to-gray-50 rounded-lg shadow-inner px-2 py-1 mx-0.5">
              {formatSegment(minutes)}
            </span>
            <span className="mx-1 text-gray-400">:</span>
            <span className="inline-block min-w-[2ch] bg-gradient-to-b from-white to-gray-50 rounded-lg shadow-inner px-2 py-1 mx-0.5">
              {formatSegment(seconds)}
            </span>
          </div>

          {/* Time Label */}
          <div className="mt-2 text-xs text-gray-500 font-medium tracking-wide uppercase">
            {hours > 0 ? 'hrs : min : sec' : 'min : sec'}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-2 w-1 h-3 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full" />
        <div className="absolute bottom-2 w-1 h-3 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full" />
      </div>
    </div>
  )
}