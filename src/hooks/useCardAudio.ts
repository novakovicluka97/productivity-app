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
  const [isLoading, setIsLoading] = useState(false)
  const currentTrackRef = useRef<string | undefined>(undefined)

  // Load track when selected
  useEffect(() => {
    if (selectedTrack && selectedTrack !== currentTrackRef.current) {
      const track = getTrackById(selectedTrack)
      if (track) {
        const audioPath = getAudioPath(track.filename)
        const wasPlaying = isPlaying

        // Unload previous track with error handling
        if (howlRef.current) {
          try {
            howlRef.current.stop()
            howlRef.current.unload()
          } catch (error) {
            console.error('Error stopping previous track:', error)
          }
          setIsPlaying(false) // Immediately reset state to prevent race conditions
        }

        setIsLoading(true)

        // Create new Howl instance with Web Audio API (html5: false)
        try {
          howlRef.current = new Howl({
            src: [audioPath],
            html5: false, // Use Web Audio API for better performance and fewer race conditions
            loop: true,
            volume: volume / 100,
            preload: true,
            onload: () => {
              setIsLoading(false)
              if (wasPlaying && isMusicPlaying) {
                try {
                  howlRef.current?.play()
                  setIsPlaying(true)
                } catch (error) {
                  console.error('Error auto-playing track:', error)
                  setIsPlaying(false)
                }
              }
            },
            onloaderror: (id, error) => {
              console.error('Error loading audio track:', error)
              setIsLoading(false)
              setIsPlaying(false)
            },
            onplayerror: (id, error) => {
              console.error('Error playing audio track:', error)
              setIsPlaying(false)
              // Unlock audio and retry (useful for autoplay restrictions)
              if (howlRef.current) {
                try {
                  howlRef.current.once('unlock', () => {
                    howlRef.current?.play()
                  })
                } catch (e) {
                  console.error('Error setting up unlock handler:', e)
                }
              }
            },
            onplay: () => setIsPlaying(true),
            onpause: () => setIsPlaying(false),
            onstop: () => setIsPlaying(false),
            onend: () => setIsPlaying(false)
          })

          currentTrackRef.current = selectedTrack
        } catch (error) {
          console.error('Error creating Howl instance:', error)
          setIsLoading(false)
          setIsPlaying(false)
        }
      }
    }
    // Only recreate Howl when track changes
    // Volume is handled by separate effect below
    // Play/pause is handled by separate effect below
  }, [selectedTrack])

  // Update volume
  useEffect(() => {
    if (howlRef.current) {
      try {
        howlRef.current.volume(volume / 100)
      } catch (error) {
        console.error('Error setting volume:', error)
      }
    }
  }, [volume])

  // Handle play/pause
  useEffect(() => {
    if (!howlRef.current || !selectedTrack || isLoading) return

    try {
      if (isMusicPlaying && !isPlaying) {
        howlRef.current.play()
      } else if (!isMusicPlaying && isPlaying) {
        howlRef.current.pause()
      }
    } catch (error) {
      console.error('Error toggling playback:', error)
      setIsPlaying(false)
    }
  }, [isMusicPlaying, isPlaying, isLoading])

  // Cleanup
  useEffect(() => {
    return () => {
      if (howlRef.current) {
        try {
          howlRef.current.stop()
          howlRef.current.unload()
        } catch (error) {
          console.error('Error during cleanup:', error)
        }
      }
    }
  }, [])

  const togglePlayPause = () => {
    if (!howlRef.current || !selectedTrack || isLoading) return

    try {
      if (isPlaying) {
        howlRef.current.pause()
      } else {
        howlRef.current.play()
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error)
      setIsPlaying(false)
    }
  }

  const stop = () => {
    if (howlRef.current) {
      try {
        howlRef.current.stop()
      } catch (error) {
        console.error('Error stopping playback:', error)
      }
    }
  }

  return {
    isPlaying,
    togglePlayPause,
    stop
  }
}
