'use client'

import { useState, useEffect, useMemo } from 'react'
import quotes from '@/lib/quotes.json'

interface BreakDisplayProps {
  isActive: boolean
  remainingTime: number
  totalTime: number
}

export function BreakDisplay({ isActive, remainingTime, totalTime }: BreakDisplayProps) {
  // Initialize with first quote to avoid hydration mismatch
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  const [fadeClass, setFadeClass] = useState('opacity-100')
  const [isHydrated, setIsHydrated] = useState(false)

  // Randomize quote after hydration
  useEffect(() => {
    setCurrentQuoteIndex(Math.floor(Math.random() * quotes.quotes.length))
    setIsHydrated(true)
  }, [])
  
  // Calculate reading time (assuming 200 words per minute)
  const calculateReadingTime = (text: string): number => {
    const words = text.split(' ').length
    return Math.max(5, Math.ceil(words / 200 * 60)) // minimum 5 seconds
  }
  
  const currentQuote = quotes.quotes[currentQuoteIndex]
  const readingTime = useMemo(() => 
    calculateReadingTime(currentQuote.text), 
    [currentQuote]
  )
  
  // Auto-cycle quotes based on reading time
  useEffect(() => {
    if (!isActive || !isHydrated) return

    const cycleTime = Math.max(readingTime * 1000, 5000) // Minimum 5 seconds, convert to milliseconds
    const fadeOutTime = cycleTime - 500 // Start fade 500ms before change
    
    const fadeOutTimer = setTimeout(() => {
      setFadeClass('opacity-0')
    }, fadeOutTime)
    
    const cycleTimer = setTimeout(() => {
      setCurrentQuoteIndex((prev) => {
        // Ensure we get a different quote
        let nextIndex = (prev + 1) % quotes.quotes.length
        return nextIndex
      })
      setFadeClass('opacity-100')
    }, cycleTime)
    
    return () => {
      clearTimeout(fadeOutTimer)
      clearTimeout(cycleTimer)
    }
  }, [currentQuoteIndex, isActive, readingTime, isHydrated])
  
  // Handle break activation changes
  useEffect(() => {
    if (isActive) {
      setFadeClass('opacity-100')
    }
  }, [isActive])
  
  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <div className="text-5xl mb-4">☕</div>
          <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">
            Take a Break
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Recharge and come back stronger
          </p>
        </div>
        
        <div className={`transition-opacity duration-500 ${fadeClass}`}>
          <blockquote className="relative">
            <div className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-3 italic">
              &ldquo;{currentQuote.text}&rdquo;
            </div>
            <cite className="text-sm text-slate-500 dark:text-slate-400 not-italic">
              — {currentQuote.author}
            </cite>
          </blockquote>
        </div>
        
        <div className="mt-8 space-y-2">
          <div className="text-xs text-slate-400 dark:text-slate-500">
            {isActive ? `Next quote in ${Math.max(readingTime, 5)} seconds` : 'Timer paused'}
          </div>
          <div className="flex justify-center space-x-1">
            {quotes.quotes.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-1.5 rounded-full transition-all ${
                  index === currentQuoteIndex
                    ? 'bg-primary-500 w-6'
                    : 'bg-slate-300 dark:bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}