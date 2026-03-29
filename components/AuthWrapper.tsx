'use client'

import { SessionProvider } from 'next-auth/react'
import { useInitializeProfile } from '@/hooks/useInitializeProfile'

function ProfileInitializer({ children }: { children: React.ReactNode }) {
  // Initialize profile once at the app level
  useInitializeProfile()
  
  return <>{children}</>
}

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ProfileInitializer>
        {children}
      </ProfileInitializer>
    </SessionProvider>
  )
}
