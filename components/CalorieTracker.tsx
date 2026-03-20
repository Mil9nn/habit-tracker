'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Utensils, Apple, Coffee, Sun } from 'lucide-react'
import CalorieGauge from './WaterGauge'
import CalorieHeatmap from './WaterHeatmap'
import { Input } from "@/components/ui/input"
import { RingProgress } from '@/components/ui/ring-progress'
import { Button } from "@/components/ui/button"
import { useProteinGoal, useCarbsGoal, useFatGoal } from '@/store/useProfileStore'
import { ManualEntryForm, CalorieLogForm } from './ManualEntryForm'
import { AIFoodAnalysis } from './AIFoodAnalysis'
import { FoodLog } from './FoodLog'
import Header from './Header'

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

// Quick food items with calorie and macro values
const quickFoods = [
  { name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, icon: Apple },
  { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, icon: Coffee },
  { name: 'Egg', calories: 78, protein: 6, carbs: 0.6, fat: 5.3, icon: Sun },
  { name: 'Bread Slice', calories: 80, protein: 3, carbs: 15, fat: 1, icon: Coffee },
  { name: 'Rice Bowl', calories: 200, protein: 2.7, carbs: 28, fat: 0.3, icon: Utensils },
]

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
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)



  const remainingCalories = summary ? Math.max(0, summary.goal - summary.totalCalories) : 2000
  const progressPercentage = summary ? Math.min((summary.totalCalories / summary.goal) * 100, 100) : 0

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
    }
  }, [selectedDate])

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
        setShowManualEntry(false)
      }
    } catch (error) {
      console.error('Error adding calorie:', error)
    } finally {
      setIsSubmitting(false)
    }
  }


  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="animate-pulse">
          <Utensils className="h-8 w-8 text-yellow-500" />
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-50">
      <Header />

      <main className="space-y-4 p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
          <h3 className="text-lg font-semibold mb-6 text-center">Today's Calorie Progress</h3>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4">
          <CalorieGauge
            current={summary?.totalCalories || 0}
            target={summary?.goal || 2000}
            size={240}
            strokeWidth={14}
          />

          {/* Macro Progress Rings */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            <RingProgress
              key={`protein-${summary?.totalProtein || 0}`}
              value={summary?.totalProtein || 0}
              max={proteinGoal || 150}
              title="Protein"
              size={80}
              strokeWidth={6}
              color="#06d6a0"
            />

            <RingProgress
              key={`carbs-${summary?.totalCarbs || 0}`}
              value={summary?.totalCarbs || 0}
              max={carbsGoal || 300}
              title="Carbs"
              size={80}
              strokeWidth={6}
              color="#118ab2"
            />

            <RingProgress
              key={`fats-${summary?.totalFat || 0}`}
              value={summary?.totalFat || 0}
              max={fatGoal || 100}
              title="Fats"
              size={80}
              strokeWidth={6}
              color="#ef476f"
            />
          </div>
        </div>

        <AIFoodAnalysis onDataAdded={fetchData} />

        <ManualEntryForm
          showManualEntry={showManualEntry}
          setShowManualEntry={setShowManualEntry}
          isSubmitting={isSubmitting}
          onSubmit={addCalorie}
        />

        {/* Daily Average */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 shadow-sm hover:shadow-md transition">
          <span className="text-xs font-medium text-gray-500">
            Daily Average
          </span>

          <span className="text-sm font-bold text-gray-900">
            {summary ? `${Math.round(summary.averageDaily)} kcal` : "0 kcal"}
          </span>
        </div>

        <CalorieHeatmap data={heatmapData} goal={summary?.goal || 2000} />

        <FoodLog logs={logs} selectedDate={selectedDate} />
      </main>
    </div>
  )
}
