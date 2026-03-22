'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import ProfileDisplay from '@/components/ProfileDisplay'
import { Progress } from "@/components/ui/progress"
import { motion } from 'framer-motion'
import { ChevronLeft, Edit, Flame, Target, TrendingUp, Droplets, Home } from 'lucide-react'
import { useProfile, useCalorieGoal, useProteinGoal, useCarbsGoal, useFatGoal, useProfileStore } from '@/store/useProfileStore'
import Image from 'next/image'
import dynamic from 'next/dynamic'

const ProfileForm = dynamic(() => import('@/components/ProfileForm'), {
  ssr: false,
  loading: () => <div className="animate-pulse">Loading profile form...</div>
})

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [calories, setCalories] = useState({ consumed: 0, goal: 0 })

  // Use Zustand store for profile and macro goals
  const profile = useProfile()
  const calorieGoal = useCalorieGoal()
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
      setLoading(false)
    }
  }, [status, searchParams])

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
      console.error('Error fetching profile:', error)
    }
  }

  const handleProfileUpdate = () => {
    setIsEditing(true)
  }

  const handleProfileSaved = () => {
    setIsEditing(false)
    router.push('/')
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  // Animation variants
  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: "easeOut" },
  })

  const stats = [
    { label: "Daily Calories", value: calories.consumed || 0, icon: Flame, color: "text-orange-400", bg: "bg-orange-400/10" },
    { label: "Protein Goal", value: `${proteinGoal}g`, icon: Target, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Carbs Goal", value: `${carbsGoal}g`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Fat Goal", value: `${fatGoal}g`, icon: Droplets, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  ]

  const badges = [
    { label: "Profile Complete", icon: "🎯" },
    { label: "7-Day Streak", icon: "🔥" },
    { label: "Macro Master", icon: "🏆" },
  ]

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-pulse text-center text-indigo-600">Loading...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    redirect('/auth/signin')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-pulse text-center text-indigo-600">Loading profile...</div>
      </div>
    )
  }

  return (
    <div>
      {profile ? (
        <ProfileDisplay dailyCalories={calories.consumed} />
      ) : (
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-gray-500">No profile found</p>
        </div>
      )}
    </div>
  )
}
