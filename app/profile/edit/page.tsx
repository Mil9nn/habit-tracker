'use client'

import { useSession, signOut } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import ProfileForm from '@/components/ProfileForm'
import { useProfile } from '@/store/useProfileStore'
import { ChevronLeft } from 'lucide-react'
import Image from 'next/image'

const DynamicProfileForm = dynamic(() => import('@/components/ProfileForm'), {
  ssr: false,
  loading: () => <div className="animate-pulse">Loading profile form...</div>
})

export default function EditProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const profile = useProfile()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      setLoading(false)
    }
  }, [status])

  const handleProfileSaved = () => {
    router.push('/profile')
  }

  const handleSignOut = () => {
    signOut()
  }

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
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => router.back()} 
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Edit Profile</h1>
      </div>

      {/* Profile Form */}
      <div className="max-w-2xl">
        <DynamicProfileForm onSuccess={handleProfileSaved} />
      </div>
    </div>
  )
}
