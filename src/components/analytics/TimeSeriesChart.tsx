/**
 * TimeSeriesChart Component
 *
 * Displays session count over time using a line/area chart
 */

'use client'

import React from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { format } from 'date-fns'

export interface TimeSeriesData {
  date: string
  sessions: number
  breaks: number
  completed: number
}

export interface TimeSeriesChartProps {
  data: TimeSeriesData[]
  title?: string
  showBreaks?: boolean
  chartType?: 'line' | 'area'
}

export function TimeSeriesChart({
  data,
  title = 'Session Activity Over Time',
  showBreaks = true,
  chartType = 'area',
}: TimeSeriesChartProps) {
  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM dd')
    } catch {
      return dateStr
    }
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/95">
          <p className="mb-2 font-medium text-slate-900 dark:text-white">
            {formatDate(label)}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const Chart = chartType === 'area' ? AreaChart : LineChart
  const DataComponent = chartType === 'area' ? Area : Line

  return (
    <Card className="border-slate-200 bg-white/80 p-6 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80">
      <h3 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <Chart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorBreaks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-slate-200 dark:stroke-slate-700"
          />

          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            className="text-xs text-slate-600 dark:text-slate-400"
            tick={{ fill: 'currentColor' }}
          />

          <YAxis
            className="text-xs text-slate-600 dark:text-slate-400"
            tick={{ fill: 'currentColor' }}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{
              paddingTop: '20px',
            }}
            iconType="circle"
          />

          <DataComponent
            type="monotone"
            dataKey="sessions"
            stroke="#3b82f6"
            fill={chartType === 'area' ? 'url(#colorSessions)' : undefined}
            strokeWidth={2}
            name="Sessions"
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />

          {showBreaks && (
            <DataComponent
              type="monotone"
              dataKey="breaks"
              stroke="#8b5cf6"
              fill={chartType === 'area' ? 'url(#colorBreaks)' : undefined}
              strokeWidth={2}
              name="Breaks"
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          )}

          <DataComponent
            type="monotone"
            dataKey="completed"
            stroke="#10b981"
            fill={chartType === 'area' ? 'url(#colorCompleted)' : undefined}
            strokeWidth={2}
            name="Completed"
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </Chart>
      </ResponsiveContainer>
    </Card>
  )
}
