import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Card } from '@/lib/types'

interface AppState {
  // Card state
  cards: Card[]
  selectedCardId: string | null
  activeCardId: string | null
  editingCardId: string | null

  // Timer state
  isPlaying: boolean
  lastUpdated: number | null

  // Music state
  selectedTrack: string | null
  volume: number
  isMusicPlaying: boolean

  // Actions
  setCards: (cards: Card[]) => void
  addCard: (card: Card, position?: number) => void
  updateCard: (cardId: string, updates: Partial<Card>) => void
  deleteCard: (cardId: string) => void
  selectCard: (cardId: string) => void

  // Timer actions
  startTimer: (cardId?: string) => void
  pauseTimer: () => void
  toggleTimer: () => void
  updateCardTime: (cardId: string, newTime: number) => void
  resetCard: (cardId: string) => void
  completeCard: (cardId: string) => void
  tickTimer: (elapsedSeconds: number) => { completed: boolean; completedCardId: string | null; completedCardType: 'session' | 'break' | null }

  // Editing actions
  setEditingCard: (cardId: string | null) => void
  updateCardContent: (cardId: string, content: string) => void

  // Music actions
  setSelectedTrack: (track: string | null) => void
  setVolume: (volume: number) => void
  setMusicPlaying: (playing: boolean) => void
  toggleMusic: () => void

  // Utility
  getNextIncompleteCard: (fromIndex: number) => Card | null
  resetState: () => void
}

const initialCards: Card[] = [
  {
    id: '1',
    type: 'session',
    duration: 45 * 60,
    timeRemaining: 45 * 60,
    isActive: false,
    isCompleted: false,
    isSelected: true,
    content: `<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox" disabled="disabled"></label><div><p>Review project requirements</p></div></li><li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked="checked" disabled="disabled"></label><div><p>Design system architecture</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox" disabled="disabled"></label><div><p>Implement core components</p></div></li></ul>`
  },
  {
    id: '2',
    type: 'break',
    duration: 15 * 60,
    timeRemaining: 15 * 60,
    isActive: false,
    isCompleted: false,
    isSelected: false,
  },
  {
    id: '3',
    type: 'session',
    duration: 30 * 60,
    timeRemaining: 30 * 60,
    isActive: false,
    isCompleted: false,
    isSelected: false,
    content: `<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox" disabled="disabled"></label><div><p>Test components in browser</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox" disabled="disabled"></label><div><p>Review design aesthetics</p></div></li></ul>`
  }
]

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      cards: initialCards,
      selectedCardId: initialCards[0]?.id ?? null,
      activeCardId: null,
      editingCardId: null,
      isPlaying: false,
      lastUpdated: null,
      selectedTrack: null,
      volume: 50,
      isMusicPlaying: false,

      // Card actions
      setCards: (cards) => {
        const state = get()

        // Ensure selected card still exists
        let newSelectedId = state.selectedCardId
        if (newSelectedId && !cards.find(c => c.id === newSelectedId)) {
          newSelectedId = cards[0]?.id ?? null
        }

        // Ensure active card still exists
        let newActiveId = state.activeCardId
        let newIsPlaying = state.isPlaying
        if (newActiveId && !cards.find(c => c.id === newActiveId)) {
          newActiveId = null
          newIsPlaying = false
        }

        set({
          cards,
          selectedCardId: newSelectedId,
          activeCardId: newActiveId,
          isPlaying: newIsPlaying,
          lastUpdated: Date.now()
        })
      },

      addCard: (card, position) => {
        const { cards } = get()
        const newCards = position !== undefined
          ? [...cards.slice(0, position), card, ...cards.slice(position)]
          : [...cards, card]

        set({
          cards: newCards,
          selectedCardId: card.id,
          lastUpdated: Date.now()
        })
      },

      updateCard: (cardId, updates) => {
        set((state) => ({
          cards: state.cards.map(card =>
            card.id === cardId ? { ...card, ...updates } : card
          ),
          lastUpdated: Date.now()
        }))
      },

      deleteCard: (cardId) => {
        const { cards, selectedCardId } = get()

        if (cards.length <= 1) {
          console.warn('Cannot delete the last card')
          return
        }

        const newCards = cards.filter(c => c.id !== cardId)
        const newSelectedId = selectedCardId === cardId
          ? newCards[0]?.id ?? null
          : selectedCardId

        set({
          cards: newCards,
          selectedCardId: newSelectedId,
          lastUpdated: Date.now()
        })
      },

      selectCard: (cardId) => {
        const { cards } = get()
        const card = cards.find(c => c.id === cardId)

        if (card) {
          set({
            selectedCardId: cardId,
            lastUpdated: Date.now()
          })
        }
      },

      // Timer actions
      startTimer: (cardId) => {
        const { cards, selectedCardId, activeCardId } = get()

        // Determine which card to start
        let targetCardId = cardId || activeCardId || selectedCardId

        // If still no card, find first incomplete
        if (!targetCardId) {
          const firstIncomplete = cards.find(c => !c.isCompleted && c.timeRemaining > 0)
          targetCardId = firstIncomplete?.id ?? null
        }

        if (targetCardId) {
          const targetCard = cards.find(c => c.id === targetCardId)
          if (targetCard && targetCard.timeRemaining > 0 && !targetCard.isCompleted) {
            set({
              activeCardId: targetCardId,
              isPlaying: true,
              selectedCardId: targetCardId,
              lastUpdated: Date.now()
            })
          }
        }
      },

      pauseTimer: () => {
        set({
          isPlaying: false,
          activeCardId: null,
          lastUpdated: Date.now()
        })
      },

      toggleTimer: () => {
        const { isPlaying, startTimer, pauseTimer } = get()
        if (isPlaying) {
          pauseTimer()
        } else {
          startTimer()
        }
      },

      tickTimer: (elapsedSeconds) => {
        const { activeCardId, cards } = get()

        if (!activeCardId || elapsedSeconds <= 0) {
          return { completed: false, completedCardId: null, completedCardType: null }
        }

        let completedCardId: string | null = null
        let completedCardType: 'session' | 'break' | null = null
        let shouldStop = false

        const newCards = cards.map(card => {
          if (card.id === activeCardId && card.timeRemaining > 0) {
            const newTimeRemaining = Math.max(card.timeRemaining - elapsedSeconds, 0)

            if (newTimeRemaining === 0) {
              completedCardId = card.id
              completedCardType = card.type
              shouldStop = true

              return {
                ...card,
                timeRemaining: 0,
                isCompleted: true,
                isActive: false
              }
            }

            return {
              ...card,
              timeRemaining: newTimeRemaining
            }
          }
          return card
        })

        set({
          cards: newCards,
          isPlaying: !shouldStop,
          activeCardId: shouldStop ? null : activeCardId,
          lastUpdated: Date.now()
        })

        return {
          completed: shouldStop,
          completedCardId,
          completedCardType
        }
      },

      updateCardTime: (cardId, newTime) => {
        set((state) => ({
          cards: state.cards.map(card =>
            card.id === cardId
              ? {
                  ...card,
                  timeRemaining: newTime,
                  duration: Math.max(card.duration, newTime),
                  isCompleted: newTime === 0
                }
              : card
          ),
          lastUpdated: Date.now()
        }))
      },

      resetCard: (cardId) => {
        const { activeCardId } = get()

        set((state) => ({
          cards: state.cards.map(card =>
            card.id === cardId
              ? {
                  ...card,
                  timeRemaining: card.duration,
                  isCompleted: false,
                  isActive: false
                }
              : card
          ),
          isPlaying: cardId === activeCardId ? false : state.isPlaying,
          activeCardId: cardId === activeCardId ? null : state.activeCardId,
          lastUpdated: Date.now()
        }))
      },

      completeCard: (cardId) => {
        const { activeCardId, isPlaying } = get()

        set((state) => ({
          cards: state.cards.map(card =>
            card.id === cardId
              ? {
                  ...card,
                  isCompleted: true,
                  timeRemaining: 0,
                  isActive: false
                }
              : card
          ),
          isPlaying: cardId === activeCardId ? false : state.isPlaying,
          activeCardId: cardId === activeCardId ? null : state.activeCardId,
          lastUpdated: Date.now()
        }))
      },

      // Editing actions
      setEditingCard: (cardId) => {
        set({ editingCardId: cardId })
      },

      updateCardContent: (cardId, content) => {
        set((state) => ({
          cards: state.cards.map(card =>
            card.id === cardId ? { ...card, content } : card
          ),
          lastUpdated: Date.now()
        }))
      },

      // Music actions
      setSelectedTrack: (track) => {
        set({ selectedTrack: track })
      },

      setVolume: (volume) => {
        set({ volume })
      },

      setMusicPlaying: (playing) => {
        set({ isMusicPlaying: playing })
      },

      toggleMusic: () => {
        set((state) => ({ isMusicPlaying: !state.isMusicPlaying }))
      },

      // Utility
      getNextIncompleteCard: (fromIndex) => {
        const { cards } = get()
        return cards.slice(fromIndex + 1).find(c => !c.isCompleted && c.timeRemaining > 0) ?? null
      },

      resetState: () => {
        set({
          cards: initialCards,
          selectedCardId: initialCards[0]?.id ?? null,
          activeCardId: null,
          editingCardId: null,
          isPlaying: false,
          lastUpdated: null,
          selectedTrack: null,
          volume: 50,
          isMusicPlaying: false
        })
      }
    }),
    {
      name: 'productivity-app-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cards: state.cards,
        selectedCardId: state.selectedCardId,
        activeCardId: state.activeCardId,
        isPlaying: state.isPlaying,
        lastUpdated: state.lastUpdated,
        selectedTrack: state.selectedTrack,
        volume: state.volume,
        isMusicPlaying: state.isMusicPlaying
      })
    }
  )
)

// Selectors for optimized subscriptions
export const selectCards = (state: AppState) => state.cards
export const selectSelectedCard = (state: AppState) => {
  const card = state.cards.find(c => c.id === state.selectedCardId)
  return card ?? null
}
export const selectActiveCard = (state: AppState) => {
  const card = state.cards.find(c => c.id === state.activeCardId)
  return card ?? null
}
export const selectIsPlaying = (state: AppState) => state.isPlaying
export const selectTimerState = (state: AppState) => ({
  isPlaying: state.isPlaying,
  activeCardId: state.activeCardId
})
export const selectMusicState = (state: AppState) => ({
  selectedTrack: state.selectedTrack,
  volume: state.volume,
  isMusicPlaying: state.isMusicPlaying
})
