'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Achievement } from './achievements'
import { getRarityColor } from './achievements'
import { Lock } from 'lucide-react'

interface AchievementBadgeProps {
  achievement: Achievement
  unlocked: boolean
  unlockedAt?: string | null
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function AchievementBadge({
  achievement,
  unlocked,
  unlockedAt,
  className,
  size = 'md',
}: AchievementBadgeProps) {
  const sizeClasses = {
    sm: 'w-20 h-24',
    md: 'w-28 h-32',
    lg: 'w-36 h-40',
  }

  const iconSizes = {
    sm: 'text-3xl',
    md: 'text-4xl',
    lg: 'text-5xl',
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={cn(
              'relative overflow-hidden transition-all hover:scale-105',
              sizeClasses[size],
              unlocked
                ? getRarityColor(achievement.rarity)
                : 'bg-muted/50 opacity-50 grayscale',
              className
            )}
          >
            <CardContent className="flex h-full flex-col items-center justify-center gap-2 p-3">
              {/* Lock overlay for locked achievements */}
              {!unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                  <Lock className="h-6 w-6 text-muted-foreground" />
                </div>
              )}

              {/* Icon */}
              <div className={cn('flex items-center justify-center', iconSizes[size])}>
                {achievement.icon}
              </div>

              {/* Name */}
              <div className="text-center text-xs font-semibold leading-tight">
                {achievement.name}
              </div>

              {/* Rarity badge */}
              {unlocked && (
                <Badge
                  variant="secondary"
                  className={cn('text-xs capitalize', getRarityColor(achievement.rarity))}
                >
                  {achievement.rarity}
                </Badge>
              )}
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{achievement.icon}</span>
              <div>
                <p className="font-semibold">{achievement.name}</p>
                <p className="text-xs capitalize text-muted-foreground">{achievement.rarity}</p>
              </div>
            </div>
            <p className="text-sm">{achievement.description}</p>
            {unlocked && unlockedAt && (
              <p className="text-xs text-muted-foreground">
                Unlocked: {new Date(unlockedAt).toLocaleDateString()}
              </p>
            )}
            {!unlocked && (
              <p className="text-xs text-muted-foreground">
                {achievement.criteria.type === 'sessions' &&
                  `Complete ${achievement.criteria.threshold} sessions`}
                {achievement.criteria.type === 'streak' &&
                  `Maintain a ${achievement.criteria.threshold}-day streak`}
                {achievement.criteria.type === 'completion_rate' &&
                  `Reach ${achievement.criteria.threshold}% completion rate`}
                {achievement.criteria.type === 'time_spent' &&
                  `Spend ${achievement.criteria.threshold / 3600} hours in sessions`}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
