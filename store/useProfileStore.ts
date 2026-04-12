import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { calculateBMR, calculateDailyCalorieNeeds } from '@/lib/calorieCalculator'

const calculateHealthMetrics = (age: number, gender: Gender, height: number, weight: number, activityLevel: ActivityLevel) => {
  // Calculate BMI
  const heightInMeters = height / 100
  const bmi = weight / (heightInMeters * heightInMeters)
  
  // Healthy BMI range (18.5 - 24.9)
  const healthyBMI = { min: 18.5, max: 24.9 }
  
  // Calculate healthy weight range based on height and healthy BMI
  const healthyWeightRange = {
    min: Math.round(healthyBMI.min * heightInMeters * heightInMeters),
    max: Math.round(healthyBMI.max * heightInMeters * heightInMeters)
  }
  
  // Calculate ideal weight (midpoint of healthy range)
  const idealWeight = Math.round((healthyWeightRange.min + healthyWeightRange.max) / 2)
  
  // BMR calculation using Mifflin-St Jeor equation
  let bmr: number
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161
  }
  
  // Activity multipliers for BMR to get TDEE
  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9
  }
  
  const tdee = Math.round(bmr * activityMultipliers[activityLevel])
  
  // Healthy BMR range (±10% of calculated BMR)
  const healthyBMRRange = {
    min: Math.round(bmr * 0.9),
    max: Math.round(bmr * 1.1)
  }
  
  // Healthy calorie range (±15% of TDEE for weight maintenance)
  const healthyCalorieRange = {
    min: Math.round(tdee * 0.85),
    max: Math.round(tdee * 1.15)
  }
  
  // Weight status based on BMI
  let weightStatus: string
  if (bmi < 18.5) weightStatus = 'Underweight'
  else if (bmi < 25) weightStatus = 'Normal weight'
  else if (bmi < 30) weightStatus = 'Overweight'
  else weightStatus = 'Obese'
  
  // Calculate weight difference from ideal
  const weightDifference = weight - idealWeight
  const weightToGoal = weightDifference > 0 ? weightDifference : -weightDifference
  
  return {
    bmi: Math.round(bmi * 10) / 10,
    weightStatus,
    healthyWeightRange,
    idealWeight,
    weightDifference,
    weightToGoal,
    bmr: Math.round(bmr),
    healthyBMRRange,
    tdee,
    healthyCalorieRange
  }
}

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
  
  // Water: 35ml per kg body weight + activity-based extra
const waterGoal = Math.round((35 * weight) + {
  sedentary: 0,
  lightly_active: 300,
  moderately_active: 600,
  very_active: 900,
  extra_active: 1200
}[activityLevel])
  
  return {
    proteinGoal,
    carbsGoal,
    fatGoal,
    waterGoal
  }
}

// Types
export type Gender = 'male' | 'female'
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active'

export interface UserProfile {
  name: string
  email: string
  image?: string
  age: number
  gender: Gender
  weight: number // kg
  height: number // cm
  activityLevel: ActivityLevel
  calorieGoal: number
  proteinGoal: number // grams
  carbsGoal: number // grams
  fatGoal: number // grams
  waterGoal: number // ml
  bmr: number
  // Health metrics
  bmi: number
  weightStatus: string
  healthyWeightRange: { min: number; max: number }
  idealWeight: number
  weightDifference: number
  weightToGoal: number
  healthyBMRRange: { min: number; max: number }
  tdee: number
  healthyCalorieRange: { min: number; max: number }
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
  recalculateMacroGoals: () => void
}

// Default profile values (empty state, no dummy data)
const defaultProfile: UserProfile = {
  name: '',
  email: '',
  image: undefined,
  age: 0,
  gender: 'male',
  weight: 0, // kg
  height: 0, // cm
  activityLevel: 'moderately_active',
  calorieGoal: 0,
  proteinGoal: 0,
  carbsGoal: 0,
  fatGoal: 0,
  waterGoal: 0,
  bmr: 0,
  // Health metrics
  bmi: 0,
  weightStatus: '',
  healthyWeightRange: { min: 0, max: 0 },
  idealWeight: 0,
  weightDifference: 0,
  weightToGoal: 0,
  healthyBMRRange: { min: 0, max: 0 },
  tdee: 0,
  healthyCalorieRange: { min: 0, max: 0 },
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
          
          // Calculate health metrics
          const healthMetrics = calculateHealthMetrics(
            profile.age,
            profile.gender,
            profile.height,
            profile.weight,
            profile.activityLevel
          )

          // Calculate recommended daily calorie needs
          const recommendedCalories = calculateDailyCalorieNeeds({
            age: profile.age,
            gender: profile.gender,
            weight: profile.weight,
            height: profile.height,
            activityLevel: profile.activityLevel,
          })

          // Calculate macro goals based on activity level and calorie target
          const { proteinGoal, carbsGoal, fatGoal, waterGoal } = calculateMacroGoals(recommendedCalories, profile.activityLevel, profile.weight)

          set(
            {
              profile: {
                ...profile,
                ...healthMetrics,
                calorieGoal: recommendedCalories,
                proteinGoal,
                carbsGoal,
                fatGoal,
                waterGoal
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

        recalculateMacroGoals: () => {
          const { profile } = get()
          
          if (!profile || !profile.calorieGoal) return
          
          // Recalculate macro goals based on current profile data
          const { proteinGoal, carbsGoal, fatGoal, waterGoal } = calculateMacroGoals(profile.calorieGoal, profile.activityLevel, profile.weight)
          
          set(
            {
              profile: {
                ...profile,
                proteinGoal,
                carbsGoal,
                fatGoal,
                waterGoal
              },
              lastCalculated: new Date(),
            },
            false,
            'recalculateMacroGoals'
          )
        },
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
// Individual health metrics selectors to avoid caching issues
export const useBMI = () => useProfileStore((state) => state.profile?.bmi || 0)
export const useWeightStatus = () => useProfileStore((state) => state.profile?.weightStatus || '')
export const useHealthyWeightRange = () => useProfileStore((state) => state.profile?.healthyWeightRange || { min: 0, max: 0 })
export const useIdealWeight = () => useProfileStore((state) => state.profile?.idealWeight || 0)
export const useWeightDifference = () => useProfileStore((state) => state.profile?.weightDifference || 0)
export const useWeightToGoal = () => useProfileStore((state) => state.profile?.weightToGoal || 0)
export const useBMR = () => useProfileStore((state) => state.profile?.bmr || 0)
export const useHealthyBMRRange = () => useProfileStore((state) => state.profile?.healthyBMRRange || { min: 0, max: 0 })
export const useTDEE = () => useProfileStore((state) => state.profile?.tdee || 0)
export const useHealthyCalorieRange = () => useProfileStore((state) => state.profile?.healthyCalorieRange || { min: 0, max: 0 })

// Combined health metrics selector (use sparingly)
export const useHealthMetrics = () => {
  const bmi = useBMI()
  const weightStatus = useWeightStatus()
  const healthyWeightRange = useHealthyWeightRange()
  const idealWeight = useIdealWeight()
  const weightDifference = useWeightDifference()
  const weightToGoal = useWeightToGoal()
  const bmr = useBMR()
  const healthyBMRRange = useHealthyBMRRange()
  const tdee = useTDEE()
  const healthyCalorieRange = useHealthyCalorieRange()
  
  return bmi || weightStatus || healthyWeightRange.min || idealWeight ? {
    bmi,
    weightStatus,
    healthyWeightRange,
    idealWeight,
    weightDifference,
    weightToGoal,
    bmr,
    healthyBMRRange,
    tdee,
    healthyCalorieRange
  } : null
}
export const useCalorieGoal = () => useProfileStore((state) => state.profile?.calorieGoal || 0)
export const useProteinGoal = () => useProfileStore((state) => state.profile?.proteinGoal || 0)
export const useCarbsGoal = () => useProfileStore((state) => state.profile?.carbsGoal || 0)
export const useFatGoal = () => useProfileStore((state) => state.profile?.fatGoal || 0)
export const useWaterGoal = () => useProfileStore((state) => state.profile?.waterGoal || 0)
export const useActivityLevel = () => useProfileStore((state) => state.profile?.activityLevel || 'moderately_active')
export const useRecalculateMacroGoals = () => useProfileStore((state) => state.recalculateMacroGoals)
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
