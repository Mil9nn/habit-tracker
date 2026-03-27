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
          : Math.round(
              data
                .slice(i - 6, i + 1)
                .reduce((sum, x) => sum + x.calories, 0) / 7
            )
    }))
  }, [data, period])

  const avgCalories = Math.round(
    data.reduce((sum, d) => sum + d.calories, 0) / data.length
  )

  const daysUnderGoal = data.filter(d => d.calories <= d.goal).length

  const successRate = Math.round((daysUnderGoal / data.length) * 100)

  // Better trend: compare last 5 vs previous 5
  const trend = useMemo(() => {
    if (data.length < 10) return 0

    const last = data.slice(-5)
    const prev = data.slice(-10, -5)

    const lastAvg = last.reduce((s, d) => s + d.calories, 0) / last.length
    const prevAvg = prev.reduce((s, d) => s + d.calories, 0) / prev.length

    return (lastAvg - prevAvg) / prevAvg
  }, [data])

  const trendLabel =
    trend > 0.03 ? 'Increasing' : trend < -0.03 ? 'Decreasing' : 'Stable'

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null

    const d = payload[0].payload

    return (
      <div className="bg-white px-3 py-2 border text-sm">
        <div>{d.date}</div>
        <div>Calories: {d.calories}</div>
        <div>Goal: {d.goal}</div>
        <div>
          Diff:{' '}
          <span
            className={
              d.calories > d.goal ? 'text-red-500' : 'text-green-500'
            }
          >
            {d.calories - d.goal}
          </span>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      {/* Top Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm">
          Avg: <span className="font-semibold">{avgCalories}</span> kcal
        </div>

        <div className="text-sm">
          On Track: <span className="font-semibold">{successRate}%</span>
        </div>

        {onPeriodChange && (
          <div className="flex gap-2 text-sm">
            {(['week', 'month', 'quarter'] as const).map(p => (
              <button
                key={p}
                onClick={() => onPeriodChange(p)}
                className={`px-2 py-1 border ${period === p ? 'bg-black text-white' : ''}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer>
          <AreaChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="label" />
            <YAxis />

            <Tooltip content={<CustomTooltip />} />

            {/* Goal line */}
            <Line
              type="monotone"
              dataKey="goal"
              stroke="#888"
              strokeDasharray="5 5"
              dot={false}
            />

            {/* Calories */}
            <Area
              type="monotone"
              dataKey="calories"
              stroke="#3b82f6"
              fillOpacity={0.2}
              fill="#3b82f6"
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

      {/* Bottom Row */}
      <div className="flex justify-between mt-4 text-sm">
        <div>
          Trend: <span className="font-semibold">{trendLabel}</span>
        </div>

        <div>{Math.abs(trend * 100).toFixed(1)}%</div>
      </div>
    </motion.div>
  )
}
