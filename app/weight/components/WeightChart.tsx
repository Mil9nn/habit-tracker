"use client"

import { motion } from "framer-motion"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

export default function WeightChart({
  entries,
  unit,
  trendView,
  setTrendView,
  weeklyChange,
  projectedWeeks
}: any) {
  const chartData = entries.slice(-trendView).map((e: any) => ({
    weight: e.weight,
    label: e.date.slice(5)
  }))

  return (
    <div className="w-full max-w-xl mx-auto mt-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-zinc-500">Weight Trend</span>

        <div className="flex gap-2">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setTrendView(days)}
              className={`text-xs ${
                trendView === days
                  ? "text-blue-600"
                  : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* Key Insight */}
      <div className="flex gap-3 text-sm mb-3">
        {weeklyChange !== null && (
          <span
            className={`font-medium ${
              weeklyChange < 0 ? "text-green-600" : "text-zinc-500"
            }`}
          >
            {weeklyChange < 0 ? "↓" : "↑"} {Math.abs(weeklyChange)} {unit}/week
          </span>
        )}

        {projectedWeeks && (
          <span className="text-zinc-400">
            ~{projectedWeeks} weeks to goal
          </span>
        )}
      </div>

      {/* Chart */}
      <div className="w-full h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis hide domain={["auto", "auto"]} />

            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "12px"
              }}
            />

            <Area
              type="monotone"
              dataKey="weight"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="transparent"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}