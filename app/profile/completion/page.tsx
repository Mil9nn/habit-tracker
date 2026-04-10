'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import ProfileInput from '@/components/ProfileInput'
import { useRouter } from 'next/navigation'
import { useProfileStore, useProfile } from '@/store/useProfileStore'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

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
  onSuccess?: () => void
}

export default function ProfileForm({ onSave, onSuccess }: ProfileFormProps) {
  const router = useRouter()
  const profile = useProfile()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const steps = ['age', 'gender', 'weight', 'height', 'activity']

  // Auto-focus input when step changes
  useEffect(() => {
    setTimeout(() => {
      if (step === 0) {
        // Find the age input (first number input in step 0)
        const ageInput = document.querySelector('input[placeholder="18"]') as HTMLInputElement
        if (ageInput) ageInput.focus()
      } else if (step === 2) {
        // Find the weight input (input with "in kg" placeholder)
        const weightInput = document.querySelector('input[placeholder="in kg"]') as HTMLInputElement
        if (weightInput) weightInput.focus()
      } else if (step === 3) {
        // Find the height input (input with "in cm" placeholder)
        const heightInput = document.querySelector('input[placeholder="in cm"]') as HTMLInputElement
        if (heightInput) heightInput.focus()
      } else if (step === 4) {
        // Find the activity select
        const activitySelect = document.querySelector('select') as HTMLSelectElement
        if (activitySelect) activitySelect.focus()
      }
    }, 150)
  }, [step])


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
    mode: 'onTouched',
    defaultValues: {
      age: 25,
      gender: 'male',
      weight: 70,
      height: 175
    }
  })

  // Check if user already has profile data and populate the form
  useEffect(() => {
    if (profile && profile.age && profile.weight && profile.height) {
      // User already has complete profile data, populate the form
      setValue('age', profile.age)
      setValue('gender', profile.gender)
      setValue('weight', profile.weight)
      setValue('height', profile.height)
    }
  }, [profile, setValue])

  // Set activity level separately when user reaches that step
  useEffect(() => {
    if (step === 4 && profile?.activityLevel) {
      // Use setTimeout to prevent immediate form submission
      setTimeout(() => {
        setValue('activityLevel', profile.activityLevel)
      }, 100)
    }
  }, [step, profile, setValue])

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

        if (onSuccess) {
          onSuccess()
        }

        // Redirect to home page after successful profile completion
        router.push('/calorie')
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
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#F6F8FB]">

        <div className="w-full max-w-md relative">

          {/* Progress */}
          <div className="mb-6">
            <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          {/* Animated Step */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >

              {/* Question */}
              <div className='flex items-center gap-4'>
                <h2 className="text-md font-semibold text-zinc-900 leading-snug tracking-tight">
                  {step === 0 && "How old are you?"}
                  {step === 1 && "Select your gender"}
                  {step === 2 && "Your weight"}
                  {step === 3 && "Your height"}
                  {step === 4 && "Your activity level"}
                </h2>

                {/* Input Section */}
                <div className="space-y-4">

                  {step === 0 && (
                    <ProfileInput
                      placeholder="18"
                      register={register}
                      name="age"
                      validation={{ valueAsNumber: true }}
                    />
                  )}

                  {step === 1 && (
                    <div className="grid grid-cols-2 gap-3">
                      {['male', 'female'].map((g) => {
                        const selected = watch('gender') === g
                        return (
                          <motion.button
                            whileTap={{ scale: 0.96 }}
                            key={g}
                            type="button"
                            onClick={() => {
                              setValue('gender', g as any)
                              setTimeout(() => setStep((prev) => prev + 1), 200)
                            }}
                            className={`p-1 px-2 rounded-2xl text-sm font-medium transition-all
                      ${selected
                                ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg'
                                : 'bg-white border border-zinc-200 text-zinc-700'
                              }`}
                          >
                            {g === 'male' ? 'Male' : 'Female'}
                          </motion.button>
                        )
                      })}
                    </div>
                  )}

                  {step === 2 && (
                    <ProfileInput
                      placeholder="in kg"
                      register={register}
                      name="weight"
                      validation={{ valueAsNumber: true }}
                    />
                  )}

                  {step === 3 && (
                    <ProfileInput
                      placeholder="in cm"
                      register={register}
                      name="height"
                      validation={{ valueAsNumber: true }}
                    />
                  )}

                  {step === 4 && (
                    <div className="space-y-3">
                      {[
                        { value: 'sedentary', label: 'Sedentary' },
                        { value: 'lightly_active', label: 'Lightly Active' },
                        { value: 'moderately_active', label: 'Moderately Active' },
                        { value: 'very_active', label: 'Very Active' },
                        { value: 'extra_active', label: 'Extra Active' }
                      ].map((activity) => {
                        const selected = watch('activityLevel') === activity.value
                        return (
                          <motion.button
                            whileTap={{ scale: 0.96 }}
                            key={activity.value}
                            type="button"
                            onClick={() => setValue('activityLevel', activity.value as 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active')}
                            className={`w-full p-3 rounded-2xl text-sm font-medium transition-all text-left
                      ${selected
                                ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg'
                                : 'bg-white border border-zinc-200 text-zinc-700'
                              }`}
                          >
                            {activity.label}
                          </motion.button>
                        )
                      })}
                    </div>
                  )}

                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4">

                {/* Back */}
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep((prev) => prev - 1)}
                    className="text-sm text-zinc-500"
                  >
                    Back
                  </button>
                )}

                {/* Next / Submit */}
                {step < steps.length - 1 ? (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setStep((prev) => prev + 1)}
                    className="ml-auto p-2 px-4 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-sm font-medium shadow-md"
                  >
                    Continue
                  </motion.button>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={loading}
                    className="ml-auto h-12 px-6 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-sm font-medium shadow-md"
                  >
                    {loading ? 'Saving...' : 'Finish'}
                  </motion.button>
                )}

              </div>

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </form>
  )
}
