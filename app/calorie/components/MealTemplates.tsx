'use client'

import { useEffect, useState } from 'react'
import { Trash2, MoreVertical, UtensilsCrossed } from 'lucide-react'
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

export function MealTemplatesMinimal({ onTemplateSelect, onDataUpdated }: MealTemplatesProps) {
  const [templates, setTemplates] = useState<MealTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/calories/templates')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data.templates || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const deleteTemplate = async (id: string) => {
    try {
      const res = await fetch(`/api/calories/templates/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setTemplates(prev => prev.filter(t => t._id !== id))
        setActiveMenu(null)
        toast.success('Deleted')
      }
    } catch (e) {
      console.error(e)
    }
  }

  const list = templates
    .sort((a, b) => b.useCount - a.useCount)
    .slice(0, showAll ? undefined : 6)

  if (loading) {
    return (
      <div className="text-sm text-zinc-400 mb-3">Loading templates...</div>
    )
  }

  if (list.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-5 text-center">

        {/* Icon */}
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200 shadow-sm mb-4">
          <UtensilsCrossed className="w-7 h-7 text-zinc-500" />
        </div>

        {/* Heading */}
        <h3 className="text-lg font-semibold text-zinc-800 mb-1">
          No meal templates yet
        </h3>

        {/* Description */}
        <p className="text-sm text-zinc-500 max-w-xs">
          Start by adding a meal and save it as a template for faster tracking later.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 px-4" onClick={() => setActiveMenu(null)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-black">Meal Templates</h3>
        {templates.length > 6 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            {showAll ? 'Show less' : 'Show all'}
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-2">
        {list.map(t => (
          <div
            key={t._id}
            className="group flex items-center justify-between p-2 px-4 rounded-lg bg-zinc-200/30 border border-zinc-200/50 hover:bg-zinc-300/50 transition-all duration-200 cursor-pointer"
            onClick={() => onTemplateSelect(t)}
          >
            <div className="flex flex-col">
              <span className="text-black/70 font-medium">
                {t.name}
              </span>
              <span className="text-sm text-yellow-500 font-medium">
                {t.totalCalories} kcal
              </span>
            </div>

            {/* Actions */}
            <div
              className="relative opacity-0 group-hover:opacity-100"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() =>
                  setActiveMenu(activeMenu === t._id ? null : t._id)
                }
                className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-700 transition-colors"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {activeMenu === t._id && (
                <div className="absolute right-0 mt-2 w-32 bg-zinc-800 border border-zinc-700 rounded-xl text-sm z-50 shadow-lg">
                  <button
                    onClick={() => deleteTemplate(t._id)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-red-400 hover:bg-zinc-700 rounded-xl transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

