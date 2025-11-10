"use client"

import { useAppStore } from "@/stores/appStore"
import { Progress } from "@/components/ui/progress"
import { useMemo } from "react"

export function SessionIndicator() {
  const cards = useAppStore((state) => state.cards)

  const { currentSession, totalSessions, progressPercentage } = useMemo(() => {
    // Filter to get only session cards (not breaks)
    const sessionCards = cards.filter(card => card.type === 'session')
    const totalSessions = sessionCards.length

    if (totalSessions === 0) {
      return { currentSession: 0, totalSessions: 0, progressPercentage: 0 }
    }

    // Find the current session number
    // Count completed sessions
    const completedSessions = sessionCards.filter(card => card.isCompleted).length

    // Check if there's an active or selected incomplete session
    const hasActiveOrSelectedIncompleteSession = sessionCards.some(
      card => !card.isCompleted && (card.isActive || card.isSelected)
    )

    // Current session is:
    // - If all sessions are completed: totalSessions
    // - If there's an active/selected incomplete session: completedSessions + 1
    // - Otherwise: completedSessions + 1 (assumes working on the next one)
    const currentSession = completedSessions === totalSessions
      ? totalSessions
      : completedSessions + 1

    const progressPercentage = totalSessions > 0
      ? (completedSessions / totalSessions) * 100
      : 0

    return { currentSession, totalSessions, progressPercentage }
  }, [cards])

  // Don't render if there are no sessions
  if (totalSessions === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm">
      <div className="flex flex-col gap-1 min-w-[80px]">
        <div className="text-xs font-medium text-muted-foreground">Session</div>
        <Progress
          value={progressPercentage}
          className="h-1.5 w-full"
        />
      </div>
      <div className="text-sm font-semibold text-foreground whitespace-nowrap">
        {currentSession}/{totalSessions}
      </div>
    </div>
  )
}
