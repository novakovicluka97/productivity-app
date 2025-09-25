'use client'

import { useEffect, useCallback } from 'react'
import { Card } from '@/lib/types'

export function useAutoTransfer(
  cards: Card[],
  setCards: (cards: Card[]) => void,
  activeCardId: string | null
) {
  // Extract unchecked todos from HTML content
  const extractUncheckedTodos = useCallback((htmlContent: string): string[] => {
    if (!htmlContent) return []
    
    // Create a temporary div to parse HTML
    if (typeof window === 'undefined') return []
    
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlContent
    
    const checkboxes = tempDiv.querySelectorAll('input[type="checkbox"]')
    const uncheckedTodos: string[] = []
    
    checkboxes.forEach((checkbox) => {
      const input = checkbox as HTMLInputElement
      if (!input.checked) {
        // Get the text content next to the checkbox
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
      <p class="font-semibold mb-2">📋 Carried over from previous session:</p>
      ${todoItems}
    </div>
    <hr class="my-3 border-slate-200" />`
  }, [])

  // Auto-transfer unchecked todos when a session completes
  useEffect(() => {
    // Find completed session cards
    const completedSession = cards.find(
      card => card.type === 'session' && 
             card.isCompleted && 
             card.id === activeCardId &&
             card.timeRemaining === 0
    )
    
    if (completedSession && completedSession.content) {
      const uncheckedTodos = extractUncheckedTodos(completedSession.content)
      
      if (uncheckedTodos.length > 0) {
        // Find the next session card
        const currentIndex = cards.findIndex(card => card.id === completedSession.id)
        const nextSession = cards.slice(currentIndex + 1).find(
          card => card.type === 'session' && !card.isCompleted
        )
        
        if (nextSession) {
          // Update the next session with unchecked todos
          const todoHTML = createTodoHTML(uncheckedTodos)
          const updatedCards = cards.map(card => {
            if (card.id === nextSession.id) {
              const existingContent = card.content || ''
              // Prepend todos to existing content
              return {
                ...card,
                content: todoHTML + existingContent
              }
            }
            return card
          })
          
          setCards(updatedCards)
          
          // Show notification
          if (typeof window !== 'undefined') {
            const notification = document.createElement('div')
            notification.className = 'fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
            notification.style.animation = 'slideIn 0.3s ease-out'
            notification.textContent = `✓ Transferred ${uncheckedTodos.length} unchecked task${uncheckedTodos.length > 1 ? 's' : ''} to next session`
            document.body.appendChild(notification)
            
            setTimeout(() => {
              notification.style.animation = 'slideOut 0.3s ease-out'
              setTimeout(() => notification.remove(), 300)
            }, 3000)
          }
        }
      }
    }
  }, [cards, activeCardId, setCards, extractUncheckedTodos, createTodoHTML])
}