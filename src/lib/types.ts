export interface Card {
  id: string
  type: 'session' | 'break'
  duration: number // in seconds
  timeRemaining: number // in seconds
  isActive: boolean
  isCompleted: boolean
  isSelected: boolean
  content?: string // Rich text content with embedded checkboxes
  todos?: TodoItem[] // Keep for backward compatibility during transition
}

export interface TodoItem {
  id: string
  text: string
  completed: boolean
  createdAt: Date
}

export interface AppState {
  cards: Card[]
  isPlaying: boolean
  activeCardId: string | null
  selectedCardId: string | null
}