'use client'

import { signIn } from 'next-auth/react'
import { Utensils } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function SignIn() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-50 flex items-center justify-center">
      <div className="text-center p-6">
        <div className="p-8 max-w-sm mx-auto">
          <div className="flex items-center gap-2 mb-4 bg-yellow-500 shadow-md ring-2 ring-white rounded-full">
            <div className="w-12 h-12 shadow-lg ring-2 ring-white bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center">
              <Utensils className="size-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">
              Calorie Tracker
            </h1>
          </div>
          <p className="text-gray-600 mb-6">Track your daily nutrition with precision and clarity.</p>
          <Button
            onClick={() => signIn('google', { callbackUrl: '/profile?edit=true' })}
            className="w-full h-12 rounded-full shadow-md bg-white hover:bg-yellow-50 text-zinc-700 font-bold transition-all duration-300 flex items-center justify-center gap-2"
          >
            <img src="/google.svg" alt="Google" className="h-5 w-5" />
            <span className="tracking-tighter">Sign in with Google</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
