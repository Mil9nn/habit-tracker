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
  ReferenceLine,
  ResponsiveContainer,
  Legend
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
  const diff = d.calories - d.goal
  const over = diff > 0

  return (
    <div
      className="px-3 py-2.5 rounded-xl text-xs"
      style={{
        background: 'rgba(255,255,255,0.95)',
        border: '1px solid #e4e4e7',
        boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
        backdropFilter: 'blur(8px)',
        fontFamily: 'inherit'
      }}
    >
      <p className="font-semibold text-zinc-700 mb-1">{d.date}</p>
      <div className="space-y-0.5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-zinc-400">Calories</span>
          <span className="font-bold text-zinc-800">{d.calories}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-zinc-400">Goal</span>
          <span className="font-medium text-zinc-500">{d.goal}</span>
        </div>
        {d.movingAvg && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-zinc-400">7d Avg</span>
            <span className="font-medium text-indigo-500">{d.movingAvg}</span>
          </div>
        )}
        <div
          className="mt-1.5 pt-1.5 flex items-center justify-between gap-4"
          style={{ borderTop: '1px solid #f4f4f5' }}
        >
          <span className="text-zinc-400">vs Goal</span>
          <span
            className="font-bold"
            style={{ color: over ? '#ef4444' : '#10b981' }}
          >
            {over ? '+' : ''}{diff}
          </span>
        </div>
      </div>
    </div>
  )
}

const PERIODS = ['week', 'month', 'quarter'] as const

export function CalorieTrendsChart({ data, period, onPeriodChange }: CalorieTrendsChartProps) {

  const formattedData = useMemo(() => {
    return data.map((d, i) => ({
      ...d,
      label:
        period === 'week'
          ? d.dayName
          : period === 'month'
            ? d.date.split('-').pop()
            : d.date.slice(5),
      movingAvg:
        i < 6
          ? undefined
          : Math.round(
              data.slice(i - 6, i + 1).reduce((sum, x) => sum + x.calories, 0) / 7
            )
    }))
  }, [data, period])

  const goalValue = data[0]?.goal ?? 2000

  const avgCalories = useMemo(
    () => (data.length ? Math.round(data.reduce((s, d) => s + d.calories, 0) / data.length) : 0),
    [data]
  )

  const daysUnderGoal = data.filter(d => d.calories <= d.goal).length
  const successRate = data.length ? Math.round((daysUnderGoal / data.length) * 100) : 0
  const avgDiff = avgCalories - goalValue

  const trend = useMemo(() => {
    if (data.length < 10) return 0
    const last = data.slice(-5)
    const prev = data.slice(-10, -5)
    const lastAvg = last.reduce((s, d) => s + d.calories, 0) / 5
    const prevAvg = prev.reduce((s, d) => s + d.calories, 0) / 5
    return prevAvg > 0 ? (lastAvg - prevAvg) / prevAvg : 0
  }, [data])

  const trendLabel = trend > 0.03 ? '↑ Rising' : trend < -0.03 ? '↓ Falling' : '→ Stable'
  const trendColor = trend > 0.03 ? '#ef4444' : trend < -0.03 ? '#10b981' : '#6366f1'

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <div className="px-4 mb-4">
          <h3 className="text-base font-semibold text-zinc-800">Calorie Trends</h3>
        </div>
        <div
          className="mx-4 rounded-2xl flex flex-col items-center justify-center py-10 px-6 text-center"
          style={{ background: '#fafafa', border: '1.5px dashed #e4e4e7' }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
            style={{ background: 'linear-gradient(135deg, #e0e7ff, #dbeafe)' }}
          >
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M3 17l6-6 4 4 8-8" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-zinc-700">No trend data yet</p>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Log meals consistently to unlock calorie trend insights.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-4"
      style={{ fontFamily: "'DM Sans', 'Outfit', system-ui, sans-serif" }}
    >
      {/* Header */}
      <div className="px-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-zinc-800">Calorie Trends</h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {data.length} day{data.length !== 1 ? 's' : ''} tracked
          </p>
        </div>

        {onPeriodChange && (
          <div
            className="flex items-center p-0.5 rounded-lg gap-0.5"
            style={{ background: '#f4f4f5' }}
          >
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => onPeriodChange(p)}
                className="px-3 py-1 rounded-md text-xs font-medium transition-all duration-200"
                style={{
                  background: period === p ? '#fff' : 'transparent',
                  color: period === p ? '#18181b' : '#a1a1aa',
                  boxShadow: period === p ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="px-2">
        {/* Legend */}
        <div className="flex items-center gap-4 px-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: '#6366f1' }} />
            <span className="text-[10px] text-zinc-400">Calories</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: '#10b981', borderTop: '2px dashed #10b981', backgroundColor: 'none', borderBottom: 'none' }} />
            <svg width="14" height="4" viewBox="0 0 14 4"><line x1="0" y1="2" x2="14" y2="2" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 2"/></svg>
            <span className="text-[10px] text-zinc-400">7d Avg</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="14" height="4" viewBox="0 0 14 4"><line x1="0" y1="2" x2="14" y2="2" stroke="#a1a1aa" strokeWidth="1.5" strokeDasharray="4 2"/></svg>
            <span className="text-[10px] text-zinc-400">Goal</span>
          </div>
        </div>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="calorieGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />

              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: '#a1a1aa' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#a1a1aa' }}
                axisLine={false}
                tickLine={false}
                domain={['auto', 'auto']}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e4e4e7', strokeWidth: 1 }} />

              {/* Goal reference line */}
              <ReferenceLine
                y={goalValue}
                stroke="#a1a1aa"
                strokeDasharray="4 3"
                strokeWidth={1.5}
                label={{
                  value: 'Goal',
                  position: 'insideTopRight',
                  fontSize: 9,
                  fill: '#a1a1aa',
                  fontWeight: 600
                }}
              />

              {/* Calories area */}
              <Area
                type="monotone"
                dataKey="calories"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#calorieGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
              />

              {/* 7-day moving average */}
              <Line
                type="monotone"
                dataKey="movingAvg"
                stroke="#10b981"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                dot={false}
                activeDot={{ r: 3, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )
}