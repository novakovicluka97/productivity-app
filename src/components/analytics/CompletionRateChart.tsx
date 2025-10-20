/**
 * CompletionRateChart Component
 *
 * Displays completion rate as a pie/donut chart
 */

'use client'

import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card } from '@/components/ui/card'
import { CheckCircle2, XCircle } from 'lucide-react'

export interface CompletionRateChartProps {
  completed: number
  incomplete: number
  title?: string
}

const COLORS = {
  completed: '#10b981', // green
  incomplete: '#ef4444', // red
}

export function CompletionRateChart({
  completed,
  incomplete,
  title = 'Session Completion Rate',
}: CompletionRateChartProps) {
  const total = completed + incomplete
  const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0'

  const data = [
    { name: 'Completed', value: completed, color: COLORS.completed },
    { name: 'Incomplete', value: incomplete, color: COLORS.incomplete },
  ]

  // Custom label to show percentage
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180))
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180))

    if (percent < 0.05) return null // Don't show label for very small slices

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="rounded-lg border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/95">
          <p className="mb-1 font-medium text-slate-900 dark:text-white">
            {data.name}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Count: {data.value}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Percentage: {((data.value / total) * 100).toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="border-slate-200 bg-white/80 p-6 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80">
      <h3 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>

      <div className="flex flex-col items-center">
        {/* Center statistic */}
        <div className="mb-6 text-center">
          <p className="text-5xl font-bold text-slate-900 dark:text-white">
            {completionRate}%
          </p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Overall Completion Rate
          </p>
        </div>

        {/* Pie chart */}
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              innerRadius={60}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend with custom styling */}
        <div className="mt-6 flex gap-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Completed
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {completed} sessions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Incomplete
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {incomplete} sessions
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
