'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface TrendData {
  date: string
  calories: number
  goal: number
  dayName: string
}

interface CalorieTrendsChartProps {
  data: TrendData[]
  period: 'week' | 'month' | 'quarter'
  onPeriodChange?: (period: 'week' | 'month' | 'quarter') => void
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: TrendData & { movingAvg?: number } }>
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload

  return (
    <div className="bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white rounded-lg shadow-lg">
      <div className="text-zinc-300">{d.date}</div>
      <div className="text-violet-400">Calories: {d.calories}</div>
      <div className="text-zinc-400">Goal: {d.goal}</div>
      <div>
        Diff:{' '}
        <span className={d.calories > d.goal ? 'text-red-400' : 'text-emerald-400'}>
          {d.calories - d.goal}
        </span>
      </div>
    </div>
  )
}

export function CalorieTrendsChart({ data, period, onPeriodChange }: CalorieTrendsChartProps) {

  // ---------- Helpers ----------

  const formattedData = useMemo(() => {
    return data.map((d, i) => ({
      ...d,
      label:
        period === 'week'
          ? d.dayName
          : period === 'month'
          ? d.date.split('-').pop() // day number
          : d.date.slice(5), // MM-DD
      movingAvg:
        i < 6
          ? null
          : (() => {
              const slice = data.slice(i - 6, i + 1)
              return slice.length > 0 
                ? Math.round(slice.reduce((sum, x) => sum + x.calories, 0) / slice.length)
                : null
            })()
    }))
  }, [data, period])

  const avgCalories = data.length > 0 
    ? Math.round(data.reduce((sum, d) => sum + d.calories, 0) / data.length)
    : 0

  const daysUnderGoal = data.filter(d => d.calories <= d.goal).length

  const successRate = data.length > 0 
    ? Math.round((daysUnderGoal / data.length) * 100)
    : 0

  // Better trend: compare last 5 vs previous 5
  const trend = useMemo(() => {
    if (data.length < 10) return 0

    const last = data.slice(-5)
    const prev = data.slice(-10, -5)

    const lastAvg = last.reduce((s, d) => s + d.calories, 0) / last.length
    const prevAvg = prev.reduce((s, d) => s + d.calories, 0) / prev.length

    return prevAvg > 0 ? (lastAvg - prevAvg) / prevAvg : 0
  }, [data])

  const trendLabel =
    trend > 0.03 ? 'Increasing' : trend < -0.03 ? 'Decreasing' : 'Stable'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-4 p-4"
    >
      {/* Header */}
      <div className="">
        <h3 className="text-lg font-medium text-white">Calorie Trends</h3>
        
        {onPeriodChange && (
          <div className="flex items-center justify-end gap-2 mt-2">
            {(['week', 'month', 'quarter'] as const).map(p => (
              <button
                key={p}
                onClick={() => onPeriodChange(p)}
                className={`text-sm transition-all duration-200 ${
                  period === p 
                    ? 'text-violet-400' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-sm font-semibold text-white">{avgCalories}</div>
          <div className="text-xs text-zinc-400">Avg Calories</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold text-emerald-400">{successRate}%</div>
          <div className="text-xs text-zinc-400">On Track</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold text-violet-400">{trendLabel}</div>
          <div className="text-xs text-zinc-400">Trend</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer>
          <AreaChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />

            <XAxis dataKey="label" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />

            <Tooltip content={<CustomTooltip />} />

            {/* Goal line */}
            <Line
              type="monotone"
              dataKey="goal"
              stroke="#6b7280"
              strokeDasharray="5 5"
              dot={false}
            />

            {/* Calories */}
            <Area
              type="monotone"
              dataKey="calories"
              stroke="#8b5cf6"
              fillOpacity={0.2}
              fill="#8b5cf6"
            />

            {/* Moving avg */}
            <Line
              type="monotone"
              dataKey="movingAvg"
              stroke="#10b981"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
