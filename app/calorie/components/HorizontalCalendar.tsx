'use client'

import { useState, useEffect } from 'react'
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface HorizontalCalendarProps {
  selectedDate: string
  onDateSelect: (date: string) => void
}

export function HorizontalCalendar({ selectedDate, onDateSelect }: HorizontalCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(selectedDate), { weekStartsOn: 1 }) // Monday as week start
  )

  // Generate week days
  const weekDays = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart, { weekStartsOn: 1 })
  })

  // Navigate to previous/next week
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekStart = direction === 'prev' 
      ? subDays(currentWeekStart, 7)
      : addDays(currentWeekStart, 7)
    setCurrentWeekStart(newWeekStart)
  }

  // Auto-scroll to selected date
  useEffect(() => {
    const selectedDayElement = document.getElementById(`day-${format(new Date(selectedDate), 'yyyy-MM-dd')}`)
    if (selectedDayElement) {
      selectedDayElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [selectedDate, currentWeekStart])

  return (
    <div className="w-full bg-white border-b border-zinc-200">
      <div className="flex items-center justify-center px-4">
        {/* Previous Week Button */}
        <button
          onClick={() => navigateWeek('prev')}
          className="p-2 hover:bg-zinc-100 rounded-lg transition-colors flex-shrink-0"
        >
          <ChevronLeft className="w-5 h-5 text-zinc-600" />
        </button>

        {/* Week Days Container */}
        <div className="flex-1 overflow-hidden">
          <div className="overflow-x-auto scrollbar-none scrollbar-thin scrollbar-track-zinc-100 scrollbar-thumb-zinc-300 hover:scrollbar-thumb-zinc-400">
            <div className="flex justify-center min-w-max py-1">
              {weekDays.map((day) => {
                const dayStr = format(day, 'yyyy-MM-dd')
                const isSelected = isSameDay(day, new Date(selectedDate))
                const isCurrentDay = isToday(day)
                
                return (
                  <button
                    key={dayStr}
                    id={`day-${dayStr}`}
                    onClick={() => onDateSelect(dayStr)}
                    className={`
                      flex flex-col items-center justify-center min-w-[40px] sm:min-w-[48px] p-2 px-4 sm:p-3 transition-all flex-shrink-0 border border-transparent
                      ${isSelected 
                        ? 'bg-violet-500 text-white shadow-md scale-105 border-violet-500' 
                        : isCurrentDay 
                          ? 'bg-zinc-100 text-black hover:bg-zinc-200 border-zinc-200' 
                          : 'text-zinc-600 hover:bg-zinc-50 border-zinc-100'
                      }
                    `}
                  >
                    <span className={`
                      text-[10px] sm:text-xs font-medium mb-1
                      ${isSelected ? 'text-white' : 'text-zinc-500'}
                    `}>
                      {format(day, 'EEE').toUpperCase().slice(0, 2)}
                    </span>
                    <span className={`
                      text-xs sm:text-sm font-semibold
                      ${isSelected ? 'text-white' : 'text-zinc-700'}
                    `}>
                      {format(day, 'd')}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Next Week Button */}
        <button
          onClick={() => navigateWeek('next')}
          className="p-2 hover:bg-zinc-100 rounded-lg transition-colors flex-shrink-0"
        >
          <ChevronRight className="w-5 h-5 text-zinc-600" />
        </button>
      </div>
    </div>
  )
}
