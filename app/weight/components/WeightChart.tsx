"use client"

import { useState } from "react"
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
  const [timePeriod, setTimePeriod] = useState<"weekly" | "monthly">(trendView === 7 ? "weekly" : "monthly")
  const filteredData = timePeriod === "weekly" ? entries.slice(-7) : entries.slice(-30)
  const chartData = filteredData.map((e: any) => ({
    weight: e.weight,
    label: e.date.slice(5)
  }))

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="px-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-zinc-800">Weight Trend</h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {filteredData.length} day{filteredData.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <div
          className="flex items-center p-0.5 rounded-lg gap-0.5"
          style={{ background: '#f4f4f5' }}
        >
          {["weekly", "monthly"].map((period) => (
            <button
              key={period}
              onClick={() => {
                setTimePeriod(period as "weekly" | "monthly")
                setTrendView(period === "weekly" ? 7 : 30)
              }}
              className="px-3 py-1 rounded-md text-xs font-medium transition-all duration-200"
              style={{
                background: timePeriod === period ? '#fff' : 'transparent',
                color: timePeriod === period ? '#18181b' : '#a1a1aa',
                boxShadow: timePeriod === period ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              hide
              domain={["auto", "auto"]}
            />
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

      {/* Footer Stats */}
      <div className="flex justify-between text-xs text-gray-600">
        <span>
          {weeklyChange !== null && (
            <>
              {weeklyChange < 0 ? "↓" : "↑"} {Math.abs(weeklyChange)} {unit}/week
            </>
          )}
        </span>
        <span>
          {projectedWeeks !== null && `~${projectedWeeks} weeks to goal`}
        </span>
      </div>
    </div>
  )
}