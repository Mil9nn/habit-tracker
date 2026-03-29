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
import { MealTemplatesMinimal } from './components/MealTemplates'
import { CalorieTrendsChart } from './components/CalorieTrendsChart'

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
  const [trendsData, setTrendsData] = useState<any[]>([])
  const [trendsPeriod, setTrendsPeriod] = useState<'week' | 'month' | 'quarter'>('week')
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  // Get macro goals from store
  const proteinGoal = useProteinGoal()
  const carbsGoal = useCarbsGoal()
  const fatGoal = useFatGoal()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  

  const fetchTrendsData = async (period: 'week' | 'month' | 'quarter' = 'week') => {
    try {
      const response = await fetch(`/api/calories/trends?period=${period}`)
      if (response.ok) {
        const data = await response.json()
        setTrendsData(data.data)
      }
    } catch (error) {
      console.error('Error fetching trends data:', error)
    }
  }

  useEffect(() => {
    fetchTrendsData(trendsPeriod)
  }, [trendsPeriod])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
      fetchTrendsData(trendsPeriod)
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status, selectedDate])

  // useEffect(() => {
  //   if (status === 'unauthenticated') {
  //     router.push('/auth/signin')
  //   }
  // }, [status, router])

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
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateSelect = async (template: any) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/calories/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodName: template.name,
          calories: template.totalCalories,
          protein: template.totalProtein,
          carbs: template.totalCarbs,
          fat: template.totalFat,
          mealType: template.mealType,
          quantity: 1,
          isMeal: template.mealItems.length > 1,
          mealItems: template.mealItems
        })
      })

      if (response.ok) {
        // Update template usage count
        await fetch(`/api/calories/templates/${template._id}/use`, {
          method: 'POST'
        })
        
        fetchData() // Refresh data
      }
    } catch (error) {
      console.error('Error adding template:', error)
    } finally {
      setIsSubmitting(false)
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
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-violet-500/20 rounded-full"></div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="py-8 space-y-12">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white tracking-tight">Nutrition</h1>
            <p className="text-zinc-400 mt-2">Track your daily calories and macros</p>
          </div>
          
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button className="px-4 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-xl transition-all duration-200">
                {selectedDate ? format(new Date(selectedDate), "MMM do, yyyy") : "Today"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-zinc-800 border-zinc-700" align="end">
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
                className="text-white"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Daily Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Calorie Progress */}
          <div className="space-y-6">
            <div className="text-center">
              <CalorieGauge
                current={summary?.totalCalories || 0}
                target={summary?.goal || 2000}
                size={200}
                strokeWidth={12}
              />
              <div className="mt-6 space-y-2">
                <p className="text-2xl font-medium text-white">
                  {summary?.totalCalories || 0} / {summary?.goal || 2000} kcal
                </p>
                <p className="text-zinc-400">
                  {Math.round(((summary?.totalCalories || 0) / (summary?.goal || 2000)) * 100)}% of daily goal
                </p>
              </div>
            </div>
          </div>

          {/* Macros */}
          <div className="space-y-8">
            <h2 className="text-xl font-medium text-white">Macronutrients</h2>
            
            <div className="space-y-6">
              {/* Protein */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-300 font-medium">Protein</span>
                  <span className="text-white font-semibold">
                    {Math.round((summary?.totalProtein || 0) * 10) / 10}g / {proteinGoal || 150}g
                  </span>
                </div>
                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                    style={{ 
                      width: `${Math.min(((summary?.totalProtein || 0) / (proteinGoal || 150)) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>

              {/* Carbs */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-300 font-medium">Carbs</span>
                  <span className="text-white font-semibold">
                    {Math.round((summary?.totalCarbs || 0) * 10) / 10}g / {carbsGoal || 300}g
                  </span>
                </div>
                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                    style={{ 
                      width: `${Math.min(((summary?.totalCarbs || 0) / (carbsGoal || 300)) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>

              {/* Fats */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-300 font-medium">Fats</span>
                  <span className="text-white font-semibold">
                    {Math.round((summary?.totalFat || 0) * 10) / 10}g / {fatGoal || 100}g
                  </span>
                </div>
                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 rounded-full transition-all duration-500 ease-out"
                    style={{ 
                      width: `${Math.min(((summary?.totalFat || 0) / (fatGoal || 100)) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-8 py-6 border-y border-zinc-800">
          <div>
            <p className="text-zinc-500 text-sm">Daily Average</p>
            <p className="text-white font-medium">
              {summary ? `${Math.round(summary.averageDaily)} kcal` : "0 kcal"}
            </p>
          </div>
          <div>
            <p className="text-zinc-500 text-sm">Entries Today</p>
            <p className="text-white font-medium">
              {logs?.length || 0}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Column */}
          <div className="space-y-8">
            
            {/* AI Food Analysis */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Quick Add Food</h3>
              <AIFoodAnalysis onDataAdded={fetchData} />
            </div>

            {/* Meal Templates */}
            <MealTemplatesMinimal
              onTemplateSelect={handleTemplateSelect}
              onDataUpdated={fetchData}
            />

            {/* Food Log */}
            <FoodLog logs={logs} selectedDate={selectedDate} onDataUpdated={fetchData} />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            
            {/* Calorie Trends Chart */}
            <CalorieTrendsChart 
              data={trendsData}
              period={trendsPeriod}
              onPeriodChange={setTrendsPeriod}
            />

            {/* Calorie Heatmap */}
            <CalorieHeatmap data={heatmapData} goal={summary?.goal || 2000} />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
