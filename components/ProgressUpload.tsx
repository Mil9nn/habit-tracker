'use client'

import { useState, useCallback } from 'react'
import { Upload, X, Camera, Scale, FileText } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'

interface ProgressEntry {
  _id: string
  userId: string
  images: string[]
  weight?: number
  note?: string
  createdAt: string
}

interface ProgressUploadProps {
  onEntryAdded: (entry: ProgressEntry) => void
  setUploading: (uploading: boolean) => void
}

const uploadPreset = 'progress_photos'

export function ProgressUpload({ onEntryAdded, setUploading }: ProgressUploadProps) {
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

      // Check file sizes (max 5MB per file, max 10MB total)
      const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
      const MAX_TOTAL_SIZE = 10 * 1024 * 1024 // 10MB
      
      const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE)
      if (oversizedFiles.length > 0) {
        setError(`Files larger than 5MB not allowed. ${oversizedFiles.map(f => f.name).join(', ')}`)
        return
      }
      
      const currentTotalSize = images.reduce((sum, img) => sum + img.size, 0)
      const newFilesTotalSize = files.reduce((sum, file) => sum + file.size, 0)
      const totalSize = currentTotalSize + newFilesTotalSize
      
      if (totalSize > MAX_TOTAL_SIZE) {
        setError(`Total upload size cannot exceed 10MB. Current: ${(currentTotalSize / 1024 / 1024).toFixed(1)}MB`)
        return
      }
      
      setImages(prev => [...prev, ...files].slice(0, 3))
      setError(null)
    }
  }, [images])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files)
      const totalImages = images.length + files.length
      
      if (totalImages > 3) {
        setError('Maximum 3 images allowed')
        return
      }

      // Check file sizes (max 5MB per file, max 10MB total)
      const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
      const MAX_TOTAL_SIZE = 10 * 1024 * 1024 // 10MB
      
      const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE)
      if (oversizedFiles.length > 0) {
        setError(`Files larger than 5MB not allowed. ${oversizedFiles.map(f => f.name).join(', ')}`)
        return
      }
      
      const currentTotalSize = images.reduce((sum, img) => sum + img.size, 0)
      const newFilesTotalSize = files.reduce((sum, file) => sum + file.size, 0)
      const totalSize = currentTotalSize + newFilesTotalSize
      
      if (totalSize > MAX_TOTAL_SIZE) {
        setError(`Total upload size cannot exceed 10MB. Current: ${(currentTotalSize / 1024 / 1024).toFixed(1)}MB`)
        return
      }
      
      setImages(prev => [...prev, ...files].slice(0, 3))
      setError(null)
    }
  }, [images])

  const compressImage = async (file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              resolve(file) // Return original if compression fails
            }
          },
          'image/jpeg',
          quality
        )
      }
      
      img.onerror = () => resolve(file) // Return original if loading fails
      img.src = URL.createObjectURL(file)
    })
  }

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
      // Compress images before upload
      toast.info('Compressing images...', { duration: 2000 })
      const compressedImages = await Promise.all(
        images.map(async (image) => {
          // Compress if image is larger than 1MB
          if (image.size > 1024 * 1024) {
            return await compressImage(image, 1200, 0.8)
          }
          return image
        })
      )
      toast.success('Images compressed successfully', { duration: 2000 })

      const formData = new FormData()
      
      // Add compressed images
      compressedImages.forEach((image, index) => {
        formData.append(`images[${index}]`, image)
      })
      
      // Add weight if provided
      if (weight) {
        formData.append('weight', weight)
      }
      
      // Add note if provided
      if (note.trim()) {
        formData.append('note', note.trim())
      }

      toast.info('Uploading progress photos...', { duration: 2000 })
      const response = await axios.post('/api/progress', formData)

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to upload progress entry')
      }

      onEntryAdded(response.data.entry)
      toast.success('Progress photos uploaded successfully!', { duration: 3000 })
      
      // Reset form
      setImages([])
      setWeight('')
      setNote('')
      
    } catch (err) {
      console.error('Upload error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload progress entry'
      setError(errorMessage)
      toast.error(errorMessage, { duration: 5000 })
    } finally {
      setIsSubmitting(false)
      setUploading(false)
    }
  }, [images, weight, note, onEntryAdded, setUploading])

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-zinc-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Camera className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Add Progress Entry</h2>
          <p className="text-sm text-zinc-600">Upload photos and track your journey</p>
        </div>
      </div>

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
                or click to browse (max 3 images, 5MB each, 10MB total)
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={images.length === 0 || isSubmitting}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload
            </>
          )}
        </button>
      </form>
    </div>
  )
}
