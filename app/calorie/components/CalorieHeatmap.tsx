'use client'

import { useMemo } from 'react'

interface HeatmapData {
  date: string
  count: number
}

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const daysInMonth = lastDay.getDate()
  const startOffset = firstDay.getDay() // 0 = Sunday

  const cells: (Date | null)[] = []

  // empty cells before month starts
  for (let i = 0; i < startOffset; i++) {
    cells.push(null)
  }

  // actual days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d))
  }

  return cells
}


export default function CalorieHeatmap({ data }: { data: HeatmapData[] }) {
  const dataMap = useMemo(() => {
    const map = new Map<string, number>()
    data.forEach(d => map.set(d.date, d.count))
    return map
  }, [data])

  const year = new Date().getFullYear()

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, m) => ({
      month: m,
      cells: getMonthGrid(year, m),
    }))
  }, [year])

  const getLevel = (count: number) => {
    if (count === 0) return 'bg-zinc-200'
    if (count < 500) return 'bg-green-200'
    if (count < 1000) return 'bg-green-400'
    if (count < 2000) return 'bg-green-600'
    return 'bg-green-800'
  }

  return (
  <div className="space-y-4 p-4">

    <h3 className="text-lg font-semibold text-zinc-800">
      Calorie Heatmap
    </h3>

    <div className="flex gap-3">

      {/* Weekday labels (LEFT SIDE, aligned) */}
      <div className="flex flex-col gap-1 text-[10px] text-zinc-400 pt-6">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} className="h-3.5 flex items-center">
            {d}
          </div>
        ))}
      </div>

      {/* Months */}
      <div className="flex gap-6 overflow-x-auto pb-2">
        {months.map(({ month, cells }) => (
          <div key={month} className="flex flex-col">

            {/* Month label */}
            <span className="text-xs text-zinc-500 mb-2 text-center">
              {new Date(year, month).toLocaleString('default', { month: 'short' })}
            </span>

            {/* Grid */}
            <div className="grid grid-rows-7 grid-flow-col gap-1">
              {cells.map((date, i) => {
                const key = date
                  ? date.toISOString().split('T')[0]
                  : `empty-${i}`

                const count = date
                  ? dataMap.get(key) || 0
                  : 0

                return (
                  <div
                    key={key}
                    className={`w-3.5 h-3.5 rounded-[3px] ${date ? getLevel(count) : 'bg-transparent'}`}
                    title={date ? `${key} → ${count}` : ''}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>

    </div>
  </div>
)
}