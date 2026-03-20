'use client'

import { useSession } from 'next-auth/react'
import { Utensils } from 'lucide-react'

interface HeaderProps {
  title?: string
}

export default function Header({ title = "Calorie Tracker" }: HeaderProps) {
  const { data: session } = useSession()

  return (
    <header className="bg-yellow-400 backdrop-blur-md shadow-sm border-b border-yellow-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          </div>

          {/* Profile Avatar - Direct Link */}
          <a
            href="/profile"
            className="flex items-center justify-center rounded-full p-2 hover:bg-yellow-50 transition-all duration-200"
          >
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-yellow-200"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white text-sm font-semibold">
                {session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
              </div>
            )}
          </a>
        </div>
      </div>
    </header>
  )
}
