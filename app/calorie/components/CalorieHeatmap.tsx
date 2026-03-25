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
    if (count === 0) return 'fill-gray-100'
    if (count === 1) return 'fill-blue-100'
    if (count === 2) return 'fill-blue-300'
    if (count === 3) return 'fill-blue-500'
    if (count === 4) return 'fill-red-400'
    return 'fill-red-500' // Changed to red-500 for consistency
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
    <div className="w-full">
      <div className="">
        <h3 className="text-base font-semibold mb-3 text-gray-900">Calorie Intake Heatmap</h3>
        
        <div className="mb-4 bg-white shadow-sm rounded-md p-2">
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
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-gray-100" />
              <div className="w-2 sm:w-3 sm:h-3 h-2 sm:w-3 sm:h-3 rounded-sm bg-blue-100" />
              <div className="w-2 sm:w-3 sm:h-3 h-2 sm:w-3 sm:h-3 rounded-sm bg-blue-300" />
              <div className="w-2 sm:w-3 sm:h-3 h-2 sm:w-3 sm:h-3 rounded-sm bg-blue-500" />
              <div className="w-2 sm:w-3 sm:h-3 h-2 sm:w-3 sm:h-3 rounded-sm bg-red-400" />
              <div className="w-2 sm:w-3 sm:h-3 h-2 sm:w-3 sm:h-3 rounded-sm bg-red-600" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  )
}
