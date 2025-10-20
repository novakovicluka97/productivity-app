'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateGoal, useUpdateGoal } from '@/hooks/useGoals'
import type { Goal, GoalType, GoalMetric } from '@/lib/supabase/goals'
import { format } from 'date-fns'

interface CreateGoalModalProps {
  open: boolean
  onClose: () => void
  editGoal?: Goal | null
}

export function CreateGoalModal({ open, onClose, editGoal }: CreateGoalModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<GoalType>('daily')
  const [metric, setMetric] = useState<GoalMetric>('sessions')
  const [targetValue, setTargetValue] = useState('5')
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState('')

  const createGoalMutation = useCreateGoal()
  const updateGoalMutation = useUpdateGoal()

  // Load edit goal data
  useEffect(() => {
    if (editGoal) {
      setName(editGoal.name)
      setDescription(editGoal.description || '')
      setType(editGoal.type)
      setMetric(editGoal.metric)
      setTargetValue(editGoal.target_value.toString())
      setStartDate(format(new Date(editGoal.start_date), 'yyyy-MM-dd'))
      setEndDate(editGoal.end_date ? format(new Date(editGoal.end_date), 'yyyy-MM-dd') : '')
    } else {
      // Reset form for new goal
      setName('')
      setDescription('')
      setType('daily')
      setMetric('sessions')
      setTargetValue('5')
      setStartDate(format(new Date(), 'yyyy-MM-dd'))
      setEndDate('')
    }
  }, [editGoal, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const goalData = {
      name,
      description: description || null,
      type,
      metric,
      target_value: parseInt(targetValue),
      start_date: new Date(startDate).toISOString(),
      end_date: endDate ? new Date(endDate).toISOString() : null,
    }

    if (editGoal) {
      updateGoalMutation.mutate(
        { goalId: editGoal.id, updates: goalData },
        {
          onSuccess: () => {
            onClose()
          },
        }
      )
    } else {
      createGoalMutation.mutate(
        { ...goalData, user_id: '' }, // user_id will be filled by the API
        {
          onSuccess: () => {
            onClose()
          },
        }
      )
    }
  }

  const isSubmitting = createGoalMutation.isPending || updateGoalMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
          <DialogDescription>
            {editGoal
              ? 'Update your goal details and progress tracking.'
              : 'Set a new goal to track your productivity progress.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Goal Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Goal Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Complete 5 sessions today"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Stay focused and productive"
            />
          </div>

          {/* Type and Metric */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={type} onValueChange={(value) => setType(value as GoalType)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metric">Metric *</Label>
              <Select value={metric} onValueChange={(value) => setMetric(value as GoalMetric)}>
                <SelectTrigger id="metric">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sessions">Sessions</SelectItem>
                  <SelectItem value="time">Time (hours)</SelectItem>
                  <SelectItem value="completion_rate">Completion Rate</SelectItem>
                  <SelectItem value="streak">Streak (days)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Target Value */}
          <div className="space-y-2">
            <Label htmlFor="target">Target Value *</Label>
            <Input
              id="target"
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="5"
              min="1"
              required
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date *</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date (Optional)</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editGoal ? 'Update Goal' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
