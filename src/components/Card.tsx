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
    <div className="relative flex-shrink-0 w-full mx-0 md:mx-2">
      {/* Animated gradient background for active/selected cards */}
      {(card.isActive || card.isSelected) && (
        <div className={cn(
          "absolute inset-0 rounded-3xl blur-2xl transition-all duration-500",
          isSession
            ? "bg-gradient-to-br from-blue-400/30 via-purple-400/30 to-pink-400/30 dark:from-blue-600/20 dark:via-purple-600/20 dark:to-pink-600/20"
            : "bg-gradient-to-br from-green-400/30 via-teal-400/30 to-cyan-400/30 dark:from-green-600/20 dark:via-teal-600/20 dark:to-cyan-600/20",
          card.isActive && "animate-pulse"
        )} />
      )}

      <ShadcnCard
        className={cn(
          'relative flex-shrink-0 cursor-pointer flex flex-col transition-all duration-500 transform-gpu',
          // Glass morphism effect
          'backdrop-blur-md bg-white/80 border-white/50',
          'dark:bg-slate-800/80 dark:border-slate-700/50',
          'hover:shadow-2xl hover:bg-white/90 dark:hover:bg-slate-800/90',
          // Base size
          'w-full max-w-md sm:w-96 sm:max-w-none min-h-[520px] sm:min-h-[600px] max-h-[820px]',
          // Modern rounded corners
          'rounded-3xl',
          // Expand when selected - seamless expansion in all directions
          card.isSelected && 'sm:scale-105 sm:w-[420px] sm:min-h-[650px] sm:max-h-[850px] sm:z-20',
          card.isSelected && 'shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3)] border-2',
          card.isActive && 'shadow-2xl',
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
        'flex flex-row items-center justify-between space-y-0 pb-2 relative overflow-hidden',
        'rounded-t-3xl'
      )}>
        {/* Animated gradient background */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r opacity-90",
          isSession
            ? "from-blue-500 via-purple-500 to-pink-500 dark:from-blue-700 dark:via-purple-700 dark:to-pink-700 forest:from-green-600 forest:via-emerald-600 forest:to-teal-600 ocean:from-blue-600 ocean:via-cyan-600 ocean:to-teal-600"
            : "from-green-500 via-teal-500 to-cyan-500 dark:from-green-700 dark:via-teal-700 dark:to-cyan-700 forest:from-lime-600 forest:via-green-600 forest:to-emerald-600 ocean:from-cyan-600 ocean:via-sky-600 ocean:to-blue-600"
        )} />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 dark:to-white/5" />

        <CardTitle className="relative z-10 text-sm font-medium">
          <div className="flex items-center gap-2 text-white">
            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
              <Clock className="h-4 w-4" />
            </div>
            <span className="capitalize font-semibold tracking-wide">{card.type}</span>
          </div>
        </CardTitle>
        {card.isActive && (
          <Badge className="relative z-10 bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30">
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
            isActive={card.isActive}
          />

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
          <div className="h-full rounded-2xl backdrop-blur-sm bg-gradient-to-br from-white/50 to-gray-50/50 border border-white/50 shadow-inner">
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
          <div className="h-full rounded-2xl backdrop-blur-sm bg-gradient-to-br from-green-50/50 to-teal-50/50 border border-green-200/50 shadow-inner">
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
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-3xl flex items-center justify-center">
          <Badge className="shadow-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-4 py-2 text-lg">
            Completed
          </Badge>
        </div>
      )}
      </ShadcnCard>
    </div>
  )
}
