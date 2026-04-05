'use client'

import { useRef, useState } from 'react'
import { Drumstick, Wheat, Droplet } from 'lucide-react'
import CalorieGauge from './CalorieGauge'
import MacroRing from './MacroRing'

interface CarouselProps {
  summary?: any
  microRDA?: any
  microPercentages?: any
  proteinGoal?: number
  carbsGoal?: number
  fatGoal?: number
}

export function Carousel({
  summary,
  microRDA,
  microPercentages,
  proteinGoal = 150,
  carbsGoal = 200,
  fatGoal = 70
}: CarouselProps) {
  const [carouselSlide, setCarouselSlide] = useState(0)
  const touchStartXRef = useRef<number | null>(null)
  const touchEndXRef = useRef<number | null>(null)
  const minSwipeDistance = 50

  // Helper function to format numbers for display
  const formatNumber = (num: number | undefined, decimals: number = 1): string => {
    if (num === undefined || num === null) return '0'
    return num.toFixed(decimals).replace(/\.0$/, '')
  }

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null
  }

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    touchEndXRef.current = event.touches[0]?.clientX ?? null
  }

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return
    const distance = touchStartXRef.current - touchEndXRef.current
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        setCarouselSlide((prev) => (prev + 1) % 2)
      } else {
        setCarouselSlide((prev) => (prev - 1 + 2) % 2)
      }
    }
    touchStartXRef.current = null
    touchEndXRef.current = null
  }

  const microBar = (pct: number) =>
    pct >= 100 ? 'bg-green-500' : pct >= 80 ? 'bg-blue-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <section className="space-y-6 px-4 mb-10">
      <div className="relative shadow-sm rounded-2xl border border-zinc-200 overflow-hidden">
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
              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium text-zinc-500">Daily Calories</h3>
                <div className="flex items-center justify-center gap-4">
                  <CalorieGauge
                    current={summary?.totalCalories || 0}
                    target={summary?.goal || 2000}
                    size={140}
                    strokeWidth={8}
                  />
                  <div className="space-y-2 pt-2 text-left">
                    <p className="text-sm font-semibold text-black">
                      <span className="text-blue-600">{summary?.totalCalories || 0}</span> /{' '}
                      <span className="text-green-600">{summary?.goal || 2000}</span> kcal
                    </p>
                    <p className="text-sm text-zinc-400">
                      {Math.max((summary?.goal || 2000) - (summary?.totalCalories || 0), 0)} kcal remaining
                    </p>
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
                  {[
                    { label: 'A', key: 'vitaminA', val: summary?.totalVitamins?.vitaminA, rda: microRDA?.vitaminA, unit: 'mcg' },
                    { label: 'C', key: 'vitaminC', val: summary?.totalVitamins?.vitaminC, rda: microRDA?.vitaminC, unit: 'mg' },
                    { label: 'D', key: 'vitaminD', val: summary?.totalVitamins?.vitaminD, rda: microRDA?.vitaminD, unit: 'mcg' },
                    { label: 'B6', key: 'vitaminB6', val: summary?.totalVitamins?.vitaminB6, rda: microRDA?.vitaminB6, unit: 'mg' },
                    { label: 'B12', key: 'vitaminB12', val: summary?.totalVitamins?.vitaminB12, rda: microRDA?.vitaminB12, unit: 'mcg' },
                  ].map(({ label, key, val, rda, unit }) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-zinc-600">{label}</span>
                        <span className="text-[10px] text-black font-mono">{formatNumber(val)} / {formatNumber(rda)} {unit}</span>
                      </div>
                      <div className="w-full bg-zinc-200 rounded-full h-1">
                        <div className={`h-1 rounded-full ${microBar(microPercentages?.[key] || 0)}`}
                          style={{ width: `${Math.min(microPercentages?.[key] || 0, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Minerals */}
              <div>
                <h4 className="text-sm font-medium text-zinc-500 pb-2">Minerals</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Iron', key: 'iron', val: summary?.totalMinerals?.iron, rda: microRDA?.iron },
                    { label: 'Magnesium', key: 'magnesium', val: summary?.totalMinerals?.magnesium, rda: microRDA?.magnesium },
                    { label: 'Zinc', key: 'zinc', val: summary?.totalMinerals?.zinc, rda: microRDA?.zinc },
                    { label: 'Calcium', key: 'calcium', val: summary?.totalMinerals?.calcium, rda: microRDA?.calcium },
                    { label: 'Potassium', key: 'potassium', val: summary?.totalMinerals?.potassium, rda: microRDA?.potassium },
                    { label: 'Sodium', key: 'sodium', val: summary?.totalMinerals?.sodium, rda: microRDA?.sodium },
                  ].map(({ label, key, val, rda }) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-zinc-600">{label}</span>
                        <span className="text-[10px] text-black font-mono">{formatNumber(val)} / {formatNumber(rda)} mg</span>
                      </div>
                      <div className="w-full bg-zinc-200 rounded-full h-1">
                        <div className={`h-1 rounded-full ${microBar(microPercentages?.[key] || 0)}`}
                          style={{ width: `${Math.min(microPercentages?.[key] || 0, 100)}%` }} />
                      </div>
                    </div>
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
            onClick={() => setCarouselSlide((prev) => (prev - 1 + 2) % 2)}
            className="hidden md:block p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400 hover:text-black"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex gap-2">
            {[0, 1].map((index) => (
              <button
                key={index}
                onClick={() => setCarouselSlide(index)}
                className={`h-2 rounded-full transition-all duration-200 ${carouselSlide === index ? 'bg-violet-500 w-4' : 'bg-zinc-300 w-2 hover:bg-zinc-400'}`}
              />
            ))}
          </div>
          <button
            onClick={() => setCarouselSlide((prev) => (prev + 1) % 2)}
            className="hidden md:block p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400 hover:text-black"
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