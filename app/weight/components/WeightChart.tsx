'use client'

import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

interface WeightChartProps {
  entries: any[]
  unit: string
  trendView: number
  setTrendView: (days: number) => void
  progressPercentage: number
  remainingWeight?: number | null
  weeklyChange?: number | null
  projectedWeeks?: number | null
}

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1C1917] rounded-lg p-3.5 text-[#F7F5F2] text-xs">
      <p className="m-0 text-[#9C8B75] text-xs mb-0.5">{label}</p>
      <p className="m-0 font-semibold">{payload[0].value} {unit}</p>
    </div>
  )
}

export default function WeightChart({
  entries,
  unit,
  trendView,
  setTrendView,
  progressPercentage,
  remainingWeight,
  weeklyChange,
  projectedWeeks
}: WeightChartProps) {
  // Prepare chart data from entries
  const chartData = entries.slice(-trendView).map(e => ({ 
    weight: e.weight, 
    label: e.date.slice(5) 
  }))
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2 }}
      className="p-4 mb-4"
    >
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm font-semibold text-gray-900">Progress</p>
        <div className="flex gap-2">
          {[7, 30, 90].map(days => (
            <button
              key={days}
              onClick={() => setTrendView(days)}
              className={`px-2 py-1 text-sm rounded-md border border-zinc-200/60 ${trendView === days ? 'bg-blue-500 text-white' : 'bg-[#F9F7F5] text-gray-600'}`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="">
        <div className="h-2 bg-gray-200 rounded-md overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, progressPercentage)}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full bg-[#1E40AF] rounded-md"
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400 font-medium">{progressPercentage}% Complete</span>
          <span className="text-xs text-gray-400 font-medium">{remainingWeight?.toFixed(1)} {unit} to go</span>
        </div>
      </div>

      {/* Rate of Change Insights */}
      <div className="flex gap-2 text-sm text-gray-600 mb-4">
        {weeklyChange && (
          <span className={`font-semibold ${weeklyChange < 0 ? 'text-[#1E40AF]' : 'text-gray-500'}`}>
            {weeklyChange < 0 ? '↓' : '↑'} {Math.abs(weeklyChange)} {unit} this week
          </span>
        )}
        {projectedWeeks && (
          <span>
            On track to reach goal in {projectedWeeks} weeks
          </span>
        )}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300} className={"bg-white rounded-md"}>
        <AreaChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E40AF" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#1E40AF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'rgb(156, 163, 175)', fontFamily: 'Plus Jakarta Sans' }} axisLine={false} tickLine={false} />
          <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: 'rgb(156, 163, 175)', fontFamily: 'Plus Jakarta Sans' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip unit={unit} />} />
          <Area
            type="monotone" dataKey="weight"
            stroke="#1E40AF" strokeWidth={2.5}
            fill="url(#grad)"
            dot={{ r: 3.5, fill: '#1E40AF', strokeWidth: 0 }}
            activeDot={{ r: 5.5, fill: '#1E40AF', strokeWidth: 2, stroke: '#fff' }}
            name="Weight"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
