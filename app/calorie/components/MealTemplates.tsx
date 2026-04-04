'use client'

import { useEffect, useState } from 'react'
import { Trash2, MoreVertical, UtensilsCrossed, ChevronDown, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '../../../components/ConfirmDialog'

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
  const [isOpen, setIsOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; templateId: string; templateName: string }>({
    open: false,
    templateId: '',
    templateName: ''
  })

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
        toast.success('Template deleted successfully')
        onDataUpdated?.()
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to delete template')
    }
  }

  const handleDeleteClick = (templateId: string, templateName: string) => {
    setDeleteConfirm({ open: true, templateId, templateName })
  }

  const list = templates
    .sort((a, b) => b.useCount - a.useCount)
    .slice(0, showAll ? undefined : 6)

  return (
    <div className="px-4" onClick={() => setActiveMenu(null)}>
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full flex items-center justify-between p-3 px-4 shadow-sm border transition-all duration-200 rounded-lg"
      >
        <span className="text-sm font-medium text-black/70">
          Meal Templates
          {!loading && templates.length > 0 && (
            <span className="ml-2 text-xs text-zinc-400">({templates.length})</span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="mt-1 border border-zinc-200/50 rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-sm text-zinc-400 p-3">Loading templates...</div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-5 text-center px-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200 shadow-sm mb-3">
                <UtensilsCrossed className="w-5 h-5 text-yellow-500" />
              </div>
              <h3 className="text-sm font-medium text-zinc-700">No meal templates yet</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                Start by adding a meal and save it as a template for faster tracking later.
              </p>
            </div>
          ) : (
            <>
              {list.map(t => (
                <div
                  key={t._id}
                  className="group flex items-center justify-between p-2 px-4 bg-zinc-200/30 border-b border-zinc-200/50 last:border-b-0 hover:bg-zinc-300/50 transition-all duration-200"
                >
                  <div className="flex flex-col">
                    <span className="text-sm text-black/70 font-medium">{t.name}</span>
                    <span className="text-sm text-yellow-500 font-medium">{t.totalCalories} kcal</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Plus button to add template */}
                    <button
                      onClick={() => onTemplateSelect(t)}
                      className="p-2 text-zinc-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                      title="Add this template"
                    >
                      <Plus className="h-4 w-4" />
                    </button>

                    {/* More options menu */}
                    <div
                      className="relative opacity-0 group-hover:opacity-100"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setActiveMenu(activeMenu === t._id ? null : t._id)}
                        className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-700 transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {activeMenu === t._id && (
                        <div className="absolute right-0 mt-2 w-32 bg-zinc-800 border border-zinc-700 rounded-xl text-sm z-50 shadow-lg">
                          <button
                            onClick={() => handleDeleteClick(t._id, t.name)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-red-400 hover:bg-zinc-700 rounded-xl transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {templates.length > 6 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowAll(!showAll) }}
                  className="w-full text-sm text-zinc-400 hover:text-black transition-colors py-2 bg-zinc-100/50 hover:bg-zinc-200/50"
                >
                  {showAll ? 'Show less' : `Show all ${templates.length}`}
                </button>
              )}
            </>
          )}
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm(prev => ({ ...prev, open }))}
        title="Delete Template"
        description="Are you sure you want to delete this meal template? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => deleteTemplate(deleteConfirm.templateId)}
        type="template"
        itemName={deleteConfirm.templateName}
      />
    </div>
  )
}

