'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useProfileStore } from '@/store/useProfileStore'

/**
 * Hook to initialize profile data on app mount for authenticated users
 * This ensures profile is loaded globally, not just on profile page
 */
export function useInitializeProfile() {
  const { status } = useSession()
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (status !== 'authenticated') {
      hasInitialized.current = false
      return
    }

    // Prevent double initialization
    if (hasInitialized.current) return

    hasInitialized.current = true

    const initializeProfile = async () => {
      try {

        const response = await fetch('/api/user/profile')


        if (response.ok) {
          const data = await response.json()


          if (data.profile) {
            // Map API response to store schema
            const profileData = {
              name: data.profile.name,
              email: data.profile.email,
              image: data.profile.image,
              age: data.profile.age,
              gender: data.profile.gender,
              weight: data.profile.weight,
              height: data.profile.height,
              activityLevel: data.profile.activityLevel,
              calorieGoal: data.profile.dailyCalorieGoal || data.recommendedCalories || 2000,
              proteinGoal: 0, // Will be calculated
              carbsGoal: 0,   // Will be calculated
              fatGoal: 0,     // Will be calculated
              bmr: 0,         // Will be calculated
            }

            const { setProfile, calculateMetrics, setInitialized } = useProfileStore.getState()
            setProfile(profileData)
            calculateMetrics()
            setInitialized(true)

          } else {
            // No profile data, still mark as initialized
            const { setInitialized } = useProfileStore.getState()
            setInitialized(true)

          }
        } else if (response.status === 404) {
          // Profile not found - this is ok, user just needs to create one
          const { setInitialized } = useProfileStore.getState()
          setInitialized(true)

        } else {
          console.warn('[useInitializeProfile] Response not ok:', response.status)
          // Mark as initialized even if fetch failed
          const { setInitialized } = useProfileStore.getState()
          setInitialized(true)
        }
      } catch (error) {

        // Mark as initialized even on error
        const { setInitialized } = useProfileStore.getState()
        setInitialized(true)
      }
    }

    initializeProfile()
  }, [status])
}

