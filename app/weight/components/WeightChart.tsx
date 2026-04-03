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
      <div className="flex items-center justify-between">
        <h3 className="text-md font-medium text-gray-600">Weight Trend</h3>
        <div className="flex gap-2">
          {["weekly", "monthly"].map((period) => (
            <button
              key={period}
              onClick={() => {
                setTimePeriod(period as "weekly" | "monthly")
                setTrendView(period === "weekly" ? 7 : 30)
              }}
              className={`text-xs px-2 py-1 rounded-md transition-colors ${
                timePeriod === period
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-500 hover:text-gray-600"
              }`}
            >
              {period}
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