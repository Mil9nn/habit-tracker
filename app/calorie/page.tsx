'use client'

import { useState, useEffect, useRef, useCallback, TouchEvent } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import { format } from 'date-fns'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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

interface TrendData {
  date: string
  calories: number
  goal: number
  dayName: string
}

interface MealTemplate {
  _id: string
  name: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  mealItems: FoodItem[]
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
  totalVitamins?: {
    vitaminA: number
    vitaminC: number
    vitaminD: number
    vitaminE: number
    vitaminK: number
    thiamin: number
    riboflavin: number
    niacin: number
    vitaminB6: number
    folate: number
    vitaminB12: number
  }
  totalMinerals?: {
    calcium: number
    iron: number
    magnesium: number
    phosphorus: number
    potassium: number
    sodium: number
    zinc: number
    copper: number
    manganese: number
    selenium: number
  }
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
  
  const touchStartXRef = useRef<number | null>(null)
  const touchEndXRef = useRef<number | null>(null)
  const minSwipeDistance = 50

  const [carouselSlide, setCarouselSlide] = useState(0)
  const [trendsData, setTrendsData] = useState<any>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<CalorieSummary | null>(null)
  const [logs, setLogs] = useState<CalorieLog[]>([])
  const [heatmapData, setHeatmapData] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [quickAddForm, setQuickAddForm] = useState<CalorieLogForm>({
    foodName: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    mealType: 'breakfast',
    quantity: 1
  })
  const [isQuickAddActive, setIsQuickAddActive] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [trendsPeriod, setTrendsPeriod] = useState<'week' | 'month' | 'quarter'>('week')
  
  const proteinGoal = useProteinGoal()
  const carbsGoal = useCarbsGoal()
  const fatGoal = useFatGoal()

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null
  }

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
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
        setCarouselSlide((prev) => (prev + 1) % 4)
      } else {
        // swipe right -> previous
        setCarouselSlide((prev) => (prev - 1 + 2) % 4)
      }
    }

    touchStartXRef.current = null
    touchEndXRef.current = null
  }

  const fetchTrendsData = useCallback(async (period: 'week' | 'month' | 'quarter' = 'week') => {
    try {
      const response = await fetch(`/api/calories/trends?period=${period}`)
      if (response.ok) {
        const data = await response.json()
        setTrendsData(data.data)
      }
    } catch (error) {
      console.error('Error fetching trends data:', error)
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const fetchData = useCallback(async () => {
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
  }, [selectedDate])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status, fetchData])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTrendsData(trendsPeriod)
    }
  }, [status, trendsPeriod, fetchTrendsData])

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
    setErrorMessage(null)
    try {
      const response = await fetch('/api/calories/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        await fetchData()
        return true
      }

      const json = await response.json()
      setErrorMessage(json?.error || 'Failed to save entry')
      return false
    } catch (error) {
      console.error('Error adding calorie:', error)
      setErrorMessage('Network error, please retry.')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickAdd = useCallback(async () => {
    if (!quickAddForm.foodName.trim()) {
      setErrorMessage('Enter a food name.')
      return
    }

    if (!quickAddForm.calories || quickAddForm.calories <= 0) {
      setErrorMessage('Calories must be greater than zero.')
      return
    }

    const success = await addCalorie(quickAddForm)
    if (success) {
      setQuickAddForm({
        foodName: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        mealType: 'breakfast',
        quantity: 1
      })
      setErrorMessage(null)
      setIsQuickAddActive(false)
    }
  }, [quickAddForm, addCalorie])


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
            <p className="text-zinc-400 text-sm">Track your daily calories and macros</p>
          </div>

          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button className="text-xs text-zinc-300 hover:text-white transition-all duration-200">
                {selectedDate ? format(new Date(selectedDate), "MMM do, yyyy") : "Today"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-zinc-800 border-zinc-700" align="end">
              <Calendar
                mode="single"
                required
                selected={dayjs(selectedDate).toDate()}
                onSelect={(date: Date | null) => {
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
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${carouselSlide * 100}%)` }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Slide 1: Calorie Progress */}
              <div className="w-full flex-shrink-0">
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
                      <div className="space-y-2 pt-2 text-left">
                        <p className="text-sm font-semibold text-white">
                          {summary?.totalCalories || 0} / {summary?.goal || 2000} kcal
                        </p>
                        <p className="text-sm text-zinc-400">
                          {Math.max((summary?.goal || 2000) - (summary?.totalCalories || 0), 0)} kcal remaining
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 2: Macronutrients */}
              <div className="w-full flex-shrink-0">
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

              {/* Slide 3: Vitamins */}
              <div className="w-full flex-shrink-0">
                <div className="p-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-zinc-300">Vitamins</h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-zinc-300">A</span>
                            <span className="text-white font-mono">{summary?.totalVitamins?.vitaminA || 0} IU</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-300">D</span>
                            <span className="text-white font-mono">{summary?.totalVitamins?.vitaminD || 0} IU</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-300">E</span>
                            <span className="text-white font-mono">{summary?.totalVitamins?.vitaminE || 0} IU</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-300">K</span>
                            <span className="text-white font-mono">{summary?.totalVitamins?.vitaminK || 0} mcg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-300">C</span>
                            <span className="text-white font-mono">{summary?.totalVitamins?.vitaminC || 0} mg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-300">B1</span>
                            <span className="text-white font-mono">{summary?.totalVitamins?.thiamin || 0} mg</span>
                          </div>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-zinc-300">B2</span>
                            <span className="text-white font-mono">{summary?.totalVitamins?.riboflavin || 0} mg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-300">B3</span>
                            <span className="text-white font-mono">{summary?.totalVitamins?.niacin || 0} mg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-300">B6</span>
                            <span className="text-white font-mono">{summary?.totalVitamins?.vitaminB6 || 0} mg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-300">B9</span>
                            <span className="text-white font-mono">{summary?.totalVitamins?.folate || 0} mcg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-300">B12</span>
                            <span className="text-white font-mono">{summary?.totalVitamins?.vitaminB12 || 0} mcg</span>
                          </div>
                        </div>
                      </div>
                    </div>
                </div>
              </div>

              {/* Slide 4: Minerals */}
              <div className="w-full flex-shrink-0">
                <div className="p-4">
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-zinc-300">Minerals</h3>

                    <div className="grid grid-cols-2 gap-6">
                      {/* Major Minerals */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-zinc-400">Major Minerals</h4>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-zinc-300">Calcium</span>
                            <span className="text-white font-mono">{summary?.totalMinerals?.calcium || 0} mg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-300">Phosphorus</span>
                            <span className="text-white font-mono">{summary?.totalMinerals?.phosphorus || 0} mg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-300">Potassium</span>
                            <span className="text-white font-mono">{summary?.totalMinerals?.potassium || 0} mg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-300">Sodium</span>
                            <span className="text-white font-mono">{summary?.totalMinerals?.sodium || 0} mg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-300">Magnesium</span>
                            <span className="text-white font-mono">{summary?.totalMinerals?.magnesium || 0} mg</span>
                          </div>
                        </div>
                      </div>

                      {/* Trace Minerals */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-zinc-400">Trace Minerals</h4>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-zinc-300">Iron</span>
                            <span className="text-white font-mono">{summary?.totalMinerals?.iron || 0} mg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-300">Zinc</span>
                            <span className="text-white font-mono">{summary?.totalMinerals?.zinc || 0} mg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-300">Copper</span>
                            <span className="text-white font-mono">{summary?.totalMinerals?.copper || 0} mcg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-300">Manganese</span>
                            <span className="text-white font-mono">{summary?.totalMinerals?.manganese || 0} mg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-300">Selenium</span>
                            <span className="text-white font-mono">{summary?.totalMinerals?.selenium || 0} mcg</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-center px-6 py-4">
              <button
                onClick={() => setCarouselSlide((prev) => (prev - 1 + 4) % 4)}
                className="hidden md:block p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
                aria-label="Previous slide"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Slide Indicators */}
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((index) => (
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
                onClick={() => setCarouselSlide((prev) => (prev + 1) % 4)}
                className="hidden md:block p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
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
