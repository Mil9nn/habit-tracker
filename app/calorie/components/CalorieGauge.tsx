'use client'

import { useEffect, useState } from 'react'
import { Flame } from 'lucide-react'

interface CalorieGaugeProps {
  current: number
  target: number
  size?: number
  strokeWidth?: number
  className?: string
}

export default function CalorieGauge({ 
  current, 
  target, 
  size = 160, 
  strokeWidth = 8,
  className 
}: CalorieGaugeProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const percentage = Math.min((current / target) * 100, 100)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(percentage)
    }, 100)
    return () => clearTimeout(timer)
  }, [percentage])

  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#d4d4d8"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#818cf8"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Flame className="size-5 text-violet-400 mb-2" />
        <span className="text-sm font-medium text-black/70">
          {Math.round(animatedProgress)}%
        </span>
      </div>
    </div>
  )
}