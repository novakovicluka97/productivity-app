'use client'

import { Play, Pause, Plus, Settings } from 'lucide-react'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Badge } from './ui/badge'

interface TimeControlsProps {
  isPlaying: boolean
  onPlayPause: () => void
  onAddCard: (type: 'session' | 'break') => void
  canEdit: boolean
}

export function TimeControls({ isPlaying, onPlayPause, onAddCard, canEdit }: TimeControlsProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-primary-foreground rounded-sm" />
            </div>
            <h1 className="text-xl font-semibold">
              Productivity
            </h1>
          </div>

          {/* Main Controls */}
          <div className="flex items-center gap-2">
            {/* Play/Pause Button */}
            <Button
              onClick={onPlayPause}
              size="icon"
              className="h-12 w-12 rounded-full"
              aria-label={isPlaying ? 'Pause timer' : 'Start timer'}
              aria-pressed={isPlaying}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" aria-hidden="true" />
              )}
            </Button>

            {/* Add Card Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  aria-label="Add new card"
                >
                  <Plus className="h-5 w-5" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onAddCard('session')}>
                  Add Session
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddCard('break')}>
                  Add Break
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings (future feature) */}
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full"
              disabled
              aria-label="Settings (coming soon)"
            >
              <Settings className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}