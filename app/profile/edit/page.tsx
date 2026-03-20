'use client'

import { useSession, signOut } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProfileForm from '@/components/ProfileForm'
import { useProfile } from '@/store/useProfileStore'
import { ChevronLeft } from 'lucide-react'
import Image from 'next/image'

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
      {/* Container */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* Back Arrow */}
            <button
              onClick={() => router.push("/profile")}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center group"
              title="Go back to profile"
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
                  <p className="text-sm text-[#06d6a0]/60">Edit Profile</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="max-w-2xl">
          <ProfileForm onSave={handleProfileSaved} />
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="w-full bg-white/70 backdrop-blur-xl hover:bg-white/80 text-[#ef476f] border border-white/40 rounded-xl p-4 transition-colors shadow-[0_8px_25px_rgba(0,0,0,0.08)]"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
