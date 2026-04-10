'use client'

import { useState, useEffect, useRef, useCallback, TouchEvent } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import { format } from 'date-fns'
import { HorizontalCalendar } from './components/HorizontalCalendar'
import { Carousel } from './components/Carousel'
import CalorieHeatmap from './components/CalorieHeatmap'
import AIFoodAnalysis from './components/AIFoodAnalysis'
import { useProteinGoal, useCarbsGoal, useFatGoal, useProfile } from '@/store/useProfileStore'
import MainLayout from '../layout/MainLayout'
import { FoodLog } from './components/FoodLog'
import { MealTemplatesMinimal } from './components/MealTemplates'
import { CalorieTrendsChart } from './components/CalorieTrendsChart'
import { calculateMicroRDA, calculateRDAPercentage } from '@/lib/microRDA'
import Loader from '@/components/Loader'
import { IMealLog } from '@/lib/models/MealLog'

// Define CalorieLogForm interface locally since we removed ManualEntryForm
export interface CalorieLogForm {
  inputText: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  foods: FoodItem[]
  totals: {
    calories: number
    macros: {
      protein: number
      carbs: number
      fat: number
      fiber: number
    }
    micros: {
      vitamins: {
        vitaminA: number
        vitaminC: number
        vitaminD: number
        vitaminB6: number
        vitaminB7: number
        vitaminB12: number
      }
      minerals: {
        iron: number
        magnesium: number
        zinc: number
        calcium: number
        potassium: number
        sodium: number
      }
      other: {
        cholesterol: number
        sugar: number
      }
    }
  }
  method: 'ai' | 'manual'
}

export interface FoodItem {
  name: string
  quantity: number
  unit: string
  calories: number
  macros: {
    protein: number
    carbs: number
    fat: number
    fiber: number
  }
  micros: {
    vitamins: {
      vitaminA: number
      vitaminC: number
      vitaminD: number
      vitaminB6: number
      vitaminB7: number
      vitaminB12: number
    }
    minerals: {
      iron: number
      magnesium: number
      zinc: number
      calcium: number
      potassium: number
      sodium: number
    }
    other: {
      cholesterol: number
      sugar: number
    }
  }
  mealType?: string
  confidence?: number
}

export interface CalorieLog {
  _id: string
  inputText: string
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
  const [logs, setLogs] = useState<IMealLog[]>([])
  const [heatmapData, setHeatmapData] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
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
          allLogsData.forEach((log: IMealLog) => {
            const dateKey = new Date(log.date).toISOString().split('T')[0]
            dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + log.totals.calories
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
      // Handle both old and new template structures
      let transformedFoods
      let calculatedTotals

      // Check for new nested structure OR old flat structure with totals
      const hasNewNestedStructure = template.totals && template.totals.macros
      const hasOldFlatStructure = template.totalProtein !== undefined || template.totalCarbs !== undefined || template.totalFat !== undefined
      
      if (hasNewNestedStructure || hasOldFlatStructure) {
        // Template has calculated totals - use them directly without recalculation
        transformedFoods = template.mealItems.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit || 'serving',
          calories: item.calories,
          macros: item.macros || { protein: 0, carbs: 0, fat: 0, fiber: 0 },
          micros: item.micros || { vitamins: {}, minerals: {}, other: { cholesterol: 0, sugar: 0 } }
        }))
        
        // Use existing totals from template
        if (hasNewNestedStructure) {
          calculatedTotals = template.totals
        } else {
          // Convert old flat structure to nested
          calculatedTotals = {
            calories: template.totalCalories || 0,
            macros: {
              protein: template.totalProtein || 0,
              carbs: template.totalCarbs || 0,
              fat: template.totalFat || 0,
              fiber: template.totalFiber || 0
            },
            micros: {
              vitamins: template.totalVitamins || {},
              minerals: template.totalMinerals || {},
              other: {
                cholesterol: template.totalCholesterol || 0,
                sugar: template.totalSugar || 0
              }
            }
          }
        }
      } else {
        // Old flat structure - transform to nested
        transformedFoods = template.mealItems.map((item: any) => {
          // Check if macros are zero and calculate fallback
          const hasZeroMacros = (!item.protein || item.protein === 0) && 
                                (!item.carbs || item.carbs === 0) && 
                                (!item.fat || item.fat === 0)
          
          let fallbackMacros = { protein: 0, carbs: 0, fat: 0, fiber: 0 }
          
          if (hasZeroMacros && item.calories > 0) {
            // Simple macro estimation based on food type
            const foodName = item.name.toLowerCase()
            
            if (foodName.includes('egg')) {
              // Eggs: ~6g protein, 0.5g carbs, 5g fat per 70 calories
              const proteinPerCal = 6 / 70
              const carbsPerCal = 0.5 / 70
              const fatPerCal = 5 / 70
              fallbackMacros = {
                protein: Math.round(item.calories * proteinPerCal),
                carbs: Math.round(item.calories * carbsPerCal),
                fat: Math.round(item.calories * fatPerCal),
                fiber: 0
              }
            } else if (foodName.includes('rice') || foodName.includes('bread') || foodName.includes('pasta')) {
              // Carbs-heavy foods: 10% protein, 80% carbs, 10% fat
              fallbackMacros = {
                protein: Math.round(item.calories * 0.10 / 4),
                carbs: Math.round(item.calories * 0.80 / 4),
                fat: Math.round(item.calories * 0.10 / 9),
                fiber: Math.round(item.calories * 0.05 / 4)
              }
            } else if (foodName.includes('chicken') || foodName.includes('meat') || foodName.includes('fish')) {
              // Protein-heavy foods: 70% protein, 20% fat, 10% carbs
              fallbackMacros = {
                protein: Math.round(item.calories * 0.70 / 4),
                carbs: Math.round(item.calories * 0.10 / 4),
                fat: Math.round(item.calories * 0.20 / 9),
                fiber: 0
              }
            } else {
              // Default balanced estimation: 30% protein, 50% carbs, 20% fat
              fallbackMacros = {
                protein: Math.round(item.calories * 0.30 / 4),
                carbs: Math.round(item.calories * 0.50 / 4),
                fat: Math.round(item.calories * 0.20 / 9),
                fiber: Math.round(item.calories * 0.05 / 4)
              }
            }
          }
          
          return {
            name: item.name,
            quantity: item.quantity,
            unit: item.unit || 'serving',
            calories: item.calories,
            macros: {
              protein: item.protein || fallbackMacros.protein,
              carbs: item.carbs || fallbackMacros.carbs,
              fat: item.fat || fallbackMacros.fat,
              fiber: item.fiber || fallbackMacros.fiber
            },
            micros: {
              vitamins: item.vitamins || {},
              minerals: item.minerals || {},
              other: {
                cholesterol: item.cholesterol || 0,
                sugar: item.sugar || 0
              }
            }
          }
        })

        // Calculate totals from individual food items
        calculatedTotals = transformedFoods.reduce((acc: any, food: any) => {
          acc.calories += food.calories
          acc.macros.protein += food.macros.protein
          acc.macros.carbs += food.macros.carbs
          acc.macros.fat += food.macros.fat
          acc.macros.fiber += food.macros.fiber
          acc.micros.other.cholesterol += food.micros.other.cholesterol
          acc.micros.other.sugar += food.micros.other.sugar
          
          // Sum up vitamins and minerals
          Object.keys(food.micros.vitamins).forEach(vitamin => {
            acc.micros.vitamins[vitamin] = (acc.micros.vitamins[vitamin] || 0) + (food.micros.vitamins[vitamin] || 0)
          })
          
          Object.keys(food.micros.minerals).forEach(mineral => {
            acc.micros.minerals[mineral] = (acc.micros.minerals[mineral] || 0) + (food.micros.minerals[mineral] || 0)
          })
          
          return acc
        }, {
          calories: template.totalCalories || 0,
          macros: { 
            protein: template.totalProtein || 0, 
            carbs: template.totalCarbs || 0, 
            fat: template.totalFat || 0, 
            fiber: template.totalFiber || 0 
          },
          micros: { 
            vitamins: template.totalVitamins || {}, 
            minerals: template.totalMinerals || {}, 
            other: { 
              cholesterol: template.totalCholesterol || 0, 
              sugar: template.totalSugar || 0 
            } 
          }
        })
      }

      const requestData = {
          inputText: template.name,
          mealType: template.mealType,
          foods: transformedFoods,
          totals: calculatedTotals,
          method: 'manual'
        }

      const response = await fetch('/api/calories/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        // Update template usage count
        await fetch(`/api/calories/templates/${template._id}/use`, {
          method: 'POST'
        })

        fetchData() // Refresh data
        fetchTrendsData(trendsPeriod) // Refresh trends data
      }
    } catch (error) {
      console.error('Error adding template:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  
  

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
      <div>
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

          <AIFoodAnalysis onDataAdded={() => { 
            fetchData(); 
            fetchTrendsData(trendsPeriod); 
          }} />

          <MealTemplatesMinimal
            onTemplateSelect={handleTemplateSelect}
            onDataUpdated={fetchData}
          />

          <FoodLog logs={logs} selectedDate={selectedDate} onDataUpdated={() => { fetchData(); fetchTrendsData(trendsPeriod); }} />
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
