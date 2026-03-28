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
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-light text-gray-900 tracking-tight">Nutrition</h1>
                <p className="text-sm text-gray-500 mt-1">Track your daily calories and macros</p>
              </div>
              
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    {selectedDate ? format(new Date(selectedDate), "MMM do, yyyy") : "Today"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
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
          </div>

          {/* Main Stats Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Calorie Progress */}
            <div className="lg:col-span-1">
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center">
                  <CalorieGauge
                    current={summary?.totalCalories || 0}
                    target={summary?.goal || 2000}
                    size={160}
                    strokeWidth={10}
                  />
                </div>
                <div className="mt-4 space-y-1">
                  <p className="text-sm font-medium text-gray-900">
                    {summary?.totalCalories || 0} / {summary?.goal || 2000} kcal
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round(((summary?.totalCalories || 0) / (summary?.goal || 2000)) * 100)}% of daily goal
                  </p>
                </div>
              </div>
            </div>

            {/* Macros Section */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Macronutrients</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Protein */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Protein</span>
                      <span className="text-sm text-gray-500">
                        {Math.round((summary?.totalProtein || 0) * 10) / 10}g
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                        style={{ 
                          width: `${Math.min(((summary?.totalProtein || 0) / (proteinGoal || 150)) * 100, 100)}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-400">Goal: {proteinGoal || 150}g</p>
                  </div>

                  {/* Carbs */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Carbs</span>
                      <span className="text-sm text-gray-500">
                        {Math.round((summary?.totalCarbs || 0) * 10) / 10}g
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                        style={{ 
                          width: `${Math.min(((summary?.totalCarbs || 0) / (carbsGoal || 300)) * 100, 100)}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-400">Goal: {carbsGoal || 300}g</p>
                  </div>

                  {/* Fats */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Fats</span>
                      <span className="text-sm text-gray-500">
                        {Math.round((summary?.totalFat || 0) * 10) / 10}g
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-rose-500 rounded-full transition-all duration-500 ease-out"
                        style={{ 
                          width: `${Math.min(((summary?.totalFat || 0) / (fatGoal || 100)) * 100, 100)}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-400">Goal: {fatGoal || 100}g</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center justify-between py-4 border-y border-gray-100 mb-6">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-gray-500">Daily Average</p>
                <p className="text-sm font-medium text-gray-900">
                  {summary ? `${Math.round(summary.averageDaily)} kcal` : "0 kcal"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Entries Today</p>
                <p className="text-sm font-medium text-gray-900">
                  {logs?.length || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column */}
            <div className="space-y-6">
              
              {/* AI Food Analysis */}
              <AIFoodAnalysis onDataAdded={fetchData} />

              {/* Meal Templates */}
              <MealTemplatesMinimal
                onTemplateSelect={handleTemplateSelect}
                onDataUpdated={fetchData}
              />

              {/* Food Log */}
              <FoodLog logs={logs} selectedDate={selectedDate} onDataUpdated={fetchData} />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              
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
      </div>
    </MainLayout>
  )
}
