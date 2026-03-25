import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { Session } from 'next-auth'

// Types
export interface User {
  id: string
  email: string
  name?: string
  image?: string
}

export interface AuthState {
  // State
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

// Create the store
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,

        // Actions
        setUser: (user) => 
          set(
            { 
              user, 
              isAuthenticated: !!user 
            },
            false,
            'setUser'
          ),

        setSession: (session) => {
          const user = session?.user ? {
            id: session.user.email || '', // Use email as id since NextAuth user doesn't have id field
            email: session.user.email || '',
            name: session.user.name || undefined,
            image: session.user.image || undefined,
          } : null
          
          set(
            { 
              session, 
              user, 
              isAuthenticated: !!session?.user 
            },
            false,
            'setSession'
          )
        },

        setLoading: (isLoading) => 
          set({ isLoading }, false, 'setLoading'),

        logout: () => 
          set(
            { 
              user: null, 
              session: null, 
              isAuthenticated: false,
              isLoading: false 
            },
            false,
            'logout'
          ),

      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
)

// Selectors for optimized re-renders
export const useUser = () => useAuthStore((state) => state.user)
export const useSession = () => useAuthStore((state) => state.session)
export const useIsLoading = () => useAuthStore((state) => state.isLoading)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useAuthActions = () => useAuthStore((state) => ({
  setUser: state.setUser,
  setSession: state.setSession,
  setLoading: state.setLoading,
  logout: state.logout,
}))
