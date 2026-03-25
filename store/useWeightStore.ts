import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export interface WeightEntry {
  date: string
  weight: number
  unit: 'kg' | 'lbs'
}

export interface WeightGoal {
  targetWeight: number
  startDate: string
  unit: 'kg' | 'lbs'
}

export interface WeightMilestone {
  id: string
  title: string
  achieved: boolean
  achievedDate?: string
}

export interface WeightState {
  entries: WeightEntry[]
  goal: WeightGoal | null
  milestones: WeightMilestone[]
  isLoading: boolean
  isInitialized: boolean
  // Actions
  setEntries: (entries: WeightEntry[]) => void
  addEntry: (entry: WeightEntry) => void
  updateEntry: (date: string, updates: Partial<WeightEntry>) => void
  deleteEntry: (date: string) => void
  setGoal: (goal: WeightGoal | null) => void
  setMilestones: (milestones: WeightMilestone[]) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  resetWeight: () => void
  getCurrentWeight: () => number | null
}

// Create store
export const useWeightStore = create<WeightState>()(
  persist(
    (set, get) => ({
      entries: [],
      goal: null,
      milestones: [],
      isLoading: false,
      isInitialized: false,
      
      // Actions
      setEntries: (entries) => set({ entries }),
      addEntry: (entry) => set({ entries: [...get().entries, entry] }),
      updateEntry: (date, updates) => set({
        entries: get().entries.map(e => 
          e.date === date ? { ...e, ...updates } : e
        )
      }),
      deleteEntry: (date) => set({
        entries: get().entries.filter(e => e.date !== date)
      }),
      setGoal: (goal) => set({ goal }),
      setMilestones: (milestones) => set({ milestones }),
      setLoading: (loading) => set({ isLoading: loading }),
      setInitialized: (initialized) => set({ isInitialized: initialized }),
      resetWeight: () => set({
        entries: [],
        goal: null,
        milestones: [],
        isLoading: false,
        isInitialized: false
      }),
      
      // Selectors
      getCurrentWeight: () => {
        const entries = get().entries
        return entries.length > 0 ? entries[entries.length - 1].weight : null
      }
    }),
    {
      name: 'weight-store',
      partialize: (state) => ({
        entries: state.entries,
        goal: state.goal,
        milestones: state.milestones,
        isLoading: state.isLoading,
        isInitialized: state.isInitialized
      })
    }
  )
)

// Selectors for optimized re-renders
export const useWeightEntries = () => useWeightStore((state) => state.entries)
export const useWeightGoal = () => useWeightStore((state) => state.goal)
export const useWeightMilestones = () => useWeightStore((state) => state.milestones)
export const useWeightLoading = () => useWeightStore((state) => state.isLoading)
export const useWeightInitialized = () => useWeightStore((state) => state.isInitialized)
export const useWeightActions = () => {
  const store = useWeightStore()
  return {
    setEntries: store.setEntries,
    addEntry: store.addEntry,
    updateEntry: store.updateEntry,
    deleteEntry: store.deleteEntry,
    setGoal: store.setGoal,
    setMilestones: store.setMilestones,
    setLoading: store.setLoading,
    setInitialized: store.setInitialized,
    resetWeight: store.resetWeight
  }
}
export const useCurrentWeight = () => useWeightStore((state) => state.getCurrentWeight())

// Export individual actions for direct access
export const setGoal = (goal: WeightGoal | null) => {
  useWeightStore.getState().setGoal(goal)
}
