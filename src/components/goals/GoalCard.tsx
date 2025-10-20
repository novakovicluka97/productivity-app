'use client'

import { useState } from 'react'
import { Trophy, Calendar, Target, Trash2, Edit, Archive, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GoalProgress } from './GoalProgress'
import { useGoalOperations } from '@/hooks/useGoals'
import type { Goal } from '@/lib/supabase/goals'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface GoalCardProps {
  goal: Goal
  onEdit?: (goal: Goal) => void
}

export function GoalCard({ goal, onEdit }: GoalCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { deleteGoal, archiveCompleted } = useGoalOperations()

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this goal?')) {
      setIsDeleting(true)
      deleteGoal(goal.id)
    }
  }

  const handleArchive = () => {
    archiveCompleted()
  }

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'sessions':
        return 'Sessions'
      case 'time':
        return 'Hours'
      case 'completion_rate':
        return 'Completion Rate'
      case 'streak':
        return 'Day Streak'
      default:
        return metric
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
      case 'weekly':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400'
      case 'monthly':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-400'
      case 'custom':
        return 'bg-pink-500/10 text-pink-700 dark:text-pink-400'
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
    }
  }

  return (
    <Card className={cn('relative overflow-hidden', goal.is_completed && 'opacity-75')}>
      {/* Completion overlay */}
      {goal.is_completed && (
        <div className="absolute right-4 top-4">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">{goal.name}</CardTitle>
            </div>
            {goal.description && (
              <CardDescription className="line-clamp-2">{goal.description}</CardDescription>
            )}
          </div>
          <Badge className={getTypeColor(goal.type)} variant="secondary">
            {goal.type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{getMetricLabel(goal.metric)}</span>
            {goal.is_completed && goal.completed_at && (
              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <Trophy className="h-3 w-3" />
                Completed {format(new Date(goal.completed_at), 'MMM d, yyyy')}
              </span>
            )}
          </div>
          <GoalProgress current={goal.current_value} target={goal.target_value} />
        </div>

        {/* Dates */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Start: {format(new Date(goal.start_date), 'MMM d, yyyy')}</span>
          </div>
          {goal.end_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>End: {format(new Date(goal.end_date), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          {onEdit && !goal.is_completed && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(goal)}
              className="flex-1"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {goal.is_completed && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleArchive}
              className="flex-1"
            >
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
