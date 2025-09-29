'use client'

import React, { useState } from 'react'
import { TimeControls } from '@/components/TimeControls'
import { CardContainer } from '@/components/CardContainer'
import { UniversalToolbar } from '@/components/UniversalToolbar'
import { EditorProvider } from '@/components/EditorManager'
import { useTimer } from '@/hooks/useTimer'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useAutoTransfer } from '@/hooks/useAutoTransfer'
import { Card } from '@/lib/types'

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

  // Removed handleFormatCommand - using TipTap editor commands instead

  const canEdit = true // Allow editing while timer is running

  // Update localStorage when cards change
  React.useEffect(() => {
    setSavedCards(cards)
  }, [cards, setSavedCards])

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
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <UniversalToolbar
          isEditing={!!editingCardId}
          activeCardId={editingCardId}
        />

      <TimeControls
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onAddCard={handleAddCard}
        canEdit={canEdit}
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
          onResetCard={resetCard}
          onUpdateTime={updateCardTime}
          onCompleteCard={handleCompleteCard}
          isPlaying={isPlaying}
          editingCardId={editingCardId}
          canEdit={canEdit}
        />
      </div>



      {/* Status Bar for Testing */}
      <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 text-sm">
        <div className="text-slate-600">
          Status: <span className="font-medium">{isPlaying ? 'Playing' : 'Paused'}</span>
        </div>
        <div className="text-slate-600">
          Cards: <span className="font-medium">{cards.length}</span>
        </div>
        <div className="text-slate-600">
          Selected: <span className="font-medium">{selectedCardId || 'None'}</span>
        </div>
        <div className="text-slate-600">
          Active: <span className="font-medium">{activeCardId || 'None'}</span>
        </div>
        <div className="text-slate-600 text-xs mt-1">
          Keyboard: Space/Enter=Play/Pause, ←/→=Navigate, Del=Delete
        </div>
      </div>
      </main>
    </EditorProvider>
  )
}