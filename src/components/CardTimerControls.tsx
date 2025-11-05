'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Pause, Play, RotateCcw, Timer } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface CardTimerControlsProps {
  cardId: string
  isActive: boolean
  isPlaying: boolean
  currentTime: number
  onToggleTimer: (cardId: string) => void
  onResetCard: (cardId: string) => void
  onUpdateTime: (cardId: string, newTime: number) => void
  canEdit: boolean
}

export function CardTimerControls({
  cardId,
  isActive,
  isPlaying,
  currentTime,
  onToggleTimer,
  onResetCard,
  onUpdateTime,
  canEdit
}: CardTimerControlsProps) {
  const [hours, setHours] = useState(Math.floor(currentTime / 3600))
  const [minutes, setMinutes] = useState(Math.floor((currentTime % 3600) / 60))
  const [seconds, setSeconds] = useState(currentTime % 60)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleEditTimer = () => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds
    onUpdateTime(cardId, totalSeconds)
    setDialogOpen(false)
  }

  const handleDialogOpen = (open: boolean) => {
    if (open) {
      setHours(Math.floor(currentTime / 3600))
      setMinutes(Math.floor((currentTime % 3600) / 60))
      setSeconds(currentTime % 60)
    }
    setDialogOpen(open)
  }

  return (
    <div className="flex gap-2 justify-center mt-4">
      <Dialog open={dialogOpen} onOpenChange={handleDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="default"
            size="sm"
            disabled={!canEdit}
            onClick={(e) => e.stopPropagation()}
            className="
              bg-blue-500 hover:bg-blue-600
              dark:bg-blue-600 dark:hover:bg-blue-700
              forest:bg-emerald-600 forest:hover:bg-emerald-700
              ocean:bg-cyan-600 ocean:hover:bg-cyan-700
              text-white
              transition-all duration-200 ease-in-out
              hover:scale-105 hover:shadow-lg
              active:scale-95 active:shadow-md
              disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed
            "
          >
            <Timer className="h-4 w-4 mr-1 transition-transform group-hover:rotate-12" />
            Edit Timer
          </Button>
        </DialogTrigger>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Edit Timer Duration</DialogTitle>
            <DialogDescription>
              Set the timer duration for this card
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="hours" className="text-xs">Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  max="23"
                  value={hours}
                  onChange={(e) => setHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                  className="text-center"
                />
              </div>
              <div>
                <Label htmlFor="minutes" className="text-xs">Minutes</Label>
                <Input
                  id="minutes"
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="text-center"
                />
              </div>
              <div>
                <Label htmlFor="seconds" className="text-xs">Seconds</Label>
                <Input
                  id="seconds"
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="text-center"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEditTimer}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Button
        variant="default"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          onResetCard(cardId)
        }}
        disabled={!canEdit}
        className="
          bg-orange-500 hover:bg-orange-600
          dark:bg-orange-600 dark:hover:bg-orange-700
          forest:bg-amber-600 forest:hover:bg-amber-700
          ocean:bg-amber-500 ocean:hover:bg-amber-600
          text-white
          transition-all duration-200 ease-in-out
          hover:scale-105 hover:shadow-lg
          active:scale-95 active:shadow-md
          active:rotate-[-15deg]
          disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed
        "
      >
        <RotateCcw className="h-4 w-4 mr-1 transition-transform group-hover:rotate-[-180deg] duration-500" />
        Reset
      </Button>

      <Button
        variant={isActive && isPlaying ? "destructive" : "default"}
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          onToggleTimer(cardId)
        }}
        className={
          isActive && isPlaying
            ? `
              bg-red-500 hover:bg-red-600
              dark:bg-red-600 dark:hover:bg-red-700
              forest:bg-rose-600 forest:hover:bg-rose-700
              ocean:bg-red-500 ocean:hover:bg-red-600
              text-white
              transition-all duration-200 ease-in-out
              hover:scale-105 hover:shadow-lg
              active:scale-95 active:shadow-md
              animate-pulse
            `
            : `
              bg-green-500 hover:bg-green-600
              dark:bg-green-600 dark:hover:bg-green-700
              forest:bg-green-600 forest:hover:bg-green-700
              ocean:bg-teal-600 ocean:hover:bg-teal-700
              text-white
              transition-all duration-200 ease-in-out
              hover:scale-105 hover:shadow-lg
              active:scale-95 active:shadow-md
            `
        }
      >
        {isActive && isPlaying ? (
          <>
            <Pause className="h-4 w-4 mr-1 animate-pulse" />
            Stop
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-1" />
            Start
          </>
        )}
      </Button>
    </div>
  )
}