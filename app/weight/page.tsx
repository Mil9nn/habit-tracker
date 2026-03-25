'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import MainLayout from '../layout/MainLayout'
import {
  useWeightEntries,
  useWeightGoal,
  useWeightMilestones,
  useWeightLoading,
  useWeightInitialized,
  useWeightActions,
  useCurrentWeight,
  setGoal
} from '@/store/useWeightStore'
import {
  useProfile,
  useBMI,
  useProfileStore,
  useProfileLoading,
  useProfileInitialized
} from '@/store/useProfileStore'

import WeightChart from './components/WeightChart'
import WeightLogInput from './components/WeightLogInput'
import WeightEntries from './components/WeightEntries'
import GoalModal from './components/GoalModal'
import BMIInsights from './components/BMIInsights'
import { Edit2 } from 'lucide-react'
import { WeightEntry } from '@/store/useWeightStore'

interface Goal {
  targetWeight: number
  startDate: string
}

interface Milestone {
  id: string
  title: string
  achieved: boolean
  achievedDate?: string
}

const DEMO: WeightEntry[] = [
  { date: '2025-01-10', weight: 83.2, unit: 'kg' },
  { date: '2025-01-15', weight: 82.8, unit: 'kg' },
  { date: '2025-01-22', weight: 82.3, unit: 'kg' },
  { date: '2025-02-01', weight: 81.9, unit: 'kg' },
  { date: '2025-02-08', weight: 81.5, unit: 'kg' },
  { date: '2025-02-15', weight: 81.8, unit: 'kg' },
  { date: '2025-02-22', weight: 81.1, unit: 'kg' },
  { date: '2025-03-01', weight: 80.7, unit: 'kg' },
  { date: '2025-03-10', weight: 80.2, unit: 'kg' },
]

export default function WeightTracker() {
  const { data: session, status } = useSession()
  const entries = useWeightEntries()
  const goal = useWeightGoal()
  const milestones = useWeightMilestones()
  const loading = useWeightLoading()
  const initialized = useWeightInitialized()
  const weightActions = useWeightActions()
  const currentWeight = useCurrentWeight()
  const profile = useProfile()
  const bmi = useBMI()
  const profileLoading = useProfileLoading()
  const profileInitialized = useProfileInitialized()

  // Debug: Check goal state
  console.log("Goal state:", goal, "Type:", typeof goal, "Falsy:", !goal)

  // Get profile store actions
  const store = useProfileStore()
  const setProfile = store.setProfile
  const calculateMetrics = store.calculateMetrics

  const [weight, setWeight] = useState('')
  const [unit, setUnit] = useState('kg')
  const [logged, setLogged] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [editingEntry, setEditingEntry] = useState<string | null>(null)
  const [editWeight, setEditWeight] = useState('')
  const [trendView, setTrendView] = useState(30) // 7, 30, or 90 days
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [showSetupModal, setShowSetupModal] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (status === 'authenticated' && session?.user?.email) {
      // Fetch profile data if not initialized
      if (!profileInitialized) {
        const fetchProfile = async () => {
          try {
            const response = await fetch('/api/user/profile')
            if (response.ok) {
              const data = await response.json()
              if (data.profile) {
                setProfile(data.profile)
                calculateMetrics()
              }
            }
          } catch (error) {
            console.error('Error fetching profile:', error)
          }
        }
        fetchProfile()
      }

      // Fetch weight data if not initialized
      if (!initialized) {
        fetchWeightData()
      }
    }
  }, [status, session, profileInitialized, initialized])

  // Show setup modal for first-time users
  useEffect(() => {
    if (mounted && profile && entries.length === 0) {
      setShowSetupModal(true)
    }
  }, [mounted, profile, entries.length])

  useEffect(() => {
    // Pre-fill weight from profile or last entry
    if (profile?.weight && !weight && entries.length === 0) {
      // Use profile weight as initial suggestion
      setWeight(profile.weight.toString())
    } else if (entries.length > 0 && !weight) {
      // Use last logged weight
      const lastEntry = entries[entries.length - 1]
      setWeight(lastEntry.weight.toString())
    }
  }, [profile, entries, weight])

  const handleLog = async (weightValue: string, unitValue: string) => {
    const val = parseFloat(weightValue)
    if (!val || isNaN(val)) return
    const today = new Date().toISOString().split('T')[0]

    try {
      const response = await fetch('/api/weight/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: val,
          unit: unitValue,
          date: today
        })
      })

      if (response.ok) {
        const data = await response.json()
        const updated = [...entries.filter(e => e.date !== today), { date: today, weight: val, unit: unitValue as 'kg' | 'lbs' }]
          .sort((a, b) => a.date.localeCompare(b.date))
        weightActions.setEntries(updated)
        // Pre-fill for next time with today's weight
        setWeight(val.toString())
        setLogged(true)
        setTimeout(() => setLogged(false), 2000)
      } else {
        console.error('Failed to save weight entry')
      }
    } catch (error) {
      console.error('Error saving weight entry:', error)
    }
  }

  const handleEdit = (date: string) => {
    const entry = entries.find((e: WeightEntry) => e.date === date)
    if (entry) {
      setEditingEntry(date)
      setEditWeight(entry.weight.toString())
    }
  }

  const handleSaveEdit = async () => {
    const val = parseFloat(editWeight)
    if (!val || isNaN(val) || !editingEntry) return

    try {
      const response = await fetch('/api/weight/entries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: val,
          unit,
          date: editingEntry
        })
      })

      if (response.ok) {
        const updated = entries.map((e) =>
          e.date === editingEntry ? { ...e, weight: val, unit: unit as 'kg' | 'lbs' } : e
        ) as WeightEntry[]
        weightActions.setEntries(updated)
        setEditingEntry(null)
        setEditWeight('')
      } else {
        console.error('Failed to update weight entry')
      }
    } catch (error) {
      console.error('Error updating weight entry:', error)
    }
  }

  const handleCancelEdit = () => {
    setEditingEntry(null)
    setEditWeight('')
  }

  const handleDelete = async (date: string) => {
    try {
      const response = await fetch(`/api/weight/entries?date=${date}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const updated = entries.filter((e: WeightEntry) => e.date !== date)
        weightActions.setEntries(updated)
      } else {
        console.error('Failed to delete weight entry')
      }
    } catch (error) {
      console.error('Error deleting weight entry:', error)
    }
  }

  const chartData = entries.slice(-trendView).map(e => ({ ...e, label: e.date.slice(5) }))
  const current = entries.at(-1)?.weight
  const first = entries[0]?.weight
  const totalChange = current && first ? +(current - first).toFixed(1) : null

  // Calculate change vs yesterday and last week
  const yesterday = entries.slice(-2)[0]?.weight
  const lastWeek = entries.slice(-8)[0]?.weight
  const changeYesterday = yesterday && currentWeight ? +(currentWeight - yesterday).toFixed(1) : null
  const changeLastWeek = lastWeek && currentWeight ? +(currentWeight - lastWeek).toFixed(1) : null

  // BMI from profile store
  const bmiValue = bmi && profile?.height ? bmi : null

  // Trend smoothing - rolling average
  const smoothedData = entries.map((entry, index) => {
    const start = Math.max(0, index - 3)
    const end = Math.min(entries.length, index + 4)
    const window = entries.slice(start, end)
    const avg = window.reduce((sum, e) => sum + e.weight, 0) / window.length
    return { ...entry, smoothed: avg, label: entry.date.slice(5) }
  })

  // Goal tracking
  const progressPercentage = goal && current && goal.targetWeight !== current
    ? Math.round(((first || current) - current) / ((first || current) - goal.targetWeight) * 100)
    : 0
  const remainingWeight = goal && current ? Math.abs(goal.targetWeight - current) : null

  // Rate of change and projections
  const weeklyChange = changeLastWeek
  const projectedWeeks = weeklyChange && goal && current
    ? Math.ceil(Math.abs(current - goal.targetWeight) / Math.abs(weeklyChange))
    : null

  // Milestone system
  const checkMilestones = () => {
    if (!first || !current || !goal) return milestones

    const newMilestones = [...milestones]
    const totalLoss = (first - current)
    const goalProgress = ((first - current) / (first - goal.targetWeight)) * 100

    // First 1kg lost
    if (totalLoss >= 1 && !milestones.find(m => m.id === 'first-kg')) {
      newMilestones.push({
        id: 'first-kg',
        title: 'First 1kg Lost! 🎉',
        achieved: true,
        achievedDate: new Date().toISOString().split('T')[0]
      })
    }

    // Halfway to goal
    if (goalProgress >= 50 && !milestones.find(m => m.id === 'halfway')) {
      newMilestones.push({
        id: 'halfway',
        title: 'Halfway to Goal! 🚀',
        achieved: true,
        achievedDate: new Date().toISOString().split('T')[0]
      })
    }

    return newMilestones
  }

  const updatedMilestones = checkMilestones()

  function calculateBMI(weight: number, height: string, unit: string): string {
    const heightInMeters = unit === 'kg' ? parseFloat(height) / 100 : (parseFloat(height) * 2.54) / 100
    const weightInKg = unit === 'kg' ? weight : weight * 0.453592
    return (weightInKg / (heightInMeters * heightInMeters)).toFixed(1)
  }

  const handleSetupComplete = () => {
    const val = parseFloat(weight)
    if (val && !isNaN(val)) {
      const today = new Date().toISOString().split('T')[0]
      const entryData = {
        weight: val,
        unit,
        date: today
      }

      // Log initial weight
      fetch('/api/weight/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryData)
      })
        .then(res => res.json())
        .then(data => {
          weightActions.addEntry(data.entry)
          setWeight(val.toString())
        })
        .catch(console.error)

      setShowSetupModal(false)
    }
  }

  const fetchWeightData = async () => {
    try {
      const response = await fetch('/api/weight/entries')
      if (response.ok) {
        const data = await response.json()
        if (data.entries) {
          weightActions.setEntries(data.entries)
        }
      }
    } catch (error) {
      console.error('Error fetching weight data:', error)
    }
  }

  if (!mounted) return null

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#F6F8FB] p-4 sm:p-5">
        <div className="max-w-2xl mx-auto space-y-2">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className=""
          >
            <p className="text-gray-600 text-12 font-bold tracking-[0.12em] uppercase mb-6">
              Weight Tracking
            </p>
          </motion.div>


          {/* Current Weight */}
          {currentWeight && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] text-center"
            >
              <p className="text-sm font-semibold text-gray-700">Current Weight:</p>
              <p className="font-Fraunces text-lg font-bold text-blue-700">
                {currentWeight} <span className="text-sm font-normal text-blue-500">{unit}</span>
              </p>
            </motion.div>
          )}

          {/* BMI Insights */}
          <BMIInsights
            bmi={bmiValue}
            height={profile?.height || null}
            weight={currentWeight}
            unit={unit}
          />

          {/* Set Goal Button */}
          {!goal ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.25 }}
              className="bg-white rounded-xl p-5 border border-zinc-200/60 shadow-[0_1px_4px_rgba(0,0,0,0.05)] text-center"
            >
              <button
                onClick={() => setShowGoalModal(true)}
                className="px-4 py-2 rounded-xl bg-[#1E40AF] text-white font-Plus_Jakarta_Sans font-semibold text-sm border-none cursor-pointer transition-all duration-200"
              >
                Set Your Goal 🎯
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.25 }}
              className="bg-white rounded-xl p-5 border border-zinc-200/60 shadow-[0_1px_4px_rgba(0,0,0,0.05)] text-center"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-emerald-700">Goal: {goal.targetWeight} {unit}</span>
                <button
                  onClick={() => setShowGoalModal(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-black text-white text-xs border-none cursor-pointer transition-all duration-200"
                >
                  <Edit2 className='size-3' />
                  Edit
                </button>
              </div>
            </motion.div>
          )}

          {/* Milestones */}
          {updatedMilestones.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.3 }}
              className="bg-white rounded-xl p-5 border border-zinc-200/60 shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
            >
              <p className="text-sm font-semibold text-gray-900">Milestones</p>
              <div className="flex flex-col gap-2">
                {updatedMilestones.map(milestone => (
                  <div
                    key={milestone.id}
                    className="flex items-center gap-2 p-2 rounded-md bg-[#F0F7F4]"
                  >
                    <span className="text-sm text-gray-600 font-medium">🏆</span>
                    <span className="text-sm text-gray-600 font-medium">{milestone.title}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}


          {/* Log Input Component */}
          <WeightLogInput
            weight={weight}
            setWeight={setWeight}
            unit={unit}
            setUnit={setUnit}
            onLog={handleLog}
            logged={logged}
          />

          {/* Chart Component */}
          <WeightChart
            entries={entries}
            unit={unit}
            trendView={trendView}
            setTrendView={setTrendView}
            progressPercentage={progressPercentage}
            remainingWeight={remainingWeight}
            weeklyChange={weeklyChange}
            projectedWeeks={projectedWeeks}
          />

          {/* Entries Component */}
          <WeightEntries
            entries={entries}
            unit={unit}
            editingEntry={editingEntry}
            editWeight={editWeight}
            onEdit={handleEdit}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            onDelete={handleDelete}
            setEditWeight={setEditWeight}
          />

          {/* Goal Modal Component */}
        <GoalModal
          showGoalModal={showGoalModal}
          setShowGoalModal={setShowGoalModal}
          goal={goal || undefined}
          unit={unit}
          setGoal={setGoal}
        />

        </div>
      </div>
    </MainLayout>
  )
}
