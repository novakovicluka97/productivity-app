'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { TopHeader } from '@/components/layout/TopHeader'
import { ProtectedHeaderPortal } from '@/components/layout/ProtectedHeaderPortal'
import { CardContainer } from '@/components/CardContainer'
import { EditorProvider } from '@/components/EditorManager'
import { useTimerWithStore } from '@/hooks/useTimer.zustand'
import { useAutoTransferWithStore } from '@/hooks/useAutoTransfer.zustand'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'
import { useCardAudio } from '@/hooks/useCardAudio'
import { useCreateSession } from '@/hooks/useSessions'
import { useQueryClient } from '@tanstack/react-query'
import { updateGoalsForSession } from '@/lib/utils/goalHelpers'
import { getUserPreferences, type UserPreferences } from '@/lib/supabase/preferences'
import { format } from 'date-fns'
import { useAppStore, selectCards } from '@/stores/appStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { Card } from '@/lib/types'

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
  // Zustand stores - selective subscriptions
  const cards = useAppStore(selectCards)
  const selectedCardId = useAppStore((state) => state.selectedCardId)
  const activeCardId = useAppStore((state) => state.activeCardId)
  const isPlaying = useAppStore((state) => state.isPlaying)
  const editingCardId = useAppStore((state) => state.editingCardId)

  // Subscribe to music state individually to avoid re-renders
  const selectedTrack = useAppStore((state) => state.selectedTrack)
  const volume = useAppStore((state) => state.volume)
  const isMusicPlaying = useAppStore((state) => state.isMusicPlaying)

  const musicState = { selectedTrack, volume, isMusicPlaying }

  // Store actions
  const setCards = useAppStore((state) => state.setCards)
  const selectCard = useAppStore((state) => state.selectCard)
  const updateCardTime = useAppStore((state) => state.updateCardTime)
  const resetCard = useAppStore((state) => state.resetCard)
  const deleteCard = useAppStore((state) => state.deleteCard)
  const addCard = useAppStore((state) => state.addCard)
  const updateCardContent = useAppStore((state) => state.updateCardContent)
  const setEditingCard = useAppStore((state) => state.setEditingCard)
  const completeCard = useAppStore((state) => state.completeCard)
  const setSelectedTrack = useAppStore((state) => state.setSelectedTrack)
  const setVolume = useAppStore((state) => state.setVolume)
  const toggleMusic = useAppStore((state) => state.toggleMusic)
  const getNextIncompleteCard = useAppStore((state) => state.getNextIncompleteCard)

  // Settings store - subscribe individually
  const defaultSessionDuration = useSettingsStore((state) => state.defaultSessionDuration)
  const defaultBreakDuration = useSettingsStore((state) => state.defaultBreakDuration)

  const defaultDurations = {
    sessionDuration: defaultSessionDuration,
    breakDuration: defaultBreakDuration
  }

  // Local state
  const [nextCardId, setNextCardId] = useState(() => getNextCardId(cards))
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null)

  // Session sync and query invalidation
  const createSessionMutation = useCreateSession()
  const queryClient = useQueryClient()

  // Initialize timer hook with Zustand
  useTimerWithStore({
    onTimerComplete: (completedCardId, completedCardType) => {
      // Save to Supabase
      const completedCard = cards.find(c => c.id === completedCardId)
      if (completedCard) {
        saveCompletedCardToSupabase(completedCard)
      }

      // Auto-start next card
      const completedIndex = cards.findIndex(c => c.id === completedCardId)
      if (completedIndex !== -1) {
        const nextCard = getNextIncompleteCard(completedIndex)
        if (nextCard) {
          setTimeout(() => {
            selectCard(nextCard.id)
            useAppStore.getState().startTimer(nextCard.id)
          }, 100)
        }
      }
    }
  })

  // Save completed card to Supabase and update goals
  const saveCompletedCardToSupabase = useCallback(async (card: Card) => {
    try {
      const sessionDate = format(new Date(), 'yyyy-MM-dd')

      // Create session record
      const session = await createSessionMutation.mutateAsync({
        user_id: undefined as any, // Will be set by RLS
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

  // Load user preferences from Supabase on mount
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const prefs = await getUserPreferences()
        setUserPreferences(prefs)

        // Update settings store with Supabase preferences
        useSettingsStore.getState().updatePreferences({
          defaultSessionDuration: prefs.defaultSessionDuration,
          defaultBreakDuration: prefs.defaultBreakDuration
        })

        console.log('Loaded user preferences from Supabase:', prefs)
      } catch (error) {
        console.log('Could not load user preferences (using defaults):', error)
      }
    }
    loadUserPreferences()
  }, [])

  // Update next card ID when cards change
  useEffect(() => {
    setNextCardId(prev => {
      const calculatedNext = getNextCardId(cards)
      return prev === calculatedNext ? prev : calculatedNext
    })
  }, [cards])

  // Update document title with timer and card type
  useEffect(() => {
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

  // Auto-transfer todos between sessions
  useAutoTransferWithStore()

  // Audio player
  useCardAudio({
    selectedTrack: musicState.selectedTrack ?? undefined,
    volume: musicState.volume,
    isMusicPlaying: musicState.isMusicPlaying
  })

  // Handlers
  const handlePlayPause = () => {
    useAppStore.getState().toggleTimer()
  }

  const handleToggleTimer = (cardId: string) => {
    if (activeCardId === cardId && isPlaying) {
      useAppStore.getState().pauseTimer()
    } else {
      selectCard(cardId)
      useAppStore.getState().startTimer(cardId)
    }
  }

  const handleCompleteCard = useCallback((cardId: string) => {
    const completedCard = cards.find(card => card.id === cardId)
    const wasTimerActive = cardId === activeCardId && isPlaying

    // Mark card as completed in store
    completeCard(cardId)

    // Save to Supabase
    if (completedCard) {
      const cardToSave = { ...completedCard, isCompleted: true, timeRemaining: 0 }
      saveCompletedCardToSupabase(cardToSave)
    }

    // If timer was active, auto-start next card
    if (wasTimerActive) {
      const completedIndex = cards.findIndex(card => card.id === cardId)
      if (completedIndex !== -1) {
        const nextCard = getNextIncompleteCard(completedIndex)
        if (nextCard) {
          setTimeout(() => {
            selectCard(nextCard.id)
            useAppStore.getState().startTimer(nextCard.id)
          }, 100)
        }
      }
    }
  }, [cards, activeCardId, isPlaying, completeCard, saveCompletedCardToSupabase, selectCard, getNextIncompleteCard])

  const handleResetCard = (cardId: string) => {
    resetCard(cardId)
  }

  const handleUpdateTime = (cardId: string, newTime: number) => {
    updateCardTime(cardId, newTime)
  }

  const handleInsertCard = (type: 'session' | 'break', position: number) => {
    const defaultDuration = type === 'session'
      ? (userPreferences?.defaultSessionDuration ?? defaultDurations.sessionDuration)
      : (userPreferences?.defaultBreakDuration ?? defaultDurations.breakDuration)

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
    addCard(newCard, position)
  }

  const handleSelectCard = (cardId: string) => {
    selectCard(cardId)
  }

  const handleDeleteCard = (cardId: string) => {
    if (cards.length <= 1) {
      alert('Cannot delete the last card. You need at least one card.')
      return
    }
    deleteCard(cardId)
  }

  const handleContentChange = (cardId: string, content: string) => {
    updateCardContent(cardId, content)
  }

  const handleStartEditing = (cardId: string) => {
    setEditingCard(cardId)
  }

  const handleStopEditing = () => {
    setEditingCard(null)
  }

  const handleTrackSelect = (trackId: string) => {
    setSelectedTrack(trackId)
  }

  const handleVolumeChange = (volume: number) => {
    setVolume(volume)
  }

  const handleMusicToggle = () => {
    toggleMusic()
  }

  const handleApplyTemplate = useCallback((templateCards: Card[]) => {
    setCards(templateCards)

    if (templateCards.length > 0) {
      selectCard(templateCards[0].id)
    }

    setNextCardId(getNextCardId(templateCards))

    if (isPlaying) {
      useAppStore.getState().pauseTimer()
    }
  }, [setCards, selectCard, setNextCardId, isPlaying])

  const canEdit = true

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
          showMusicAndTemplate={true}
          canEdit={canEdit}
          isEditing={!!editingCardId}
          activeCardId={editingCardId}
          selectedTrack={musicState.selectedTrack ?? undefined}
          volume={musicState.volume}
          isMusicPlaying={musicState.isMusicPlaying}
          onTrackSelect={handleTrackSelect}
          onVolumeChange={handleVolumeChange}
          onMusicToggle={handleMusicToggle}
          onApplyTemplate={handleApplyTemplate}
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
          </div>
        </main>
      </div>
    </EditorProvider>
  )
}
