'use client'

import { motion } from 'framer-motion'

interface BMIInsightsProps {
  bmi: number | null
  height: number | null
  weight: number | null
  unit: string
}

export default function BMIInsights({ bmi, height, weight, unit }: BMIInsightsProps) {
  if (!bmi || !height || !weight) {
    return null
  }

  const heightInMeters = height / 100
  const weightInKg = unit === 'kg' ? weight : weight * 0.453592

  // Calculate healthy weight range (BMI 18.5 - 24.9)
  const minHealthyWeight = 18.5 * heightInMeters * heightInMeters
  const maxHealthyWeight = 24.9 * heightInMeters * heightInMeters

  // Determine status and messages
  let status: string
  let message: string
  let statusColor: string

  if (bmi < 18.5) {
    status = "Underweight"
    message = "Your body weight is lower than recommended for your height"
    statusColor = "text-red-600"
  } else if (bmi < 25) {
    status = "Normal"
    message = "Your weight is within a healthy range"
    statusColor = "text-green-600"
  } else if (bmi < 30) {
    status = "Overweight"
    message = "You are above recommended weight range"
    statusColor = "text-amber-600"
  } else {
    status = "Obese"
    message = "Your BMI is significantly above range"
    statusColor = "text-red-600"
  }

  // Calculate distance from healthy range
  let distanceFromRange: string

  if (weightInKg < minHealthyWeight) {
    const distance = (minHealthyWeight - weightInKg).toFixed(1)
    distanceFromRange = `You are ${distance} kg away from healthy range`
  } else if (weightInKg > maxHealthyWeight) {
    const distance = (weightInKg - maxHealthyWeight).toFixed(1)
    distanceFromRange = `You are ${distance} kg away from healthy range`
  } else {
    distanceFromRange = "You are within healthy range"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.35 }}
      className="bg-white rounded-xl p-5 border border-zinc-200/60 shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
    >
      <div className="space-y-2">
        {/* Status */}
        <div className="">
          <h3 className={`text-lg font-bold ${statusColor} mb-2`}>{status}</h3>
          <p className="text-sm text-gray-600">{message}</p>
        </div>

        {/* Healthy Weight Range */}
        <div className="p-4">
          <p className="text-sm font-semibold text-zinc-700 mb-2">Healthy weight range:</p>
          <p className="text-base font-bold text-teal-700">
            {minHealthyWeight.toFixed(0)} kg – {maxHealthyWeight.toFixed(0)} kg
          </p>
        </div>
      </div>
    </motion.div>
  )
}
