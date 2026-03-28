"use client"

import { motion } from "framer-motion"
import { Droplets } from "lucide-react"

type WaterProgressProps = {
  current: number
  goal: number
}

export default function WaterProgress({ current, goal }: WaterProgressProps) {
  const percentage = Math.min((current / goal) * 100, 100)

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Background circle */}
      <div className="w-32 h-32 rounded-full border-8 border-gray-100" />
      
      {/* Progress circle */}
      <svg className="absolute inset-0 w-32 h-32 transform -rotate-90">
        <circle
          cx="64"
          cy="64"
          r="56"
          stroke="#e5e7eb"
          strokeWidth="8"
          fill="none"
        />
        <motion.circle
          cx="64"
          cy="64"
          r="56"
          stroke="#3b82f6"
          strokeWidth="8"
          fill="none"
          strokeDasharray={`${2 * Math.PI * 56}`}
          strokeDashoffset={`${2 * Math.PI * 56 * (1 - percentage / 100)}`}
          strokeLinecap="round"
          initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
          animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - percentage / 100) }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Droplets className="w-5 h-5 text-blue-500 mb-1" />
        <span className="text-lg font-light text-gray-900">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  )
}