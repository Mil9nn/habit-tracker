'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import MainLayout from '../layout/MainLayout'
import ProfileDisplay from '@/components/ProfileDisplay'
import { Edit, LogOut } from 'lucide-react'
import { useProfile, useCalorieGoal, useProteinGoal, useCarbsGoal, useFatGoal, useProfileInitialized } from '@/store/useProfileStore'
import dynamic from 'next/dynamic'
import Loader from '@/components/Loader'
import Link from 'next/link'

const ProfileForm = dynamic(() => import('@/components/ProfileForm'), {
  ssr: false,
})

function ProfilePageContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [calories, setCalories] = useState({ consumed: 0, goal: 0 })

  // Use Zustand store for profile and macro goals
  const profile = useProfile()
  const isInitialized = useProfileInitialized()
  const calorieGoal = useCalorieGoal()
  const proteinGoal = useProteinGoal()
  const carbsGoal = useCarbsGoal()
  const fatGoal = useFatGoal()

  useEffect(() => {
    if (status === 'authenticated') {
      // Fetch today's calories
      fetchTodayCalories()
      setLoading(false)
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status])

  useEffect(() => {
    // Only redirect to edit if initialization is complete AND no profile exists
    if (status === 'authenticated' && isInitialized && !profile) {
      router.push('/profile/edit')
    }
  }, [status, profile, isInitialized, router])

  const fetchTodayCalories = async () => {
    try {
      const response = await fetch('/api/calories/summary')
      if (response.ok) {
        const data = await response.json()
        setCalories({
          consumed: data.consumed || 0,
          goal: data.goal || profile?.calorieGoal || 0
        })
      }
    } catch (error) {
      console.error('Error fetching calories:', error)
      setCalories({ consumed: 0, goal: profile?.calorieGoal || 0 })
    }
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-50px)]">
        <Loader />
      </div>
    )
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center text-black">Initializing profile...</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-zinc-900 to-zinc-800 flex items-center justify-center">
        <div className="animate-pulse text-center text-black">Loading profile...</div>
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-light text-black tracking-tight">Profile</h1>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-800 mt-1">Manage your personal information and goals</p>

              <Link
                href="/profile/edit"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-white/10 rounded-lg transition-colors border border-white/20"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>
            </div>
          </div>

          {/* Main Content */}
          {profile ? (

            <ProfileDisplay />

          ) : (
            <div className="flex items-center justify-center min-h-[50vh]">
              <p className="text-gray-400">Loading profile...</p>
            </div>
          )}

          {/* Logout Section */}
          <div className="mt-10 pt-5 border-t border-white/20">
            <div className="flex justify-end">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-3 bg-zinc-200 border-2 border-zinc-200 text-sm text-red-400 hover:text-red-500 rounded-xl transition-colors hover:border-red-400"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-center text-black">Loading...</div>
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  )
}
