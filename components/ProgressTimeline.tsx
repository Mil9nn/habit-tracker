'use client'

import { useState, useCallback } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { Trash2, Calendar, Scale, FileText, Check, X } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

interface ProgressEntry {
  _id: string
  userId: string
  images: string[]
  weight?: number
  note?: string
  createdAt: string
}

interface ProgressTimelineProps {
  entries: ProgressEntry[]
  loading: boolean
  onEntryDeleted: (id: string) => void
  selectedEntries: ProgressEntry[]
  onSelectionChange: (entries: ProgressEntry[]) => void
}

export function ProgressTimeline({ 
  entries, 
  loading, 
  onEntryDeleted, 
  selectedEntries, 
  onSelectionChange 
}: ProgressTimelineProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())
  const [isOpen, setIsOpen] = useState(false)
  const [idToDelete, setIdToDelete] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)

  const handleDelete = useCallback(async (id: string) => {
    setIdToDelete(id)
    setIsOpen(true)
  }, [idToDelete, onEntryDeleted])

  const handleConfirmDelete = useCallback(async () => {
    if (!idToDelete) return

    setDeletingId(idToDelete)
    
    try {
      const response = await fetch(`/api/progress/${idToDelete}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete progress entry')
      }

      onEntryDeleted(idToDelete)
      toast.success('Progress entry deleted successfully')
    } catch (error) {
      console.error('Error deleting entry:', error)
      toast.error('Failed to delete progress entry')
    } finally {
      setDeletingId(null)
      setIsOpen(false)
      setIdToDelete(null)
    }
  }, [idToDelete, onEntryDeleted])

  const toggleExpanded = useCallback((id: string) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  const toggleSelection = useCallback((entry: ProgressEntry) => {
    const isSelected = selectedEntries.some(e => e._id === entry._id)
    
    if (isSelected) {
      onSelectionChange(selectedEntries.filter(e => e._id !== entry._id))
    } else {
      if (selectedEntries.length < 2) {
        onSelectionChange([...selectedEntries, entry])
      } else {
        // Replace the first selected entry
        onSelectionChange([selectedEntries[1], entry])
      }
    }
  }, [selectedEntries, onSelectionChange])

  const handleImageClick = useCallback((image: string) => {
    setSelectedImage(image)
    setIsImageDialogOpen(true)
  }, [])

  const groupEntriesByMonth = useCallback((entries: ProgressEntry[]) => {
    const groups: { [key: string]: ProgressEntry[] } = {}
    
    entries.forEach(entry => {
      const date = new Date(entry.createdAt)
      const monthKey = format(date, 'MMMM yyyy')
      
      if (!groups[monthKey]) {
        groups[monthKey] = []
      }
      groups[monthKey].push(entry)
    })
    
    return groups
  }, [])

  const monthlyGroups = groupEntriesByMonth(entries)

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-zinc-200 animate-pulse">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-zinc-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-zinc-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-zinc-200 rounded w-24"></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="w-full h-24 bg-zinc-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-3 bg-zinc-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-zinc-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {Object.entries(monthlyGroups).map(([month, monthEntries]) => (
        <div key={month}>
          <h3 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-zinc-600" />
            {month}
            <span className="text-sm font-normal text-zinc-500">
              ({monthEntries.length} entries)
            </span>
          </h3>
          
          <div className="space-y-4">
            {monthEntries.map((entry) => (
              <div
                key={entry._id}
                className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Entry Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {format(new Date(entry.createdAt), 'd')}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900">
                            {format(new Date(entry.createdAt), 'EEEE, MMMM d, yyyy')}
                          </p>
                          <p className="text-sm text-zinc-500">
                            {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      
                      {/* Weight Display */}
                      {entry.weight && (
                        <div className="flex items-center gap-2 text-sm text-zinc-600 mb-2">
                          <Scale className="w-4 h-4" />
                          <span className="font-medium">{entry.weight} kg</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {/* Compare Checkbox */}
                      <button
                        onClick={() => toggleSelection(entry)}
                        className={`p-2 rounded-lg border transition-colors ${
                          selectedEntries.some(e => e._id === entry._id)
                            ? 'bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-zinc-300 text-zinc-500 hover:border-zinc-400'
                        }`}
                        title={selectedEntries.some(e => e._id === entry._id) ? 'Remove from comparison' : 'Add to comparison'}
                      >
                        {selectedEntries.some(e => e._id === entry._id) ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-current rounded" />
                        )}
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(entry._id)}
                        disabled={deletingId === entry._id}
                        className="p-2 rounded-lg border border-red-300 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Delete entry"
                      >
                        {deletingId === entry._id ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Images Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {entry.images.slice(0, 3).map((image, index) => (
                      <div key={index} className="relative group">
                        <div 
                          className="aspect-square overflow-hidden border border-zinc-200 cursor-pointer"
                          onClick={() => handleImageClick(image)}
                        >
                          <Image
                            src={image}
                            alt={`Progress photo ${index + 1}`}
                            fill
                            className="object-cover rounded-sm group-hover:scale-105 transition-transform duration-200"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                        {entry.images.length > 3 && index === 2 && (
                          <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center pointer-events-none">
                            <span className="text-white font-semibold">
                              +{entry.images.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Notes */}
                  {entry.note && (
                    <div className="flex items-start gap-2 text-sm text-zinc-600">
                      <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-zinc-700">{entry.note}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Expand/Collapse for more images */}
                  {entry.images.length > 3 && (
                    <button
                      onClick={() => toggleExpanded(entry._id)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-3"
                    >
                      {expandedEntries.has(entry._id) ? 'Show less' : `Show all ${entry.images.length} images`}
                    </button>
                  )}
                </div>
                
                {/* Expanded Images */}
                {expandedEntries.has(entry._id) && entry.images.length > 3 && (
                  <div className="border-t border-zinc-200 p-6">
                    <div className="grid grid-cols-3 gap-3">
                      {entry.images.slice(3).map((image, index) => (
                        <div 
                          key={index} 
                          className="aspect-square overflow-hidden border border-zinc-200 cursor-pointer"
                          onClick={() => handleImageClick(image)}
                        >
                          <Image
                            src={image}
                            alt={`Progress photo ${index + 4}`}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-200"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {/* Delete Confirmation Dialog */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 border border-zinc-200">
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
              Delete Progress Entry
            </h3>
            <p className="text-sm text-zinc-600 mb-6">
              Are you sure you want to delete this progress entry? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsOpen(false)
                  setIdToDelete(null)
                }}
                className="px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deletingId !== null}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingId ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </div>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Image Dialog */}
      {isImageDialogOpen && selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setIsImageDialogOpen(false)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage}
              alt="Full size progress photo"
              width={1200}
              height={800}
              className="max-w-full max-h-[90vh] object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
            <button
              onClick={() => setIsImageDialogOpen(false)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-zinc-100 transition-colors"
            >
              <X className="w-4 h-4 text-zinc-700" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
