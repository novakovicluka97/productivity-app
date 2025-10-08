'use client'

import { useEffect, useRef, useState } from 'react'
import { Howl } from 'howler'
import { getAudioPath, getTrackById } from '@/lib/audioConfig'

interface UseCardAudioProps {
  selectedTrack?: string
  volume: number
  isMusicPlaying: boolean
}

export function useCardAudio({
  selectedTrack,
  volume,
  isMusicPlaying
}: UseCardAudioProps) {
  const howlRef = useRef<Howl | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const currentTrackRef = useRef<string | undefined>(undefined)

  // Load track when selected
  useEffect(() => {
    if (selectedTrack && selectedTrack !== currentTrackRef.current) {
      const track = getTrackById(selectedTrack)
      if (track) {
        const audioPath = getAudioPath(track.filename)

        const wasPlaying = isPlaying

        // Unload previous track
        if (howlRef.current) {
          howlRef.current.stop()
          howlRef.current.unload()
        }

        // Create new Howl instance
        howlRef.current = new Howl({
          src: [audioPath],
          html5: true,
          loop: true,
          volume: volume / 100,
          onload: () => {
            if (wasPlaying && isMusicPlaying) {
              howlRef.current?.play()
              setIsPlaying(true)
            }
          },
          onplay: () => setIsPlaying(true),
          onpause: () => setIsPlaying(false),
          onstop: () => setIsPlaying(false),
          onend: () => setIsPlaying(false)
        })

        currentTrackRef.current = selectedTrack
      }
    }
  }, [selectedTrack, isMusicPlaying, volume, isPlaying])

  // Update volume
  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.volume(volume / 100)
    }
  }, [volume])

  // Handle play/pause
  useEffect(() => {
    if (!howlRef.current || !selectedTrack) return

    if (isMusicPlaying && !isPlaying) {
      howlRef.current.play()
    } else if (!isMusicPlaying && isPlaying) {
      howlRef.current.pause()
    }
  }, [isMusicPlaying, isPlaying, selectedTrack])

  // Cleanup
  useEffect(() => {
    return () => {
      if (howlRef.current) {
        howlRef.current.stop()
        howlRef.current.unload()
      }
    }
  }, [])

  const togglePlayPause = () => {
    if (!howlRef.current || !selectedTrack) return
    if (isPlaying) {
      howlRef.current.pause()
    } else {
      howlRef.current.play()
    }
  }

  const stop = () => {
    if (howlRef.current) {
      howlRef.current.stop()
    }
  }

  return {
    isPlaying,
    togglePlayPause,
    stop
  }
}
