'use client'

import { useRef, useState, useMemo, useCallback, memo } from 'react'
import { Drumstick, Wheat, Droplet } from 'lucide-react'
import CalorieGauge from './CalorieGauge'
import MacroRing from './MacroRing'

// Type definitions for better type safety
interface MicroNutrient {
  vitaminA?: number
  vitaminC?: number
  vitaminD?: number
  vitaminB6?: number
  vitaminB12?: number
}

interface Mineral {
  iron?: number
  magnesium?: number
  zinc?: number
  calcium?: number
  potassium?: number
  sodium?: number
}

interface Summary {
  totalCalories?: number
  goal?: number
  totalProtein?: number
  totalCarbs?: number
  totalFat?: number
  totalVitamins?: MicroNutrient
  totalMinerals?: Mineral
  cholesterol?: number
  sugar?: number
}

interface CarouselProps {
  summary?: Summary | null
  microRDA?: (MicroNutrient & Mineral) | null
  microPercentages?: Record<string, number> | null
  proteinGoal?: number
  carbsGoal?: number
  fatGoal?: number
}

// Constants
const DEFAULT_GOALS = {
  protein: 150,
  carbs: 200,
  fat: 70,
  calories: 2000
}

const MIN_SWIPE_DISTANCE = 50
const SLIDES_COUNT = 2

// Helper function to format numbers for display
const formatNumber = (num: number | undefined, decimals: number = 1): string => {
  if (num === undefined || num === null || isNaN(num)) return '0'
  return num.toFixed(decimals).replace(/\.0$/, '')
}

// Helper function for micro-nutrient bar color (no useCallback needed)
const getMicroBarColor = (pct: number): string => {
  if (pct >= 100) return 'bg-green-500'
  if (pct >= 80) return 'bg-blue-500'
  if (pct >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}

// Memoized vitamin data
const vitaminData = [
  { label: 'A', key: 'vitaminA', unit: 'mcg' },
  { label: 'C', key: 'vitaminC', unit: 'mg' },
  { label: 'D', key: 'vitaminD', unit: 'mcg' },
  { label: 'B6', key: 'vitaminB6', unit: 'mg' },
  { label: 'B12', key: 'vitaminB12', unit: 'mcg' }
] as const

// Memoized mineral data
const mineralData = [
  { label: 'Iron', key: 'iron' },
  { label: 'Magnesium', key: 'magnesium' },
  { label: 'Zinc', key: 'zinc' },
  { label: 'Calcium', key: 'calcium' },
  { label: 'Potassium', key: 'potassium' },
  { label: 'Sodium', key: 'sodium' }
] as const

// Memoized component for vitamin item
const VitaminItem = memo(({ 
  label, 
  dataKey, 
  val, 
  rda, 
  unit, 
  percentage 
}: {
  label: string
  dataKey: string
  val?: number
  rda?: number
  unit: string
  percentage?: number
}) => {
  const barColor = getMicroBarColor(percentage || 0)
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-zinc-600">{label}</span>
        <span className="text-[10px] text-black font-mono">
          {formatNumber(val)} / {formatNumber(rda)} {unit}
        </span>
      </div>
      <div className="w-full bg-zinc-200 rounded-full h-1">
        <div 
          className={`h-1 rounded-full ${barColor}`}
          style={{ width: `${Math.min(percentage || 0, 100)}%` }} 
        />
      </div>
    </div>
  )
})

// Memoized component for mineral item
const MineralItem = memo(({ 
  label, 
  dataKey, 
  val, 
  rda, 
  percentage 
}: {
  label: string
  dataKey: string
  val?: number
  rda?: number
  percentage?: number
}) => {
  const barColor = getMicroBarColor(percentage || 0)
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-zinc-600">{label}</span>
        <span className="text-[10px] text-black font-mono">
          {formatNumber(val)} / {formatNumber(rda)} mg
        </span>
      </div>
      <div className="w-full bg-zinc-200 rounded-full h-1">
        <div 
          className={`h-1 rounded-full ${barColor}`}
          style={{ width: `${Math.min(percentage || 0, 100)}%` }} 
        />
      </div>
    </div>
  )
})

export function Carousel({
  summary,
  microRDA,
  microPercentages,
  proteinGoal = DEFAULT_GOALS.protein,
  carbsGoal = DEFAULT_GOALS.carbs,
  fatGoal = DEFAULT_GOALS.fat
}: CarouselProps) {
  const [carouselSlide, setCarouselSlide] = useState(0)
  const touchStartXRef = useRef<number | null>(null)
  const touchEndXRef = useRef<number | null>(null)

  // Memoize calculated values
  const caloriesRemaining = useMemo(() => {
    const goal = summary?.goal ?? DEFAULT_GOALS.calories
    const current = summary?.totalCalories ?? 0
    return Math.max(goal - current, 0)
  }, [summary])

  // Memoize touch handlers
  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null
  }, [])

  const handleTouchMove = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    touchEndXRef.current = event.touches[0]?.clientX ?? null
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return
    
    const distance = touchStartXRef.current - touchEndXRef.current
    if (Math.abs(distance) > MIN_SWIPE_DISTANCE) {
      setCarouselSlide(prev => {
        if (distance > 0) {
          return (prev + 1) % SLIDES_COUNT
        } else {
          return (prev - 1 + SLIDES_COUNT) % SLIDES_COUNT
        }
      })
    }
    
    touchStartXRef.current = null
    touchEndXRef.current = null
  }, [])

  // Memoize navigation handlers
  const goToSlide = useCallback((slideIndex: number) => {
    setCarouselSlide(slideIndex % SLIDES_COUNT)
  }, [])

  const goToNextSlide = useCallback(() => {
    setCarouselSlide(prev => (prev + 1) % SLIDES_COUNT)
  }, [])

  const goToPrevSlide = useCallback(() => {
    setCarouselSlide(prev => (prev - 1 + SLIDES_COUNT) % SLIDES_COUNT)
  }, [])

  return (
    <section className="space-y-4 mb-10">
      <div className="relative bg-white shadow-sm overflow-hidden">
        <div
          className="flex transition-transform duration-200 ease-out"
          style={{ transform: `translateX(-${carouselSlide * 100}%)` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slide 1: Calories & Macros */}
          <div className="w-full flex-shrink-0">
            <div className="p-4 space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-zinc-500">Daily Nutrition</h3>
                <div className="flex items-center justify-center gap-4">
                  <CalorieGauge
                    current={summary?.totalCalories || 0}
                    target={summary?.goal || DEFAULT_GOALS.calories}
                    size={140}
                    strokeWidth={8}
                  />
                  <div className="space-y-2 pt-2 text-left">
                    {(summary?.goal || 0) > 0 ? (
                      <>
                        <p className="text-sm font-semibold text-black">
                          <span className="text-blue-600">{formatNumber(summary?.totalCalories)}</span> /{' '}
                          <span className="text-green-600">{formatNumber(summary?.goal)}</span> kcal
                        </p>
                        <p className="text-sm text-zinc-400">
                          {formatNumber(caloriesRemaining)} kcal remaining
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-black">
                          Loading...
                        </p>
                        <p className="text-sm text-zinc-400">
                          Calculating goals...
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-center items-center gap-6">
                <MacroRing current={summary?.totalProtein || 0} goal={proteinGoal} label="Protein" icon={Drumstick} color="emerald" size={70} strokeWidth={5} />
                <MacroRing current={summary?.totalCarbs || 0} goal={carbsGoal} label="Carbs" icon={Wheat} color="blue" size={70} strokeWidth={5} />
                <MacroRing current={summary?.totalFat || 0} goal={fatGoal} label="Fats" icon={Droplet} color="amber" size={70} strokeWidth={5} />
              </div>
            </div>
          </div>

          {/* Slide 2: Micro-nutrients */}
          <div className="w-full flex-shrink-0">
            <div className="p-4 space-y-4">
              <h3 className="text-lg font-medium text-zinc-600">Micro-nutrients</h3>

              {/* Vitamins */}
              <div>
                <h4 className="text-sm font-medium text-zinc-500 pb-2">Vitamins</h4>
                <div className="grid grid-cols-3 gap-3">
                  {vitaminData.map(({ label, key, unit }) => (
                    <VitaminItem
                      key={key}
                      dataKey={key}
                      label={label}
                      val={summary?.totalVitamins?.[key as keyof MicroNutrient]}
                      rda={microRDA?.[key as keyof MicroNutrient]}
                      unit={unit}
                      percentage={microPercentages?.[key]}
                    />
                  ))}
                </div>
              </div>

              {/* Minerals */}
              <div>
                <h4 className="text-sm font-medium text-zinc-500 pb-2">Minerals</h4>
                <div className="grid grid-cols-2 gap-4">
                  {mineralData.map(({ label, key }) => (
                    <MineralItem
                      key={key}
                      dataKey={key}
                      label={label}
                      val={summary?.totalMinerals?.[key as keyof Mineral]}
                      rda={microRDA?.[key as keyof Mineral]}
                      percentage={microPercentages?.[key]}
                    />
                  ))}
                </div>
              </div>

              {/* Others */}
              <div>
                <h4 className="text-sm font-medium text-zinc-500 pb-2">Others</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-zinc-600">Cholesterol</span>
                      <span className="text-[10px] text-black font-mono">{formatNumber(summary?.cholesterol)} mg</span>
                    </div>
                    <div className="w-full bg-zinc-200 rounded-full h-1">
                      <div
                        className={`h-1 rounded-full ${(summary?.cholesterol || 0) >= 300 ? 'bg-red-500' : (summary?.cholesterol || 0) >= 200 ? 'bg-amber-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min((summary?.cholesterol || 0) / 3, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-zinc-600">Sugar</span>
                      <span className="text-[10px] text-black font-mono">{formatNumber(summary?.sugar)} g</span>
                    </div>
                    <div className="w-full bg-zinc-200 rounded-full h-1">
                      <div
                        className={`h-1 rounded-full ${(summary?.sugar || 0) >= 50 ? 'bg-red-500' : (summary?.sugar || 0) >= 25 ? 'bg-amber-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min((summary?.sugar || 0) * 2, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center px-6 py-4">
          <button
            onClick={goToPrevSlide}
            className="hidden md:block p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400 hover:text-black focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex gap-2">
            {Array.from({ length: SLIDES_COUNT }, (_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-200 ${carouselSlide === index ? 'bg-violet-500 w-4' : 'bg-zinc-300 w-2 hover:bg-zinc-400'} focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={carouselSlide === index}
              />
            ))}
          </div>
          <button
            onClick={goToNextSlide}
            className="hidden md:block p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400 hover:text-black focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}