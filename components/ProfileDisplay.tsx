'use client'

import { Activity, Flame, ChevronLeft, Edit, Home, Info } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  useProfile,
  useBMR,
  useHealthMetrics,
  useCalorieGoal,
  useProteinGoal,
  useCarbsGoal,
  useFatGoal,
  useWaterGoal
} from '@/store/useProfileStore'
import { Button } from './ui/button'

interface Props {
  dailyCalories: number
}

// Tooltip component for health metrics
const HealthTooltip = ({ term, definition }: { term: string; definition: string }) => (
  <div className="group relative inline-block">
    <Info className="w-3 h-3 text-gray-400 cursor-help" />
    <div className="absolute bottom-full left-1/2 transform translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
      <div className="font-semibold mb-1">{term}</div>
      <div className="text-gray-300">{definition}</div>
    </div>
  </div>
)

export default function ProfileDisplay() {
  const profile = useProfile()
  const healthMetrics = useHealthMetrics()
  const bmr = useBMR()
  const calorieGoal = useCalorieGoal()
  const proteinGoal = useProteinGoal()
  const carbsGoal = useCarbsGoal()
  const fatGoal = useFatGoal()
  const waterGoal = useWaterGoal()

  const format = (num: number) => Number(num.toFixed(1))

  const getActivityLabel = (level: string) => {
    const labels = {
      sedentary: 'Sedentary',
      lightly_active: 'Light Activity',
      moderately_active: 'Moderate',
      very_active: 'Active',
      extra_active: 'Very Active'
    }
    return labels[level as keyof typeof labels] || level
  }

  const handleSignOut = () => signOut()

  if (!profile) return null

  return (
    <div className="space-y-8">

      {/* Profile Overview */}
      <div className="flex items-center gap-4 pb-6 border-b border-white/20">
        {profile?.image ? (
          <Image
            src={profile.image}
            alt="Profile"
            width={50}
            height={50}
            className='rounded-full'
          />
        ) : (
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium">
              {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-lg font-medium text-black">{profile?.name}</h2>
          <p className="text-sm text-gray-500">{profile?.email}</p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Left Column - Personal Info */}
        <div className="space-y-6">

          {/* Body Metrics */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-600">Body Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Age</p>
                <p className="text-sm font-medium text-black">{profile.age}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Gender</p>
                <p className="text-sm font-medium text-black">{profile.gender}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Weight</p>
                <p className="text-sm font-medium text-black">{format(profile.weight)} kg</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Height</p>
                <p className="text-sm font-medium text-black">{format(profile.height)} cm</p>
              </div>
            </div>
          </div>

          {/* Health Metrics */}
          {healthMetrics && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-600">Health Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">BMI</span>
                    <HealthTooltip 
                      term="BMI" 
                      definition="Body Mass Index. A measure of body fat based on height and weight. Normal range is 18.5-24.9 for adults."
                    />
                  </div>
                  <span className="text-sm font-medium text-black">{healthMetrics.bmi}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Weight Status</span>
                  <span className={`text-sm font-medium ${
                    healthMetrics.weightStatus === 'Normal weight' ? 'text-emerald-400' :
                    healthMetrics.weightStatus === 'Underweight' ? 'text-blue-400' :
                    healthMetrics.weightStatus === 'Overweight' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {healthMetrics.weightStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Healthy Weight Range</span>
                  <span className="text-sm font-medium text-black">
                    {healthMetrics.healthyWeightRange.min} - {healthMetrics.healthyWeightRange.max} kg
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Ideal Weight</span>
                    <HealthTooltip 
                      term="Ideal Weight" 
                      definition="The midpoint of your healthy weight range. Often considered the optimal weight for your height."
                    />
                  </div>
                  <span className="text-sm font-medium text-emerald-400">{healthMetrics.idealWeight} kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">BMR</span>
                    <HealthTooltip 
                      term="BMR" 
                      definition="BMR = calories your body burns just to stay alive (doing nothing)."
                    />
                  </div>
                  <span className="text-sm font-medium text-black">{healthMetrics.bmr} kcal</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">TDEE</span>
                    <HealthTooltip 
                      term="TDEE" 
                      definition="Total Daily Energy Expenditure. Total calories you burn in a day including BMR and all activities. This is your maintenance calorie level."
                    />
                  </div>
                  <span className="text-sm font-medium text-black">{healthMetrics.tdee} kcal</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Healthy BMR Range</span>
                  <span className="text-sm font-medium text-black">
                    {healthMetrics.healthyBMRRange.min} - {healthMetrics.healthyBMRRange.max} kcal
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Healthy Calorie Range</span>
                  <span className="text-sm font-medium text-black">
                    {healthMetrics.healthyCalorieRange.min} - {healthMetrics.healthyCalorieRange.max} kcal
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Activity Level */}
          <div className="flex  items-center gap-2">
            <h3 className="text-sm font-medium text-gray-600">Activity Level:</h3>
              <p className="text-sm font-medium text-emerald-400">
                {getActivityLabel(profile.activityLevel)}
              </p>
          </div>
        </div>

        {/* Right Column - Goals */}
        <div className="space-y-6">

          {/* Calorie Goals */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-600">Energy Goals</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Daily Requirement</span>
                <span className="text-sm font-medium text-black">{format(calorieGoal)} kcal</span>
              </div>
            </div>
          </div>

          {/* Macro Goals */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-600">Macronutrient Goals</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Protein</span>
                <span className="text-sm font-medium text-blue-400">{format(proteinGoal || 0)} g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Carbohydrates</span>
                <span className="text-sm font-medium text-amber-400">{format(carbsGoal || 0)} g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Fats</span>
                <span className="text-sm font-medium text-rose-400">{format(fatGoal || 0)} g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Water</span>
                <span className="text-sm font-medium text-cyan-400">{format(waterGoal || 0)} ml</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}