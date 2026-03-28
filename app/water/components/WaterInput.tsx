'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface WaterInputProps {
  onLog: (amount: number) => void
  disabled?: boolean
}

export default function WaterInput({ onLog, disabled = false }: WaterInputProps) {
  const [waterIntake, setWaterIntake] = useState('')

  const handleLog = () => {
    const val = parseFloat(waterIntake)
    if (!val || isNaN(val)) return

    onLog(val)
    setWaterIntake('')
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 relative">
        <input
          type="number"
          value={waterIntake}
          onChange={e => setWaterIntake(e.target.value)}
          placeholder="Enter amount"
          step="100"
          min="0"
          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          disabled={disabled}
        />
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
          ml
        </span>
      </div>

      <motion.button
        onClick={handleLog}
        disabled={!waterIntake || isNaN(parseFloat(waterIntake)) || disabled}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
        className="px-6 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Add
      </motion.button>
    </div>
  )
}
