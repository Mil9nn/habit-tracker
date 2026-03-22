'use client'

import { useEffect, useState } from 'react'
import { cn } from "@/lib/utils"
import { formatToOneDecimal } from "@/lib/utils"

interface RingProgressProps {
  value: number
  max: number
  title: string
  size?: number
  strokeWidth?: number
  className?: string
  color?: string
}

export function RingProgress({
  value,
  max,
  title,
  size = 120,
  strokeWidth = 8,
  className,
  color = '#06d6a0',
}: RingProgressProps) {
  const [animatedValue, setAnimatedValue] = useState(0)
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference

  // Animate value changes like CalorieGauge
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(percentage)
    }, 100)
    return () => clearTimeout(timer)
  }, [percentage])

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative inline-flex items-center justify-center">
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
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-bold" style={{ color }}>
              {value}
            </p>
            <p className="text-xs text-gray-500">
              / {max}g
            </p>
          </div>
        </div>
      </div>
      <p className="text-xs font-medium text-gray-700 mt-2">{title}</p>
    </div>
  )
}
