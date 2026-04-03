"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine
} from "recharts"

type WaterChartProps = {
  data: Array<{
    date: string
    amount: number
    goal: number
  }>
}

type TimePeriod = "weekly" | "monthly"

export default function WaterChart({ data }: WaterChartProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("weekly")

  const filteredData =
    timePeriod === "weekly" ? data.slice(-7) : data.slice(-30)

  const avg =
    filteredData.reduce((acc, d) => acc + d.amount, 0) /
    (filteredData.length || 1)

  return (
    <div className="w-full max-w-xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-md font-bold text-black/80">Water Intake</span>

        <div className="flex items-center gap-2">
          {["weekly", "monthly"].map((t) => (
            <button
              key={t}
              onClick={() => setTimePeriod(t as TimePeriod)}
              className={`text-sm py-1 transition ${
                timePeriod === t
                  ? "text-blue-500"
                  : "text-gray-500 hover:text-gray-400 hover:bg-white/5"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filteredData}>
            
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              hide
              domain={[0, "dataMax + 300"]}
            />

            {/* Goal Line (subtle) */}
            <ReferenceLine
              y={filteredData[0]?.goal || 0}
              stroke="rgba(255,255,255,0.3)"
              strokeDasharray="3 3"
            />

            <Tooltip
              cursor={{ fill: "#ffffffaa" }}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.2)",
                backgroundColor: "rgba(142, 163, 200, 0.95)",
                color: "white",
                fontSize: "12px",
                backdropFilter: "blur(8px)"
              }}
            />

            <Bar
              dataKey="amount"
              radius={[4, 4, 0, 0]}
              fillOpacity={1}
              shape={(props: any) => {
                const { x, y, width, height, payload } = props
                const met = payload.amount >= payload.goal

                return (
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    rx={4}
                    fill={met ? "#10b981" : "#5a99e6"}
                  />
                )
              }}
            />
            <defs>
              <linearGradient id="waterBarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Stats */}
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>
          Avg: {Math.round(avg)} ml
        </span>
        <span>
          Goal: {filteredData[0]?.goal || 0} ml
        </span>
      </div>
    </div>
  )
}