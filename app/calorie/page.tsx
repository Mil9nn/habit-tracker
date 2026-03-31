'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Drumstick, Wheat, Droplet } from 'lucide-react'
import CalorieGauge from './components/CalorieGauge'
import MacroRing from './components/MacroRing'
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
  const [carouselSlide, setCarouselSlide] = useState(0)
  const touchStartXRef = useRef<number | null>(null)
  const touchEndXRef = useRef<number | null>(null)
  const minSwipeDistance = 50

  const handleTouchStart = (event: any) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null
  }

  const handleTouchMove = (event: any) => {
    touchEndXRef.current = event.touches[0]?.clientX ?? null
  }

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) {
      return
    }

    const distance = touchStartXRef.current - touchEndXRef.current
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // swipe left -> next
        setCarouselSlide((prev) => (prev + 1) % 2)
      } else {
        // swipe right -> previous
        setCarouselSlide((prev) => (prev - 1 + 2) % 2)
      }
    }

    touchStartXRef.current = null
    touchEndXRef.current = null
  }

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
      <div className="space-y-4">

        {/* Header Section */}
        <div className="flex items-center justify-between px-4 py-2">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Nutrition</h1>
            <p className="text-zinc-400 text-sm mt-2">Track your daily calories and macros</p>
          </div>

          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button className="px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-xl transition-all duration-200">
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

        {/* Daily Summary - Carousel */}
        <div className="space-y-6 px-4">
          <div className="relative bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden">
            {/* Carousel Container */}
            <div
              className="flex"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Slide 1: Calorie Progress */}
              <div
                className={`w-full flex-shrink-0 transition-opacity duration-500 ${carouselSlide === 0 ? 'opacity-100' : 'opacity-0 hidden'
                  }`}
              >
                <div className="p-4">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-medium text-zinc-300">Daily Calories</h3>
                    <div className="flex items-center justify-center gap-4">
                      <CalorieGauge
                      current={summary?.totalCalories || 0}
                      target={summary?.goal || 2000}
                      size={140}
                      strokeWidth={8}
                    />
                    <div className="space-y-2 pt-2">
                      <p className="text-xl font-semibold text-white">
                        {summary?.totalCalories || 0} / {summary?.goal || 2000} kcal
                      </p>
                      <p className="text-zinc-400">
                        {Math.round(((summary?.totalCalories || 0) / (summary?.goal || 2000)) * 100)}% of daily goal
                      </p>
                    </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 2: Macronutrients */}
              <div
                className={`w-full flex-shrink-0 transition-opacity duration-500 ${carouselSlide === 1 ? 'opacity-100' : 'opacity-0 hidden'
                  }`}
              >
                <div className="p-4">
                  <div className="space-y-8">
                    <h3 className="text-lg font-medium text-zinc-300">Macronutrients</h3>

                    <div className="flex justify-center items-center gap-8">
                      <MacroRing
                        current={summary?.totalProtein || 0}
                        goal={proteinGoal || 150}
                        label="Protein"
                        icon={Drumstick}
                        color="emerald"
                        size={70}
                        strokeWidth={5}
                      />
                      <MacroRing
                        current={summary?.totalCarbs || 0}
                        goal={carbsGoal || 300}
                        label="Carbs"
                        icon={Wheat}
                        color="blue"
                        size={70}
                        strokeWidth={5}
                      />
                      <MacroRing
                        current={summary?.totalFat || 0}
                        goal={fatGoal || 100}
                        label="Fats"
                        icon={Droplet}
                        color="amber"
                        size={70}
                        strokeWidth={5}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-center px-6 py-4">
              <button
                onClick={() => setCarouselSlide(carouselSlide === 0 ? 1 : 0)}
                className="hidden md:block p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
                aria-label="Previous slide"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Slide Indicators */}
              <div className="flex gap-2">
                {[0, 1].map((index) => (
                  <button
                    key={index}
                    onClick={() => setCarouselSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${carouselSlide === index
                        ? 'bg-violet-500 w-6'
                        : 'bg-zinc-700 w-2 hover:bg-zinc-600'
                      }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCarouselSlide(carouselSlide === 0 ? 1 : 0)}
                className="hidden md:blockp-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
                aria-label="Next slide"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Left Column */}
          <div className="space-y-8">

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
