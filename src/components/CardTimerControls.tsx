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
import { cn } from '@/lib/utils'

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
      {/* Edit Timer Button */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="default"
            size="sm"
            disabled={!canEdit}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              // Base styling with theme-aware colors
              "group relative overflow-hidden",
              "bg-gradient-to-r from-violet-600 to-purple-600",
              "dark:from-violet-600 dark:to-purple-700",
              "forest:from-emerald-600 forest:to-emerald-700",
              "ocean:from-cyan-600 ocean:to-cyan-700",
              "text-white font-semibold uppercase tracking-wider",
              // Elegant hover effect
              "hover:from-violet-700 hover:to-purple-700",
              "dark:hover:from-violet-700 dark:hover:to-purple-800",
              "forest:hover:from-emerald-700 forest:hover:to-emerald-800",
              "ocean:hover:from-cyan-700 ocean:hover:to-cyan-800",
              // Smooth transitions and subtle scale
              "transition-all duration-300 ease-out",
              "hover:shadow-lg hover:-translate-y-0.5",
              "active:translate-y-0 active:shadow-md",
              // Disabled state
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "disabled:hover:translate-y-0 disabled:hover:shadow-none"
            )}
          >
            <Timer className="h-4 w-4 mr-1.5 transition-transform duration-300 group-hover:rotate-12" />
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

      {/* Reset Button */}
      <Button
        variant="default"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          onResetCard(cardId)
        }}
        disabled={!canEdit}
        className={cn(
          // Base styling with theme-aware colors
          "group relative overflow-hidden",
          "bg-gradient-to-r from-orange-500 to-orange-600",
          "dark:from-orange-600 dark:to-orange-700",
          "forest:from-amber-600 forest:to-amber-700",
          "ocean:from-amber-500 ocean:to-amber-600",
          "text-white font-semibold uppercase tracking-wider",
          // Elegant hover effect
          "hover:from-orange-600 hover:to-orange-700",
          "dark:hover:from-orange-700 dark:hover:to-orange-800",
          "forest:hover:from-amber-700 forest:hover:to-amber-800",
          "ocean:hover:from-amber-600 ocean:hover:to-amber-700",
          // Smooth transitions and subtle scale
          "transition-all duration-300 ease-out",
          "hover:shadow-lg hover:-translate-y-0.5",
          "active:translate-y-0 active:shadow-md",
          // Disabled state
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "disabled:hover:translate-y-0 disabled:hover:shadow-none"
        )}
      >
        <RotateCcw className="h-4 w-4 mr-1.5 transition-transform duration-500 group-hover:-rotate-180" />
        Reset
      </Button>

      {/* Start/Stop Button */}
      <Button
        variant="default"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          onToggleTimer(cardId)
        }}
        className={cn(
          // Base styling
          "group relative overflow-hidden font-semibold uppercase tracking-wider",
          // Conditional colors based on state - NO BLINKING
          isActive && isPlaying ? [
            // Stop button (red)
            "bg-gradient-to-r from-red-500 to-red-600",
            "dark:from-red-600 dark:to-red-700",
            "forest:from-rose-600 forest:to-rose-700",
            "ocean:from-red-500 ocean:to-red-600",
            "hover:from-red-600 hover:to-red-700",
            "dark:hover:from-red-700 dark:hover:to-red-800",
            "forest:hover:from-rose-700 forest:hover:to-rose-800",
            "ocean:hover:from-red-600 ocean:hover:to-red-700",
          ] : [
            // Start button (green)
            "bg-gradient-to-r from-green-500 to-green-600",
            "dark:from-green-600 dark:to-green-700",
            "forest:from-green-600 forest:to-green-700",
            "ocean:from-teal-600 ocean:to-teal-700",
            "hover:from-green-600 hover:to-green-700",
            "dark:hover:from-green-700 dark:hover:to-green-800",
            "forest:hover:from-green-700 forest:hover:to-green-800",
            "ocean:hover:from-teal-700 ocean:hover:to-teal-800",
          ],
          "text-white",
          // Smooth transitions and subtle scale
          "transition-all duration-300 ease-out",
          "hover:shadow-lg hover:-translate-y-0.5",
          "active:translate-y-0 active:shadow-md"
        )}
      >
        {isActive && isPlaying ? (
          <>
            <Pause className="h-4 w-4 mr-1.5" />
            Stop
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-1.5" />
            Start
          </>
        )}
      </Button>
    </div>
  )
}