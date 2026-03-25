// Store exports for centralized access
export { useAuthStore, useUser, useSession, useIsLoading, useIsAuthenticated, useAuthActions } from './useAuthStore'
export type { User, AuthState } from './useAuthStore'

export { 
  useProfileStore, 
  useProfile, 
  useProfileLoading, 
  useProfileInitialized, 
  useBMR, 
  useCalorieGoal, 
  useActivityLevel, 
  useProfileActions,
  useBMI,
  useProfileCompletion
} from './useProfileStore'
export type { UserProfile, ProfileState, Gender, ActivityLevel } from './useProfileStore'

export { 
  useWeightEntries, 
  useWeightGoal, 
  useWeightMilestones, 
  useWeightLoading, 
  useWeightInitialized,
  useWeightActions,
  useCurrentWeight
} from './useWeightStore'
