'use client'

import { useEffect, useRef } from 'react'

export function useSoundNotification() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const isPlayingRef = useRef(false)

  useEffect(() => {
    // Create AudioContext on mount
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    return () => {
      // Cleanup
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const playCompletionSound = () => {
    if (!audioContextRef.current || isPlayingRef.current) return

    isPlayingRef.current = true
    const context = audioContextRef.current

    // Resume context if suspended (browser autoplay policy)
    if (context.state === 'suspended') {
      context.resume()
    }

    const duration = 10 // 10 seconds total
    const now = context.currentTime

    // Create a series of pleasant chimes
    const playChime = (frequency: number, startTime: number, chimeDuration: number = 0.8) => {
      const oscillator = context.createOscillator()
      const gainNode = context.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(context.destination)

      // Use sine wave for pleasant sound
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequency, startTime)

      // Envelope for each chime (fade in and out)
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + chimeDuration)

      oscillator.start(startTime)
      oscillator.stop(startTime + chimeDuration)
    }

    // Play a melody pattern (major chord progression)
    const baseFreq = 523.25 // C5
    const pattern = [
      { freq: baseFreq, time: 0 },           // C
      { freq: baseFreq * 1.25, time: 0.3 },  // E
      { freq: baseFreq * 1.5, time: 0.6 },   // G
      { freq: baseFreq * 2, time: 0.9 },     // C6

      // Repeat pattern
      { freq: baseFreq * 2, time: 2 },       // C6
      { freq: baseFreq * 1.5, time: 2.3 },   // G
      { freq: baseFreq * 1.25, time: 2.6 },  // E
      { freq: baseFreq, time: 2.9 },         // C

      // Another variation
      { freq: baseFreq * 1.25, time: 4 },    // E
      { freq: baseFreq * 1.5, time: 4.2 },   // G
      { freq: baseFreq * 2, time: 4.4 },     // C6
      { freq: baseFreq * 1.5, time: 4.6 },   // G
      { freq: baseFreq * 1.25, time: 4.8 },  // E

      // Final chimes
      { freq: baseFreq, time: 6 },           // C
      { freq: baseFreq * 1.25, time: 6.5 },  // E
      { freq: baseFreq * 1.5, time: 7 },     // G
      { freq: baseFreq * 2, time: 7.5 },     // C6

      // Ending
      { freq: baseFreq * 2, time: 8.5 },     // C6
      { freq: baseFreq, time: 9 },           // C
      { freq: baseFreq * 2, time: 9.3 },     // C6 (final)
    ]

    // Play all chimes
    pattern.forEach(({ freq, time }) => {
      playChime(freq, now + time)
    })

    // Add a soft background pad
    const padOsc = context.createOscillator()
    const padGain = context.createGain()
    const padFilter = context.createBiquadFilter()

    padOsc.connect(padFilter)
    padFilter.connect(padGain)
    padGain.connect(context.destination)

    padOsc.type = 'triangle'
    padOsc.frequency.setValueAtTime(baseFreq / 4, now) // Two octaves lower
    padFilter.type = 'lowpass'
    padFilter.frequency.setValueAtTime(800, now)

    // Pad envelope
    padGain.gain.setValueAtTime(0, now)
    padGain.gain.linearRampToValueAtTime(0.05, now + 1)
    padGain.gain.setValueAtTime(0.05, now + 8)
    padGain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    padOsc.start(now)
    padOsc.stop(now + duration)

    // Reset playing flag after duration
    setTimeout(() => {
      isPlayingRef.current = false
    }, duration * 1000)
  }

  return { playCompletionSound }
}