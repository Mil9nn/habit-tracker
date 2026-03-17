'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Droplets, Target, TrendingUp, LogIn, LogOut, ChevronDown, User, Calendar, Utensils } from 'lucide-react'
import WaterGauge from './WaterGauge'
import WaterHeatmap from './WaterHeatmap'
import { mlToL } from '@/lib/utils'
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

interface WaterLog {
  _id: string
  amountMl: number
  date: string
  userId: string
  createdAt: string
  updatedAt: string
}

interface WaterSummary {
  period: string
  totalAmount: number
  targetMl: number
  progress: number
  entryCount: number
  dailyStats: { [key: string]: number }
  averageDaily: number
}

export default function CalorieTracker() {
  const { data: session, status } = useSession()
  const [summary, setSummary] = useState<CalorieSummary | null>(null)
  const [logs, setLogs] = useState<CalorieLog[]>([])
  const [heatmapData, setHeatmapData] = useState<{ date: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

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
      
      const [summaryRes, logsRes] = await Promise.all([
        fetch(`/api/calories/summary?period=daily&date=${targetDate}`),
        fetch(`/api/calories/log?startDate=${targetDate}&endDate=${targetDate}`)
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

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full p-8 rounded-lg shadow-md text-center">
          <Droplets className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Water Tracker</h1>
          <p className="text-gray-600 mb-6">Sign in to track your daily water intake</p>
          <Button
            onClick={() => signIn('google')}
            className="w-full hover:bg-blue-600 flex items-center justify-center gap-2"
            size={"lg"}
          >
            <img src="/google.svg" alt="Google" className="h-5 w-5" />
            Sign in with Google
          </Button>
        </div>
      </div>
    )
  }

  const progressPercentage = summary ? (summary.progress / 100) : 0

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 backdrop-blur-sm shadow-sm">

        {/* Title Section */}
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
            Water Tracker
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Stay hydrated, stay healthy
          </p>
        </div>

        {/* Profile Dropdown */}
        <div className="relative dropdown-container">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-center rounded-full p-1.5 hover:bg-gray-100 transition-all duration-200"
          >
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-gray-200"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold">
                {session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
              </div>
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-64 rounded-xl border border-gray-200 shadow-lg overflow-hidden z-50 animate-in fade-in zoom-in-95">

              {/* User Info */}
              <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-3">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                    {session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {session?.user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {session?.user?.email}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <a
                href="/profile"
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="h-4 w-4 text-gray-500" />
                Profile Settings
              </a>
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="h-4 w-4 text-gray-500" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto space-y-6 pt-24 px-2">

        <div className="rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold mb-6 text-center">Today's Calorie Progress</h3>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <div className="flex justify-center">
            <WaterGauge
              current={summary?.totalCalories || 0}
              target={summary?.goal || 2000}
              size={240}
              strokeWidth={14}
            />
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold">
              {session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
            </div>

            {/* Quick Calorie Buttons */}
            <div className="flex gap-2 mt-3">
              {quickCalories.map((calorie) => (
                <Button
                  key={calorie}
                  onClick={() => {
                    setValue("calories", calorie);
                  }}
                  className="bg-indigo-400 text-sm h-10"
                >
                  +{calorie} kcal
                </Button>
              ))}
            </div>

            <form onSubmit={handleSubmit(addCalorie)} className="flex items-center gap-2">
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

          <WaterHeatmap data={heatmapData} goal={summary?.goal || 2000} />

          <div className="rounded-lg shadow-sm border p-4">
            <h3 className="text-lg font-semibold mb-3">Daily Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Today's Calories</span>
                <span className="font-bold text-gray-900">
                  {summary ? `${summary.totalCalories} kcal` : '0 kcal'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Daily Average</span>
                <span className="font-bold text-gray-900">
                  {summary ? `${Math.round(summary.averageDaily)} kcal` : '0 kcal'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Daily Goal</span>
                <span className="font-bold text-gray-900">
                  {summary?.goal || 2000} kcal
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedDate === new Date().toISOString().split('T')[0] ? "Today's Log" : `${new Date(selectedDate).toLocaleDateString()} Log`}
              </h3>
              {logs.length > 0 ? (
                <div className="space-y-2">
                  {logs.slice(0, 5).map((log) => (
                    <div key={log._id} className="flex justify-between items-center py-2 border-b">
                      <div className="flex-1">
                        <span className="text-gray-800 font-medium">{log.foodName}</span>
                        <span className="text-gray-500 text-sm ml-2">{log.mealType}</span>
                        <span className="text-gray-400 text-xs ml-2">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{log.calories} kcal</span>
                    </div>
                  ))}
                  {logs.length > 5 && (
                    <div className="text-center text-sm text-gray-500 pt-2">
                      +{logs.length - 5} more entries
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No food entries today</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
