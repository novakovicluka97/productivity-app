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
      <div className="relative flex-shrink-0 flex flex-row md:flex-col items-center justify-center gap-2 md:gap-1 w-full md:w-8 h-auto md:h-full mx-0 md:mx-1">
        {/* Session button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => onInsert('session', position)}
              size="icon"
              className="h-10 w-full md:h-7 md:w-7 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm md:text-base"
              aria-label="Add session card"
            >
              <span className="hidden md:inline">S</span>
              <span className="md:hidden font-semibold">Session</span>
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
              className="h-10 w-full md:h-7 md:w-7 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm md:text-base"
              aria-label="Add break card"
            >
              <span className="hidden md:inline">B</span>
              <span className="md:hidden font-semibold">Break</span>
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