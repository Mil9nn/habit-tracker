'use client'

import { Button } from '@/components/ui/button'
import { User2, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ProfileEmptyState() {
  const router = useRouter()

  const handleCreateProfile = () => {
    // Navigate to edit mode - the parent component will handle the state
    router.push('/profile?edit=true')
  }

  return (
    <div className="flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-4">

        {/* Content */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-[#06d6a0]">
            Answer a few quick questions
          </h2>
          
          <p className="text-gray-500 leading-relaxed">
            So we can calculate your daily calorie needs and personalize your nutrition goals.
          </p>
        </div>

        {/* Action */}
        <Button
          onClick={handleCreateProfile}
          className="bg-[#06d6a0] h-12 hover:bg-[#06d6a0]/90 text-white font-medium px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
        >
          Continue
          <ArrowRight className="size-5" />
        </Button>
      </div>
    </div>
  )
}
