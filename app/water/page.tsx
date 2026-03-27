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
      <div className="min-h-screen bg-[#F6F8FB] p-4 sm:p-5">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className=""
          >
            <h1 className="text-gray-600 text-12 font-bold tracking-[0.12em] uppercase mb-6">
              Water Tracking
            </h1>
          </motion.div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-700">Daily Goal: {goal} ml</p>
            <button
              onClick={() => {
                setShowGoalModal(true)
                setTempGoal(goal.toString())
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-full text-xs border-none cursor-pointer transition-all duration-200"
            >
              <Edit2 className='size-3' />
              Edit
            </button>
          </div>

          <WaterProgress current={todayTotal} goal={goal} />

          <WaterInput onLog={handleLog} />

          {/* Quick Water Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex items-center gap-2 flex-wrap"
          >
            <span className="text-xs text-zinc-400">Quick:</span>
            {[{ amount: 300, label: "1 Glass" }, { amount: 250, label: "250ml" }, { amount: 500, label: "500ml" }, { amount: 750, label: "750ml" }, { amount: 1000, label: "1L" }].map(({ amount, label }) => (
              <motion.button
                key={amount}
                onClick={() => handleQuickLog(amount)}
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.05 }}
                className="text-xs px-3 py-1.5 rounded-full border border-zinc-200 text-zinc-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                {label}
              </motion.button>
            ))}
          </motion.div>

          <WaterChart data={chartData} />

          <WaterLog
            entries={entries}
            onEntryUpdate={handleEntryUpdate}
            onEntryDelete={handleEntryDelete}
          />
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
              <h3 className="font-Fraunces text-xl font-bold text-gray-900 mb-4">
                Set Your Water Goal 💧
              </h3>
              <p className="text-sm text-gray-600 mb-6 leading-7">
                What's your daily water intake goal? This helps track progress and stay hydrated.
              </p>
              <div className="flex gap-3 mb-6">
                <input
                  type="number"
                  placeholder={goal ? goal.toString() : "e.g. 2000"}
                  id="water-goal"
                  className="flex-1 p-3.5 rounded-xl border border-zinc-200/60 bg-[#F9F7F5] text-base text-gray-900 font-Plus_Jakarta_Sans outline-none"
                  value={tempGoal}
                  onChange={e => setTempGoal(e.target.value)}
                />
                <span className="p-3.5 rounded-xl border border-zinc-200/60 bg-[#F9F7F5] text-sm text-gray-600 font-Plus_Jakarta_Sans flex items-center">
                  ml
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 p-3.5 rounded-xl border border-zinc-200/60 bg-[#F9F7F5] text-gray-600 font-Plus_Jakarta_Sans font-semibold text-sm border-[1.5px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGoalUpdate}
                  className="flex-1 p-3.5 rounded-xl bg-[#1E40AF] text-white font-Plus_Jakarta_Sans font-semibold text-sm border-none cursor-pointer"
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