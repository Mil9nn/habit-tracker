"use client"

import { motion } from "framer-motion"
import { Droplets } from "lucide-react"

type WaterProgressProps = {
  current: number
  goal: number
  onClick?: () => void
}

export default function WaterProgress({ current, goal, onClick }: WaterProgressProps) {
  const percentage = Math.min((current / goal) * 100, 100)

  return (
    <div
      onClick={onClick}
      className="relative inline-flex items-center justify-center cursor-pointer"
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={event => {
        if (onClick && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault()
          onClick()
        }
      }}
    >
      {/* Background circle */}
      <div className="w-32 h-32 rounded-full border-8 border-white/10" />
      
      {/* Progress circle */}
      <svg className="absolute inset-0 w-32 h-32 transform -rotate-90">
        <circle
          cx="64"
          cy="64"
          r="56"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
          fill="none"
        />
        <motion.circle
          cx="64"
          cy="64"
          r="56"
          stroke="url(#waterGradient)"
          strokeWidth="8"
          fill="none"
          strokeDasharray={`${2 * Math.PI * 56}`}
          strokeDashoffset={`${2 * Math.PI * 56 * (1 - percentage / 100)}`}
          strokeLinecap="round"
          initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
          animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - percentage / 100) }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Droplets className="w-5 h-5 text-blue-400 mb-1" />
        <span className="text-lg font-light text-white">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  )
}