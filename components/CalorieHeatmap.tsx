'use client'

import { useState, useEffect } from 'react'
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'

interface CalorieHeatmapProps {
  data: { date: string; count: number }[]
  goal: number
}

export default function CalorieHeatmap({ data, goal }: CalorieHeatmapProps) {
  const [processedData, setProcessedData] = useState<any[]>([])

  useEffect(() => {
    // Process data for heatmap - convert calories to count levels based on goal
    const caloriesPerLevel = Math.ceil(goal / 5) // Divide goal into 5 levels
    const heatmapData = data.map(entry => {
      const level = Math.min(Math.floor(entry.count / caloriesPerLevel), 5)
      
      return {
        date: entry.date,
        count: level
      }
    })
    
    setProcessedData(heatmapData)
  }, [data, goal])

  const classForValue = (value: any) => {
    const count = value?.count || 0
    if (count === 0) return 'fill-gray-100'
    if (count === 1) return 'fill-yellow-100'
    if (count === 2) return 'fill-yellow-300'
    if (count === 3) return 'fill-yellow-400'
    if (count === 4) return 'fill-amber-400'
    return 'fill-amber-600'
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
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Calorie Intake Heatmap</h3>
        
        <div className="mb-4">
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
              <div className="w-2 sm:w-3 sm:h-3 h-2 sm:w-3 sm:h-3 rounded-sm bg-yellow-100" />
              <div className="w-2 sm:w-3 sm:h-3 h-2 sm:w-3 sm:h-3 rounded-sm bg-yellow-300" />
              <div className="w-2 sm:w-3 sm:h-3 h-2 sm:w-3 sm:h-3 rounded-sm bg-yellow-400" />
              <div className="w-2 sm:w-3 sm:h-3 h-2 sm:w-3 sm:h-3 rounded-sm bg-amber-400" />
              <div className="w-2 sm:w-3 sm:h-3 h-2 sm:w-3 sm:h-3 rounded-sm bg-amber-600" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  )
}
