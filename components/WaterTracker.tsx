'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Droplets, Target, TrendingUp, LogIn, LogOut, ChevronDown, User } from 'lucide-react'
import WaterGauge from './WaterGauge'
import WaterHeatmap from './WaterHeatmap'
import { mlToL } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const waterAmountSchema = z.object({
  amount: z.string()
    .refine((val) => !isNaN(Number(val)), {
      message: "Amount must be a number"
    })
    .refine((val) => Number(val) > 0, {
      message: "Amount must be greater than 0"
    })
    .refine((val) => Number(val) <= 5000, {
      message: "Amount must be less than or equal to 5000ml"
    })
})

type WaterAmountForm = z.infer<typeof waterAmountSchema>

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

export default function WaterTracker() {
  const { data: session, status } = useSession()
  const [summary, setSummary] = useState<WaterSummary | null>(null)
  const [logs, setLogs] = useState<WaterLog[]>([])
  const [heatmapData, setHeatmapData] = useState<{ date: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<WaterAmountForm>({
    resolver: zodResolver(waterAmountSchema),
    defaultValues: {
      amount: '250'
    }
  })
  
  const watchedAmount = watch('amount')

  const quickAmounts = [100, 200, 250, 500, 750, 1000]

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status])

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
      const [summaryRes, logsRes] = await Promise.all([
        fetch('/api/water/summary?period=daily'),
        fetch('/api/water/log')
      ])

      if (summaryRes.ok && logsRes.ok) {
        const [summaryData, logsData] = await Promise.all([
          summaryRes.json(),
          logsRes.json()
        ])
        setSummary(summaryData)
        setLogs(logsData)

        // Process logs for heatmap
        const dailyTotals: { [key: string]: number } = {}
        logsData.forEach((log: WaterLog) => {
          const dateKey = new Date(log.date).toISOString().split('T')[0]
          dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + log.amountMl
        })

        const heatmap = Object.entries(dailyTotals).map(([date, count]) => ({
          date,
          count
        }))
        console.log('Daily totals:', dailyTotals)
        console.log('Heatmap data being sent:', heatmap)
        setHeatmapData(heatmap)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addWater = async (data: WaterAmountForm) => {
    try {
      const amountMl = parseInt(data.amount)
      const res = await fetch('/api/water/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountMl })
      })

      if (res.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Failed to add water:', error)
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
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
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
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white/90 backdrop-blur-sm shadow-sm">

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
            <div className="absolute right-0 mt-3 w-64 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden z-50 animate-in fade-in zoom-in-95">

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

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-6 text-center">Today's Progress</h3>
        <div className="flex justify-center">
          <WaterGauge
            current={summary?.totalAmount || 0}
            target={summary?.targetMl || 2000}
            size={240}
            strokeWidth={14}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Add Water</h3>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {quickAmounts.map((quickAmount) => (
            <Button
              key={quickAmount}
              type="button"
              variant={watchedAmount === quickAmount.toString() ? "default" : "outline"}
              onClick={() => setValue('amount', quickAmount.toString())}
              className="h-12"
            >
              {quickAmount}ml
            </Button>
          ))}
        </div>

        <form onSubmit={handleSubmit(addWater)} className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              type="number"
              {...register('amount')}
              placeholder="Custom amount (ml)"
              className={errors.amount ? 'border-red-500 focus:border-red-500' : ''}
            />
            {errors.amount && (
              <p className="text-sm text-red-500 mt-1">{errors.amount.message}</p>
            )}
          </div>
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isSubmitting ? 'Adding...' : 'Add'}
          </Button>
        </form>
      </div>

      <WaterHeatmap data={heatmapData} goal={summary?.targetMl || 2000} />

      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-lg font-semibold mb-3">Daily Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
            <span className="text-gray-600 font-medium">Today's Intake</span>
            <span className="font-bold text-gray-900">
              {summary ? `${mlToL(summary.totalAmount)}` : '0ml'}
            </span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
            <span className="text-gray-600 font-medium">Daily Average</span>
            <span className="font-bold text-gray-900">
              {summary ? `${mlToL(Math.round(summary.averageDaily))}` : '0ml'}
            </span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
            <span className="text-gray-600 font-medium">Daily Goal</span>
            <span className="font-bold text-gray-900">
              {mlToL(summary?.targetMl || 2000)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Today's Log</h3>
        {logs.length > 0 ? (
          <div className="space-y-2">
            {logs.slice(0, 5).map((log) => (
              <div key={log._id} className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">
                  {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="font-medium">{log.amountMl}ml</span>
              </div>
            ))}
            {logs.length > 5 && (
              <div className="text-center text-sm text-gray-500 pt-2">
                +{logs.length - 5} more entries
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No water entries today</p>
        )}
      </div>
      </main>
    </div>
  )
}
