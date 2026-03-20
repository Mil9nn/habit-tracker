'use client'

import { Activity, Target, Flame, TrendingUp } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useProfile, useBMR, useCalorieGoal, useProteinGoal, useCarbsGoal, useFatGoal } from '@/store/useProfileStore'
import { Button } from './ui/button'

interface Props {
  dailyCalories: number
}

export default function ProfileDisplay({
  dailyCalories
}: Props) {
  const profile = useProfile()
  const bmr = useBMR()
  const calorieGoal = useCalorieGoal()
  const proteinGoal = useProteinGoal()
  const carbsGoal = useCarbsGoal()
  const fatGoal = useFatGoal()

  // Helper function to format numbers to 1 decimal place
  const formatToOneDecimal = (num: number) => {
    return Number(num.toFixed(2))
  }

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

  const handleSignOut = () => {
    signOut()
  }

  if (!profile) {
    return null
  }

  return (
    <div className="space-y-4">

      {/* 🔥 Stats */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* 🔥 Body Metrics */}
        <div className="bg-white rounded-2xl px-4 p-2 border border-gray-200 shadow-sm">

          <h2 className="text-sm text-gray-500 font-medium">Body Metrics</h2>

          <div className="flex items-center gap-4 flex-wrap">

            {[
              { label: 'Age', value: `${profile.age}` },
              { label: 'Gender', value: profile.gender },
              { label: 'Weight', value: `${formatToOneDecimal(profile.weight)} kg` },
              { label: 'Height', value: `${formatToOneDecimal(profile.height)} cm` },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-gray-50 rounded-xl p-4 text-center"
              >
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-sm font-semibold mt-1 text-gray-900">
                  {item.value}
                </p>
              </div>
            ))}

          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* BMR */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition">

            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Activity className="w-5 h-5 text-[#06d6a0]" />
              <span className="text-sm font-medium">BMR</span>
            </div>

            <p className="text-xl font-bold text-[#ffd166]">
              {formatToOneDecimal(bmr)}
            </p>
            <p className="text-xs text-gray-500 mt-1">kcal at rest</p>

          </div>

          {/* Calories */}
          <div className="ring-yellow-400 ring-2 rounded-2xl p-6 text-black shadow-md hover:shadow-lg transition">

            <div className="flex items-center gap-2 text-black/70 mb-2">
              <Flame className="size-5 text-yellow-400" />
              <span className="text-sm font-medium">Daily</span>
            </div>

            <p className="text-xl font-bold text-[#ffd166]">
              {formatToOneDecimal(dailyCalories)}
            </p>
            <p className="text-xs text-black/60 mt-1">kcal/day</p>

          </div>
        </div>

      </div>

      {/* 🔥 Macros */}
      <div className="flex items-center gap-2 flex-wrap">

        {[
          { label: 'Protein', value: formatToOneDecimal(proteinGoal || 0), color: '#06d6a0' },
          { label: 'Carbs', value: formatToOneDecimal(carbsGoal || 0), color: '#118ab2' },
          { label: 'Fats', value: formatToOneDecimal(fatGoal || 0), color: '#ef476f' }
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white rounded-2xl p-5 text-center border border-gray-200 shadow-sm hover:shadow-md transition"
          >
            <p className="text-xs text-gray-500 mb-2">{item.label}</p>

            <p
              className="text-xl font-bold tracking-tight"
              style={{ color: item.color }}
            >
              {item.value}g
            </p>

            <p className="text-xs text-gray-400">per day</p>
          </div>
        ))}

      </div>

      {/* 🔥 Activity */}
      <div className="bg-white rounded-2xl p-6 flex items-center justify-between border border-gray-200 shadow-sm">

        <div>
          <p className="text-sm text-gray-500">Activity Level</p>
          <p className="text-lg font-semibold text-gray-900">
            {getActivityLabel(profile.activityLevel)}
          </p>
        </div>

        <span className="text-xs px-3 py-1 rounded-full bg-[#06d6a0]/10 text-[#06d6a0] border border-[#06d6a0]/20">
          Lifestyle
        </span>

      </div>

      {/* 🔥 Insight */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">

        <h3 className="text-sm text-gray-500 mb-2 font-medium">Insight</h3>

        <p className="text-sm text-gray-700 leading-relaxed">
          Your body burns{' '}
          <span className="text-[#ffd166] font-semibold">{formatToOneDecimal(bmr)} kcal</span> at rest.
          You need around{' '}
          <span className="text-[#ffd166] font-semibold">{formatToOneDecimal(dailyCalories)} kcal</span> daily.
        </p>

      </div>
      <Button
        onClick={handleSignOut}
        className="w-full h-12"
        variant={"destructive"}
      >
        Sign Out
      </Button>

    </div>
  )
}