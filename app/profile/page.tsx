'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import ProfileDisplay from '@/components/ProfileDisplay'
import ProfileEmptyState from '@/components/ProfileEmptyState'
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, Edit } from 'lucide-react'
import { useProfile, useProteinGoal, useCarbsGoal, useFatGoal, useProfileStore } from '@/store/useProfileStore'
import Image from 'next/image'
import ProfileForm from '@/components/ProfileForm'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [calories, setCalories] = useState({ consumed: 0, goal: 0 })

  // Use Zustand store for profile and macro goals
  const profile = useProfile()
  const proteinGoal = useProteinGoal()
  const carbsGoal = useCarbsGoal()
  const fatGoal = useFatGoal()

  // Get store actions and state in one call to avoid multiple instances
  const store = useProfileStore()
  const setProfile = store.setProfile
  const calculateMetrics = store.calculateMetrics

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile()
      fetchTodayCalories()

      // Check if edit mode is requested via URL
      const editMode = searchParams.get('edit')
      if (editMode === 'true') {
        setIsEditing(true)
      }
    }
  }, [status, searchParams])

  // Redirect users with complete profiles directly to home page
  useEffect(() => {
    if (profile && profile.age && profile.weight && profile.height && !isEditing) {
      router.push('/')
    }
  }, [profile, isEditing, router])

  const fetchTodayCalories = async () => {
    try {
      const response = await fetch('/api/calories/summary')
      if (response.ok) {
        const data = await response.json()
        setCalories({
          consumed: data.consumed || 0,
          goal: data.goal || profile?.calorieGoal || 0 // Use profile goal instead of dummy data
        })
      }
    } catch (error) {
      console.error('Error fetching calories:', error)
      setCalories({ consumed: 0, goal: profile?.calorieGoal || 0 })
    }
  }

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')

      if (response.ok) {
        const data = await response.json()

        if (data.profile) {
          setProfile(data.profile)
          calculateMetrics()
        }
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = () => {
    setIsEditing(true)
  }

  const handleProfileSaved = () => {

    setIsEditing(false)

    window.history.replaceState({}, '', '/profile')

    fetchProfile()
    fetchTodayCalories()
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  // Calculate percentage of daily calorie goal
  const percentage = calories.goal > 0 ? Math.round((calories.consumed / calories.goal) * 100) : 0

  // Calculate BMR and daily calories for display
  const bmr = profile ? Math.round(
    (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age) +
    (profile.gender === 'male' ? 5 : -161)
  ) : 0

  const dailyCalories = profile?.calorieGoal || 0

  if (status === 'loading') {
    return (
      <div className="min-h-screen text-[#f4f1de] p-4 md:p-8">
        <div className="animate-pulse text-center">Loading...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    redirect('/auth/signin')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-[#06d6a0] p-4 md:p-8">
        <div className="animate-pulse text-center">Loading profile...</div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-white px-4 md:px-8 py-6 md:py-10">
      {/* Container */}
      <div className="space-y-6">
        {/* 🔥 Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* Back Arrow */}
            <button
              onClick={() => router.push("/")}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center group"
              title="Go back"
            >
              <ChevronLeft className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
            </button>

            <div className="w-full flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Image
                  src={session?.user?.image || ''}
                  alt="Profile Avatar"
                  className="rounded-full border-2 border-[#06d6a0]/20 shadow-[0_8px_25px_rgba(0,0,0,0.08)] object-cover"
                  width={40}
                  height={40}
                />
                <div>
                  <h1 className="text-sm font-semibold text-[#06d6a0]">{session?.user?.name || 'User'}</h1>
                  <p className="text-sm text-[#06d6a0]/60">Dashboard</p>
                </div>
              </div>

              {/* Edit Button - Only show when not editing and profile exists */}
              {!isEditing && profile && (
                <button
                  onClick={handleProfileUpdate}
                  className="flex items-center gap-2 p-2 rounded-xl bg-[#06d6a0] text-black text-sm font-medium hover:opacity-90 transition shadow-sm"
                >
                  <Edit className="w-4 h-4" />
                  <span className='hidden sm:block'>Update Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>

        
          <div className="space-y-6">
            {isEditing ? (
              <ProfileForm />
            ) : profile ? (
              /* Profile Exists: Show Profile Display */
              <ProfileDisplay
                dailyCalories={dailyCalories}
              />
            ) : (
              /* No Profile: Show Empty State */
              <ProfileEmptyState />
            )}
          </div>
      </div>
    </div>
  )
}

