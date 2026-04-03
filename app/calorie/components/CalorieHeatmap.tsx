'use client'

import { useMemo } from 'react'
import CalendarHeatmap from 'react-calendar-heatmap'
import { CalendarDays } from 'lucide-react'
import 'react-calendar-heatmap/dist/styles.css'

interface CalorieHeatmapProps {
  data: { date: string; count: number }[]
  goal?: number // Made goal optional since we're not using it for coloring
}

export default function CalorieHeatmap({ data, goal }: CalorieHeatmapProps) {
  const processedData = useMemo(() => {
    // Process data for heatmap with dynamic scaling so light and heavy days are visible
    const maxValue = Math.max(1, ...data.map(entry => entry.count))
    const base = goal && goal > 0 ? goal : maxValue

    return data.map(entry => {
      const ratio = entry.count / base
      const level = Math.min(4, Math.floor(ratio * 5))

      return {
        date: entry.date,
        count: level
      }
    })
  }, [data, goal])

  const classForValue = (value: { count?: number; date?: string } | null) => {
    const count = value?.count || 0
    if (count === 0) return 'fill-white'
    if (count === 1) return 'fill-green-100'
    if (count === 2) return 'fill-green-300'
    if (count === 3) return 'fill-green-500'
    if (count === 4) return 'fill-green-700'
    return 'fill-green-900'
  }

  const getTooltipDataAttrs = (value: { date?: string; count?: number } | null) => {
    if (!value || value.count === 0) {
      return {
        'data-tip': 'No calorie intake recorded'
      }
    }
    // Find the original data entry to get actual calorie value
    const originalEntry = data.find(entry => entry.date === value.date)
    const calories = originalEntry?.count || 0
    return {
      'data-tip': `${calories} calories consumed`
    }
  }

  if (data.length === 0) {
    return (
      <div className="w-full p-5">

        {/* Header */}
        <h3 className="text-lg font-semibold text-zinc-800 mb-4">
          Activity Heatmap
        </h3>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center text-center py-10">

          {/* Icon */}
          <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 shadow-sm mb-4">
            <CalendarDays className="w-6 h-6 text-indigo-500" />
          </div>

          {/* Title */}
          <p className="text-sm font-medium text-zinc-700">
            No activity yet
          </p>

          {/* Description */}
          <p className="text-xs text-zinc-500 mt-1 max-w-xs">
            Your daily food logs will appear here as a streak heatmap.
            Start logging meals to build consistency.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full p-4">
      <h3 className="text-lg font-medium text-black">Activity Heatmap</h3>

      <div className="overflow-x-auto -mx-4 px-4">
        <div style={{ minWidth: '1000px' }} className="p-2">
          <CalendarHeatmap
            startDate={new Date(new Date().getFullYear(), 0, 1)}
            endDate={new Date(new Date().getFullYear(), 11, 31)}
            values={processedData}
            classForValue={classForValue}
            tooltipDataAttrs={getTooltipDataAttrs}
            showMonthLabels={true}
            gutterSize={4}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-white border border-zinc-400" />
          <div className="w-3 h-3 rounded-sm bg-green-100" />
          <div className="w-3 h-3 rounded-sm bg-green-300" />
          <div className="w-3 h-3 rounded-sm bg-green-500" />
          <div className="w-3 h-3 rounded-sm bg-green-700" />
        </div>
        <span>More</span>
      </div>
    </div>
  )
}
