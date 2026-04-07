'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, isValid } from 'date-fns'

interface HorizontalCalendarProps {
  selectedDate: string
  onDateSelect: (date: string) => void
}

const WEEK_START = 1 // Monday
const MIN_SWIPE_DISTANCE = 50

export function HorizontalCalendar({ selectedDate, onDateSelect }: HorizontalCalendarProps) {
  // Validate and parse selected date
  const parsedSelectedDate = useMemo(() => {
    const date = new Date(selectedDate)
    return isValid(date) ? date : new Date()
  }, [selectedDate])

  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(parsedSelectedDate, { weekStartsOn: WEEK_START })
  )

  // Memoize week days to prevent unnecessary recalculations
  const weekDays = useMemo(() => {
    try {
      return eachDayOfInterval({
        start: currentWeekStart,
        end: endOfWeek(currentWeekStart, { weekStartsOn: WEEK_START })
      })
    } catch (error) {
      console.error('Error generating week days:', error)
      return []
    }
  }, [currentWeekStart])

  
  // Memoize date selection handler
  const handleDateSelect = useCallback((dateStr: string) => {
    try {
      const date = new Date(dateStr)
      if (isValid(date)) {
        onDateSelect(dateStr)
      }
    } catch (error) {
      console.error('Invalid date selected:', dateStr)
    }
  }, [onDateSelect])

  // Auto-scroll to selected date with error handling
  useEffect(() => {
    try {
      const dayId = `day-${format(parsedSelectedDate, 'yyyy-MM-dd')}`
      const selectedDayElement = document.getElementById(dayId)
      
      if (selectedDayElement) {
        selectedDayElement.scrollIntoView({ 
          behavior: 'smooth', 
          inline: 'center', 
          block: 'nearest' 
        })
      }
    } catch (error) {
      console.error('Error scrolling to selected date:', error)
    }
  }, [parsedSelectedDate, currentWeekStart])

  // Memoize button styles to prevent recreation
  const getButtonStyles = useCallback((isSelected: boolean, isCurrentDay: boolean) => {
    const baseStyles = 'flex flex-col items-center justify-center min-w-[50px] sm:min-w-[58px] sm:p-3 transition-all flex-shrink-0'
    
    if (isSelected) {
      return `${baseStyles} bg-violet-500 text-white shadow-md`
    }
    
    if (isCurrentDay) {
      return `${baseStyles} bg-zinc-200 text-black hover:bg-zinc-200`
    }
    
    return `${baseStyles} text-zinc-600 hover:bg-zinc-50`
  }, [])

  const getDayLabelStyles = useCallback((isSelected: boolean) => {
    return `text-[10px] sm:text-xs font-medium mb-1 ${isSelected ? 'text-white' : 'text-zinc-500'}`
  }, [])

  const getDayNumberStyles = useCallback((isSelected: boolean) => {
    return `text-xs sm:text-sm font-semibold ${isSelected ? 'text-white' : 'text-zinc-700'}`
  }, [])

  return (
    <div className="w-full bg-white border-b border-zinc-200">
      <div className="px-4">
        {/* Week Days Container */}
        <div className="overflow-hidden">
          <div className="overflow-x-auto scrollbar-none scrollbar-thin scrollbar-track-zinc-100 scrollbar-thumb-zinc-300 hover:scrollbar-thumb-zinc-400">
            <div className="flex justify-center min-w-max">
              {weekDays.map((day) => {
                const dayStr = format(day, 'yyyy-MM-dd')
                const isSelected = isSameDay(day, parsedSelectedDate)
                const isCurrentDay = isToday(day)
                
                return (
                  <button
                    key={dayStr}
                    id={`day-${dayStr}`}
                    onClick={() => handleDateSelect(dayStr)}
                    className={getButtonStyles(isSelected, isCurrentDay)}
                    aria-label={`Select ${format(day, 'EEEE, MMMM d, yyyy')}`}
                    aria-pressed={isSelected}
                  >
                    <span className={getDayLabelStyles(isSelected)}>
                      {format(day, 'EEE').toUpperCase().slice(0, 2)}
                    </span>
                    <span className={getDayNumberStyles(isSelected)}>
                      {format(day, 'd')}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
