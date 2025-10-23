'use client'

import React, { useState, useCallback } from 'react'
import { TopHeader } from '@/components/layout/TopHeader'
import { ProtectedHeaderPortal } from '@/components/layout/ProtectedHeaderPortal'
import { CardContainer } from '@/components/CardContainer'
import { EditorProvider } from '@/components/EditorManager'
import { useTimer } from '@/hooks/useTimer'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useAutoTransfer } from '@/hooks/useAutoTransfer'
import { useCardAudio } from '@/hooks/useCardAudio'
import { useCreateSession } from '@/hooks/useSessions'
import { useQueryClient } from '@tanstack/react-query'
import { updateGoalsForSession } from '@/lib/utils/goalHelpers'
import { format } from 'date-fns'
import { Card, AppState } from '@/lib/types'

// Demo data for Step 1 testing
const initialCards: Card[] = [
  {
    id: '1',
    type: 'session',
    duration: 45 * 60, // 45 minutes in seconds
    timeRemaining: 45 * 60,
    isActive: false,
    isCompleted: false,
    isSelected: true,
    content: `<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox" disabled="disabled"></label><div><p>Review project requirements</p></div></li><li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked="checked" disabled="disabled"></label><div><p>Design system architecture</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox" disabled="disabled"></label><div><p>Implement core components</p></div></li></ul>`
  },
  {
    id: '2',
    type: 'break',
    duration: 15 * 60, // 15 minutes in seconds
    timeRemaining: 15 * 60,
    isActive: false,
    isCompleted: false,
    isSelected: false,
  },
  {
    id: '3',
    type: 'session',
    duration: 30 * 60, // 30 minutes in seconds
    timeRemaining: 30 * 60,
    isActive: false,
    isCompleted: false,
    isSelected: false,
    content: `<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox" disabled="disabled"></label><div><p>Test components in browser</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox" disabled="disabled"></label><div><p>Review design aesthetics</p></div></li></ul>`
  }
]

const getNextCardId = (cards: Card[]) => {
  const numericIds = cards
    .map(card => Number.parseInt(card.id, 10))
    .filter(id => !Number.isNaN(id))

  if (numericIds.length === 0) {
    return 1
  }

  return Math.max(...numericIds) + 1
}

export default function Home() {
  const defaultAppState = React.useMemo<AppState>(() => ({
    cards: initialCards.map(card => ({ ...card })),
    isPlaying: false,
    activeCardId: null,
    selectedCardId: initialCards.find(card => card.isSelected)?.id ?? initialCards[0]?.id ?? null,
    lastUpdated: Date.now()
  }), [])

  const [appState, setAppState, appStateHydrated] = useLocalStorage<AppState>('productivity-app-state', defaultAppState)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [nextCardId, setNextCardId] = useState(() => getNextCardId(appState.cards))
  const [selectedTrack, setSelectedTrack] = useLocalStorage<string | null>('productivity-selected-track', null)
  const [volume, setVolume] = useLocalStorage<number>('productivity-volume', 50)
  const [isMusicPlaying, setIsMusicPlaying] = useLocalStorage<boolean>('productivity-music-playing', false)

  // Session sync and query invalidation
  const createSessionMutation = useCreateSession()
  const queryClient = useQueryClient()

  // Save completed card to Supabase and update goals
  const saveCompletedCardToSupabase = useCallback(async (card: Card) => {
    try {
      const sessionDate = format(new Date(), 'yyyy-MM-dd')

      // Create session record
      const session = await createSessionMutation.mutateAsync({
        user_id: undefined as any, // Will be set by RLS
        card_id: card.id, // Store card ID to prevent duplicates at DB level
        session_date: sessionDate,
        type: card.type,
        duration: card.duration,
        time_spent: card.duration - card.timeRemaining,
        is_completed: card.isCompleted,
        content: card.content || null,
        tasks: card.todos ? card.todos.map(todo => ({
          id: todo.id,
          text: todo.text,
          completed: todo.completed,
          createdAt: todo.createdAt.toISOString(),
        })) : null,
      })

      console.log('Session saved to Supabase:', session)

      // Update goals based on session completion
      await updateGoalsForSession({
        type: card.type,
        duration: card.duration,
        timeSpent: card.duration - card.timeRemaining,
        isCompleted: card.isCompleted,
        sessionDate,
      })

      // Invalidate queries to update analytics and tracker
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['goals'] })

      console.log('Goals updated and queries invalidated')
    } catch (error) {
      console.error('Error saving session to Supabase:', error)
      // Don't throw - session saving should not block UI
    }
  }, [createSessionMutation, queryClient])

  const handlePersistedStateChange = React.useCallback(
    (state: AppState) => {
      // Only persist to localStorage after hydration to prevent overwriting stored data
      if (appStateHydrated) {
        setAppState(state)
      }
    },
    [setAppState, appStateHydrated]
  )

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const legacyCardsRaw = window.localStorage.getItem('productivity-cards')
    if (!legacyCardsRaw) {
      return
    }

    try {
      const legacyCards = JSON.parse(legacyCardsRaw) as Card[]
      if (!Array.isArray(legacyCards) || legacyCards.length === 0) {
        return
      }

      const existingStateRaw = window.localStorage.getItem('productivity-app-state')
      if (existingStateRaw) {
        try {
          const existingState = JSON.parse(existingStateRaw) as AppState
          if (existingState && Array.isArray(existingState.cards)) {
            const existingCardsString = JSON.stringify(existingState.cards)
            const defaultCardsString = JSON.stringify(defaultAppState.cards)
            if (existingCardsString !== defaultCardsString) {
              return
            }
          }
        } catch (error) {
          console.warn('Error parsing existing productivity app state:', error)
        }
      }

      const normalizedCards = legacyCards.map(card => ({ ...card }))
      const migratedState: AppState = {
        cards: normalizedCards,
        isPlaying: false,
        activeCardId: normalizedCards.find(card => card.isActive)?.id ?? null,
        selectedCardId:
          normalizedCards.find(card => card.isSelected)?.id ??
          normalizedCards[0]?.id ??
          null,
        lastUpdated: Date.now()
      }

      setAppState(migratedState)
    } catch (error) {
      console.warn('Error migrating legacy productivity cards:', error)
    } finally {
      window.localStorage.removeItem('productivity-cards')
    }
  }, [defaultAppState, setAppState])

  const {
    cards,
    isPlaying,
    activeCardId,
    selectedCardId,
    toggleTimer,
    setCards,
    selectCard,
    updateCardTime,
    resetCard,
    startTimer,
    pauseTimer
  } = useTimer(appState, { onStateChange: handlePersistedStateChange })

  // Auto-transfer unchecked todos
  // Get active card for document title
  const activeCard = cards.find(card => card.id === activeCardId)

  React.useEffect(() => {
    setNextCardId(prev => {
      const calculatedNext = getNextCardId(cards)
      return prev === calculatedNext ? prev : calculatedNext
    })
  }, [cards])

  // Single audio player instance - fully global (independent of card/timer state)
  useCardAudio({
    selectedTrack: selectedTrack ?? undefined,
    volume: volume,
    isMusicPlaying: isMusicPlaying
  })
  useAutoTransfer(cards, setCards, activeCardId)

  // Auto-save completed sessions to Supabase
  React.useEffect(() => {
    // Only save cards that are completed but not yet synced
    const completedUnsyncedCards = cards.filter(
      card => card.isCompleted && !card.syncedToSupabase
    )

    completedUnsyncedCards.forEach(async (card) => {
      try {
        console.log('Auto-saving completed card:', card.id)
        await saveCompletedCardToSupabase(card)

        // Mark card as synced in state
        const updatedCards = cards.map(c =>
          c.id === card.id
            ? { ...c, syncedToSupabase: true }
            : c
        )
        setCards(updatedCards)
      } catch (error) {
        console.error('Failed to sync card:', card.id, error)
      }
    })
  }, [cards, saveCompletedCardToSupabase, setCards])

  const handlePlayPause = () => {
    toggleTimer()
  }

  const handleToggleTimer = (cardId: string) => {
    // If this card is active and playing, pause it
    if (activeCardId === cardId && isPlaying) {
      pauseTimer()
    } else {
      // Select and start this card
      selectCard(cardId)
      startTimer(cardId)
    }
  }

  const handleCompleteCard = useCallback((cardId: string) => {
    const completedCard = cards.find(card => card.id === cardId)

    const newCards = cards.map(card =>
      card.id === cardId
        ? { ...card, isCompleted: true, isActive: false, timeRemaining: 0 }
        : card
    )
    setCards(newCards)

    // If this was the active card, stop the timer
    if (cardId === activeCardId) {
      pauseTimer()
    }

    // Save to Supabase and update goals
    if (completedCard) {
      const cardToSave = { ...completedCard, isCompleted: true, timeRemaining: 0 }
      saveCompletedCardToSupabase(cardToSave)
    }
  }, [cards, activeCardId, pauseTimer, setCards, saveCompletedCardToSupabase])

  const handleResetCard = (cardId: string) => {
    // Call the hook's resetCard function which updates the cards state
    resetCard(cardId)
  }

  const handleUpdateTime = (cardId: string, newTime: number) => {
    updateCardTime(cardId, newTime)
  }

  const handleInsertCard = (type: 'session' | 'break', position: number) => {
    const defaultDuration = type === 'session' ? 45 * 60 : 15 * 60 // 45 min session, 15 min break
    const newCard: Card = {
      id: nextCardId.toString(),
      type,
      duration: defaultDuration,
      timeRemaining: defaultDuration,
      isActive: false,
      isCompleted: false,
      isSelected: false,
      todos: type === 'session' ? [] : undefined
    }
    setNextCardId(prev => prev + 1)

    const newCards = [...cards.slice(0, position), newCard, ...cards.slice(position)]
    setCards(newCards)
    selectCard(newCard.id)
  }

  const handleSelectCard = (cardId: string) => {
    selectCard(cardId)
  }

  const handleDeleteCard = (cardId: string) => {
    if (cards.length <= 1) {
      alert('Cannot delete the last card. You need at least one card.')
      return
    }

    // Direct deletion without confirmation
    const newCards = cards.filter(card => card.id !== cardId)
    setCards(newCards)

    // Select first remaining card if deleted card was selected
    if (selectedCardId === cardId && newCards.length > 0) {
      selectCard(newCards[0].id)
    }
  }


  const handleContentChange = (cardId: string, content: string) => {
    const newCards = cards.map(card =>
      card.id === cardId ? { ...card, content } : card
    )
    setCards(newCards)
  }

  const handleStartEditing = (cardId: string) => {
    setEditingCardId(cardId)
  }

  const handleStopEditing = () => {
    setEditingCardId(null)
  }

  // Music control handlers
  const handleTrackSelect = (trackId: string) => {
    setSelectedTrack(trackId)
  }

  const handleVolumeChange = (volume: number) => {
    setVolume(volume)
  }

  const handleMusicToggle = () => {
    setIsMusicPlaying(prev => !prev)
  }

  // Removed handleFormatCommand - using TipTap editor commands instead

  const canEdit = true // Allow editing while timer is running

  // Card, timer, and selection state automatically persist via localStorage synchronization

  // Update document title with timer and card type
  React.useEffect(() => {
    const activeCard = cards.find(card => card.id === activeCardId)

    if (activeCard && isPlaying) {
      const minutes = Math.floor(activeCard.timeRemaining / 60)
      const seconds = activeCard.timeRemaining % 60
      const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      const cardType = activeCard.type === 'session' ? 'Session' : 'Break'
      document.title = `${timeString} - ${cardType}`
    } else {
      document.title = 'Session-Break'
    }
  }, [cards, activeCardId, isPlaying])

  // Keyboard navigation
  useKeyboardNavigation({
    cards,
    selectedCardId,
    canEdit,
    onSelectCard: handleSelectCard,
    onPlayPause: handlePlayPause,
    onDeleteSelected: selectedCardId ? (() => handleDeleteCard(selectedCardId)) : undefined
  })

  return (
    <EditorProvider>
      <ProtectedHeaderPortal>
        <TopHeader
          showEditingControls={true}
          canEdit={canEdit}
          isEditing={!!editingCardId}
          activeCardId={editingCardId}
          selectedTrack={selectedTrack ?? undefined}
          volume={volume}
          isMusicPlaying={isMusicPlaying}
          onTrackSelect={handleTrackSelect}
          onVolumeChange={handleVolumeChange}
          onMusicToggle={handleMusicToggle}
        />
      </ProtectedHeaderPortal>
      <div className="relative flex min-h-full flex-col overflow-hidden">
        {/* Main content area below header */}
        <main className="relative flex-1 overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-900 forest:from-green-50 forest:via-emerald-50 forest:to-teal-50 ocean:from-cyan-50 ocean:via-blue-50 ocean:to-sky-50" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent dark:via-slate-800/30 forest:via-green-100/30 ocean:via-blue-100/30" />

          {/* Animated floating orbs for depth */}
          <div className="absolute top-20 left-20 h-72 w-72 animate-pulse rounded-full bg-blue-300/30 blur-3xl dark:bg-blue-900/20 forest:bg-green-300/30 ocean:bg-cyan-300/30" />
          <div className="animation-delay-2000 absolute bottom-20 right-20 h-96 w-96 animate-pulse rounded-full bg-purple-300/30 blur-3xl dark:bg-purple-900/20 forest:bg-emerald-300/30 ocean:bg-blue-300/30" />
          <div className="animation-delay-4000 absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-pink-300/20 blur-3xl dark:bg-pink-900/10 forest:bg-teal-300/20 ocean:bg-sky-300/20" />

          <div className="relative z-10">
            <div className="card-container container mx-auto px-0 md:px-4">
              <CardContainer
                cards={cards}
                onSelectCard={handleSelectCard}
                onDeleteCard={handleDeleteCard}
                onContentChange={handleContentChange}
                onStartEditing={handleStartEditing}
                onStopEditing={handleStopEditing}
                onInsertCard={handleInsertCard}
                onToggleTimer={handleToggleTimer}
                onResetCard={handleResetCard}
                onUpdateTime={handleUpdateTime}
                onCompleteCard={handleCompleteCard}
                isPlaying={isPlaying}
                editingCardId={editingCardId}
                canEdit={canEdit}
              />
            </div>

          {/* Status Bar for Testing */}
          <div className="hidden md:block fixed bottom-4 right-4 rounded-lg bg-white/90 p-3 text-sm shadow-lg backdrop-blur-sm dark:bg-slate-800/90">
            <div className="text-slate-600 dark:text-slate-300">
              Status: <span className="font-medium">{isPlaying ? 'Playing' : 'Paused'}</span>
            </div>
            <div className="text-slate-600 dark:text-slate-300">
              Cards: <span className="font-medium">{cards.length}</span>
            </div>
            <div className="text-slate-600 dark:text-slate-300">
              Selected: <span className="font-medium">{selectedCardId || 'None'}</span>
            </div>
            <div className="text-slate-600 dark:text-slate-300">
              Active: <span className="font-medium">{activeCardId || 'None'}</span>
            </div>
            <div className="mt-1 text-xs text-slate-600">
              Keyboard: Space/Enter = Play or Pause, Left/Right arrows = Navigate, Delete = Remove card
            </div>
          </div>
        </div>
        </main>
      </div>
    </EditorProvider>
  )
}
