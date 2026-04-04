'use client'

import { useState, useEffect, useRef, useCallback, TouchEvent } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import { format } from 'date-fns'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Drumstick, Wheat, Droplet } from 'lucide-react'
import CalorieGauge from './components/CalorieGauge'
import MacroRing from './components/MacroRing'
import CalorieHeatmap from './components/CalorieHeatmap'
import { AIFoodAnalysis } from './components/AIFoodAnalysis'
import { useProteinGoal, useCarbsGoal, useFatGoal, useProfile } from '@/store/useProfileStore'
import MainLayout from '../layout/MainLayout'
import { FoodLog } from './components/FoodLog'
import { MealTemplatesMinimal } from './components/MealTemplates'
import { CalorieTrendsChart } from './components/CalorieTrendsChart'
import { calculateMicroRDA, calculateRDAPercentage } from '@/lib/microRDA'
import Loader from '@/components/Loader'

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
  name: string
  quantity: number
  calories: number
  protein?: number
  carbs?: number
  fat?: number
  fiber?: number
  vitamins?: {
    vitaminA?: number
    vitaminC?: number
    vitaminD?: number
    vitaminB6?: number
    vitaminB7?: number
    vitaminB12?: number
  }
  minerals?: {
    iron?: number
    magnesium?: number
    zinc?: number
    calcium?: number
    potassium?: number
    sodium?: number
  }
  cholesterol?: number
  sugar?: number
}

export interface CalorieLog {
  _id: string
  foodName: string
  calories: number
  protein?: number
  carbs?: number
  fat?: number
  fiber?: number
  cholesterol?: number
  sugar?: number
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  quantity?: number
  timestamp: string
  userId: string
  createdAt: string
  updatedAt: string
  // New fields for meal support
  isMeal: boolean
  mealItems?: FoodItem[]
  // Micro-nutrients
  vitamins?: {
    vitaminA?: number
    vitaminC?: number
    vitaminD?: number
    vitaminE?: number
    vitaminK?: number
    thiamin?: number
    riboflavin?: number
    niacin?: number
    vitaminB6?: number
    folate?: number
    vitaminB12?: number
  }
  minerals?: {
    calcium?: number
    iron?: number
    magnesium?: number
    phosphorus?: number
    potassium?: number
    sodium?: number
    zinc?: number
    copper?: number
    manganese?: number
    selenium?: number
  }
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
  totalFiber?: number
  totalCholesterol?: number
  totalSugar?: number
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
  const profile = useProfile()

  // Calculate RDA for micro-nutrients
  const microRDA = profile ? calculateMicroRDA({
    age: profile.age,
    gender: profile.gender,
    weight: profile.weight,
    height: profile.height,
    activityLevel: profile.activityLevel
  }) : null

  // Calculate micro-nutrient percentages
  const microPercentages = microRDA && summary ? calculateRDAPercentage({
    vitaminA: summary.totalVitamins?.vitaminA || 0,
    vitaminB6: summary.totalVitamins?.vitaminB6 || 0,
    vitaminB12: summary.totalVitamins?.vitaminB12 || 0,
    vitaminC: summary.totalVitamins?.vitaminC || 0,
    vitaminD: summary.totalVitamins?.vitaminD || 0,
    iron: summary.totalMinerals?.iron || 0,
    magnesium: summary.totalMinerals?.magnesium || 0,
    zinc: summary.totalMinerals?.zinc || 0,
    calcium: summary.totalMinerals?.calcium || 0,
    potassium: summary.totalMinerals?.potassium || 0,
    sodium: summary.totalMinerals?.sodium || 0
  }, microRDA) : null

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
        setCarouselSlide((prev) => (prev + 1) % 2)
      } else {
        // swipe right -> previous
        setCarouselSlide((prev) => (prev - 1 + 2) % 2)
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

  // useEffect(() => {
  //   if (status === 'unauthenticated') {
  //     router.push('/auth/signin')
  //   }
  // }, [status, router])

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
          <div className="flex items-center justify-center h-[calc(100vh-50px)] bg-black">
            <Loader />
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
            <h1 className="text-2xl font-semibold text-black tracking-tight">Nutrition</h1>
            <p className="text-zinc-500 text-sm">Track your daily calories and macros</p>
          </div>

          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button className="text-xs text-zinc-400 hover:text-black transition-all duration-200">
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
                className="text-black"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Daily Summary - Carousel */}
        <section className="space-y-6 px-4 mb-10">
          <div className="relative shadow-sm rounded-2xl border border-zinc-200 overflow-hidden">
            {/* Carousel Container */}
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${carouselSlide * 100}%)` }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Slide 1: Daily Summary - Calories & Macros */}
              <div className="w-full flex-shrink-0">
                <div className="p-4">
                  <div className="space-y-4">
                    {/* Calories Section */}
                    <div className="text-center space-y-4">
                      <h3 className="text-lg font-medium text-zinc-500">Daily Calories</h3>
                      <div className="flex items-center justify-center gap-4">
                        <CalorieGauge
                          current={summary?.totalCalories || 0}
                          target={summary?.goal || 2000}
                          size={140}
                          strokeWidth={8}
                        />
                        <div className="space-y-2 pt-2 text-left">
                          <p className="text-sm font-semibold text-black">
                            <span className="text-blue-600">{summary?.totalCalories || 0}</span> / <span className="text-green-600">{summary?.goal || 2000}</span> kcal
                          </p>
                          <p className="text-sm text-zinc-400">
                            {Math.max((summary?.goal || 2000) - (summary?.totalCalories || 0), 0)} kcal remaining
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Macros Section */}
                    <div className="space-y-4">
                      <div className="flex justify-center items-center gap-6">
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

              {/* Slide 2: Micro-nutrients with Progress */}
              <div className="w-full flex-shrink-0">
                <div className="p-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-zinc-600">Micro-nutrients</h3>

                    <div className="space-y-6">
                      {/* Vitamins */}
                      <div>
                        <h4 className="text-sm font-medium text-zinc-500 pb-2">Vitamins</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {/* Vitamin A */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-zinc-600">A</span>
                              <span className="text-xs text-black font-mono">
                                {summary?.totalVitamins?.vitaminA || 0} / {microRDA?.vitaminA || 0} mcg
                              </span>
                            </div>
                            <div className="w-full bg-zinc-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${(microPercentages?.vitaminA || 0) >= 100 ? 'bg-green-500' :
                                    (microPercentages?.vitaminA || 0) >= 80 ? 'bg-blue-500' :
                                      (microPercentages?.vitaminA || 0) >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                style={{ width: `${Math.min((microPercentages?.vitaminA || 0), 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Vitamin C */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-zinc-600">C</span>
                              <span className="text-xs text-black font-mono">
                                {summary?.totalVitamins?.vitaminC || 0} / {microRDA?.vitaminC || 0} mg
                              </span>
                            </div>
                            <div className="w-full bg-zinc-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${(microPercentages?.vitaminC || 0) >= 100 ? 'bg-green-500' :
                                    (microPercentages?.vitaminC || 0) >= 80 ? 'bg-blue-500' :
                                      (microPercentages?.vitaminC || 0) >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                style={{ width: `${Math.min((microPercentages?.vitaminC || 0), 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Vitamin D */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-zinc-600">D</span>
                              <span className="text-xs text-black font-mono">
                                {summary?.totalVitamins?.vitaminD || 0} / {microRDA?.vitaminD || 0} mcg
                              </span>
                            </div>
                            <div className="w-full bg-zinc-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${(microPercentages?.vitaminD || 0) >= 100 ? 'bg-green-500' :
                                    (microPercentages?.vitaminD || 0) >= 80 ? 'bg-blue-500' :
                                      (microPercentages?.vitaminD || 0) >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                style={{ width: `${Math.min((microPercentages?.vitaminD || 0), 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Vitamin B6 */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-zinc-600">B6</span>
                              <span className="text-xs text-black font-mono">
                                {summary?.totalVitamins?.vitaminB6 || 0} / {microRDA?.vitaminB6 || 0} mg
                              </span>
                            </div>
                            <div className="w-full bg-zinc-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${(microPercentages?.vitaminB6 || 0) >= 100 ? 'bg-green-500' :
                                    (microPercentages?.vitaminB6 || 0) >= 80 ? 'bg-blue-500' :
                                      (microPercentages?.vitaminB6 || 0) >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                style={{ width: `${Math.min((microPercentages?.vitaminB6 || 0), 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Vitamin B12 */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-zinc-600">B12</span>
                              <span className="text-xs text-black font-mono">
                                {summary?.totalVitamins?.vitaminB12 || 0} / {microRDA?.vitaminB12 || 0} mcg
                              </span>
                            </div>
                            <div className="w-full bg-zinc-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${(microPercentages?.vitaminB12 || 0) >= 100 ? 'bg-green-500' :
                                    (microPercentages?.vitaminB12 || 0) >= 80 ? 'bg-blue-500' :
                                      (microPercentages?.vitaminB12 || 0) >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                style={{ width: `${Math.min((microPercentages?.vitaminB12 || 0), 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Minerals */}
                      <div>
                        <h4 className="text-sm font-medium text-zinc-500 pb-2">Minerals</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {/* Iron */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-zinc-600">Iron</span>
                              <span className="text-xs text-black font-mono">
                                {summary?.totalMinerals?.iron || 0} / {microRDA?.iron || 0} mg
                              </span>
                            </div>
                            <div className="w-full bg-zinc-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${(microPercentages?.iron || 0) >= 100 ? 'bg-green-500' :
                                    (microPercentages?.iron || 0) >= 80 ? 'bg-blue-500' :
                                      (microPercentages?.iron || 0) >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                style={{ width: `${Math.min((microPercentages?.iron || 0), 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Magnesium */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-zinc-600">Magnesium</span>
                              <span className="text-xs text-black font-mono">
                                {summary?.totalMinerals?.magnesium || 0} / {microRDA?.magnesium || 0} mg
                              </span>
                            </div>
                            <div className="w-full bg-zinc-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${(microPercentages?.magnesium || 0) >= 100 ? 'bg-green-500' :
                                    (microPercentages?.magnesium || 0) >= 80 ? 'bg-blue-500' :
                                      (microPercentages?.magnesium || 0) >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                style={{ width: `${Math.min((microPercentages?.magnesium || 0), 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Zinc */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-zinc-600">Zinc</span>
                              <span className="text-xs text-black font-mono">
                                {summary?.totalMinerals?.zinc || 0} / {microRDA?.zinc || 0} mg
                              </span>
                            </div>
                            <div className="w-full bg-zinc-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${(microPercentages?.zinc || 0) >= 100 ? 'bg-green-500' :
                                    (microPercentages?.zinc || 0) >= 80 ? 'bg-blue-500' :
                                      (microPercentages?.zinc || 0) >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                style={{ width: `${Math.min((microPercentages?.zinc || 0), 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Calcium */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-zinc-600">Calcium</span>
                              <span className="text-xs text-black font-mono">
                                {summary?.totalMinerals?.calcium || 0} / {microRDA?.calcium || 0} mg
                              </span>
                            </div>
                            <div className="w-full bg-zinc-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${(microPercentages?.calcium || 0) >= 100 ? 'bg-green-500' :
                                    (microPercentages?.calcium || 0) >= 80 ? 'bg-blue-500' :
                                      (microPercentages?.calcium || 0) >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                style={{ width: `${Math.min((microPercentages?.calcium || 0), 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Potassium */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-zinc-600">Potassium</span>
                              <span className="text-xs text-black font-mono">
                                {summary?.totalMinerals?.potassium || 0} / {microRDA?.potassium || 0} mg
                              </span>
                            </div>
                            <div className="w-full bg-zinc-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${(microPercentages?.potassium || 0) >= 100 ? 'bg-green-500' :
                                    (microPercentages?.potassium || 0) >= 80 ? 'bg-blue-500' :
                                      (microPercentages?.potassium || 0) >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                style={{ width: `${Math.min((microPercentages?.potassium || 0), 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Sodium */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-zinc-600">Sodium</span>
                              <span className="text-xs text-black font-mono">
                                {summary?.totalMinerals?.sodium || 0} / {microRDA?.sodium || 0} mg
                              </span>
                            </div>
                            <div className="w-full bg-zinc-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${(microPercentages?.sodium || 0) >= 100 ? 'bg-green-500' :
                                    (microPercentages?.sodium || 0) >= 80 ? 'bg-blue-500' :
                                      (microPercentages?.sodium || 0) >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                style={{ width: `${Math.min((microPercentages?.sodium || 0), 100)}%` }}
                              />
                            </div>
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
                onClick={() => setCarouselSlide((prev) => (prev - 1 + 2) % 2)}
                className="hidden md:block p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-black"
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
                      ? 'bg-violet-500 w-4'
                      : 'bg-zinc-500 w-2 hover:bg-zinc-600'
                      }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCarouselSlide((prev) => (prev + 1) % 2)}
                className="hidden md:block p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-600 hover:text-black"
                aria-label="Next slide"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">

          {/* Left Column */}
          <div className="space-y-10">

            <AIFoodAnalysis onDataAdded={fetchData} />

            <MealTemplatesMinimal
              onTemplateSelect={handleTemplateSelect}
              onDataUpdated={fetchData}
            />

            <FoodLog logs={logs} selectedDate={selectedDate} onDataUpdated={fetchData} />
          </div>

          {/* Right Column */}
          <div className="space-y-10">


            <CalorieTrendsChart
              data={trendsData}
              period={trendsPeriod}
              onPeriodChange={setTrendsPeriod}
            />

            <CalorieHeatmap data={heatmapData} goal={summary?.goal || 2000} />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
