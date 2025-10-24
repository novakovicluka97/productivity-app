'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card } from './Card'
import { CardInsertButton } from './CardInsertButton'
import { Card as CardType } from '@/lib/types'
import { ScrollArea, ScrollBar } from './ui/scroll-area'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { cn } from '@/lib/utils'

interface CardContainerProps {
  cards: CardType[]
  onSelectCard: (cardId: string) => void
  onDeleteCard: (cardId: string) => void
  onContentChange: (cardId: string, content: string) => void
  onStartEditing: (cardId: string) => void
  onStopEditing: () => void
  onInsertCard: (type: 'session' | 'break', position: number) => void
  onToggleTimer: (cardId: string) => void
  onResetCard: (cardId: string) => void
  onUpdateTime: (cardId: string, newTime: number) => void
  onCompleteCard: (cardId: string) => void
  isPlaying: boolean
  editingCardId: string | null
  canEdit: boolean
}

export function CardContainer({
  cards,
  onSelectCard,
  onDeleteCard,
  onContentChange,
  onStartEditing,
  onStopEditing,
  onInsertCard,
  onToggleTimer,
  onResetCard,
  onUpdateTime,
  onCompleteCard,
  isPlaying,
  editingCardId,
  canEdit
}: CardContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollButtons = useCallback(() => {
    const viewport = viewportRef.current

    if (!viewport) {
      setCanScrollLeft(false)
      setCanScrollRight(false)
      return
    }

    const { scrollLeft, scrollWidth, clientWidth } = viewport
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
  }, [])

  // Function to center a card in view
  const centerCard = (cardId: string) => {
    requestAnimationFrame(() => {
      const viewport = viewportRef.current
      const container = containerRef.current
      if (!viewport || !container) return

      const cardElement = container.querySelector(`[data-card-id="${cardId}"]`) as HTMLElement | null
      if (!cardElement) return

      const cardLeft = cardElement.offsetLeft
      const cardWidth = cardElement.offsetWidth
      const viewportWidth = viewport.clientWidth
      const scrollPosition = cardLeft - viewportWidth / 2 + cardWidth / 2

      viewport.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      })
    })
  }

  useEffect(() => {
    const viewport = containerRef.current?.closest('[data-radix-scroll-area-viewport]') as HTMLDivElement | null
    viewportRef.current = viewport

    updateScrollButtons()

    if (!viewport) {
      return
    }

    viewport.addEventListener('scroll', updateScrollButtons)
    window.addEventListener('resize', updateScrollButtons)

    return () => {
      viewport.removeEventListener('scroll', updateScrollButtons)
      window.removeEventListener('resize', updateScrollButtons)
    }
  }, [cards, updateScrollButtons])

  // Auto-center the selected card whenever selection changes
  useEffect(() => {
    const selectedCard = cards.find(card => card.isSelected)
    if (!selectedCard) return

    const timeoutId = window.setTimeout(() => {
      centerCard(selectedCard.id)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [cards.find(card => card.isSelected)?.id])

  const scroll = (direction: 'left' | 'right') => {
    const viewport = viewportRef.current
    if (!viewport) return

    const scrollAmount = Math.max(viewport.clientWidth * 0.6, 320)
    const newScrollLeft = viewport.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount)

    viewport.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    })
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!canEdit) return // Only allow navigation when editing is enabled

      // Don't intercept arrow keys when editing text
      if (editingCardId) return

      const selectedIndex = cards.findIndex(card => card.isSelected)

      if (e.key === 'ArrowLeft' && selectedIndex > 0) {
        e.preventDefault()
        const targetCardId = cards[selectedIndex - 1].id
        onSelectCard(targetCardId)
      } else if (e.key === 'ArrowRight' && selectedIndex < cards.length - 1) {
        e.preventDefault()
        const targetCardId = cards[selectedIndex + 1].id
        onSelectCard(targetCardId)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [cards, onSelectCard, canEdit, editingCardId])

  if (cards.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-muted-foreground/20 rounded-lg" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            No cards yet
          </h3>
          <p className="text-muted-foreground mb-4 max-w-sm">
            Create your first session or break card to get started with your productivity journey.
          </p>
          <Badge variant="secondary">
            Use the + button in the header to add cards
          </Badge>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex-1">
      {/* Desktop layout */}
      <div className="relative hidden md:block">
        {canScrollLeft && (
          <Button
            onClick={() => scroll('left')}
            size="icon"
            variant="secondary"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full shadow-lg"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}

        {canScrollRight && (
          <Button
            onClick={() => scroll('right')}
            size="icon"
            variant="secondary"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full shadow-lg"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}

        <ScrollArea className="w-full">
          <div
            ref={containerRef}
            className={cn(
              'flex items-start gap-4 py-8 px-6',
              cards.length === 1 && 'justify-center'
            )}
            role="list"
            aria-label="Productivity cards"
          >
            <CardInsertButton
              onInsert={onInsertCard}
              position={0}
              canEdit={canEdit}
            />

            {cards.map((card, index) => (
              <React.Fragment key={card.id}>
                <Card
                  card={card}
                  onSelect={(cardId) => {
                    onSelectCard(cardId)
                  }}
                  onDelete={onDeleteCard}
                  onContentChange={onContentChange}
                  onStartEditing={onStartEditing}
                  onStopEditing={onStopEditing}
                  onToggleTimer={onToggleTimer}
                  onResetCard={onResetCard}
                  onUpdateTime={onUpdateTime}
                  onCompleteCard={onCompleteCard}
                  isPlaying={isPlaying}
                  isEditing={editingCardId === card.id}
                  canEdit={canEdit}
                />

                <CardInsertButton
                  onInsert={onInsertCard}
                  position={index + 1}
                  canEdit={canEdit}
                />
              </React.Fragment>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden px-4 py-6">
        <div className="flex flex-col gap-4" role="list" aria-label="Productivity cards">
          <CardInsertButton
            onInsert={onInsertCard}
            position={0}
            canEdit={canEdit}
          />

          {cards.map((card, index) => (
            <React.Fragment key={card.id}>
              <Card
                card={card}
                onSelect={onSelectCard}
                onDelete={onDeleteCard}
                onContentChange={onContentChange}
                onStartEditing={onStartEditing}
                onStopEditing={onStopEditing}
                onToggleTimer={onToggleTimer}
                onResetCard={onResetCard}
                onUpdateTime={onUpdateTime}
                onCompleteCard={onCompleteCard}
                isPlaying={isPlaying}
                isEditing={editingCardId === card.id}
                canEdit={canEdit}
              />

              <CardInsertButton
                onInsert={onInsertCard}
                position={index + 1}
                canEdit={canEdit}
              />
            </React.Fragment>
          ))}
        </div>
      </div>

      {canEdit && cards.length > 1 && (
        <div className="hidden md:block absolute bottom-4 left-1/2 -translate-x-1/2">
          <Badge variant="secondary" className="text-xs">
            Use the Left and Right arrow keys to navigate cards
          </Badge>
        </div>
      )}
    </div>
  )
}
