"use client"

import { motion } from "framer-motion"

type WaterProgressProps = {
  current: number
  goal: number
}

export default function WaterProgress({ current, goal }: WaterProgressProps) {
  const percentage = Math.min((current / goal) * 100, 100)

  return (
    <div className="w-full max-w-xl mx-auto">
      
      {/* Top Row */}
      <div className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-1">
        <span className="">Water Intake</span>
        <span className="font-medium">
          {current} / {goal} ml
        </span>
      </div>

      {/* Thin Progress Line */}
      <div className="relative h-[5px] rounded-full w-full bg-zinc-200 overflow-hidden">
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-blue-500"
        />

        {/* Subtle glow (very minimal) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: percentage > 10 ? 0.2 : 0 }}
          className="absolute top-0 left-0 h-full w-full bg-blue-400 blur-sm"
        />
      </div>

      {/* Bottom Meta */}
      <div className="flex justify-end mt-1">
        <span className="text-xs text-zinc-400">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  )
}