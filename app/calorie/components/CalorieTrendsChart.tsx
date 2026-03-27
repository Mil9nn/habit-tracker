'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Line, LineChart, LineProps, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react'

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
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

  // Calculate statistics
  const avgCalories = Math.round(data.reduce((sum, d) => sum + d.calories, 0) / data.length)
  const avgGoal = Math.round(data.reduce((sum, d) => sum + d.goal, 0) / data.length)
  const daysOverGoal = data.filter(d => d.calories > d.goal).length
  const daysUnderGoal = data.filter(d => d.calories < d.goal).length
  const trend = data.length > 1 ? 
    (data[data.length - 1].calories - data[0].calories) / data[0].calories : 0

  const getTrendIcon = () => {
    if (trend > 0.05) return <TrendingUp className="w-4 h-4 text-green-500" />
    if (trend < -0.05) return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-gray-500" />
  }

  const getTrendColor = () => {
    if (trend > 0.05) return 'text-green-600'
    if (trend < -0.05) return 'text-red-600'
    return 'text-gray-600'
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-lg">
          <p className="text-sm font-semibold text-gray-900">{data.dayName}</p>
          <p className="text-sm text-gray-600">{data.date}</p>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600">Intake:</span>
              <span className="text-sm font-semibold text-blue-600">{data.calories} kcal</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600">Goal:</span>
              <span className="text-sm font-semibold text-gray-600">{data.goal} kcal</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600">Diff:</span>
              <span className={`text-sm font-semibold ${data.calories > data.goal ? 'text-red-600' : 'text-green-600'}`}>
                {data.calories > data.goal ? '+' : ''}{data.calories - data.goal} kcal
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Calorie Trends
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {period === 'week' ? 'Last 7 days' : period === 'month' ? 'Last 30 days' : 'Last 90 days'}
          </p>
        </div>
        
        {onPeriodChange && (
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {(['week', 'month', 'quarter'] as const).map((p) => (
              <button
                key={p}
                onClick={() => onPeriodChange(p)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  period === p
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {p === 'week' ? 'Week' : p === 'month' ? 'Month' : 'Quarter'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-medium">Avg Intake</p>
              <p className="text-lg font-bold text-blue-900">{avgCalories}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xs text-blue-600 font-bold">kcal</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 font-medium">Avg Goal</p>
              <p className="text-lg font-bold text-gray-900">{avgGoal}</p>
            </div>
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-xs text-gray-600 font-bold">kcal</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 font-medium">On Track</p>
              <p className="text-lg font-bold text-green-900">{daysUnderGoal}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-xs text-green-600 font-bold">days</span>
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-600 font-medium">Over Goal</p>
              <p className="text-lg font-bold text-red-900">{daysOverGoal}</p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-xs text-red-600 font-bold">days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorGoal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6B7280" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#6B7280" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="dayName" 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Area
              type="monotone"
              dataKey="goal"
              stroke="#6B7280"
              strokeWidth={2}
              fill="url(#colorGoal)"
              strokeDasharray="5 5"
              name="Goal"
            />
            
            <Area
              type="monotone"
              dataKey="calories"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#colorCalories)"
              name="Calories"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Trend Summary */}
      <div className="mt-6 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          {getTrendIcon()}
          <div>
            <p className={`text-sm font-medium ${getTrendColor()}`}>
              {trend > 0.05 ? 'Increasing' : trend < -0.05 ? 'Decreasing' : 'Stable'} trend
            </p>
            <p className="text-xs text-gray-500">
              {Math.abs(trend * 100).toFixed(1)}% change over {period}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            Success Rate
          </p>
          <p className="text-xs text-gray-500">
            {Math.round((daysUnderGoal / data.length) * 100)}% on goal
          </p>
        </div>
      </div>
    </motion.div>
  )
}
