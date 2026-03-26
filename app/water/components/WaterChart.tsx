"use client"

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type WaterChartProps = {
  data: Array<{
    date: string
    amount: number
    goal: number
    status: 'above' | 'close' | 'below'
  }>
}

type TimePeriod = 'weekly' | 'monthly' | 'yearly'

export default function WaterChart({ data }: WaterChartProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('weekly')

  // Filter data based on time period
  const getFilteredData = () => {
    if (timePeriod === 'weekly') {
      return data.slice(-7) // Last 7 days
    } else if (timePeriod === 'monthly') {
      return data.slice(-30) // Last 30 days
    } else {
      return data.slice(-365) // Last 365 days
    }
  }

  const filteredData = getFilteredData()

  // Custom dot component based on status
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props

    let fill = '#ef4444' // red for below goal
    let r = 4

    if (payload.status === 'above') {
      fill = '#10b981' // green for above goal
      r = 5
    } else if (payload.status === 'close') {
      fill = '#f59e0b' // amber for close to goal
      r = 4.5
    }

    return <circle cx={cx} cy={cy} r={r} fill={fill} />
  }

  return (
    <div className='mt-5'>
      <h3 className="text-gray-600 text-15 mb-2 font-bold tracking-[0.12em]">Water Trend</h3>
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2 w-full justify-end">
            <button
              onClick={() => setTimePeriod('weekly')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${timePeriod === 'weekly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimePeriod('monthly')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${timePeriod === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setTimePeriod('yearly')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${timePeriod === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              Yearly
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
              domain={[0, 'dataMax + 500']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={<CustomDot />}
              activeDot={{ r: 6 }}
              name="Water Intake (ml)"
            />
            <Line
              type="monotone"
              dataKey="goal"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Daily Goal"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
