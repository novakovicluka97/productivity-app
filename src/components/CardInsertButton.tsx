'use client'

import { Button } from './ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'

interface CardInsertButtonProps {
  onInsert: (type: 'session' | 'break', position: number) => void
  position: number
  canEdit: boolean
}

export function CardInsertButton({ onInsert, position, canEdit }: CardInsertButtonProps) {
  if (!canEdit) return null

  return (
    <TooltipProvider>
      <div className="relative flex-shrink-0 flex flex-col items-center justify-center gap-1 w-8 h-full mx-1">
        {/* Session button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => onInsert('session', position)}
              size="icon"
              className="h-7 w-7 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
              aria-label="Add session card"
            >
              S
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add Session</p>
          </TooltipContent>
        </Tooltip>

        {/* Break button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => onInsert('break', position)}
              size="icon"
              className="h-7 w-7 rounded-full bg-green-500 hover:bg-green-600 text-white"
              aria-label="Add break card"
            >
              B
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add Break</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}