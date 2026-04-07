'use client'

import { useCallback, memo } from 'react'
import { X, Home, ChartBar, GlassWater, UserRound, Activity } from 'lucide-react'
import Link from 'next/link'

interface SidePanelProps {
  isOpen: boolean
  onClose: () => void
}

// Navigation items configuration
const navigationItems = [
  { href: '/calorie', label: 'Home', icon: Activity },
  { href: '/weight', label: 'Weight', icon: ChartBar },
  { href: '/water', label: 'Water', icon: GlassWater },
  { href: '/profile', label: 'Profile', icon: UserRound }
] as const

// Memoized navigation link component
const NavigationLink = memo(({ 
  href, 
  label, 
  icon: Icon, 
  onClose 
}: {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string; size?: number }>
  onClose: () => void
}) => {
  const handleClick = useCallback(() => {
    onClose()
  }, [onClose])

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-800 transition-colors duration-200 text-zinc-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:ring-offset-2 focus:ring-offset-zinc-900"
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </Link>
  )
})

NavigationLink.displayName = 'NavigationLink'

export default function SidePanel({ isOpen, onClose }: SidePanelProps) {
  // Memoize backdrop click handler
  const handleBackdropClick = useCallback(() => {
    onClose()
  }, [onClose])

  // Memoize close button handler
  const handleCloseClick = useCallback(() => {
    onClose()
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-all duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleBackdropClick}
        aria-hidden={isOpen}
      />

      {/* Side Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-zinc-900 border-r border-zinc-800 shadow-2xl z-50 transform transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidepanel-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 640 640" 
                className="h-6 w-6 text-white fill-current"
                aria-hidden="true"
              >
                <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="80%" stopColor="#6366f1" />
                </linearGradient>
                <path
                  fill="url(#iconGradient)"
                  d="M320 176C311.2 176 304 168.8 304 160L304 144C304 99.8 339.8 64 384 64L400 64C408.8 64 416 71.2 416 80L416 96C416 140.2 380.2 176 336 176L320 176zM96 352C96 275.7 131.7 192 208 192C235.3 192 267.7 202.3 290.7 211.3C309.5 218.6 330.6 218.6 349.4 211.3C372.3 202.4 404.8 192 432.1 192C508.4 192 544.1 275.7 544.1 352C544.1 480 464.1 576 384.1 576C367.6 576 346 569.4 332.6 564.7C324.5 561.9 315.7 561.9 307.6 564.7C294.2 569.4 272.6 576 256.1 576C176.1 576 96.1 480 96.1 352z"
                />
              </svg>
            </div>
            <div>
              <h2 id="sidepanel-title" className="text-xl font-semibold text-white">
                <><span className="text-blue-600">Calo</span><span className="text-red-600">Mind</span></>
              </h2>
              <p className="text-sm text-zinc-400">Track your journey</p>
            </div>
          </div>
          
          <button
            onClick={handleCloseClick}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:ring-offset-2 focus:ring-offset-zinc-900"
            aria-label="Close side panel"
          >
            <X className="h-5 w-5 text-zinc-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1" role="navigation" aria-label="Main navigation">
          {navigationItems.map((item) => (
            <NavigationLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              onClose={onClose}
            />
          ))}
        </nav>
      </div>
    </>
  )
}
