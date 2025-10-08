'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card } from '@/lib/types'
import { useSoundNotification } from './useSoundNotification'

interface UseTimerReturn {
  cards: Card[]
  isPlaying: boolean
  activeCardId: string | null
  selectedCardId: string | null
  startTimer: (cardIdToStart?: string) => void
  pauseTimer: () => void
  toggleTimer: () => void
  setCards: (cards: Card[]) => void
  selectCard: (cardId: string) => void
  updateCardTime: (cardId: string, newTime: number) => void
  resetCard: (cardId: string) => void
}

export function useTimer(initialCards: Card[] = []): UseTimerReturn {
  const [cards, setCardsState] = useState<Card[]>(initialCards)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeCardId, setActiveCardId] = useState<string | null>(null)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(
    initialCards.find(card => card.isSelected)?.id || null
  )

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastTickRef = useRef<number | null>(null)
  const { playCompletionSound } = useSoundNotification()

  // Only sync initialCards on mount, not on every change (prevents infinite loops)
  useEffect(() => {
    setCardsState(initialCards)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Timer logic - updates while playing, accounting for real elapsed time to prevent drift
  useEffect(() => {
    if (isPlaying && activeCardId) {
      if (lastTickRef.current === null) {
        lastTickRef.current = Date.now()
      }

      intervalRef.current = setInterval(() => {
        const now = Date.now()
        const lastTick = lastTickRef.current ?? now
        const elapsedSeconds = Math.floor((now - lastTick) / 1000)

        if (elapsedSeconds <= 0) {
          return
        }

        lastTickRef.current = lastTick + elapsedSeconds * 1000

        let completedCardType: Card['type'] | null = null

        setCardsState(prevCards =>
          prevCards.map(card => {
            if (card.id === activeCardId && card.timeRemaining > 0) {
              const updatedTime = Math.max(card.timeRemaining - elapsedSeconds, 0)

              if (updatedTime === 0) {
                completedCardType = card.type
                return {
                  ...card,
                  timeRemaining: 0,
                  isCompleted: true,
                  isActive: false
                }
              }

              return {
                ...card,
                timeRemaining: updatedTime
              }
            }
            return card
          })
        )

        if (completedCardType) {
          if (completedCardType === 'session') {
            playCompletionSound()
          }
          setIsPlaying(false)
          setActiveCardId(null)
          lastTickRef.current = null
        }
      }, 250)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      lastTickRef.current = null
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isPlaying, activeCardId, playCompletionSound])

  // Update cards when active card changes
  useEffect(() => {
    setCardsState(prevCards => 
      prevCards.map(card => ({
        ...card,
        isActive: card.id === activeCardId
      }))
    )
  }, [activeCardId])

  // Update cards when selected card changes
  useEffect(() => {
    setCardsState(prevCards => 
      prevCards.map(card => ({
        ...card,
        isSelected: card.id === selectedCardId
      }))
    )
  }, [selectedCardId])

  const startTimer = useCallback((cardIdToStart?: string) => {
    // Use provided cardId or fall back to existing logic
    let cardToActivate = cardIdToStart || activeCardId

    if (!cardToActivate && selectedCardId) {
      const selectedCard = cards.find(card => card.id === selectedCardId)
      if (selectedCard && selectedCard.timeRemaining > 0 && !selectedCard.isCompleted) {
        cardToActivate = selectedCardId
      }
    }

    // If no valid card to activate, find first incomplete card
    if (!cardToActivate) {
      const firstIncompleteCard = cards.find(card =>
        card.timeRemaining > 0 && !card.isCompleted
      )
      if (firstIncompleteCard) {
        cardToActivate = firstIncompleteCard.id
        setSelectedCardId(firstIncompleteCard.id)
      }
    }

    if (cardToActivate) {
      lastTickRef.current = Date.now()
      setActiveCardId(cardToActivate)
      setIsPlaying(true)
    }
  }, [activeCardId, selectedCardId, cards])

  const pauseTimer = useCallback(() => {
    setIsPlaying(false)
    setActiveCardId(null)
    lastTickRef.current = null
  }, [])

  const toggleTimer = useCallback(() => {
    if (isPlaying) {
      pauseTimer()
    } else {
      startTimer()
    }
  }, [isPlaying, startTimer, pauseTimer])

  const setCards = useCallback((newCards: Card[]) => {
    setCardsState(newCards)
    
    // Update selected card if current selection no longer exists
    if (selectedCardId && !newCards.find(card => card.id === selectedCardId)) {
      const firstCard = newCards[0]
      setSelectedCardId(firstCard?.id || null)
    }
    
    // Update active card if current active card no longer exists
    if (activeCardId && !newCards.find(card => card.id === activeCardId)) {
      setActiveCardId(null)
      setIsPlaying(false)
    }
  }, [selectedCardId, activeCardId])

  const selectCard = useCallback((cardId: string) => {
    const card = cards.find(c => c.id === cardId)
    if (card) {
      setSelectedCardId(cardId)
    }
  }, [cards])

  const updateCardTime = useCallback((cardId: string, newTime: number) => {
    setCardsState(prevCards => 
      prevCards.map(card => 
        card.id === cardId 
          ? { 
              ...card, 
              timeRemaining: newTime,
              duration: Math.max(card.duration, newTime), // Update duration if time is extended
              isCompleted: newTime === 0
            }
          : card
      )
    )
  }, [])

  const resetCard = useCallback((cardId: string) => {
    setCardsState(prevCards => 
      prevCards.map(card => 
        card.id === cardId 
          ? { 
              ...card, 
              timeRemaining: card.duration,
              isCompleted: false,
              isActive: false
            }
          : card
      )
    )
    
    // If resetting the active card, pause the timer
    if (cardId === activeCardId) {
      setIsPlaying(false)
      setActiveCardId(null)
      lastTickRef.current = null
    }
  }, [activeCardId])

  return {
    cards,
    isPlaying,
    activeCardId,
    selectedCardId,
    startTimer,
    pauseTimer,
    toggleTimer,
    setCards,
    selectCard,
    updateCardTime,
    resetCard
  }
}
