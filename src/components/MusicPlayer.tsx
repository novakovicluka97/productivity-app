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
  isActive?: boolean // Whether there's an active card
}

export function MusicPlayer({
  selectedTrack,
  volume,
  isMusicPlaying,
  isTimerActive,
  onTrackSelect,
  onVolumeChange,
  onPlayToggle,
  className,
  isActive = true
}: MusicPlayerProps) {
  const currentTrack = selectedTrack ? getTrackById(selectedTrack) : null

  return (
    <div className={cn(
      "relative rounded-lg backdrop-blur-md bg-white/30 border border-white/50 px-3 py-1.5 shadow-sm",
      "transition-all duration-300",
      isActive ? "hover:bg-white/40" : "opacity-60",
      className
    )}>
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />

      {/* Compact single-row layout */}
      <div className="relative z-10 flex items-center gap-2">
        {/* Track Selection - Compact */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 bg-white/50 hover:bg-white/70 backdrop-blur-sm min-w-[120px] justify-between"
              disabled={!isActive}
            >
              <span className="text-xs font-medium truncate max-w-[80px]">
                {currentTrack ? currentTrack.name : 'Select Track'}
              </span>
              <ChevronDown className="h-3 w-3 ml-1 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 max-h-72 overflow-y-auto">
            {audioTracks.map((track) => (
              <DropdownMenuItem
                key={track.id}
                onClick={() => onTrackSelect(track.id)}
                className="flex flex-col items-start py-2"
              >
                <span className="font-medium text-sm">{track.name}</span>
                {track.description && (
                  <span className="text-xs text-muted-foreground">{track.description}</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Play/Pause Button */}
        <Button
          onClick={onPlayToggle}
          size="icon"
          variant="ghost"
          className={cn(
            "h-8 w-8 rounded-full flex-shrink-0",
            "bg-gradient-to-br from-blue-500/20 to-purple-500/20",
            "hover:from-blue-500/30 hover:to-purple-500/30",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          disabled={!selectedTrack || !isActive}
          aria-label={isMusicPlaying ? 'Pause music' : 'Play music'}
        >
          {isMusicPlaying ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5 ml-0.5" />
          )}
        </Button>

        {/* Volume Control - Compact */}
        <div className="flex items-center gap-1.5 flex-1 min-w-[120px]">
          <Volume2 className="h-3.5 w-3.5 text-gray-600 flex-shrink-0" />
          <Slider
            value={[volume]}
            onValueChange={([value]) => onVolumeChange(value)}
            max={100}
            step={1}
            className="flex-1"
            disabled={!selectedTrack || !isActive}
            aria-label="Volume control"
          />
          <span className="text-xs text-gray-600 min-w-[2rem] text-right">
            {volume}%
          </span>
        </div>

        {/* Playing indicator - inline */}
        {isMusicPlaying && isTimerActive && (
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
        )}
      </div>
    </div>
  )
}