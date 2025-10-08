'use client'

import React, { useState } from 'react'
import { UnifiedHeader } from '@/components/UnifiedHeader'
import { CardContainer } from '@/components/CardContainer'
import { EditorProvider } from '@/components/EditorManager'
import { useTimer } from '@/hooks/useTimer'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useAutoTransfer } from '@/hooks/useAutoTransfer'
import { useCardAudio } from '@/hooks/useCardAudio'
import { useTheme } from '@/hooks/useTheme'
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

export default function Home() {
  const [savedCards, setSavedCards] = useLocalStorage<Card[]>('productivity-cards', initialCards)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [nextCardId, setNextCardId] = useState(4) // Start from 4 since we have cards 1,2,3
  const [selectedTrack, setSelectedTrack] = useState<string | undefined>(undefined)
  const [volume, setVolume] = useState<number>(50)
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false)

  // Theme management
  const { theme, setTheme } = useTheme()

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
  } = useTimer(savedCards)

  // Auto-transfer unchecked todos
  // Get active card for document title
  const activeCard = cards.find(card => card.id === activeCardId)

  // Single audio player instance - fully global (independent of card/timer state)
  useCardAudio({
    selectedTrack: selectedTrack,
    volume: volume,
    isMusicPlaying: isMusicPlaying
  })
  useAutoTransfer(cards, setCards, activeCardId)

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

  const handleCompleteCard = (cardId: string) => {
    const newCards = cards.map(card =>
      card.id === cardId
        ? { ...card, isCompleted: true, isActive: false, timeRemaining: 0 }
        : card
    )
    setCards(newCards)
    setSavedCards(newCards)

    // If this was the active card, stop the timer
    if (cardId === activeCardId) {
      pauseTimer()
    }
  }

  const handleResetCard = (cardId: string) => {
    // Call the hook's resetCard function which updates the cards state
    resetCard(cardId)
  }

  // Sync cards to localStorage whenever they change (but only for user actions)
  React.useEffect(() => {
    // Only sync if cards have actually changed
    const cardsString = JSON.stringify(cards)
    const savedString = JSON.stringify(savedCards)
    if (cardsString !== savedString) {
      setSavedCards(cards)
    }
  }, [cards, savedCards, setSavedCards])

  const handleUpdateTime = (cardId: string, newTime: number) => {
    updateCardTime(cardId, newTime)
    // Sync to localStorage after time update
    const updatedCards = cards.map(card =>
      card.id === cardId
        ? { ...card, timeRemaining: newTime, duration: Math.max(card.duration, newTime), isCompleted: newTime === 0 }
        : card
    )
    setSavedCards(updatedCards)
  }

  const handleAddCard = (type: 'session' | 'break') => {
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

    // Find the selected card index, add after it
    const currentSelectedIndex = cards.findIndex(card => card.isSelected)
    const insertPosition = currentSelectedIndex >= 0 ? currentSelectedIndex + 1 : cards.length

    const newCards = [
      ...cards.slice(0, insertPosition),
      newCard,
      ...cards.slice(insertPosition)
    ]
    setCards(newCards)
    setSavedCards(newCards)
    selectCard(newCard.id)
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
    setSavedCards(newCards)
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
    setSavedCards(newCards)

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
    setSavedCards(newCards)
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
    setIsMusicPlaying(!isMusicPlaying)
  }

  // Removed handleFormatCommand - using TipTap editor commands instead

  // Theme control handler
  const handleThemeChange = (newTheme: 'default' | 'dark' | 'forest' | 'ocean') => {
    setTheme(newTheme)
  }

  const canEdit = true // Allow editing while timer is running

  // Note: Removed automatic localStorage sync to prevent infinite re-render loop
  // Cards are now saved to localStorage only on explicit user actions

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
        <main className="min-h-screen relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-900 forest:from-green-50 forest:via-emerald-50 forest:to-teal-50 ocean:from-cyan-50 ocean:via-blue-50 ocean:to-sky-50" />
        <div className="fixed inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent dark:via-slate-800/30 forest:via-green-100/30 ocean:via-blue-100/30" />

        {/* Animated floating orbs for depth */}
        <div className="fixed top-20 left-20 w-72 h-72 bg-blue-300/30 dark:bg-blue-900/20 forest:bg-green-300/30 ocean:bg-cyan-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="fixed bottom-20 right-20 w-96 h-96 bg-purple-300/30 dark:bg-purple-900/20 forest:bg-emerald-300/30 ocean:bg-blue-300/30 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300/20 dark:bg-pink-900/10 forest:bg-teal-300/20 ocean:bg-sky-300/20 rounded-full blur-3xl animate-pulse animation-delay-4000" />

        <div className="relative z-10">
        <UnifiedHeader
          onAddCard={handleAddCard}
          canEdit={canEdit}
          isEditing={!!editingCardId}
          activeCardId={editingCardId}
          selectedTrack={selectedTrack}
          volume={volume}
          isMusicPlaying={isMusicPlaying}
          onTrackSelect={handleTrackSelect}
          onVolumeChange={handleVolumeChange}
          onMusicToggle={handleMusicToggle}
          theme={theme}
          onThemeChange={handleThemeChange}
        />

      <div className="container mx-auto card-container">
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
      <div className="fixed bottom-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-lg p-3 text-sm">
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
        <div className="text-slate-600 text-xs mt-1">
          Keyboard: Space/Enter=Play/Pause, ←/→=Navigate, Del=Delete
        </div>
      </div>
        </div>
      </main>
      </EditorProvider>
  )
}