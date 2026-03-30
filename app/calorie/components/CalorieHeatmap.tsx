'use client'

import { useState, useEffect } from 'react'
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'

interface CalorieHeatmapProps {
  data: { date: string; count: number }[]
  goal?: number // Made goal optional since we're not using it for coloring
}

export default function CalorieHeatmap({ data, goal }: CalorieHeatmapProps) {
  const [processedData, setProcessedData] = useState<any[]>([])

  useEffect(() => {
    // Process data for heatmap - use simple 5-level coloring based on calorie count
    const heatmapData = data.map(entry => {
      // Simple division into 5 levels regardless of goal
      const level = Math.min(Math.floor(entry.count / 200), 4) // Roughly every 200 calories = 1 level, max 4

      return {
        date: entry.date,
        count: level
      }
    })

    setProcessedData(heatmapData)
  }, [data])

  const classForValue = (value: any) => {
    const count = value?.count || 0
    if (count === 0) return 'fill-white'
    if (count === 1) return 'fill-green-100'
    if (count === 2) return 'fill-green-300'
    if (count === 3) return 'fill-green-500'
    if (count === 4) return 'fill-green-700'
    return 'fill-green-900'
  }

  const getTooltipDataAttrs = (value: any) => {
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

  return (
    <div className="w-full p-4">
      <h3 className="text-lg font-medium text-white">Activity Heatmap</h3>

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
