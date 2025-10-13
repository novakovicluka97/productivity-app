'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
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

type LooseCard = Partial<Omit<Card, 'id'>> & { id?: string | number }

function coerceNumber(value: unknown, fallback: number) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return fallback
}

function normalizeCards(cards: Card[]): Card[] {
  return cards.map((card, index) => {
    const looseCard = card as LooseCard
    const rawId = looseCard.id ?? index + 1
    const id = typeof rawId === 'string' ? rawId : String(rawId)

    const rawDuration = coerceNumber(looseCard.duration, 0)
    const duration = Math.max(0, Math.floor(rawDuration))

    const rawTimeRemaining = coerceNumber(looseCard.timeRemaining, duration)
    const clampedTimeRemaining = Math.max(
      0,
      Math.min(Math.floor(rawTimeRemaining), duration || Number.MAX_SAFE_INTEGER)
    )

    const timeRemaining = duration === 0 ? 0 : clampedTimeRemaining
    const isCompleted = Boolean(looseCard.isCompleted) || timeRemaining === 0
    const isActive = !isCompleted && Boolean(looseCard.isActive)

    return {
      ...card,
      id,
      duration,
      timeRemaining,
      isActive,
      isCompleted,
      isSelected: Boolean(looseCard.isSelected)
    }
  })
}

export function useTimer(initialCards: Card[] = []): UseTimerReturn {
  const normalizedInitialCards = useMemo(() => normalizeCards(initialCards), [initialCards])

  const [cards, setCardsState] = useState<Card[]>(normalizedInitialCards)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeCardId, setActiveCardId] = useState<string | null>(
    normalizedInitialCards.find(
      card => card.isActive && !card.isCompleted && card.timeRemaining > 0
    )?.id || null
  )
  const [selectedCardId, setSelectedCardId] = useState<string | null>(
    normalizedInitialCards.find(card => card.isSelected)?.id || null
  )

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastTickRef = useRef<number | null>(null)
  const { playCompletionSound } = useSoundNotification()
  const previousInitialCardsRef = useRef<string | null>(null)

  // Sync with incoming initial cards (including values restored from persistence)
  useEffect(() => {
    const serializedInitial = JSON.stringify(normalizedInitialCards)

    if (previousInitialCardsRef.current === serializedInitial) {
      return
    }

    previousInitialCardsRef.current = serializedInitial

    setCardsState(prevCards => {
      const prevSerialized = JSON.stringify(prevCards)
      if (prevSerialized !== serializedInitial) {
        return normalizedInitialCards
      }
      return prevCards
    })

    const savedSelected = normalizedInitialCards.find(card => card.isSelected)?.id ?? null
    setSelectedCardId(prevSelected => (prevSelected === savedSelected ? prevSelected : savedSelected))

    const savedActive =
      normalizedInitialCards.find(
        card => card.isActive && !card.isCompleted && card.timeRemaining > 0
      )?.id ?? null

    setActiveCardId(prevActive => (prevActive === savedActive ? prevActive : savedActive))
  }, [normalizedInitialCards])

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
        let hasCompletedCard = false
        let nextCardToActivate: string | null = null

        setCardsState(prevCards =>
          prevCards.map((card, index) => {
            if (card.id === activeCardId && card.timeRemaining > 0) {
              const updatedTime = Math.max(card.timeRemaining - elapsedSeconds, 0)

              if (updatedTime === 0) {
                completedCardType = card.type
                hasCompletedCard = true

                const nextCard = prevCards.slice(index + 1).find(next =>
                  next.timeRemaining > 0 && !next.isCompleted
                )

                if (nextCard) {
                  nextCardToActivate = nextCard.id
                }
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

        if (completedCardType === 'session') {
          playCompletionSound()
        }

        if (hasCompletedCard) {
          if (nextCardToActivate) {
            setSelectedCardId(nextCardToActivate)
            setActiveCardId(nextCardToActivate)
            setIsPlaying(true)
            lastTickRef.current = Date.now()
          } else {
            setIsPlaying(false)
            setActiveCardId(null)
            lastTickRef.current = null
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
  }, [isPlaying, activeCardId, playCompletionSound])

  // Update cards when active card changes
  useEffect(() => {
    setCardsState(prevCards => {
      let didChange = false

      const updatedCards = prevCards.map(card => {
        const shouldBeActive = card.id === activeCardId
        if (card.isActive === shouldBeActive) {
          return card
        }

        didChange = true
        return {
          ...card,
          isActive: shouldBeActive
        }
      })

      return didChange ? updatedCards : prevCards
    })
  }, [activeCardId])

  // Update cards when selected card changes
  useEffect(() => {
    setCardsState(prevCards => {
      let didChange = false

      const updatedCards = prevCards.map(card => {
        const shouldBeSelected = card.id === selectedCardId
        if (card.isSelected === shouldBeSelected) {
          return card
        }

        didChange = true
        return {
          ...card,
          isSelected: shouldBeSelected
        }
      })

      return didChange ? updatedCards : prevCards
    })
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
    const normalizedCards = normalizeCards(newCards)
    setCardsState(normalizedCards)

    // Update selected card if current selection no longer exists
    if (selectedCardId && !normalizedCards.find(card => card.id === selectedCardId)) {
      const firstCard = normalizedCards[0]
      setSelectedCardId(firstCard?.id || null)
    }

    // Update active card if current active card no longer exists
    if (activeCardId && !normalizedCards.find(card => card.id === activeCardId)) {
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
    const clampedTime = Math.max(0, Math.floor(newTime))

    setCardsState(prevCards =>
      prevCards.map(card =>
        card.id === cardId
          ? {
              ...card,
              timeRemaining: clampedTime,
              duration: Math.max(card.duration, clampedTime), // Update duration if time is extended
              isCompleted: clampedTime === 0,
              isActive: clampedTime === 0 ? false : card.isActive
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
