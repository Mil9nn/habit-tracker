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
    if (count === 0) return 'fill-zinc-700'
    if (count === 1) return 'fill-violet-900/50'
    if (count === 2) return 'fill-violet-700'
    if (count === 3) return 'fill-violet-500'
    if (count === 4) return 'fill-violet-300'
    return 'fill-violet-200'
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
    <div className="w-full space-y-4">
      <h3 className="text-lg font-medium text-white">Activity Heatmap</h3>
      
      <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700/50">
        <CalendarHeatmap
          startDate={new Date(new Date().setDate(new Date().getDate() - 90))}
          endDate={new Date()}
          values={processedData}
          classForValue={classForValue}
          tooltipDataAttrs={getTooltipDataAttrs}
          showWeekdayLabels={true}
          showMonthLabels={true}
          horizontal={true}
          gutterSize={2}
        />
      </div>
      
      <div className="flex items-center justify-between text-sm text-zinc-400">
        <div className="flex items-center gap-2">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-zinc-700" />
            <div className="w-3 h-3 rounded-sm bg-violet-900/50" />
            <div className="w-3 h-3 rounded-sm bg-violet-700" />
            <div className="w-3 h-3 rounded-sm bg-violet-500" />
            <div className="w-3 h-3 rounded-sm bg-violet-300" />
            <div className="w-3 h-3 rounded-sm bg-violet-200" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
