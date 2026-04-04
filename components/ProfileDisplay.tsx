'use client'

import { Activity, Flame, ChevronLeft, Edit, Home } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  useProfile,
  useBMR,
  useCalorieGoal,
  useProteinGoal,
  useCarbsGoal,
  useFatGoal
} from '@/store/useProfileStore'
import { Button } from './ui/button'

interface Props {
  dailyCalories: number
}

export default function ProfileDisplay({ dailyCalories }: Props) {
  const profile = useProfile()
  const router = useRouter()
  const bmr = useBMR()
  const calorieGoal = useCalorieGoal()
  const proteinGoal = useProteinGoal()
  const carbsGoal = useCarbsGoal()
  const fatGoal = useFatGoal()

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
        <div className="flex-1">
          <h2 className="text-lg font-medium text-white">{profile?.name}</h2>
          <p className="text-sm text-gray-400">{profile?.email}</p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Left Column - Personal Info */}
        <div className="space-y-6">

          {/* Body Metrics */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-300">Body Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-400">Age</p>
                <p className="text-sm font-medium text-white">{profile.age}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-400">Gender</p>
                <p className="text-sm font-medium text-white">{profile.gender}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-400">Weight</p>
                <p className="text-sm font-medium text-white">{format(profile.weight)} kg</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-400">Height</p>
                <p className="text-sm font-medium text-white">{format(profile.height)} cm</p>
              </div>
            </div>
          </div>

          {/* Activity Level */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-300">Activity Level</h3>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm font-medium text-emerald-400">
                {getActivityLabel(profile.activityLevel)}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Goals */}
        <div className="space-y-6">

          {/* Calorie Goals */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-300">Energy Goals</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">BMR</span>
                <span className="text-sm font-medium text-white">{format(bmr)} kcal</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Daily Requirement</span>
                <span className="text-sm font-medium text-white">{format(calorieGoal)} kcal</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Today's Intake</span>
                <span className="text-sm font-medium text-blue-400">{dailyCalories} kcal</span>
              </div>
            </div>
          </div>

          {/* Macro Goals */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-300">Macronutrient Goals</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Protein</span>
                <span className="text-sm font-medium text-blue-400">{format(proteinGoal || 0)} g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Carbohydrates</span>
                <span className="text-sm font-medium text-amber-400">{format(carbsGoal || 0)} g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Fats</span>
                <span className="text-sm font-medium text-rose-400">{format(fatGoal || 0)} g</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}