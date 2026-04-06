'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import UpdateProfileForm from '@/components/UpdateProfileForm'
import { useProfile } from '@/store/useProfileStore'
import MainLayout from '@/app/layout/MainLayout'
import Loader from '@/components/Loader'

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

  if (status === 'loading') {
    return (
      <div className="min-h-screen text-[#f4f1de] p-4 md:p-8">
        <div className="animate-pulse text-center">Loading...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-[#06d6a0] p-4 md:p-8">
        <div className="animate-pulse text-center">Loading profile...</div>
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-white px-4 md:px-8 py-6 md:py-10">
        <div className="max-w-2xl">
          <UpdateProfileForm onSuccess={handleProfileSaved} />
        </div>
      </div>
    </MainLayout>
  )
}
