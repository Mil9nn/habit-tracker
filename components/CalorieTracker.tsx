'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Droplets, Target, TrendingUp, LogIn, LogOut, ChevronDown, User, Calendar, Utensils, Plus, Flame, Apple, Coffee, Sun } from 'lucide-react'
import CalorieGauge from './WaterGauge'
import CalorieHeatmap from './WaterHeatmap'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from "@/components/ui/button"
import { calculateDailyCalorieNeeds, getCalorieGoalInfo } from '@/lib/calorieCalculator'

// Zod schemas for calorie tracking
const calorieLogSchema = z.object({
  foodName: z.string().min(1, 'Food name is required'),
  calories: z.number().min(1, 'Calories must be at least 1').max(5000, 'Calories must be less than 5000'),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  quantity: z.number().min(0.1, 'Quantity must be positive').max(10, 'Quantity must be less than 10').optional()
})

type CalorieLogForm = z.infer<typeof calorieLogSchema>

interface CalorieLog {
  _id: string
  foodName: string
  calories: number
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  quantity?: number
  timestamp: string
  userId: string
  createdAt: string
  updatedAt: string
}

interface CalorieSummary {
  totalCalories: number
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

// Quick food items with calorie values
const quickFoods = [
  { name: 'Apple', calories: 95, icon: Apple },
  { name: 'Banana', calories: 105, icon: Coffee },
  { name: 'Egg', calories: 78, icon: Sun },
  { name: 'Bread Slice', calories: 80, icon: Coffee },
  { name: 'Rice Bowl', calories: 200, icon: Utensils },
]

export default function CalorieTracker() {
  const { data: session, status } = useSession()
  const [summary, setSummary] = useState<CalorieSummary | null>(null)
  const [logs, setLogs] = useState<CalorieLog[]>([])
  const [heatmapData, setHeatmapData] = useState<{ date: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiFoodDescription, setAiFoodDescription] = useState('')
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const [isAddingFoods, setIsAddingFoods] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<CalorieLogForm>({
    resolver: zodResolver(calorieLogSchema),
    defaultValues: {
      foodName: '',
      calories: 0,
      mealType: 'breakfast',
      quantity: 1
    }
  })

  const watchedFoodName = watch('foodName')
  const watchedCalories = watch('calories')
  const watchedMealType = watch('mealType')

  const quickCalories = [50, 100, 200, 300, 500, 750]

  const addQuickFood = (food: typeof quickFoods[0]) => {
    setValue('foodName', food.name)
    setValue('calories', food.calories)
    setValue('mealType', 'breakfast')
  }

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen && !(event.target as Element).closest('.dropdown-container')) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isDropdownOpen])

  const fetchData = async () => {
    try {
      const targetDate = selectedDate
      console.log('Fetching logs for date:', targetDate)
      console.log('Selected date state:', selectedDate)

      // Create end date that includes the full day
      const endDate = new Date(targetDate)
      endDate.setHours(23, 59, 59, 999)

      const [summaryRes, logsRes] = await Promise.all([
        fetch(`/api/calories/summary?period=daily&date=${targetDate}`),
        fetch(`/api/calories/log?startDate=${targetDate}&endDate=${endDate.toISOString()}`)
      ])

      console.log('API response status:', { summary: summaryRes.status, logs: logsRes.status })

      if (summaryRes.ok && logsRes.ok) {
        const [summaryData, logsData] = await Promise.all([
          summaryRes.json(),
          logsRes.json()
        ])
        console.log('Logs data received:', logsData)
        setSummary(summaryData)
        setLogs(logsData)

        // Fetch all logs for heatmap
        const allLogsRes = await fetch('/api/calories/log')
        if (allLogsRes.ok) {
          const allLogsData = await allLogsRes.json()
          console.log('All logs for heatmap:', allLogsData)

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
          console.log('Daily totals:', dailyTotals)
          console.log('Heatmap data being sent:', heatmap)
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
    try {
      const response = await fetch('/api/calories/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        fetchData()
        setValue('foodName', '')
        setValue('calories', 0)
        setValue('mealType', 'breakfast')
        setValue('quantity', 1)
      }
    } catch (error) {
      console.error('Error adding calorie:', error)
    }
  }

  const analyzeFoodWithAI = async () => {
    if (!aiFoodDescription.trim()) return

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/ai/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodDescription: aiFoodDescription,
          mealType: watchedMealType
        })
      })

      if (response.ok) {
        const analysis = await response.json()
        setAiAnalysis(analysis)
      }
    } catch (error) {
      console.error('Error analyzing food:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const addAnalyzedFoods = async () => {
    if (!aiAnalysis?.foods) return

    setIsAddingFoods(true)
    console.log('Adding analyzed foods:', aiAnalysis.foods)

    try {
      // Add all foods in parallel for better performance
      const addPromises = aiAnalysis.foods.map((food: any) => {
        console.log('Adding food:', food)
        return fetch('/api/calories/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            foodName: food.name,
            calories: food.calories,
            mealType: food.mealType,
            quantity: food.quantity
          })
        })
      })

      const results = await Promise.all(addPromises)
      console.log('Add results:', results)

      // Check if all additions were successful
      const allSuccessful = results.every(response => response.ok)
      if (allSuccessful) {
        console.log('All foods added successfully')
        // Clear AI analysis and refresh data
        setAiAnalysis(null)
        setAiFoodDescription('')
        fetchData() // Refresh the data once after all additions
      } else {
        console.error('Some foods failed to add')
      }
    } catch (error) {
      console.error('Error adding analyzed foods:', error)
    } finally {
      setIsAddingFoods(false)
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="rounded-2xl shadow-lg p-8 max-w-sm mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Utensils className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Calorie Tracker</h1>
            <p className="text-gray-600 mb-6">Track your daily nutrition with style</p>
            <Button
              onClick={() => signIn('google')}
              className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-medium py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              size={"lg"}
            >
              <img src="/google.svg" alt="Google" className="h-5 w-5" />
              Sign in with Google
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <header className="bg-yellow-400 backdrop-blur-md shadow-sm border-b border-yellow-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center">
                <Utensils className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Calorie Tracker</h1>
            </div>

            {/* Profile Dropdown */}
            <div className="relative dropdown-container">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-center rounded-full p-2 hover:bg-yellow-50 transition-all duration-200"
              >
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-yellow-200"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white text-sm font-semibold">
                    {session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
                  </div>
                )}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-72 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
                  <div className="p-4 border-b border-yellow-100 bg-gradient-to-r from-yellow-50 to-amber-50">
                    <p className="font-medium text-gray-900">{session?.user?.name}</p>
                    <p className="text-sm text-gray-600">{session?.user?.email}</p>
                  </div>
                  <div className="p-2">
                    <a
                      href="/profile"
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-yellow-50 rounded-xl transition-colors"
                    >
                      <User className="h-4 w-4 text-yellow-600" />
                      Profile Settings
                    </a>
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-yellow-50 rounded-xl transition-colors"
                    >
                      <LogOut className="h-4 w-4 text-yellow-600" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto space-y-6">

        <div className="shadow-sm p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
            <h3 className="text-lg font-semibold mb-6 text-center">Today's Calorie Progress</h3>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-center mb-4 space-y-4">
            <CalorieGauge
              current={summary?.totalCalories || 0}
              target={summary?.goal || 2000}
              size={240}
              strokeWidth={14}
            />

            {/* AI Food Analysis */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">AI Food Analysis</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <textarea
                    value={aiFoodDescription}
                    onChange={(e) => setAiFoodDescription(e.target.value)}
                    placeholder="Describe your meal (e.g., '2 bananas, 1 protein shake, 3 chapatis with phoolgobi')"
                    className="flex-1 rounded-xl border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 p-3 resize-none h-24"
                    rows={3}
                  />
                  <Button
                    onClick={analyzeFoodWithAI}
                    disabled={isAnalyzing || !aiFoodDescription.trim()}
                    className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-medium px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                  </Button>
                </div>

                {aiAnalysis && (
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-gray-900">Analysis Results</h4>
                      <span className="text-sm text-gray-600">
                        {aiAnalysis.method === 'ai' ? '🤖 AI Analysis' : '📊 Local Calculation'}
                      </span>
                    </div>

                    <div className="space-y-2 mb-3">
                      {aiAnalysis.foods.map((food: any, index: number) => (
                        <div key={index} className="flex justify-between items-center bg-white rounded-lg p-2">
                          <div>
                            <span className="font-medium text-gray-900">{food.quantity}x {food.name}</span>
                            <span className="text-sm text-gray-600 ml-2">({food.unit})</span>
                          </div>
                          <span className="font-semibold text-yellow-600">{food.calories} kcal</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-yellow-200">
                      <span className="font-bold text-gray-900">Total Calories</span>
                      <span className="text-xl font-bold text-yellow-600">{aiAnalysis.totalCalories} kcal</span>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button
                        onClick={addAnalyzedFoods}
                        disabled={isAddingFoods}
                        className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        {isAddingFoods ? 'Adding Foods...' : 'Add All Foods'}
                      </Button>
                      <Button
                        onClick={() => {
                          setAiAnalysis(null)
                          setAiFoodDescription('')
                        }}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Manual Entry Form */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Manual Entry</h3>
              <form onSubmit={handleSubmit(addCalorie)} className="space-y-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    {...register('foodName')}
                    placeholder="Food name"
                    className={errors.foodName ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {errors.foodName && (
                    <p className="text-sm text-red-500 mt-1">{errors.foodName.message}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    {...register('calories', { valueAsNumber: true })}
                    placeholder="Calories"
                    className={errors.calories ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  <select {...register('mealType')} className="border rounded px-2 py-1">
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
                {errors.calories && (
                  <p className="text-sm text-red-500 mt-1">{errors.calories.message}</p>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="relative overflow-hidden ring-2 ring-blue-500 rounded-full text-blue-500 bg-transparent group"
                >
                  {/* Water fill span */}
                  <span className="absolute inset-0 bg-blue-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></span>

                  <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                    {isSubmitting ? "Adding..." : "Add Food"}
                  </span>
                </Button>
              </form>
            </div>
          </div>

          <CalorieHeatmap data={heatmapData} goal={summary?.goal || 2000} />

          <div className="rounded-lg shadow-sm p-4 my-2">
            <h3 className="text-lg font-semibold mb-3">Daily Summary</h3>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-yellow-50 border border-yellow-100 shadow-sm">
                {/* Icon / indicator */}
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400"></div>

                {/* Label */}
                <span className="text-sm text-gray-600">
                  Today
                </span>

                {/* Value */}
                <span className="text-sm font-semibold text-gray-900">
                  {summary ? `${summary.totalCalories} kcal` : "0 kcal"}
                </span>
              </div>

              {/* Daily Average */}
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 shadow-sm hover:shadow-md transition">
                <span className="text-xs font-medium text-gray-500">
                  Daily Average
                </span>

                <span className="text-sm font-bold text-gray-900">
                  {summary ? `${Math.round(summary.averageDaily)} kcal` : "0 kcal"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedDate === new Date().toISOString().split('T')[0] ? "Today's Log" : `${new Date(selectedDate).toLocaleDateString()} Log`}
              </h3>
            </div>
            {logs.length > 0 ? (
              <div className="space-y-2">
                {logs.slice(0, 5).map((log) => (
                  <div key={log._id} className="flex justify-between items-center py-2 border-b">
                    <div className="flex-1">
                      <span className="text-gray-600 text-sm">{log.quantity}x </span>
                      <span className="text-gray-800 capitalize font-medium">{log.foodName}</span>
                      <span className="text-gray-400 text-xs ml-2">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className="font-medium text-sm text-yellow-800">{log.calories} kcal</span>
                  </div>
                ))}
                {logs.length > 5 && (
                  <div className="text-center text-sm text-gray-500 pt-2">
                    +{logs.length - 5} more entries
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No food entries for this date</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
