'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import CalorieGauge from './components/CalorieGauge'
import CalorieHeatmap from './components/CalorieHeatmap'
import { AIFoodAnalysis } from './components/AIFoodAnalysis'
import { useProteinGoal, useCarbsGoal, useFatGoal } from '@/store/useProfileStore'
import MainLayout from '../layout/MainLayout'
import { FoodLog } from './components/FoodLog'

// Define CalorieLogForm interface locally since we removed ManualEntryForm
export interface CalorieLogForm {
  foodName: string
  calories: number
  protein?: number
  carbs?: number
  fat?: number
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  quantity?: number
}

export interface FoodItem {
  name: string;
  quantity: number;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface CalorieLog {
  _id: string
  foodName: string
  calories: number
  protein?: number
  carbs?: number
  fat?: number
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  quantity?: number
  timestamp: string
  userId: string
  createdAt: string
  updatedAt: string
  // New fields for meal support
  isMeal: boolean
  mealItems?: FoodItem[]
}

export interface CalorieSummary {
  totalCalories: number
  totalProtein?: number
  totalCarbs?: number
  totalFat?: number
  goal: number
  progress: number
  entryCount: number
  averageDaily: number
  goalInfo?: {
    currentGoal: number
    calculatedNeeds: number
    difference: number
    percentage: number
    isDeficit: boolean
    isSurplus: boolean
    recommendation: string
  }
}

export default function CalorieTracker() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [summary, setSummary] = useState<CalorieSummary | null>(null)
  const [logs, setLogs] = useState<CalorieLog[]>([])
  const [heatmapData, setHeatmapData] = useState<{ date: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  // Get macro goals from store
  const proteinGoal = useProteinGoal()
  const carbsGoal = useCarbsGoal()
  const fatGoal = useFatGoal()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status, selectedDate])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const fetchData = async () => {
    try {
      const targetDate = selectedDate

      // Create end date that includes the full day
      const endDate = new Date(targetDate)
      endDate.setHours(23, 59, 59, 999)

      const [summaryRes, logsRes] = await Promise.all([
        fetch(`/api/calories/summary?period=daily&date=${targetDate}`),
        fetch(`/api/calories/log?startDate=${targetDate}&endDate=${endDate.toISOString()}`)
      ])

      if (summaryRes.ok && logsRes.ok) {
        const [summaryData, logsData] = await Promise.all([
          summaryRes.json(),
          logsRes.json()
        ])

        setSummary(summaryData)
        setLogs(logsData)

        // Fetch all logs for heatmap
        const allLogsRes = await fetch('/api/calories/log')
        if (allLogsRes.ok) {
          const allLogsData = await allLogsRes.json()

          // Process logs for heatmap
          const dailyTotals: { [key: string]: number } = {}
          allLogsData.forEach((log: CalorieLog) => {
            const dateKey = new Date(log.timestamp).toISOString().split('T')[0]
            dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + log.calories
          })

          const heatmap = Object.entries(dailyTotals).map(([date, count]) => ({
            date,
            count
          }))
          setHeatmapData(heatmap)
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addCalorie = async (data: CalorieLogForm) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/calories/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error adding calorie:', error)
    } finally {
      setIsSubmitting(false)
    }
  }


  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="h-8 w-8 text-blue-500 fill-current">
            <path d="M320 176C311.2 176 304 168.8 304 160L304 144C304 99.8 339.8 64 384 64L400 64C408.8 64 416 71.2 416 80L416 96C416 140.2 380.2 176 336 176L320 176zM96 352C96 275.7 131.7 192 208 192C235.3 192 267.7 202.3 290.7 211.3C309.5 218.6 330.6 218.6 349.4 211.3C372.3 202.4 404.8 192 432.1 192C508.4 192 544.1 275.7 544.1 352C544.1 480 464.1 576 384.1 576C367.6 576 346 569.4 332.6 564.7C324.5 561.9 315.7 561.9 307.6 564.7C294.2 569.4 272.6 576 256.1 576C176.1 576 96.1 480 96.1 352z"/>
          </svg>
        </div>
      </div>
    )
  }

  return (
    <MainLayout>
      <main className="space-y-4 p-4">
        <div className="flex items-center gap-2 justify-between mb-2">
          <h3 className="text-base font-semibold">Today's Nutrition</h3>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal text-xs",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                {selectedDate ? format(new Date(selectedDate), "do 'of' MMMM yyyy") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dayjs(selectedDate).toDate()}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(dayjs(date).format('YYYY-MM-DD'))
                    setCalendarOpen(false)
                  }
                }}
                disabled={(date) => date > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center gap-6 mb-4">
          <CalorieGauge
            current={summary?.totalCalories || 0}
            target={summary?.goal || 2000}
            size={200}
            strokeWidth={12}
          />

          {/* Macro Progress Bars */}
          <div className="w-64 space-y-3">
            {/* Protein */}
            <div className="space-y-1">
              <div className="flex justify-between items-center flex-wrap">
                <span className="text-[11px] font-medium text-gray-600">Protein(g)</span>
                <span className="text-[11px] text-gray-400">
                  {Math.round((summary?.totalProtein || 0) * 10) / 10}/{proteinGoal || 150}
                </span>
              </div>
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div 
                  className="h-full bg-green-500 transition-all duration-500 ease-out"
                  style={{ 
                    transform: `translateX(-${100 - Math.min(((summary?.totalProtein || 0) / (proteinGoal || 150)) * 100, 100)}%)`,
                    backgroundColor: '#06d6a0'
                  }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div className="space-y-1">
              <div className="flex justify-between items-center flex-wrap">
                <span className="text-[11px] font-medium text-gray-600">Carbs(g)</span>
                <span className="text-[11px] text-gray-400">
                  {Math.round((summary?.totalCarbs || 0) * 10) / 10}/{carbsGoal || 300}
                </span>
              </div>
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div 
                  className="h-full bg-blue-500 transition-all duration-500 ease-out"
                  style={{ 
                    transform: `translateX(-${100 - Math.min(((summary?.totalCarbs || 0) / (carbsGoal || 300)) * 100, 100)}%)`,
                    backgroundColor: '#118ab2'
                  }}
                />
              </div>
            </div>

            {/* Fats */}
            <div className="space-y-1">
              <div className="flex justify-between items-center flex-wrap">
                <span className="text-[11px] font-medium text-gray-600">Fats(g)</span>
                <span className="text-[11px] text-gray-400">
                  {Math.round((summary?.totalFat || 0) * 10) / 10}/{fatGoal || 100}
                </span>
              </div>
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div 
                  className="h-full bg-pink-500 transition-all duration-500 ease-out"
                  style={{ 
                    transform: `translateX(-${100 - Math.min(((summary?.totalFat || 0) / (fatGoal || 100)) * 100, 100)}%)`,
                    backgroundColor: '#ef476f'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <AIFoodAnalysis onDataAdded={fetchData} />

        {/* Daily Average */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 shadow-sm hover:shadow-md transition">
          <span className="text-xs font-medium text-gray-500">
            Daily Average
          </span>

          <span className="text-sm font-bold text-gray-900">
            {summary ? `${Math.round(summary.averageDaily)} kcal` : "0 kcal"}
          </span>
        </div>

        <FoodLog logs={logs} selectedDate={selectedDate} onDataUpdated={fetchData} />
        <CalorieHeatmap data={heatmapData} goal={summary?.goal || 2000} />
      </main>
    </MainLayout>
  )
}
