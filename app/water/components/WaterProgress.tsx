"use client"

import { motion } from "framer-motion"

type WaterProgressProps = {
  current: number
  goal: number
}

export default function WaterProgress({ current, goal }: WaterProgressProps) {
  const percentage = Math.min((current / goal) * 100, 100)

  return (
    <div className="w-full max-w-md p-5 rounded-2xl bg-white/70 backdrop-blur-md shadow-lg border border-zinc-200">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-zinc-600">
          Water Intake
        </h2>
        <span className="text-sm font-semibold text-blue-600">
          {Math.round(percentage)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-4 w-full bg-zinc-200 rounded-full overflow-hidden">
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"
        />

        {/* Glow effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: percentage > 5 ? 0.4 : 0 }}
          className="absolute top-0 left-0 h-full w-full bg-blue-400 blur-md"
        />
      </div>

      {/* Footer */}
      <div className="flex justify-between mt-3 text-xs text-zinc-500">
        <span>{current} ml</span>
        <span>{goal} ml</span>
      </div>
    </div>
  )
}