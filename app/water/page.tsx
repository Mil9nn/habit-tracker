'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MainLayout from '../layout/MainLayout'
import { Droplets, Plus, Edit2 } from 'lucide-react'
import WaterProgress from './components/WaterProgress'
import WaterChart from './components/WaterChart'
import WaterLog from './components/WaterLog'
import WaterInput from './components/WaterInput'

interface WaterEntry {
  _id: string
  userId: string
  amount: number
  unit: string
  date: string
  createdAt: string
  updatedAt: string
}

export default function WaterTracker() {
  const [waterIntake, setWaterIntake] = useState('')
  const [goal, setGoal] = useState(2000) // ml default
  const [logged, setLogged] = useState(false)
  const [editingGoal, setEditingGoal] = useState(false)
  const [tempGoal, setTempGoal] = useState('')
  const [profile, setProfile] = useState<any>(null)
  const [entries, setEntries] = useState<WaterEntry[]>([])
  const [showGoalModal, setShowGoalModal] = useState(false)

  useEffect(() => {
    // Fetch profile data
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => {
        if (data.profile) {
          setProfile(data.profile)
          // Calculate daily water goal based on body weight
          const weight = data.profile.weight
          if (weight) {
            // Formula: 30-35ml per kg body weight
            const calculatedGoal = Math.round(weight * 33) // 33ml per kg average
            setGoal(calculatedGoal)
          }
        }
      })
      .catch(error => console.error('Error fetching profile:', error))

    // Fetch water entries
    fetch('/api/water/entries')
      .then(res => res.json())
      .then(data => {
        if (data.entries) {
          setEntries(data.entries)
        }
      })
      .catch(error => console.error('Error fetching water entries:', error))

    // Fetch water goal
    fetch('/api/water/goals')
      .then(res => res.json())
      .then(data => {
        if (data.waterGoal) {
          setGoal(data.waterGoal)
        }
      })
      .catch(error => console.error('Error fetching water goal:', error))
  }, [])

  const handleQuickLog = (amount: number) => {
    handleLog(amount)
  }

  const handleLog = async (amount: number) => {
    try {
      const response = await fetch('/api/water/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          unit: 'ml'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setEntries(prev => [data.entry, ...prev])
      } else {
        const errorData = await response.json()
        console.error('Failed to log water intake:', errorData.error)
        console.error('Status:', response.status)
      }
    } catch (error) {
      console.error('Error logging water intake:', error)
    }
  }

  const handleGoalUpdate = async () => {
    const val = parseInt(tempGoal)
    if (val && !isNaN(val) && val > 0 && val >= 500 && val <= 10000) {
      try {
        const response = await fetch('/api/water/goals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            waterGoal: val
          })
        })

        if (response.ok) {
          setGoal(val)
          setShowGoalModal(false)
          setTempGoal('')
        } else {
          const errorData = await response.json()
          console.error('Failed to update water goal:', errorData.error)
        }
      } catch (error) {
        console.error('Error updating water goal:', error)
      }
    }
  }

  const handleEntryUpdate = (updatedEntry: WaterEntry) => {
    setEntries(prev => prev.map(entry =>
      entry._id === updatedEntry._id ? updatedEntry : entry
    ))
  }

  const handleEntryDelete = (entryId: string) => {
    setEntries(prev => prev.filter(entry => entry._id !== entryId))
  }

  // Get today's entries
  const today = new Date().toISOString().split('T')[0]
  const todayEntries = entries.filter((entry: WaterEntry) =>
    new Date(entry.date).toISOString().split('T')[0] === today
  )
  const todayTotal = todayEntries.reduce((sum: number, entry: WaterEntry) => sum + entry.amount, 0)
  const remaining = Math.max(0, goal - todayTotal)

  // Prepare chart data for last 365 days
  const getChartData = () => {
    const data = []
    const today = new Date()

    for (let i = 364; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const dayEntries = entries.filter((entry: WaterEntry) =>
        new Date(entry.date).toISOString().split('T')[0] === dateStr
      )

      const dayTotal = dayEntries.reduce((sum: number, entry: WaterEntry) => sum + entry.amount, 0)

      // Determine status based on goal comparison
      let status = 'below'
      if (dayTotal >= goal) {
        status = 'above'
      } else if (dayTotal >= goal * 0.9) { // Within 10% of goal
        status = 'close'
      }

      data.push({
        date: date.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }),
        amount: dayTotal,
        goal: goal,
        status: status as 'above' | 'close' | 'below',
      })
    }

    return data
  }

  const chartData = getChartData()

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-light text-gray-900 tracking-tight">Hydration</h1>
                <p className="text-sm text-gray-500 mt-1">Track your daily water intake</p>
              </div>
              
              <button
                onClick={() => {
                  setShowGoalModal(true)
                  setTempGoal(goal.toString())
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Goal: {goal}ml
              </button>
            </div>
          </div>

          {/* Main Stats Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Water Progress */}
            <div className="lg:col-span-1">
              <div className="text-center">
                <WaterProgress current={todayTotal} goal={goal} />
                <div className="mt-4 space-y-1">
                  <p className="text-sm font-medium text-gray-900">
                    {todayTotal} / {goal} ml
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round((todayTotal / goal) * 100)}% of daily goal
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Today's Progress</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">Consumed</p>
                    <p className="text-lg font-light text-gray-900">{todayTotal} ml</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">Remaining</p>
                    <p className="text-lg font-light text-gray-900">{Math.max(0, goal - todayTotal)} ml</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">Entries</p>
                    <p className="text-lg font-light text-gray-900">{todayEntries.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="flex items-center justify-between py-4 border-y border-gray-100 mb-6">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-gray-500">Daily Average</p>
                <p className="text-sm font-medium text-gray-900">
                  {entries.length > 0 ? `${Math.round(entries.reduce((sum, entry) => {
                    const entryDate = new Date(entry.date).toISOString().split('T')[0]
                    const today = new Date().toISOString().split('T')[0]
                    return entryDate === today ? sum : sum + entry.amount
                  }, 0) / Math.max(1, entries.filter(e => new Date(e.date).toISOString().split('T')[0] !== new Date().toISOString().split('T')[0]).length))} ml` : "0 ml"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Goal Progress</p>
                <p className="text-sm font-medium text-gray-900">
                  {Math.round((todayTotal / goal) * 100)}%
                </p>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column */}
            <div className="space-y-6">
              
              {/* Water Input */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Add Water</h3>
                <WaterInput onLog={handleLog} />
              </div>

              {/* Quick Add Buttons */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Quick Add</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { amount: 300, label: "1 Glass" },
                    { amount: 250, label: "250ml" },
                    { amount: 500, label: "500ml" },
                    { amount: 750, label: "750ml" },
                    { amount: 1000, label: "1L" },
                  ].map(({ amount, label }) => (
                    <button
                      key={amount}
                      onClick={() => handleQuickLog(amount)}
                      className="px-3 py-1.5 text-sm border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 rounded-full transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Water Log */}
              <WaterLog
                entries={entries}
                onEntryUpdate={handleEntryUpdate}
                onEntryDelete={handleEntryDelete}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              
              {/* Water Chart */}
              <WaterChart data={chartData} />
            </div>
          </div>
        </div>
      </div>

      {/* Goal Modal */}
      <AnimatePresence>
        {showGoalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowGoalModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 w-[90%] max-w-[400px]"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Set Your Water Goal 💧
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                What's your daily water intake goal? This helps track progress and stay hydrated.
              </p>
              <div className="flex gap-3 mb-6">
                <input
                  type="number"
                  placeholder={goal ? goal.toString() : "e.g. 2000"}
                  className="flex-1 p-3 rounded-lg border border-gray-200 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={tempGoal}
                  onChange={e => setTempGoal(e.target.value)}
                />
                <span className="p-3 rounded-lg border border-gray-200 text-sm text-gray-600 flex items-center">
                  ml
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 p-3 rounded-lg border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGoalUpdate}
                  className="flex-1 p-3 rounded-lg bg-blue-500 text-white font-medium text-sm hover:bg-blue-600 transition-colors"
                >
                  Set Goal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  )
}