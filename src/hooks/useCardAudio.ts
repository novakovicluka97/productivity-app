'use client'

import { useEffect, useRef } from 'react'
import { useAudioPlayer } from 'react-use-audio-player'
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
  const { load, play, pause, stop, isPlaying, setVolume } = useAudioPlayer()
  const currentTrackRef = useRef<string | undefined>(undefined)

  // Music is now fully decoupled from timer and card state - global audio player

  // Load track when selected - music can be loaded independently of timer state
  useEffect(() => {
    if (selectedTrack && selectedTrack !== currentTrackRef.current) {
      const track = getTrackById(selectedTrack)
      if (track) {
        const audioPath = getAudioPath(track.filename)
        console.log(`Loading track:`, audioPath)

        // Store current playing state to preserve it after track change
        const wasPlayingBefore = isPlaying

        load(audioPath, {
          autoplay: false,
          loop: true,
          format: 'mp3',
          html5: true
        })
        currentTrackRef.current = selectedTrack

        // Resume playback if music was playing before track change
        if (wasPlayingBefore && isMusicPlaying) {
          // Small delay to ensure track is loaded
          setTimeout(() => play(), 100)
        }
      }
    }
  }, [selectedTrack, load, isMusicPlaying, isPlaying, play])

  // Update volume - always responsive
  useEffect(() => {
    setVolume(volume / 100)
  }, [volume, setVolume])

  // Handle play/pause - independent of timer state
  useEffect(() => {
    if (!selectedTrack) return

    const shouldPlay = isMusicPlaying

    if (shouldPlay && !isPlaying) {
      console.log(`Starting playback`)
      play()
    } else if (!shouldPlay && isPlaying) {
      console.log(`Pausing playback`)
      pause()
    }
  }, [isMusicPlaying, selectedTrack, isPlaying, play, pause])

  // Cleanup - stop audio when component unmounts
  useEffect(() => {
    return () => {
      if (isPlaying) {
        console.log(`Unmounting, stopping audio`)
        stop()
      }
    }
  }, [isPlaying, stop])

  const togglePlayPause = () => {
    if (!selectedTrack) return

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
