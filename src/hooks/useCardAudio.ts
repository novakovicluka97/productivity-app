'use client'

import { useEffect, useRef } from 'react'
import { useAudioPlayer } from 'react-use-audio-player'
import { getAudioPath, getTrackById } from '@/lib/audioConfig'

interface UseCardAudioProps {
  cardId: string
  selectedTrack?: string
  volume: number
  isMusicPlaying: boolean
  isTimerActive: boolean
}

export function useCardAudio({
  cardId,
  selectedTrack,
  volume,
  isMusicPlaying,
  isTimerActive
}: UseCardAudioProps) {
  const { load, play, pause, stop, isPlaying, setVolume } = useAudioPlayer()
  const currentTrackRef = useRef<string | undefined>(undefined)
  const wasActiveRef = useRef(false)

  // CRITICAL: Only the active card should control the audio player
  // This prevents multiple cards from fighting over the same player
  const isActive = isTimerActive

  // Load track when selected AND card becomes active
  useEffect(() => {
    if (!isActive) return // Don't load if not active

    if (selectedTrack && selectedTrack !== currentTrackRef.current) {
      const track = getTrackById(selectedTrack)
      if (track) {
        const audioPath = getAudioPath(track.filename)
        console.log(`[Audio ${cardId}] Loading track:`, audioPath)
        load(audioPath, {
          autoplay: false,
          loop: true,
          format: 'mp3',
          html5: true
        })
        currentTrackRef.current = selectedTrack
      }
    }
  }, [isActive, selectedTrack, load, cardId])

  // Update volume only when active
  useEffect(() => {
    if (!isActive) return
    setVolume(volume / 100)
  }, [isActive, volume, setVolume])

  // Handle play/pause - ONLY when this card is active
  useEffect(() => {
    if (!isActive) {
      // If this card WAS active but isn't anymore, stop the audio
      if (wasActiveRef.current && isPlaying) {
        console.log(`[Audio ${cardId}] Card deactivated, stopping playback`)
        pause()
      }
      wasActiveRef.current = false
      return
    }

    wasActiveRef.current = true

    if (!selectedTrack) return

    const shouldPlay = isMusicPlaying

    if (shouldPlay && !isPlaying) {
      console.log(`[Audio ${cardId}] Starting playback`)
      play()
    } else if (!shouldPlay && isPlaying) {
      console.log(`[Audio ${cardId}] Pausing playback`)
      pause()
    }
  }, [isActive, isMusicPlaying, selectedTrack, isPlaying, play, pause, cardId])

  // Cleanup
  useEffect(() => {
    return () => {
      if (wasActiveRef.current && isPlaying) {
        console.log(`[Audio ${cardId}] Unmounting, stopping audio`)
        stop()
      }
    }
  }, [isPlaying, stop, cardId])

  const togglePlayPause = () => {
    if (!isActive || !selectedTrack) return

    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }

  return {
    isPlaying,
    togglePlayPause,
    stop
  }
}
