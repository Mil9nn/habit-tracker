'use client'

import { useState, useEffect, useRef } from 'react'
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
  const [allEntries, setAllEntries] = useState<WaterEntry[]>([])
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [carouselSlide, setCarouselSlide] = useState(0)
  const touchStartXRef = useRef<number | null>(null)
  const touchEndXRef = useRef<number | null>(null)
  const minSwipeDistance = 50

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

    // Fetch water entries for today only
    fetch('/api/water/entries?today=true')
      .then(res => res.json())
      .then(data => {
        if (data.entries) {
          setEntries(data.entries)
        }
      })
      .catch(error => console.error('Error fetching water entries:', error))

    // Fetch all entries for chart data
    fetch('/api/water/entries')
      .then(res => res.json())
      .then(data => {
        if (data.entries) {
          setAllEntries(data.entries)
        }
      })
      .catch(error => console.error('Error fetching all water entries:', error))

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
        setAllEntries(prev => [data.entry, ...prev])
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
    setAllEntries(prev => prev.map(entry =>
      entry._id === updatedEntry._id ? updatedEntry : entry
    ))
  }

  const handleEntryDelete = (entryId: string) => {
    setEntries(prev => prev.filter(entry => entry._id !== entryId))
    setAllEntries(prev => prev.filter(entry => entry._id !== entryId))
  }

  const handleTouchStart = (event: any) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null
  }

  const handleTouchMove = (event: any) => {
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

  // Get today's entries
  const todayTotal = entries.reduce((sum: number, entry: WaterEntry) => sum + entry.amount, 0)
  const remaining = Math.max(0, goal - todayTotal)

  // Prepare chart data for last 365 days
  const getChartData = () => {
    const data = []
    const today = new Date()

    for (let i = 364; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const dayEntries = allEntries.filter((entry: WaterEntry) =>
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
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto py-8 px-4">

          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-black tracking-tight">Hydration</h1>
            <p className="text-sm text-gray-400 mt-1">Track your daily water intake</p>
          </div>

          {/* Daily Summary - Carousel */}
          <section className="space-y-6 mb-10">
            <div className="relative bg-black/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
              {/* Carousel Container */}
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${carouselSlide * 100}%)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Slide 1: Water Progress */}
                <div className="w-full flex-shrink-0">
                  <div className="p-6">
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center gap-6">
                        <WaterProgress
                          current={todayTotal}
                          goal={goal}
                          onClick={() => {
                            setShowGoalModal(true)
                            setTempGoal(goal.toString())
                          }}
                        />
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-black">
                            <span className="text-blue-400">{todayTotal}</span> / <span className="text-emerald-400">{goal}</span> ml
                          </p>
                          <p className="text-xs text-gray-400">
                            {remaining} ml remaining
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slide 2: Water Log */}
                <div className="w-full p-4 flex-shrink-0">
                  <WaterLog
                    entries={entries}
                    onEntryUpdate={handleEntryUpdate}
                    onEntryDelete={handleEntryDelete}
                  />
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-center px-6 py-4">
                <button
                  onClick={() => setCarouselSlide(carouselSlide === 0 ? 1 : 0)}
                  className="hidden md:block p-2 hover:bg-black/10 rounded-lg transition-colors text-gray-400 hover:text-black"
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
                        ? 'bg-blue-500 w-4'
                        : 'bg-black/20 w-2 hover:bg-white/30'
                        }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setCarouselSlide(carouselSlide === 0 ? 1 : 0)}
                  className="hidden md:block p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-black"
                  aria-label="Next slide"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </section>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* Left Column */}
            <section className="space-y-6 mb-10">
              <WaterInput onLog={handleLog} />

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
                    className="px-4 py-2 text-sm border border-black/10 text-gray-600 hover:border-blue-400/50 hover:border-2 hover:scale-105 active:scale-95 ease-in-out hover:text-blue-400 rounded-lg shadow-sm transition-all"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </section>

            <WaterChart data={chartData} />
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowGoalModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 backdrop-blur-md rounded-2xl p-8 w-[90%] max-w-[400px] border border-white/20"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-medium text-black mb-4">
                Set Your Water Goal
              </h3>
              <p className="text-sm text-gray-300 mb-6">
                What's your daily water intake goal? This helps track progress and stay hydrated.
              </p>
              <div className="flex gap-3 mb-6">
                <input
                  type="number"
                  placeholder={goal ? goal.toString() : "e.g. 2000"}
                  className="flex-1 p-2 border-b-2 border-red-500 text-black placeholder-gray-400 outline-none focus:border-blue-400"
                  value={tempGoal}
                  onChange={e => setTempGoal(e.target.value)}
                />
                <span className="text-sm text-gray-300 flex items-center">
                  ml
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 p-3 rounded-lg border border-white/20 text-gray-300 font-medium text-sm hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGoalUpdate}
                  className="flex-1 p-3 rounded-lg bg-blue-700 text-black font-medium text-sm hover:from-blue-600 hover:to-purple-700 transition-colors"
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