'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Plus, Star, MoreVertical, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface MealTemplate {
  _id: string
  name: string
  mealType: string
  mealItems: Array<{
    name: string
    quantity: number
    calories: number
    protein?: number
    carbs?: number
    fat?: number
  }>
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  useCount: number
  lastUsed: string
}

interface MealTemplatesProps {
  onTemplateSelect: (template: MealTemplate) => void
  onDataUpdated?: () => void
}

export function MealTemplates({ onTemplateSelect, onDataUpdated }: MealTemplatesProps) {
  const [templates, setTemplates] = useState<MealTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/calories/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/calories/templates/${templateId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        const template = templates.find(t => t._id === templateId)
        setTemplates(prev => prev.filter(t => t._id !== templateId))
        setActiveMenu(null)
        toast.success(`Template "${template?.name}" deleted successfully!`)
      }
    } catch (error) {
      console.error('Error deleting template:', error)
    }
  }

  const filteredTemplates = templates
    .sort((a, b) => b.useCount - a.useCount)
    .slice(0, showAll ? undefined : 6)

  if (loading) {
    return (
      <div className="flex gap-2 mb-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse flex-1" />
        ))}
      </div>
    )
  }

  if (filteredTemplates.length === 0) {
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Quick Templates
          </h4>
        </div>
        <div className="text-center py-4 px-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-500 mb-2">
            No templates yet
          </p>
          <p className="text-xs text-gray-400">
            Click the three dots (⋯) on any food entry and select "Save as Template"
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Quick Templates
        </h4>
        {templates.length > 6 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            {showAll ? 'Show Less' : 'Show All'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        <AnimatePresence>
          {filteredTemplates.map((template) => (
            <motion.div
              key={template._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => onTemplateSelect(template)}
              className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-left cursor-pointer"
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {template.name}
                  </p>
                </div>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveMenu(activeMenu === template._id ? null : template._id)
                    }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {activeMenu === template._id && (
                    <div className="absolute right-0 top-8 w-32 rounded-lg border border-gray-200 bg-white shadow-md overflow-hidden z-50">
                      <button
                        onClick={() => deleteTemplate(template._id)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-xs font-bold text-amber-500">
                {template.totalCalories} kcal
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
