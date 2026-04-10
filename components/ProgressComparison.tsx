'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { X, ArrowLeft, ArrowRight, Scale, Calendar } from 'lucide-react'
import Image from 'next/image'

interface ProgressEntry {
  _id: string
  userId: string
  images: string[]
  weight?: number
  note?: string
  createdAt: string
}

interface ProgressComparisonProps {
  entries: ProgressEntry[]
  selectedEntries: ProgressEntry[]
  onSelectionChange: (entries: ProgressEntry[]) => void
}

export function ProgressComparison({ 
  entries, 
  selectedEntries, 
  onSelectionChange 
}: ProgressComparisonProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  const beforeEntry = selectedEntries[0]
  const afterEntry = selectedEntries[1]

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    updateSliderPosition(e.clientX)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      updateSliderPosition(e.clientX)
    }
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true)
    updateSliderPosition(e.touches[0].clientX)
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging) {
      updateSliderPosition(e.touches[0].clientX)
    }
  }, [isDragging])

  const updateSliderPosition = useCallback((clientX: number) => {
    if (!sliderRef.current) return
    
    const rect = sliderRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    
    setSliderPosition(percentage)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove)
      document.addEventListener('touchend', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove])

  const navigateImages = useCallback((direction: 'prev' | 'next') => {
    const maxImages = Math.max(beforeEntry?.images.length || 0, afterEntry?.images.length || 0)
    
    if (direction === 'prev') {
      setCurrentImageIndex(prev => (prev - 1 + maxImages) % maxImages)
    } else {
      setCurrentImageIndex(prev => (prev + 1) % maxImages)
    }
  }, [beforeEntry?.images.length, afterEntry?.images.length])

  const clearSelection = useCallback(() => {
    onSelectionChange([])
  }, [onSelectionChange])

  if (!beforeEntry || !afterEntry) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-zinc-200">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Scale className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">
            Compare Your Progress
          </h3>
          <p className="text-zinc-600 mb-4">
            Select 2 entries from your timeline to see your transformation
          </p>
          <div className="text-sm text-zinc-500">
            Select entries using the checkboxes in the timeline
          </div>
        </div>
      </div>
    )
  }

  const beforeImage = beforeEntry.images[currentImageIndex]
  const afterImage = afterEntry.images[currentImageIndex]
  const hasMoreImages = Math.max(beforeEntry.images.length, afterEntry.images.length) > 1

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-zinc-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-zinc-900">Progress Comparison</h3>
            <p className="text-sm text-zinc-600">See your transformation over time</p>
          </div>
        </div>
        
        <button
          onClick={clearSelection}
          className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
          title="Clear comparison"
        >
          <X className="w-5 h-5 text-zinc-500" />
        </button>
      </div>

      {/* Entry Info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-900 mb-1">Before</p>
          <p className="text-xs text-blue-700">
            {format(new Date(beforeEntry.createdAt), 'MMM d, yyyy')}
          </p>
          {beforeEntry.weight && (
            <p className="text-sm font-semibold text-blue-900 mt-2">
              {beforeEntry.weight} kg
            </p>
          )}
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-sm font-medium text-green-900 mb-1">After</p>
          <p className="text-xs text-green-700">
            {format(new Date(afterEntry.createdAt), 'MMM d, yyyy')}
          </p>
          {afterEntry.weight && (
            <p className="text-sm font-semibold text-green-900 mt-2">
              {afterEntry.weight} kg
              {beforeEntry.weight && (
                <span className="text-xs font-normal ml-1">
                  ({afterEntry.weight - beforeEntry.weight > 0 ? '+' : ''}
                  {(afterEntry.weight - beforeEntry.weight).toFixed(1)} kg)
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Image Comparison Slider */}
      <div className="relative mb-4" ref={sliderRef}>
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-zinc-100">
          {/* Before Image */}
          <div className="absolute inset-0">
            {beforeImage && (
              <Image
                src={beforeImage}
                alt="Before"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 80vw"
              />
            )}
          </div>
          
          {/* After Image (clipped) */}
          <div 
            className="absolute inset-0"
            style={{
              clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
            }}
          >
            {afterImage && (
              <Image
                src={afterImage}
                alt="After"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 80vw"
              />
            )}
          </div>
          
          {/* Slider Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
            style={{ left: `${sliderPosition}%` }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
              <div className="w-6 h-0.5 bg-zinc-400"></div>
            </div>
          </div>
          
          {/* Labels */}
          <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Before
          </div>
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            After
          </div>
        </div>
      </div>

      {/* Image Navigation */}
      {hasMoreImages && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateImages('prev')}
            className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 transition-colors"
            title="Previous image"
          >
            <ArrowLeft className="w-4 h-4 text-zinc-700" />
          </button>
          
          <span className="text-sm text-zinc-600">
            Image {currentImageIndex + 1} of {Math.max(beforeEntry.images.length, afterEntry.images.length)}
          </span>
          
          <button
            onClick={() => navigateImages('next')}
            className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 transition-colors"
            title="Next image"
          >
            <ArrowRight className="w-4 h-4 text-zinc-700" />
          </button>
        </div>
      )}

      {/* Notes Comparison */}
      {(beforeEntry.note || afterEntry.note) && (
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-zinc-200">
          {beforeEntry.note && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs font-medium text-blue-700 mb-1">Before Notes:</p>
              <p className="text-sm text-blue-900">{beforeEntry.note}</p>
            </div>
          )}
          
          {afterEntry.note && (
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs font-medium text-green-700 mb-1">After Notes:</p>
              <p className="text-sm text-green-900">{afterEntry.note}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
