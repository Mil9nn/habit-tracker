'use client'

import { useState, useCallback, useEffect } from 'react'
import { Upload, X, Camera, Scale, FileText } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ProgressEntry {
  _id: string
  userId: string
  images: string[]
  weight?: number
  note?: string
  createdAt: string
}

interface ProgressUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEntryAdded: (entry: ProgressEntry) => void
  setUploading: (uploading: boolean) => void
}

const uploadPreset = 'progress_photos'

export function ProgressUploadDialog({ 
  open, 
  onOpenChange, 
  onEntryAdded, 
  setUploading 
}: ProgressUploadDialogProps) {
  const [images, setImages] = useState<File[]>([])
  const [weight, setWeight] = useState<string>('')
  const [note, setNote] = useState<string>('')
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('image/')
      )
      
      if (files.length === 0) {
        setError('Please select image files only')
        return
      }
      
      if (files.length > 3) {
        setError('Maximum 3 images allowed')
        return
      }
      
      setImages(prev => [...prev, ...files].slice(0, 3))
      setError(null)
    }
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files)
      const totalImages = images.length + files.length
      
      if (totalImages > 3) {
        setError('Maximum 3 images allowed')
        return
      }
      
      setImages(prev => [...prev, ...files].slice(0, 3))
      setError(null)
      toast.success(`${files.length} photo(s) added to upload queue`, { duration: 2000 })
    }
  }, [images])

  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (images.length === 0) {
      setError('Please select at least one image')
      return
    }

    setIsSubmitting(true)
    setUploading(true)
    setError(null)

    try {
      toast.info('Uploading progress photos...', { duration: 2000 })
      
      const formData = new FormData()
      
      // Add images
      images.forEach((image, index) => {
        formData.append(`images`, image)
      })
      
      // Add weight if provided
      if (weight) {
        formData.append('weight', weight)
      }
      
      // Add note if provided
      if (note.trim()) {
        formData.append('note', note.trim())
      }

      const response = await axios.post('/api/progress', formData)

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to upload progress entry')
      }

      onEntryAdded(response.data.entry)
      toast.success('Progress photos uploaded successfully!', { duration: 3000 })
      
      // Reset form and close dialog
      setImages([])
      setWeight('')
      setNote('')
      onOpenChange(false)
      
    } catch (err) {
      console.error('Upload error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload progress entry'
      setError(errorMessage)
      toast.error(errorMessage, { duration: 5000 })
    } finally {
      setIsSubmitting(false)
      setUploading(false)
    }
  }, [images, weight, note, onEntryAdded, setUploading, onOpenChange])

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setImages([])
      setWeight('')
      setNote('')
      setError(null)
    }
    onOpenChange(newOpen)
  }, [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-6 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div>Add Progress Entry</div>
              <div className="text-sm font-normal text-zinc-600">Upload photos and track your journey</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Share your progress with photos and optional notes
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Area */}
          <div>
            {/* Image Previews */}
            {images.length > 0 ? (
              <>
                <div className="flex items-center gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="w-fit relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-contain rounded-lg border border-zinc-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {/* Add More Images Button */}
                  {images.length < 3 && (
                    <div className="relative">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="w-full h-24 border-2 border-dashed border-zinc-300 rounded-lg flex items-center justify-center hover:border-zinc-400 transition-colors bg-zinc-50">
                        <div className="text-center">
                          <Upload className="w-6 h-6 text-zinc-400 mx-auto mb-1" />
                          <p className="text-xs text-zinc-600">Add More</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-zinc-300 hover:border-zinc-400 bg-zinc-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-zinc-700 mb-1">
                  Drag & drop your photos here
                </p>
                <p className="text-xs text-zinc-500">
                  or click to browse (max 3 images)
                </p>
              </div>
            )}
          </div>

          {/* Weight Input */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 mb-2">
              <Scale className="w-4 h-4" />
              Weight
            </label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter your weight in kg"
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 mb-2">
              <FileText className="w-4 h-4" />
              Notes
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How are you feeling? Any achievements or challenges?"
              rows={3}
              maxLength={500}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-zinc-500 mt-1">
              {note.length}/500 characters
            </p>
          </div>

          {/* Dialog Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <DialogClose asChild>
              <Button className='h-12' variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={images.length === 0 || isSubmitting}
              className="bg-blue-500 h-12 text-white hover:bg-blue-600"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  Upload
                  <Upload className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
