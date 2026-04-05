'use client'

import { useState, useEffect, useRef, useCallback, TouchEvent } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import { format } from 'date-fns'
import { HorizontalCalendar } from './components/HorizontalCalendar'
import { Carousel } from './components/Carousel'
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
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [trendsPeriod, setTrendsPeriod] = useState<'week' | 'month' | 'quarter'>('week')

  const profile = useProfile()
  const proteinGoal = useProteinGoal()
  const carbsGoal = useCarbsGoal()
  const fatGoal = useFatGoal()

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
        <div className="flex items-center justify-center h-[calc(100vh-50px)]">
          <Loader />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-4">
        <HorizontalCalendar 
          selectedDate={selectedDate}
          onDateSelect={(date) => setSelectedDate(date)}
        />
        <Carousel
          summary={summary}
          microRDA={microRDA}
          microPercentages={microPercentages}
          proteinGoal={proteinGoal}
          carbsGoal={carbsGoal}
          fatGoal={fatGoal}
        />
      </div>

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

    </MainLayout >
  )
}
