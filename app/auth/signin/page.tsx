'use client'

import { signIn } from 'next-auth/react'
import { Button } from "@/components/ui/button"

export default function SignIn() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center">
      <div className="text-center p-6">
        <div className="p-8 max-w-sm mx-auto">
          <div className="flex items-center gap-2 mb-4 bg-gradient-to-r from-blue-500 to-red-500 shadow-md ring-2 ring-white rounded-full">
            <div className="w-12 h-12 shadow-lg ring-2 ring-white bg-gradient-to-br from-blue-400 to-red-500 rounded-2xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="size-6 text-white fill-current">
                <path d="M320 176C311.2 176 304 168.8 304 160L304 144C304 99.8 339.8 64 384 64L400 64C408.8 64 416 71.2 416 80L416 96C416 140.2 380.2 176 336 176L320 176zM96 352C96 275.7 131.7 192 208 192C235.3 192 267.7 202.3 290.7 211.3C309.5 218.6 330.6 218.6 349.4 211.3C372.3 202.4 404.8 192 432.1 192C508.4 192 544.1 275.7 544.1 352C544.1 480 464.1 576 384.1 576C367.6 576 346 569.4 332.6 564.7C324.5 561.9 315.7 561.9 307.6 564.7C294.2 569.4 272.6 576 256.1 576C176.1 576 96.1 480 96.1 352z"/>
              </svg>
            </div>
            <h1 className="text-lg font-bold text-white">
              <span className="text-blue-100">Calo</span><span className="text-red-100">Mind</span>
            </h1>
          </div>
          <p className="text-gray-600 mb-6">Track your daily nutrition with precision and clarity.</p>
          <Button
            onClick={() => signIn('google', { callbackUrl: '/profile?edit=true' })}
            className="w-full h-12 rounded-full shadow-md bg-white hover:scale-105 active:scale-95 ease-in-out text-zinc-700 font-bold transition-all duration-300 flex items-center justify-center gap-2"
          >
            <img src="/google.svg" alt="Google" className="h-5 w-5" />
            <span className="tracking-tighter">Sign in with Google</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
