'use client'

import { Play, Pause, Volume2, ChevronDown } from 'lucide-react'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Slider } from './ui/slider'
import { audioTracks, getTrackById } from '@/lib/audioConfig'
import { cn } from '@/lib/utils'

interface MusicPlayerProps {
  selectedTrack: string | undefined
  volume: number
  isMusicPlaying: boolean
  isTimerActive: boolean
  onTrackSelect: (trackId: string) => void
  onVolumeChange: (volume: number) => void
  onPlayToggle: () => void
  className?: string
}

export function MusicPlayer({
  selectedTrack,
  volume,
  isMusicPlaying,
  isTimerActive,
  onTrackSelect,
  onVolumeChange,
  onPlayToggle,
  className
}: MusicPlayerProps) {
  const currentTrack = selectedTrack ? getTrackById(selectedTrack) : null

  return (
    <div className={cn(
      "relative rounded-2xl backdrop-blur-md bg-white/30 border border-white/50 p-4 shadow-lg",
      "transition-all duration-300 hover:bg-white/40",
      className
    )}>
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />

      <div className="relative z-10 space-y-3">
        {/* Track Selection */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between h-10 px-3 bg-white/50 hover:bg-white/70 backdrop-blur-sm"
              >
                <span className="text-sm font-medium truncate">
                  {currentTrack ? currentTrack.name : 'Select Track'}
                </span>
                <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-72 overflow-y-auto">
              {audioTracks.map((track) => (
                <DropdownMenuItem
                  key={track.id}
                  onClick={() => onTrackSelect(track.id)}
                  className="flex flex-col items-start py-2"
                >
                  <span className="font-medium">{track.name}</span>
                  {track.description && (
                    <span className="text-xs text-muted-foreground">{track.description}</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Play Controls and Volume */}
        <div className="flex items-center gap-3">
          {/* Play/Pause Button */}
          <Button
            onClick={onPlayToggle}
            size="icon"
            variant="ghost"
            className={cn(
              "h-9 w-9 rounded-full",
              "bg-gradient-to-br from-blue-500/20 to-purple-500/20",
              "hover:from-blue-500/30 hover:to-purple-500/30",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            disabled={!selectedTrack}
            aria-label={isMusicPlaying ? 'Pause music' : 'Play music'}
          >
            {isMusicPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </Button>

          {/* Volume Control */}
          <div className="flex items-center gap-2 flex-1">
            <Volume2 className="h-4 w-4 text-gray-600" />
            <Slider
              value={[volume]}
              onValueChange={([value]) => onVolumeChange(value)}
              max={100}
              step={1}
              className="flex-1"
              disabled={!selectedTrack}
              aria-label="Volume control"
            />
            <span className="text-xs text-gray-600 min-w-[2rem] text-right">
              {volume}%
            </span>
          </div>
        </div>

        {/* Status Indicator */}
        {isMusicPlaying && isTimerActive && (
          <div className="flex items-center gap-2 px-2 py-1 bg-green-500/10 rounded-lg">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-700">Playing</span>
          </div>
        )}
      </div>
    </div>
  )
}