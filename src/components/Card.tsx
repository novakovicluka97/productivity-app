'use client'

import { X, Clock, CheckCircle } from 'lucide-react'
import { Card as CardType } from '@/lib/types'
import { formatTime, cn } from '@/lib/utils'
import { RichTextEditor } from './RichTextEditor'
import { BreakDisplay } from './BreakDisplay'
import { TimerDisplay } from './TimerDisplay'
import { CardTimerControls } from './CardTimerControls'
import { Card as ShadcnCard, CardHeader, CardContent, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

interface CardProps {
  card: CardType
  onSelect: (cardId: string) => void
  onDelete: (cardId: string) => void
  onContentChange: (cardId: string, content: string) => void
  onStartEditing: (cardId: string) => void
  onStopEditing: () => void
  onToggleTimer: (cardId: string) => void
  onResetCard: (cardId: string) => void
  onUpdateTime: (cardId: string, newTime: number) => void
  onCompleteCard: (cardId: string) => void
  isPlaying: boolean
  isEditing?: boolean
  canEdit: boolean
}

export function Card({
  card,
  onSelect,
  onDelete,
  onContentChange,
  onStartEditing,
  onStopEditing,
  onToggleTimer,
  onResetCard,
  onUpdateTime,
  onCompleteCard,
  isPlaying,
  isEditing = false,
  canEdit
}: CardProps) {
  const isSession = card.type === 'session'
  const progress = card.duration > 0 ? ((card.duration - card.timeRemaining) / card.duration) * 100 : 0

  return (
    <ShadcnCard
      className={cn(
        'relative flex-shrink-0 mx-1 cursor-pointer flex flex-col transition-all duration-300 transform-gpu',
        'hover:shadow-lg',
        // Base size
        'w-96 min-h-[600px] max-h-[800px]',
        // Expand when selected - seamless expansion in all directions
        card.isSelected && 'scale-105 w-[420px] min-h-[650px] max-h-[850px] z-20',
        card.isSelected && 'ring-2 ring-primary ring-offset-2 shadow-2xl',
        card.isActive && 'shadow-xl',
        card.isCompleted && 'opacity-60 grayscale',
        isEditing && 'ring-2 ring-blue-500'
      )}
      onClick={() => onSelect(card.id)}
      data-card-id={card.id}
      role="button"
      tabIndex={0}
      aria-label={`${isSession ? 'Session' : 'Break'} card - ${formatTime(card.timeRemaining)} remaining`}
      aria-pressed={card.isSelected}
      onKeyDown={(e) => {
        // Don't prevent Enter/Space if editing text
        const target = e.target as HTMLElement
        if (target.contentEditable === 'true' || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return
        }
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(card.id)
        }
      }}
    >
      {/* Action Buttons */}
      {canEdit && (
        <>
          {/* Delete Button */}
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(card.id)
            }}
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 z-10 h-6 w-6 rounded-full"
            aria-label="Delete card"
          >
            <X className="h-3 w-3" />
          </Button>

          {/* Complete Button - positioned below delete button */}
          {!card.isCompleted && (
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onCompleteCard(card.id)
              }}
              variant="default"
              size="icon"
              className="absolute top-9 right-2 z-10 h-6 w-6 rounded-full bg-green-500 hover:bg-green-600"
              aria-label="Complete card"
            >
              <CheckCircle className="h-3 w-3" />
            </Button>
          )}
        </>
      )}

      {/* Card Header */}
      <CardHeader className={cn(
        'flex flex-row items-center justify-between space-y-0 pb-2',
        isSession ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-green-500 to-green-600',
        'text-white rounded-t-lg'
      )}>
        <CardTitle className="text-sm font-medium">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="capitalize">{card.type}</span>
          </div>
        </CardTitle>
        {card.isActive && (
          <Badge variant="secondary" className="bg-white/20 text-white border-0">
            Active
          </Badge>
        )}
      </CardHeader>

      {/* Timer Display */}
      <CardContent className="py-6">
        <div className="flex flex-col items-center">
          <TimerDisplay
            time={card.timeRemaining}
            totalTime={card.duration}
            className="transform scale-90"
            showSevenSegment={true}
          />

          <p className="text-sm text-muted-foreground mt-4">
            Total: {formatTime(card.duration)}
          </p>

          {/* Timer Control Buttons */}
          <CardTimerControls
            cardId={card.id}
            isActive={card.isActive}
            isPlaying={isPlaying}
            currentTime={card.timeRemaining}
            onToggleTimer={onToggleTimer}
            onResetCard={onResetCard}
            onUpdateTime={onUpdateTime}
            canEdit={canEdit}
          />
        </div>
      </CardContent>

      {/* Card Content Area */}
      <CardContent className="flex-1 overflow-y-auto px-4 pb-4" onClick={(e) => e.stopPropagation()}>
        {isSession ? (
          <div className="h-full bg-muted/50 rounded-lg border">
            <RichTextEditor
              content={card.content || ''}
              onChange={(content) => onContentChange(card.id, content)}
              onFocus={() => onStartEditing(card.id)}
              onBlur={onStopEditing}
              placeholder="Click here to start typing your session notes and tasks..."
              isReadOnly={!canEdit}
              className="h-full"
            />
          </div>
        ) : (
          <div className="h-full bg-green-50 rounded-lg border border-green-200">
            <BreakDisplay
              isActive={card.isActive}
              remainingTime={card.timeRemaining}
              totalTime={card.duration}
            />
          </div>
        )}
      </CardContent>

      {/* Completed Overlay */}
      {card.isCompleted && (
        <div className="absolute inset-0 bg-background/50 rounded-lg flex items-center justify-center">
          <Badge variant="secondary" className="shadow-lg">
            ✓ Completed
          </Badge>
        </div>
      )}
    </ShadcnCard>
  )
}