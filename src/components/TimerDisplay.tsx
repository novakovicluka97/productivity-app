'use client'

import { cn } from '@/lib/utils'
import { useEffect, useState, type CSSProperties } from 'react'

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

  // Seven-segment inspired timer
  if (showSevenSegment) {
    return (
      <div
        className={cn(
          'inline-flex items-center justify-center rounded-xl bg-white/70 px-6 py-4 shadow-sm transition-transform duration-200',
          pulseAnimation && 'scale-[1.01]',
          className
        )}
      >
        <div className="flex items-center justify-center text-gray-500">
          {renderSevenSegmentDigits({ hours, minutes, seconds })}
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

type TimeParts = {
  hours: number
  minutes: number
  seconds: number
}

const segmentStyles: Record<SegmentKey, CSSProperties> = {
  a: { top: 0, left: '18%', right: '18%', height: '14%' },
  b: { top: '12%', right: 0, width: '22%', height: '36%' },
  c: { bottom: '12%', right: 0, width: '22%', height: '36%' },
  d: { bottom: 0, left: '18%', right: '18%', height: '14%' },
  e: { bottom: '12%', left: 0, width: '22%', height: '36%' },
  f: { top: '12%', left: 0, width: '22%', height: '36%' },
  g: { top: '43%', left: '18%', right: '18%', height: '14%' },
}

type SegmentKey = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g'

const digitSegments: Record<string, SegmentKey[]> = {
  '0': ['a', 'b', 'c', 'd', 'e', 'f'],
  '1': ['b', 'c'],
  '2': ['a', 'b', 'g', 'e', 'd'],
  '3': ['a', 'b', 'c', 'd', 'g'],
  '4': ['f', 'g', 'b', 'c'],
  '5': ['a', 'f', 'g', 'c', 'd'],
  '6': ['a', 'f', 'g', 'e', 'c', 'd'],
  '7': ['a', 'b', 'c'],
  '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  '9': ['a', 'b', 'c', 'd', 'f', 'g'],
}

function renderSevenSegmentDigits({ hours, minutes, seconds }: TimeParts) {
  const groups: string[] = []

  if (hours > 0) {
    groups.push(hours.toString().padStart(2, '0'))
  }

  groups.push(minutes.toString().padStart(2, '0'))
  groups.push(seconds.toString().padStart(2, '0'))

  return groups.map((group, groupIndex) => {
    const digits = group.split('')

    return (
      <span className="flex items-center" key={`group-${groupIndex}`}>
        {digits.map((digit, digitIndex) => (
          <SevenSegmentDigit key={`digit-${groupIndex}-${digitIndex}`} value={digit} />
        ))}
        {groupIndex < groups.length - 1 && <SevenSegmentColon key={`colon-${groupIndex}`} />}
      </span>
    )
  })
}

interface SevenSegmentDigitProps {
  value: string
}

function SevenSegmentDigit({ value }: SevenSegmentDigitProps) {
  const activeSegments = digitSegments[value] ?? []

  return (
    <span className="relative mx-0.5 flex h-20 w-12 items-center justify-center">
      {Object.entries(segmentStyles).map(([segment, style]) => (
        <span
          key={segment}
          className={cn(
            'absolute block rounded-full transition-opacity duration-200',
            activeSegments.includes(segment as SegmentKey)
              ? 'bg-gray-500'
              : 'opacity-0'
          )}
          style={style}
        />
      ))}
    </span>
  )
}

function SevenSegmentColon() {
  return (
    <span className="mx-1 flex h-20 w-4 flex-col items-center justify-between py-4">
      <span className="h-2.5 w-2.5 rounded-full bg-gray-500" />
      <span className="h-2.5 w-2.5 rounded-full bg-gray-500" />
    </span>
  )
}