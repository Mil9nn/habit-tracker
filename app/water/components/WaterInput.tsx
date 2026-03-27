'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface WaterInputProps {
  onLog: (amount: number) => void
  disabled?: boolean
}

export default function WaterInput({ onLog, disabled = false }: WaterInputProps) {
  const [waterIntake, setWaterIntake] = useState('')
  const [logged, setLogged] = useState(false)

  const handleLog = () => {
    const val = parseFloat(waterIntake)
    if (!val || isNaN(val)) return

    onLog(val)
    setWaterIntake('')
    setLogged(true)
    setTimeout(() => setLogged(false), 2000)
  }

  return (
    <div className="flex items-center gap-3 mt-2">
      {/* Input */}
      <div className="relative flex-1 max-w-[140px]">
        <input
          type="number"
          value={waterIntake}
          onChange={e => setWaterIntake(e.target.value)}
          placeholder="250"
          step="100"
          min="0"
          className="w-full bg-transparent border-b-2 border-gray-200 outline-none text-sm text-gray-900 placeholder:text-gray-400 pb-1 focus:border-b-2 focus:border-blue-500"
          disabled={disabled}
        />
      </div>

      {/* Unit */}
      <span className="text-sm text-gray-500">ml</span>

      {/* Button */}
      <motion.button
        onClick={handleLog}
        disabled={!waterIntake || isNaN(parseFloat(waterIntake)) || disabled}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
        className="bg-blue-500 rounded-full ml-4 px-4 py-2 text-white text-sm hover:scale-105 active:scale-95 transition-transform ease-in-out font-medium disabled:opacity-40"
      >
        Add Water
      </motion.button>
    </div>
  )
}
