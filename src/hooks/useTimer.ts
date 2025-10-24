'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Card, AppState } from '@/lib/types'
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

interface UseTimerOptions {
  onStateChange?: (state: AppState) => void
  onTimerComplete?: (completedCardId: string) => void
}

interface HydratedTimerState {
  cards: Card[]
  isPlaying: boolean
  activeCardId: string | null
  selectedCardId: string | null
}

const EMPTY_TIMER_STATE: HydratedTimerState = {
  cards: [],
  isPlaying: false,
  activeCardId: null,
  selectedCardId: null
}

function normalizeCards(cards: Card[], activeCardId: string | null, selectedCardId: string | null): Card[] {
  return cards.map(card => ({
    ...card,
    isActive: card.id === activeCardId,
    isSelected: card.id === selectedCardId
  }))
}

function cardsAreEqual(a: Card[], b: Card[]): boolean {
  if (a === b) return true
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) {
      return false
    }
  }
  return true
}

function hydrateInitialState(initialState?: AppState): HydratedTimerState {
  if (!initialState) {
    return EMPTY_TIMER_STATE
  }

  let cards = initialState.cards.map(card => ({ ...card }))
  let isPlaying = initialState.isPlaying
  let activeCardId = initialState.activeCardId
  const selectedCardId =
    initialState.selectedCardId ??
    cards.find(card => card.isSelected)?.id ??
    cards[0]?.id ??
    null

  if (isPlaying && activeCardId) {
    const activeIndex = cards.findIndex(card => card.id === activeCardId)

    if (activeIndex === -1) {
      isPlaying = false
      activeCardId = null
    } else if (initialState.lastUpdated) {
      const elapsedSeconds = Math.max(
        0,
        Math.floor((Date.now() - initialState.lastUpdated) / 1000)
      )

      if (elapsedSeconds > 0) {
        const activeCard = cards[activeIndex]
        const remaining = Math.max(activeCard.timeRemaining - elapsedSeconds, 0)

        cards[activeIndex] = {
          ...activeCard,
          timeRemaining: remaining,
          isCompleted: remaining === 0,
          isActive: remaining > 0
        }

        if (remaining === 0) {
          isPlaying = false
          activeCardId = null
        }
      }
    }
  }

  cards = normalizeCards(cards, activeCardId, selectedCardId)

  return {
    cards,
    isPlaying,
    activeCardId,
    selectedCardId
  }
}

export function useTimer(initialState?: AppState, options: UseTimerOptions = {}): UseTimerReturn {
  const hydratedInitialState = useMemo(() => hydrateInitialState(initialState), [initialState])

  const [cards, setCardsState] = useState<Card[]>(hydratedInitialState.cards)
  const [isPlaying, setIsPlaying] = useState(hydratedInitialState.isPlaying)
  const [activeCardId, setActiveCardId] = useState<string | null>(hydratedInitialState.activeCardId)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(hydratedInitialState.selectedCardId)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastTickRef = useRef<number | null>(null)
  const { playCompletionSound } = useSoundNotification()
  const { onTimerComplete } = options

  // Hydrate timer state whenever the persisted state changes
  useEffect(() => {
    if (!initialState) {
      return
    }

    const nextState = hydrateInitialState(initialState)

    setCardsState(prevCards => (cardsAreEqual(prevCards, nextState.cards) ? prevCards : nextState.cards))

    setIsPlaying(prev => (prev === nextState.isPlaying ? prev : nextState.isPlaying))

    setActiveCardId(prev => (prev === nextState.activeCardId ? prev : nextState.activeCardId))

    setSelectedCardId(prev => (prev === nextState.selectedCardId ? prev : nextState.selectedCardId))
  }, [initialState])

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
        let completedCardIdValue: string | null = null

        setCardsState(prevCards =>
          prevCards.map(card => {
            if (card.id === activeCardId && card.timeRemaining > 0) {
              const updatedTime = Math.max(card.timeRemaining - elapsedSeconds, 0)

              if (updatedTime === 0) {
                completedCardType = card.type
                completedCardIdValue = card.id
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

        if (completedCardType && completedCardIdValue) {
          if (completedCardType === 'session') {
            playCompletionSound()
          }
          setIsPlaying(false)
          setActiveCardId(null)
          lastTickRef.current = null

          // Call onTimerComplete callback if provided
          if (onTimerComplete) {
            onTimerComplete(completedCardIdValue)
          }
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
  }, [isPlaying, activeCardId, playCompletionSound, onTimerComplete])

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

  const { onStateChange } = options
  const lastPersistedStateRef = useRef<string | null>(null)

  useEffect(() => {
    if (!onStateChange) {
      return
    }

    const stateSnapshot = JSON.stringify({ cards, isPlaying, activeCardId, selectedCardId })

    if (lastPersistedStateRef.current === stateSnapshot) {
      return
    }

    lastPersistedStateRef.current = stateSnapshot

    onStateChange({
      cards,
      isPlaying,
      activeCardId,
      selectedCardId,
      lastUpdated: Date.now()
    })
  }, [cards, isPlaying, activeCardId, selectedCardId, onStateChange])

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
