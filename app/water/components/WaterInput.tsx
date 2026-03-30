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
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <input
          type="number"
          value={waterIntake}
          onChange={e => setWaterIntake(e.target.value)}
          placeholder="Enter amount"
          step="100"
          min="0"
          className="w-full p-2 border-b-2 max-w-sm border-white shadow-sm text-white placeholder:text-gray-400 outline-none focus:border-blue-400"
          disabled={disabled}
        />
        <span className="">
          ml
        </span>
      </div>

      <motion.button
        onClick={handleLog}
        disabled={!waterIntake || isNaN(parseFloat(waterIntake)) || disabled}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
        className="px-6 py-3 bg-blue-500 text-white text-sm font-medium rounded-full hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Add
      </motion.button>
    </div>
  )
}
