'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useProfile, useProfileStore } from '@/store/useProfileStore'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import MainLayout from '@/app/layout/MainLayout'
import { axiosInstance } from '@/lib/axios'

// Zod schema for form validation
const updateProfileSchema = z.object({
  age: z.number().min(18).max(100, "Age must be between 18 and 100"),
  gender: z.enum(['male', 'female']),
  weight: z.number().min(30).max(300, "Weight must be between 30 and 300 kg"),
  height: z.number().min(100).max(250, "Height must be between 100 and 250 cm"),
  activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'])
})

export default function EditProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const profile = useProfile()
  const { setProfile } = useProfileStore()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      age: profile?.age || 18,
      gender: profile?.gender || 'male',
      weight: profile?.weight || 70,
      height: profile?.height || 170,
      activityLevel: profile?.activityLevel || 'moderately_active'
    }
  })

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      const response = await axiosInstance.post('/api/user/profile', data)
      
      if (response.status === 200) {
        setProfile({
          ...profile,
          ...data,
          calorieGoal: response.data.dailyCalorieGoal || profile?.calorieGoal
        })

        toast.success('Profile updated successfully!')
        router.push('/profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false)
    }
  }

  const activityLabels = {
    sedentary: 'Sedentary',
    lightly_active: 'Lightly Active', 
    moderately_active: 'Moderately Active',
    very_active: 'Very Active',
    extra_active: 'Extra Active'
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen text-[#f4f1de] p-4 md:p-8">
        <div className="animate-pulse text-center">Loading...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-white px-4 md:px-8 py-6 md:py-10">
        <div className="max-w-2xl">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.back()} 
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">Edit Profile</h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <Input
                  type="number"
                  placeholder="Enter your age"
                  {...register('age', { valueAsNumber: true })}
                  className="w-full"
                />
                {errors.age && (
                  <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="male"
                      {...register('gender')}
                      className="mr-2"
                    />
                    <span className="text-gray-700">Male</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="female"
                      {...register('gender')}
                      className="mr-2"
                    />
                    <span className="text-gray-700">Female</span>
                  </label>
                </div>
                {errors.gender && (
                  <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
                )}
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <Input
                  type="number"
                  placeholder="Enter your weight in kg"
                  {...register('weight', { valueAsNumber: true })}
                  className="w-full"
                />
                {errors.weight && (
                  <p className="text-red-500 text-sm mt-1">{errors.weight.message}</p>
                )}
              </div>

              {/* Height */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height (cm)
                </label>
                <Input
                  type="number"
                  placeholder="Enter your height in cm"
                  {...register('height', { valueAsNumber: true })}
                  className="w-full"
                />
                {errors.height && (
                  <p className="text-red-500 text-sm mt-1">{errors.height.message}</p>
                )}
              </div>

              {/* Activity Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Level
                </label>
                <select
                  {...register('activityLevel')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(activityLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {errors.activityLevel && (
                  <p className="text-red-500 text-sm mt-1">{errors.activityLevel.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Updating...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}