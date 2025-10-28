'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useAppStore } from '@/stores/appStore'
import { useToast } from '@/components/ToastProvider'

/**
 * Auto-Transfer Hook using Zustand
 *
 * This hook monitors when a session card completes and automatically
 * transfers unchecked todos to the next session card.
 *
 * NO MORE CIRCULAR DEPENDENCIES:
 * - Subscribes to store state
 * - Uses store actions directly
 * - No prop drilling or complex effect chains
 */
export function useAutoTransferWithStore() {
  const { showToast } = useToast()
  const processedCardsRef = useRef<Set<string>>(new Set())

  // Subscribe only to what we need
  const cards = useAppStore((state) => state.cards)
  const activeCardId = useAppStore((state) => state.activeCardId)
  const updateCardContent = useAppStore((state) => state.updateCardContent)

  // Extract unchecked todos from HTML content
  const extractUncheckedTodos = useCallback((htmlContent: string): string[] => {
    if (!htmlContent) return []

    if (typeof window === 'undefined') return []

    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlContent

    const checkboxes = tempDiv.querySelectorAll('input[type="checkbox"]')
    const uncheckedTodos: string[] = []

    checkboxes.forEach((checkbox) => {
      const input = checkbox as HTMLInputElement
      if (!input.checked) {
        const parent = input.parentElement
        if (parent) {
          const textElement = parent.querySelector('span') || parent
          const todoText = textElement.textContent?.trim()
          if (todoText && todoText !== 'New task') {
            uncheckedTodos.push(todoText)
          }
        }
      }
    })

    return uncheckedTodos
  }, [])

  // Create HTML for unchecked todos
  const createTodoHTML = useCallback((todos: string[]): string => {
    if (todos.length === 0) return ''

    const todoItems = todos.map(todo =>
      `<div class="flex items-center my-1">
        <input type="checkbox" class="mr-2 cursor-pointer" style="margin: 0; vertical-align: middle;" />
        <span class="flex-1" contenteditable="true">${todo}</span>
      </div>`
    ).join('')

    return `<div class="unchecked-todos mb-4">
      <p class="font-semibold mb-2">Carried over from previous session:</p>
      ${todoItems}
    </div>
    <hr class="my-3 border-slate-200" />`
  }, [])

  // Monitor for completed sessions and transfer todos
  useEffect(() => {
    // Find completed session cards that haven't been processed
    const completedSessions = cards.filter(
      card => card.type === 'session' &&
             card.isCompleted &&
             card.timeRemaining === 0 &&
             !processedCardsRef.current.has(card.id)
    )

    completedSessions.forEach(completedSession => {
      if (!completedSession.content) {
        // Mark as processed even if no content
        processedCardsRef.current.add(completedSession.id)
        return
      }

      const uncheckedTodos = extractUncheckedTodos(completedSession.content)

      if (uncheckedTodos.length > 0) {
        // Find the next incomplete session
        const currentIndex = cards.findIndex(card => card.id === completedSession.id)
        const nextSession = cards.slice(currentIndex + 1).find(
          card => card.type === 'session' && !card.isCompleted
        )

        if (nextSession) {
          // Update the next session with unchecked todos
          const todoHTML = createTodoHTML(uncheckedTodos)
          const existingContent = nextSession.content || ''

          // Prepend todos to existing content
          updateCardContent(nextSession.id, todoHTML + existingContent)

          const taskLabel = uncheckedTodos.length === 1 ? 'task' : 'tasks'
          showToast({
            title: 'Moved unfinished work',
            description: `${uncheckedTodos.length} unchecked ${taskLabel} added to the next session.`,
            type: 'success'
          })
        }
      }

      // Mark this card as processed
      processedCardsRef.current.add(completedSession.id)
    })

    // Clean up old processed cards that no longer exist
    const currentCardIds = new Set(cards.map(c => c.id))
    processedCardsRef.current.forEach(id => {
      if (!currentCardIds.has(id)) {
        processedCardsRef.current.delete(id)
      }
    })
  }, [cards, extractUncheckedTodos, createTodoHTML, updateCardContent, showToast])
}
