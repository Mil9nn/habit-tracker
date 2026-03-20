'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useProfileStore, useProfile } from '@/store/useProfileStore'
import { toast } from 'sonner'

// Zod schema for form validation
const profileSchema = z.object({
  age: z.number().min(1).max(100, "Age must be between 1 and 100"),
  gender: z.enum(['male', 'female']),
  weight: z.number().min(30).max(300, "Weight must be between 30 and 300 kg"),
  height: z.number().min(100).max(250, "Height must be between 100 and 250 cm"),
  activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'])
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileFormProps {
  onSave?: () => void
}

export default function ProfileForm({ onSave }: ProfileFormProps) {
  const router = useRouter()
  const profile = useProfile()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const steps = ['age', 'gender', 'weight', 'height', 'activity']

  // Check if user already has profile data and redirect them
  useEffect(() => {
    if (profile && profile.age && profile.weight && profile.height) {
      // User already has complete profile data, redirect to home
      router.push('/')
    }
  }, [profile, router])

  // Get store actions
  const store = useProfileStore()
  const setProfile = store.setProfile
  const calculateMetrics = store.calculateMetrics

  const {
    register,
    handleSubmit: handleFormSubmit,
    setValue,
    watch,
    formState: { isValid }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      age: 25,
      gender: 'male',
      weight: 70,
      height: 175,
      activityLevel: 'moderately_active'
    }
  })

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true)

    try {
      setProfile(data)
      calculateMetrics()
      
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('Profile saved successfully!', {
          description: 'Your profile has been updated and saved.',
          duration: 3000,
        })

        if (onSave) {
          onSave()
        }
        
        // Redirect to home page after successful profile creation
        router.push('/')
      } else {
        toast.error('Failed to save profile', {
          description: 'Please try again later.',
          duration: 3000,
        })
      }
    } catch (error) {
      toast.error('Error saving profile', {
        description: 'An unexpected error occurred.',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleFormSubmit(onSubmit)}>
      <div className="max-w-xl mx-auto mt-2">
        <div className="relative bg-white/70 p-4 space-y-4 transition-all duration-300">
          {/* subtle gradient glow */}
          <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-indigo-100 via-white to-blue-100 opacity-60 blur-2xl" />

          {/* Progress */}
          <div className="w-full bg-zinc-200/60 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>

          <h3 className="text-lg md:text-xl font-semibold text-zinc-900">
            {step === 0 && "How old are you?"}
            {step === 1 && "What's your gender?"}
            {step === 2 && "What's your weight?"}
            {step === 3 && "What's your height?"}
            {step === 4 && "How active are you?"}
          </h3>

          {/* Input */}
          <div>
            {step === 0 && (
              <Input
                type="number"
                {...register('age', { valueAsNumber: true })}
                className="h-10 text-sm w-20 rounded-xl border-zinc-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                placeholder="Enter your age"
              />
            )}

            {step === 1 && (
              <div className="grid grid-cols-2 gap-3">
                {['male', 'female'].map((g) => {
                  const selected = watch('gender') === g
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setValue('gender', g as any)}
                      className={`h-10 capitalize rounded-xl text-sm font-medium transition-all duration-200 border
                      ${selected
                            ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-transparent shadow-md scale-[1.02]'
                            : 'border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50'
                          }
                    `}
                    >
                      {g}
                    </button>
                  )
                })}
              </div>
            )}

            {step === 2 && (
              <Input
                type="number"
                {...register('weight', { valueAsNumber: true })}
                className="h-10 w-20 rounded-xl border-zinc-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="Weight in kg"
              />
            )}

            {step === 3 && (
              <Input
                type="number"
                {...register('height', { valueAsNumber: true })}
                className="h-10 w-20 rounded-xl border-zinc-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="Height in cm"
              />
            )}

            {step === 4 && (
              <select
                {...register('activityLevel')}
                className="w-full h-12 px-3 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
              >
                <option value="sedentary">Sedentary</option>
                <option value="lightly_active">Lightly Active</option>
                <option value="moderately_active">Moderately Active</option>
                <option value="very_active">Very Active</option>
                <option value="extra_active">Extra Active</option>
              </select>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
              className="text-sm text-zinc-500 hover:text-indigo-600 transition"
            >
              Back
            </button>

            {step < steps.length - 1 ? (
              <Button
                type="button"
                onClick={() => setStep((prev) => prev + 1)}
                className="rounded-full px-6 bg-gradient-to-r from-indigo-500 to-blue-500 hover:opacity-90 text-white shadow-md transition-all"
              >
                Continue
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading}
                className="rounded-xl px-6 bg-gradient-to-r from-indigo-500 to-blue-500 hover:opacity-90 text-white shadow-md"
              >
                {loading ? 'Saving...' : 'Finish'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
