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
  size = 200, 
  strokeWidth = 12,
  className 
}: CalorieGaugeProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const percentage = Math.min((current / target) * 100, 100)
  
  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Responsive sizing based on screen size
  const responsiveSize = isMobile ? {
    size: 180, // Small screens
    strokeWidth: 8,
    iconSize: 18,
    percentageSize: 'text-2xl',
    textSize: 'text-xs',
    subtextSize: 'text-xs'
  } : {
    size: size,
    strokeWidth: strokeWidth,
    iconSize: 24,
    percentageSize: 'text-3xl',
    textSize: 'text-sm',
    subtextSize: 'text-xs'
  }
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(percentage)
    }, 100)
    return () => clearTimeout(timer)
  }, [percentage])

  const radius = (responsiveSize.size - responsiveSize.strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference

  const getColor = () => {
    if (percentage < 30) return '#ef4444' // red
    if (percentage < 60) return '#f59e0b' // amber
    if (percentage < 80) return '#3b82f6' // blue
    return '#10b981' // green
  }

  return (
    <div className={`relative inline-flex items-center justify-center ${className || ''}`}>
      <svg
        width={responsiveSize.size}
        height={responsiveSize.size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={responsiveSize.size / 2}
          cy={responsiveSize.size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={responsiveSize.strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <circle
          cx={responsiveSize.size / 2}
          cy={responsiveSize.size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={responsiveSize.strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.3s ease-in-out',
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 mb-1">
          <Flame 
            className={`${isMobile ? 'size-5' : 'size-7'}`}
            style={{ color: getColor() }}
          />
          <span 
            className={`font-bold ${responsiveSize.percentageSize}`}
            style={{ color: getColor() }}
          >
            {Math.round(animatedProgress)}%
          </span>
        </div>
        <div className={`${responsiveSize.textSize} text-gray-600 font-medium`}>
          {current} / {target} kcal
        </div>
        <div className={`${responsiveSize.subtextSize} text-gray-500 mt-1`}>
          {target - current > 0 ? `${target - current} kcal remaining` : 'Goal reached! 🎉'}
        </div>
      </div>
    </div>
  )
}