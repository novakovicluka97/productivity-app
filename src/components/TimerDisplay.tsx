'use client'

import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface TimerDisplayProps {
  time: number // time in seconds
  totalTime?: number // total duration for progress calculation
  className?: string
  showSevenSegment?: boolean // Option to show seven-segment display style
  isActive?: boolean
}

export function TimerDisplay({ time, totalTime, className, showSevenSegment = true, isActive = false }: TimerDisplayProps) {
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time % 3600) / 60)
  const seconds = time % 60
  const [pulseAnimation, setPulseAnimation] = useState(false)

  const formatSegment = (num: number) => num.toString().padStart(2, '0')

  // Trigger pulse animation on seconds change when active
  useEffect(() => {
    if (isActive) {
      setPulseAnimation(true)
      const timeout = setTimeout(() => setPulseAnimation(false), 200)
      return () => clearTimeout(timeout)
    }
  }, [seconds, isActive])

  // Modern card-flip style timer
  if (showSevenSegment) {
    const progress = totalTime ? ((totalTime - time) / totalTime) * 100 : 0

    return (
      <div className={cn("relative inline-block", className)}>
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 blur-2xl animate-pulse" />

        {/* Progress ring */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 200 200"
        >
          {/* Background ring */}
          <circle
            cx="100"
            cy="100"
            r="95"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-gray-200/50"
          />
          {/* Progress ring */}
          {totalTime && (
            <circle
              cx="100"
              cy="100"
              r="95"
              stroke="url(#timer-gradient)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 95}`}
              strokeDashoffset={`${2 * Math.PI * 95 * (1 - progress / 100)}`}
              className="transition-all duration-1000 ease-linear drop-shadow-lg"
            />
          )}
          <defs>
            <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>

        <div className="flex flex-col items-center justify-center p-8">
          {/* Modern Timer Display */}
          <div className={cn(
            "flex items-center justify-center font-mono transition-all duration-200",
            pulseAnimation && "scale-105"
          )}>
            {hours > 0 && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl blur-md" />
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-xl border border-white/50">
                    <span className="text-5xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent tabular-nums">
                      {formatSegment(hours)}
                    </span>
                  </div>
                </div>
                <span className="text-4xl font-light text-gray-400 mx-2 animate-pulse">:</span>
              </>
            )}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl blur-md" />
              <div className="relative bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-xl border border-white/50">
                <span className="text-5xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent tabular-nums">
                  {formatSegment(minutes)}
                </span>
              </div>
            </div>
            <span className="text-4xl font-light text-gray-400 mx-2 animate-pulse">:</span>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-xl blur-md" />
              <div className="relative bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-xl border border-white/50">
                <span className="text-5xl font-bold bg-gradient-to-br from-pink-600 to-red-600 bg-clip-text text-transparent tabular-nums">
                  {formatSegment(seconds)}
                </span>
              </div>
            </div>
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