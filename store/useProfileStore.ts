import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { calculateBMR, calculateDailyCalorieNeeds } from '@/lib/calorieCalculator'

// Macro calculation functions
const calculateMacroGoals = (calorieGoal: number, activityLevel: ActivityLevel, weight: number) => {
  // Protein: 1.6-2.2g per kg body weight for active individuals
  // Higher for very active, lower for sedentary
  const proteinMultiplier = {
    sedentary: 1.6,
    lightly_active: 1.8,
    moderately_active: 2.0,
    very_active: 2.2,
    extra_active: 2.2
  }
  
  const proteinGoal = Math.round(proteinMultiplier[activityLevel] * weight)
  
  // Fat: 20-35% of total calories (0.8-1.2g per kg for active individuals)
  const fatPercentage = {
    sedentary: 0.30,
    lightly_active: 0.25,
    moderately_active: 0.25,
    very_active: 0.25,
    extra_active: 0.20
  }
  
  const fatCalories = calorieGoal * fatPercentage[activityLevel]
  const fatGoal = Math.round(fatCalories / 9) // 9 calories per gram of fat
  
  // Carbs: Remaining calories after protein and fat
  const proteinCalories = proteinGoal * 4 // 4 calories per gram of protein
  const remainingCalories = calorieGoal - proteinCalories - fatCalories
  const carbsGoal = Math.round(remainingCalories / 4) // 4 calories per gram of carbs
  
  return {
    proteinGoal,
    carbsGoal,
    fatGoal
  }
}

// Types
export type Gender = 'male' | 'female'
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active'

export interface UserProfile {
  name: string
  email: string
  age: number
  gender: Gender
  weight: number // kg
  height: number // cm
  activityLevel: ActivityLevel
  calorieGoal: number
  proteinGoal: number // grams
  carbsGoal: number // grams
  fatGoal: number // grams
  bmr: number
  createdAt?: string
}

export interface ProfileState {
  // State
  profile: UserProfile | null
  isLoading: boolean
  isInitialized: boolean
  lastCalculated: Date | null
  
  // Actions
  setProfile: (profile: Partial<UserProfile>) => void
  updateField: <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => void
  calculateMetrics: () => void
  resetProfile: () => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  clearProfile: () => void
}

// Default profile values (empty state, no dummy data)
const defaultProfile: UserProfile = {
  name: '',
  email: '',
  age: 0,
  gender: 'male',
  weight: 0, // kg
  height: 0, // cm
  activityLevel: 'moderately_active',
  calorieGoal: 0,
  proteinGoal: 0,
  carbsGoal: 0,
  fatGoal: 0,
  bmr: 0,
}

// Create the store
export const useProfileStore = create<ProfileState>()(
  devtools(
    (set, get) => ({
        // Initial state
        profile: null,
        isLoading: false,
        isInitialized: false,
        lastCalculated: null,

        // Actions
        setProfile: (profileUpdates: UserProfile) => 
          set(
            {
              ...get(),
              profile: profileUpdates, // ✅ FIX: Direct assignment instead of conditional
              lastCalculated: new Date(),
            },
            false,
            'setProfile'
          ),

        updateField: (field: keyof UserProfile, value: any) => {
          const currentProfile = get().profile;
          if (currentProfile) {
            set(
              {
                ...get(),
                profile: { ...currentProfile, [field]: value },
                lastCalculated: new Date(),
              },
              false,
              'updateField'
            );
          }
        },

        calculateMetrics: () => {
          const { profile } = get()
          
          if (!profile) return
          
          // Don't calculate if essential data is missing
          if (!profile.age || !profile.weight || !profile.height) {
            return
          }
          
          // Calculate BMR using Mifflin-St Jeor equation
          const bmr = calculateBMR({
            age: profile.age,
            gender: profile.gender,
            weight: profile.weight,
            height: profile.height,
            activityLevel: profile.activityLevel,
          })

          // Calculate recommended daily calorie needs
          const recommendedCalories = calculateDailyCalorieNeeds({
            age: profile.age,
            gender: profile.gender,
            weight: profile.weight,
            height: profile.height,
            activityLevel: profile.activityLevel,
          })

          // Calculate macro goals based on activity level and calorie target
          const { proteinGoal, carbsGoal, fatGoal } = calculateMacroGoals(recommendedCalories, profile.activityLevel, profile.weight)

          set(
            {
              profile: {
                ...profile,
                bmr,
                calorieGoal: recommendedCalories,
                proteinGoal,
                carbsGoal,
                fatGoal,
              },
              lastCalculated: new Date(),
            },
            false,
            'calculateMetrics'
          )
        },

        resetProfile: () => 
          set(
            { 
              profile: null,
              lastCalculated: new Date(),
            },
            false,
            'resetProfile'
          ),

        clearProfile: () =>
          set(
            {
              ...get(),
              profile: null,
              lastCalculated: new Date(),
            },
            false,
            'clearProfile'
          ),

        setLoading: (isLoading) => 
          set(
            {
              ...get(),
              isLoading,
            },
            false,
            'setLoading'
          ),

        setInitialized: (isInitialized) => 
          set(
            {
              ...get(),
              isInitialized,
            },
            false,
            'setInitialized'
          ),
      }),
      {
        name: 'profile-store',
      }
  )
)

// Selectors for optimized re-renders
export const useProfile = () => useProfileStore((state) => state.profile)
export const useProfileLoading = () => useProfileStore((state) => state.isLoading)
export const useProfileInitialized = () => useProfileStore((state) => state.isInitialized)
export const useBMR = () => useProfileStore((state) => state.profile?.bmr || 0)
export const useCalorieGoal = () => useProfileStore((state) => state.profile?.calorieGoal || 0)
export const useProteinGoal = () => useProfileStore((state) => state.profile?.proteinGoal || 0)
export const useCarbsGoal = () => useProfileStore((state) => state.profile?.carbsGoal || 0)
export const useFatGoal = () => useProfileStore((state) => state.profile?.fatGoal || 0)
export const useActivityLevel = () => useProfileStore((state) => state.profile?.activityLevel || 'moderately_active')
export const useDailyCalories = () => {
  // This would need to be calculated from API calls
  // For now, return a placeholder or 0
  return 0 // TODO: Implement proper daily calories fetching
}
export const useProfileActions = () => useProfileStore((state) => ({
  setProfile: state.setProfile,
  updateField: state.updateField,
  calculateMetrics: state.calculateMetrics,
  resetProfile: state.resetProfile,
  clearProfile: state.clearProfile,
  setLoading: state.setLoading,
  setInitialized: state.setInitialized,
}))

// Computed selectors
export const useBMI = () => {
  const profile = useProfile()
  // Return 0 if weight or height is 0 or profile is null
  if (!profile?.weight || !profile?.height) return 0
  return profile.weight / Math.pow(profile.height / 100, 2)
}

export const useProfileCompletion = () => {
  const profile = useProfile()
  if (!profile) return 0
  
  const fields = Object.keys(profile) as (keyof UserProfile)[]
  const completedFields = fields.filter(field => 
    field !== 'bmr' && 
    profile[field] !== null && 
    profile[field] !== undefined && 
    profile[field] !== 0
  )
  return (completedFields.length / (fields.length - 1)) * 100 // Exclude BMR from completion calculation
}
