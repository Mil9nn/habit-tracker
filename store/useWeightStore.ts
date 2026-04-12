import { create } from 'zustand'

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
  addEntry: (entry: WeightEntry) => Promise<void>
  updateEntry: (date: string, updates: Partial<WeightEntry>) => Promise<void>
  deleteEntry: (date: string) => Promise<void>
  setGoal: (goal: WeightGoal | null) => void
  setMilestones: (milestones: WeightMilestone[]) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  fetchGoal: () => Promise<void>
  saveGoal: (goal: WeightGoal) => Promise<void>
  deleteGoal: () => Promise<void>
  fetchEntries: () => Promise<void>
  resetWeight: () => void
  getCurrentWeight: () => number | null
}

// Create store with database integration
export const useWeightStore = create<WeightState>()((set, get) => ({
  entries: [],
  goal: null,
  milestones: [],
  isLoading: false,
  isInitialized: false,
  
  // Actions
  setEntries: (entries) => set({ entries }),
  
  addEntry: async (entry) => {
    set({ isLoading: true })
    try {
      const response = await fetch('/api/weight/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      })
      
      if (response.ok) {
        const { entry: savedEntry } = await response.json()
        set({ entries: [...get().entries, savedEntry] })
      }
    } catch (error) {
      console.error('Error adding weight entry:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  
  updateEntry: async (date, updates) => {
    set({ isLoading: true })
    try {
      const response = await fetch('/api/weight/entries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, ...updates })
      })
      
      if (response.ok) {
        set({
          entries: get().entries.map(e => 
            e.date === date ? { ...e, ...updates } : e
          )
        })
      }
    } catch (error) {
      console.error('Error updating weight entry:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  
  deleteEntry: async (date) => {
    set({ isLoading: true })
    try {
      const response = await fetch(`/api/weight/entries?date=${date}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        set({
          entries: get().entries.filter(e => e.date !== date)
        })
      }
    } catch (error) {
      console.error('Error deleting weight entry:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  
  setGoal: (goal) => set({ goal }),
  setMilestones: (milestones) => set({ milestones }),
  setLoading: (loading) => set({ isLoading: loading }),
  setInitialized: (initialized) => set({ isInitialized: initialized }),
  
  fetchGoal: async () => {
    try {
      const response = await fetch('/api/weight/goal')
      if (response.ok) {
        const { goal } = await response.json()
        set({ goal })
      }
    } catch (error) {
      console.error('Error fetching weight goal:', error)
    }
  },
  
  saveGoal: async (goal) => {
    try {
      const response = await fetch('/api/weight/goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal)
      })
      
      if (response.ok) {
        const { goal: savedGoal } = await response.json()
        set({ goal: savedGoal })
      }
    } catch (error) {
      console.error('Error saving weight goal:', error)
    }
  },
  
  deleteGoal: async () => {
    try {
      const response = await fetch('/api/weight/goal', {
        method: 'DELETE'
      })
      
      if (response.ok) {
        set({ goal: null })
      }
    } catch (error) {
      console.error('Error deleting weight goal:', error)
    }
  },
  
  fetchEntries: async () => {
    set({ isLoading: true })
    try {
      const response = await fetch('/api/weight/entries')
      if (response.ok) {
        const { entries } = await response.json()
        set({ entries, isInitialized: true })
      }
    } catch (error) {
      console.error('Error fetching weight entries:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  
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
}))

// Selectors for optimized re-renders
export const useWeightEntries = () => useWeightStore((state) => state.entries)
export const useWeightGoal = () => useWeightStore((state) => state.goal)
export const useWeightMilestones = () => useWeightStore((state) => state.milestones)
export const useWeightLoading = () => useWeightStore((state) => state.isLoading)
export const useWeightInitialized = () => useWeightStore((state) => state.isInitialized)
export const useWeightActions = () => {
  const store = useWeightStore()
  return {
    addEntry: store.addEntry,
    updateEntry: store.updateEntry,
    deleteEntry: store.deleteEntry,
    setGoal: store.setGoal,
    setMilestones: store.setMilestones,
    resetWeight: store.resetWeight,
    fetchEntries: store.fetchEntries,
    fetchGoal: store.fetchGoal,
    saveGoal: store.saveGoal,
    deleteGoal: store.deleteGoal
  }
}
export const useCurrentWeight = () => useWeightStore((state) => state.getCurrentWeight())
export const useFetchEntries = () => useWeightStore((state) => state.fetchEntries)

// Export individual actions for direct access
export const setGoal = (goal: WeightGoal | null) => {
  useWeightStore.getState().setGoal(goal)
}
