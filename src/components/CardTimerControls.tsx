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
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Timer className="h-4 w-4 mr-1" />
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
        className="bg-orange-500 hover:bg-orange-600 text-white"
      >
        <RotateCcw className="h-4 w-4 mr-1" />
        Reset
      </Button>

      <Button
        variant={isActive && isPlaying ? "destructive" : "default"}
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          onToggleTimer(cardId)
        }}
        className={isActive && isPlaying
          ? "bg-red-500 hover:bg-red-600 text-white"
          : "bg-green-500 hover:bg-green-600 text-white"
        }
      >
        {isActive && isPlaying ? (
          <>
            <Pause className="h-4 w-4 mr-1" />
            Stop
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-1" />
            Play
          </>
        )}
      </Button>
    </div>
  )
}