'use client'

import { useState, useEffect } from 'react'
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'

interface WaterHeatmapProps {
  data: { date: string; count: number }[]
  goal: number
}

export default function WaterHeatmap({ data, goal }: WaterHeatmapProps) {
  const [processedData, setProcessedData] = useState<any[]>([])

  useEffect(() => {
    console.log('Raw data received:', data)
    // Process data for heatmap - convert water intake to count levels based on goal
    const mlPerLevel = Math.ceil(goal / 5) // Divide goal into 5 levels
    const heatmapData = data.map(entry => {
      const level = Math.min(Math.floor(entry.count / mlPerLevel), 5)
      console.log(`Date: ${entry.date}, Amount: ${entry.count}ml, Level: ${level} (goal: ${goal}ml, ${mlPerLevel}ml per level)`)
      return {
        date: entry.date,
        count: level
      }
    })
    console.log('Processed heatmap data:', heatmapData)
    setProcessedData(heatmapData)
  }, [data, goal])

  const classForValue = (value: any) => {
    const count = value?.count || 0
    if (count === 0) return 'fill-gray-100'
    if (count === 1) return 'fill-blue-100'
    if (count === 2) return 'fill-blue-300'
    if (count === 3) return 'fill-blue-400'
    if (count === 4) return 'fill-blue-500'
    return 'fill-blue-700'
  }

  const getTooltipDataAttrs = (value: any) => {
    if (!value || value.count === 0) {
      return {
        'data-tip': 'No water intake recorded'
      }
    }
    // Find the original data entry to get actual ml value
    const originalEntry = data.find(entry => entry.date === value.date)
    const ml = originalEntry?.count || 0
    return {
      'data-tip': `${ml}ml of water consumed`
    }
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Water Intake Heatmap</h3>
        
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
              <div className="w-2 sm:w-3 sm:h-3 h-2 sm:w-3 sm:h-3 rounded-sm bg-blue-100" />
              <div className="w-2 sm:w-3 sm:h-3 h-2 sm:w-3 sm:h-3 rounded-sm bg-blue-300" />
              <div className="w-2 sm:w-3 sm:h-3 h-2 sm:w-3 sm:h-3 rounded-sm bg-blue-400" />
              <div className="w-2 sm:w-3 sm:h-3 h-2 sm:w-3 sm:h-3 rounded-sm bg-blue-500" />
              <div className="w-2 sm:w-3 sm:h-3 h-2 sm:w-3 sm:h-3 rounded-sm bg-blue-700" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  )
}
