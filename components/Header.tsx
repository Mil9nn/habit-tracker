'use client'

import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { useProfile, useProfileInitialized } from '@/store/useProfileStore'
import { useState, useEffect } from 'react'
import SidePanel from './SidePanel'

interface HeaderProps {
  title?: string
}

export default function Header({ title = "CaloMind" }: HeaderProps) {
  const { data: session } = useSession()
  const profile = useProfile()
  const isInitialized = useProfileInitialized()
  const [profileLink, setProfileLink] = useState('/profile')
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)

  useEffect(() => {
    // Wait for initialization to complete before determining the profile link
    if (isInitialized) {
      if (!profile) {
        setProfileLink('/profile/edit')
      } else {
        setProfileLink('/profile')
      }
    }
  }, [profile, isInitialized])

  const formatTitle = (title: string) => {
    if (title === "CaloMind") {
      return <><span className="text-blue-600">Calo</span><span className="text-red-600">Mind</span></>
    }
    return title
  }

  return (
    <>
      <header className="bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div 
              className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity duration-200"
              onClick={() => setIsSidePanelOpen(true)}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="h-6 w-6 text-white fill-current">
                  <path d="M320 176C311.2 176 304 168.8 304 160L304 144C304 99.8 339.8 64 384 64L400 64C408.8 64 416 71.2 416 80L416 96C416 140.2 380.2 176 336 176L320 176zM96 352C96 275.7 131.7 192 208 192C235.3 192 267.7 202.3 290.7 211.3C309.5 218.6 330.6 218.6 349.4 211.3C372.3 202.4 404.8 192 432.1 192C508.4 192 544.1 275.7 544.1 352C544.1 480 464.1 576 384.1 576C367.6 576 346 569.4 332.6 564.7C324.5 561.9 315.7 561.9 307.6 564.7C294.2 569.4 272.6 576 256.1 576C176.1 576 96.1 480 96.1 352z"/>
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-white tracking-tight">{formatTitle(title)}</h1>
            </div>

            {/* Profile Avatar - Smart Link */}
            <a
              href={profileLink}
              className="flex items-center justify-center rounded-full p-2 hover:bg-zinc-800 transition-all duration-200"
            >
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="rounded-full object-cover"
                  width={36}
                  height={36}
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                  {session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
                </div>
              )}
            </a>
          </div>
        </div>
      </header>

      {/* Side Panel */}
      <SidePanel isOpen={isSidePanelOpen} onClose={() => setIsSidePanelOpen(false)} />
    </>
  )
}
