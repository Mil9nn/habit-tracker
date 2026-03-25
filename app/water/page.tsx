'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import MainLayout from '../layout/MainLayout'
import { Droplets, Plus } from 'lucide-react'

export default function WaterTracker() {
  const [waterIntake, setWaterIntake] = useState('')
  const [goal, setGoal] = useState(2000) // ml default
  const [logged, setLogged] = useState(false)

  const handleLog = () => {
    const val = parseFloat(waterIntake)
    if (!val || isNaN(val)) return
    
    // Simple local storage for now
    const today = new Date().toISOString().split('T')[0]
    const existing = JSON.parse(localStorage.getItem('water-entries') || '[]')
    const updated = [...existing, { date: today, amount: val }]
    localStorage.setItem('water-entries', JSON.stringify(updated))
    
    setWaterIntake('')
    setLogged(true)
    setTimeout(() => setLogged(false), 2000)
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#F6F8FB] p-4 sm:p-5">
        <div className="max-w-2xl mx-auto">
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

          {/* Current Intake */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] mb-5 text-center"
          >
            <p className="text-sm font-semibold text-gray-700">Daily Goal: {goal} ml</p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <div className="relative">
                <input
                  type="number"
                  value={waterIntake}
                  onChange={e => setWaterIntake(e.target.value)}
                  placeholder="Enter amount"
                  className="w-32 h-14 text-lg text-center font-bold text-blue-700 bg-white rounded-lg border-2 border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 px-4"
                  step="100"
                  min="0"
                />
                </div>
              <button
                onClick={handleLog}
                disabled={!waterIntake || isNaN(parseFloat(waterIntake))}
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm border-none cursor-pointer transition-all duration-200 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5 mr-2" />
                Log Intake
              </button>
            </div>
            {logged && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="mt-4 text-green-600 font-semibold text-sm"
              >
                ✓ Logged successfully!
              </motion.div>
            )}
          </motion.div>

          {/* Simple Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3 }}
            className="bg-white rounded-xl p-5 border border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Today's Progress</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current Intake:</span>
                <span className="font-bold text-blue-600">0 ml</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Daily Goal:</span>
                <span className="font-bold text-green-600">{goal} ml</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Remaining:</span>
                <span className="font-bold text-amber-600">{goal} ml</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  )
}