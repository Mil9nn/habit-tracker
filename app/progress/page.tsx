'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import MainLayout from '../layout/MainLayout'
import { ProgressTimeline } from '@/components/ProgressTimeline'
import { ProgressUploadDialog } from '@/components/ProgressUploadDialog'
import { ProgressComparison } from '@/components/ProgressComparison'
import Loader from '@/components/Loader'
import { Plus, Camera, CirclePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProgressEntry {
  _id: string
  userId: string
  images: string[]
  weight?: number
  note?: string
  createdAt: string
}

interface ProgressResponse {
  entries: ProgressEntry[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function ProgressPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [entries, setEntries] = useState<ProgressEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedEntries, setSelectedEntries] = useState<ProgressEntry[]>([])
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/progress?limit=20')
      if (!response.ok) {
        throw new Error('Failed to fetch progress entries')
      }

      const data: ProgressResponse = await response.json()
      setEntries(data.entries)
    } catch (err) {
      console.error('Error fetching progress entries:', err)
      setError(err instanceof Error ? err.message : 'Failed to load progress')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchEntries()
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, fetchEntries])

  const handleEntryAdded = useCallback((newEntry: ProgressEntry) => {
    setEntries(prev => [newEntry, ...prev])
  }, [])

  const handleEntryDeleted = useCallback((deletedId: string) => {
    setEntries(prev => prev.filter(entry => entry._id !== deletedId))
    setSelectedEntries(prev => prev.filter(entry => entry._id !== deletedId))
  }, [])

  if (status === 'loading' || loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader />
        </div>
      </MainLayout>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with Upload Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="">
            <h1 className="text-xl font-bold text-zinc-900 mb-2">
              Visual Progress Timeline
            </h1>
            <p className="text-zinc-600 text-sm">
              Track your transformation journey with photos and milestones
            </p>
          </div>
          <Button
            onClick={() => setIsUploadDialogOpen(true)}
            className="bg-blue-500 h-12 rounded-full text-white hover:from-blue-600 flex items-center gap-2"
          >
            <CirclePlus className="w-4 h-4" />
            Add
          </Button>
        </div>

        {/* Upload Dialog */}
        <ProgressUploadDialog
          open={isUploadDialogOpen}
          onOpenChange={setIsUploadDialogOpen}
          onEntryAdded={handleEntryAdded}
          setUploading={setUploading}
        />

        {/* Comparison Section */}
        {entries.length >= 2 && (
          <div className="mb-12">
            <ProgressComparison
              entries={entries}
              selectedEntries={selectedEntries}
              onSelectionChange={setSelectedEntries}
            />
          </div>
        )}

        {/* Timeline */}
        {entries.length === 0 && !loading ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
              <div className="animate-pulse bg-zinc-200 rounded-full w-16 h-16 flex items-center justify-center">
                🚀
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-zinc-700 mb-2">
              Start tracking your transformation
            </h2>
            <p className="text-zinc-500 text-sm max-w-md mx-auto">
              Upload your first progress photo to begin your journey. Track your weight, add notes, and watch your transformation over time.
            </p>
          </div>
        ) : (
          <ProgressTimeline
            entries={entries}
            loading={loading}
            onEntryDeleted={handleEntryDeleted}
            selectedEntries={selectedEntries}
            onSelectionChange={setSelectedEntries}
          />
        )}

        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            {error}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
