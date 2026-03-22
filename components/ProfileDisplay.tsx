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
      extra_active: 'Extreme'
    }
    return labels[level as keyof typeof labels] || level
  }

  const handleSignOut = () => signOut()

  if (!profile) return null

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-zinc-900">

      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()} 
              className="p-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-base font-medium">Profile</h1>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')}>
              <Home size={18} className="text-zinc-600" />
            </button>
            <button onClick={() => router.push('/profile/edit')}>
              <Edit size={18} className="text-zinc-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* Profile Info */}
        <section className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-medium text-white">
            {profile?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-medium text-gray-900">{profile?.name}</p>
            <p className="text-sm text-gray-500">{profile?.email}</p>
          </div>
        </section>

        {/* Body Metrics */}
        <section className="bg-white border rounded-lg p-4 space-y-3">
          <h2 className="text-sm font-medium text-indigo-600">Body Metrics</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Age</p>
              <p className="font-medium text-gray-900">{profile.age}</p>
            </div>
            <div>
              <p className="text-gray-500">Gender</p>
              <p className="font-medium text-gray-900">{profile.gender}</p>
            </div>
            <div>
              <p className="text-gray-500">Weight</p>
              <p className="font-medium text-gray-900">{format(profile.weight)} kg</p>
            </div>
            <div>
              <p className="text-gray-500">Height</p>
              <p className="font-medium text-gray-900">{format(profile.height)} cm</p>
            </div>
          </div>
        </section>

        {/* Calories */}
        <section className="bg-white border rounded-lg p-4 space-y-4">
          <h2 className="text-sm font-medium text-orange-600">Calories</h2>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <Activity size={16} className="text-green-500" />
              <span>BMR</span>
            </div>
            <p className="font-medium text-gray-900">{format(bmr)} kcal</p>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <Flame size={16} className="text-orange-500" />
              <span>Daily Requirement</span>
            </div>
            <p className="font-medium text-gray-900">{format(calorieGoal)} kcal</p>
          </div>
        </section>

        {/* Macros */}
        <section className="bg-white border rounded-lg p-4 space-y-3">
          <h2 className="text-sm font-medium text-blue-600">Macronutrients</h2>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Protein</span>
            <span className="font-medium text-blue-600">{format(proteinGoal || 0)} g</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Carbohydrates</span>
            <span className="font-medium text-amber-600">{format(carbsGoal || 0)} g</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Fats</span>
            <span className="font-medium text-purple-600">{format(fatGoal || 0)} g</span>
          </div>
        </section>

        {/* Activity */}
        <section className="bg-white border rounded-lg p-4 flex justify-between items-center text-sm">
          <div>
            <p className="text-gray-500">Activity Level</p>
            <p className="font-medium text-emerald-600">
              {getActivityLabel(profile.activityLevel)}
            </p>
          </div>
        </section>

        {/* Insight */}
        <section className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Your body burns <span className="font-medium text-green-600">{format(bmr)} kcal</span> at rest.
            Based on your activity level, you need approximately{' '}
            <span className="font-medium text-orange-600">{format(calorieGoal)} kcal</span> per day.
          </p>
        </section>

        {/* Sign Out */}
        <Button
          onClick={handleSignOut}
          variant="destructive"
          className="w-full"
        >
          Sign Out
        </Button>

      </div>
    </div>
  )
}