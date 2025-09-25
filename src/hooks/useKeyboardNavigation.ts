'use client'

import { useEffect, useCallback } from 'react'
import { Card } from '@/lib/types'

interface UseKeyboardNavigationProps {
  cards: Card[]
  selectedCardId: string | null
  canEdit: boolean
  onSelectCard: (cardId: string) => void
  onPlayPause?: () => void
  onDeleteSelected?: () => void
}

export function useKeyboardNavigation({
  cards,
  selectedCardId,
  canEdit,
  onSelectCard,
  onPlayPause,
  onDeleteSelected
}: UseKeyboardNavigationProps) {
  
  const scrollCardIntoView = useCallback((cardIndex: number) => {
    // Wait a moment for state to update, then scroll
    setTimeout(() => {
      const cardElements = document.querySelectorAll('[data-card-id]')
      const cardElement = cardElements[cardIndex] as HTMLElement
      
      if (cardElement) {
        cardElement.scrollIntoView({ 
          behavior: 'smooth', 
          inline: 'center',
          block: 'nearest'
        })
      }
    }, 100)
  }, [])

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    // Don't handle keyboard events if user is typing in an input
    if (e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement || 
        e.target instanceof HTMLSelectElement ||
        (e.target as HTMLElement)?.contentEditable === 'true') {
      return
    }

    const selectedIndex = selectedCardId ? 
      cards.findIndex(card => card.id === selectedCardId) : -1

    switch (e.key) {
      case 'ArrowLeft':
        if (selectedIndex > 0) {
          e.preventDefault()
          const newCardId = cards[selectedIndex - 1].id
          onSelectCard(newCardId)
          scrollCardIntoView(selectedIndex - 1)
        }
        break

      case 'ArrowRight':
        if (selectedIndex < cards.length - 1) {
          e.preventDefault()
          const newCardId = cards[selectedIndex + 1].id
          onSelectCard(newCardId)
          scrollCardIntoView(selectedIndex + 1)
        }
        break

      case ' ':
      case 'Enter':
        if (onPlayPause) {
          e.preventDefault()
          onPlayPause()
        }
        break

      case 'Delete':
      case 'Backspace':
        if (canEdit && selectedCardId && onDeleteSelected && cards.length > 1) {
          e.preventDefault()
          onDeleteSelected()
        }
        break

      case 'Home':
        if (cards.length > 0) {
          e.preventDefault()
          onSelectCard(cards[0].id)
          scrollCardIntoView(0)
        }
        break

      case 'End':
        if (cards.length > 0) {
          e.preventDefault()
          const lastIndex = cards.length - 1
          onSelectCard(cards[lastIndex].id)
          scrollCardIntoView(lastIndex)
        }
        break

      default:
        // Numbers 1-9 to select cards directly
        const num = parseInt(e.key)
        if (num >= 1 && num <= 9 && num <= cards.length) {
          e.preventDefault()
          const cardIndex = num - 1
          onSelectCard(cards[cardIndex].id)
          scrollCardIntoView(cardIndex)
        }
        break
    }
  }, [cards, selectedCardId, canEdit, onSelectCard, onPlayPause, onDeleteSelected, scrollCardIntoView])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  // Return keyboard shortcuts info for display
  return {
    shortcuts: {
      navigation: {
        'Left/Right': 'Navigate between cards',
        '1-9': 'Select card by number',
        'Home/End': 'First/Last card'
      },
      actions: {
        'Space/Enter': 'Play/Pause timer',
        'Delete/Backspace': 'Delete selected card'
      }
    }
  }
}