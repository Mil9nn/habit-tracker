'use client'

import { useEffect, useState } from 'react'
import { LucideIcon } from 'lucide-react'

interface MacroRingProps {
  current: number
  goal: number
  label: string
  icon: LucideIcon
  color: 'emerald' | 'blue' | 'amber'
  size?: number
  strokeWidth?: number
}

export default function MacroRing({
  current,
  goal,
  label,
  icon: Icon,
  color,
  size = 70,
  strokeWidth = 5,
}: MacroRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const percentage = Math.min((current / goal) * 100, 100)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(percentage)
    }, 100)
    return () => clearTimeout(timer)
  }, [percentage])

  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference

  const colorMap = {
    emerald: { stroke: '#10b981', icon: 'text-emerald-400' },
    blue: { stroke: '#3b82f6', icon: 'text-blue-400' },
    amber: { stroke: '#f59e0b', icon: 'text-amber-400' },
  }

  const selectedColor = colorMap[color]

  return (
    <div className="flex flex-col items-center gap-3">
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
            stroke="#d4d4d8"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={selectedColor.stroke}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className={`w-5 h-5 ${selectedColor.icon}`} />
        </div>
      </div>

      {/* Label and values */}
      <div className="text-center">
        <p className="text-xs font-medium text-zinc-400">{label}</p>
        <span className="text-xs font-semibold text-black/80">
          {Math.round(current * 10) / 10}g {" "}
        </span>
        <span className="text-xs text-zinc-500">
           / {goal}g
        </span>
      </div>
    </div>
  )
}
