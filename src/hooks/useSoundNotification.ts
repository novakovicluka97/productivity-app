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
      // Cleanup: Only close if AudioContext exists and is not already closed
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch((err) => {
          console.warn('Error closing AudioContext:', err)
        })
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

    const duration = 1.5 // Short bell sound
    const now = context.currentTime

    // Bell partial helper - creates one harmonic of the bell
    const playBellPartial = (
      freq: number,
      startTime: number,
      gain: number,
      decay: number
    ) => {
      const osc = context.createOscillator()
      const gainNode = context.createGain()

      osc.connect(gainNode)
      gainNode.connect(context.destination)

      // Sine wave for pure bell tone
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, startTime)

      // Bell envelope: instant attack, exponential decay
      gainNode.gain.setValueAtTime(gain, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + decay)

      osc.start(startTime)
      osc.stop(startTime + decay)
    }

    // Bell harmonics (880Hz base = A5 - pleasant bell tone)
    const baseFreq = 880
    playBellPartial(baseFreq, now, 0.4, duration) // Fundamental
    playBellPartial(baseFreq * 2.0, now, 0.25, duration * 0.8) // Octave
    playBellPartial(baseFreq * 2.4, now, 0.15, duration * 0.6) // Bell "minor third"
    playBellPartial(baseFreq * 3.0, now, 0.08, duration * 0.4) // Brightness

    // Reset playing flag after duration
    setTimeout(() => {
      isPlayingRef.current = false
    }, duration * 1000)
  }

  return { playCompletionSound }
}