'use client'

import { useState } from 'react'
import { CalorieLog } from '../page'
import { format } from 'date-fns'
import { Edit2, Trash2, MoreVertical, Bookmark } from 'lucide-react'
import { MealEditForm } from '../../../components/MealEditForm'
import { TemplateExistsDialog } from '../../../components/TemplateExistsDialog'
import { toast } from 'sonner'

interface FoodLogProps {
  logs: CalorieLog[]
  selectedDate: string
  onDataUpdated?: () => void
}

export function FoodLog({ logs, selectedDate, onDataUpdated }: FoodLogProps) {
  const [editingMeal, setEditingMeal] = useState<CalorieLog | null>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [duplicateTemplateName, setDuplicateTemplateName] = useState('')

  // ---------- Actions ----------

  const saveAsTemplate = async (log: CalorieLog) => {
    try {
      const templateData = {
        name: log.foodName,
        mealType: log.mealType,
        mealItems:
          log.mealItems || [
            {
              name: log.foodName,
              quantity: log.quantity || 1,
              calories: log.calories,
              protein: log.protein || 0,
              carbs: log.carbs || 0,
              fat: log.fat || 0
            }
          ]
      }

      const res = await fetch('/api/calories/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      })

      if (res.status === 409) {
        setDuplicateTemplateName(log.foodName)
        setShowDuplicateDialog(true)
        setActiveMenu(null)
        return
      }

      if (res.ok) {
        toast.success(`Saved "${log.foodName}"`)
        setActiveMenu(null)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const deleteLog = async (id: string) => {
    try {
      const res = await fetch(`/api/calories/log/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) onDataUpdated?.()
    } catch (e) {
      console.error(e)
    }
  }

  const updateMeal = async (updated: any) => {
    try {
      const res = await fetch(`/api/calories/log/${updated._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      })
      if (res.ok) {
        setEditingMeal(null)
        onDataUpdated?.()
      }
    } catch (e) {
      console.error(e)
    }
  }

  // ---------- UI ----------

  return (
    <>
      <div className="mt-4" onClick={() => setActiveMenu(null)}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3 text-sm font-medium text-zinc-700">
          <h3>
            {selectedDate === new Date().toISOString().split('T')[0]
              ? 'Today'
              : format(new Date(selectedDate), 'do MMMM')}
          </h3>

          <span className="text-xs text-zinc-400">
            {logs.length} entries
          </span>
        </div>

        {/* List */}
        {logs.length > 0 ? (
          <div className="divide-y divide-zinc-200">
            {logs.map(log => (
              <div
                key={log._id}
                className="group py-3 flex flex-col gap-2"
              >
                {/* Top Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-900">
                      {log.foodName}
                    </span>
                    <span className="text-xs text-amber-500 font-medium">
                      {log.calories} kcal
                    </span>
                  </div>

                  {/* Menu */}
                  <div
                    className="relative opacity-0 group-hover:opacity-100"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      onClick={() =>
                        setActiveMenu(activeMenu === log._id ? null : log._id)
                      }
                      className="p-1 text-zinc-400 hover:text-zinc-700"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {activeMenu === log._id && (
                      <div className="absolute right-0 mt-2 w-44 border bg-white text-sm z-50">
                        <button
                          onClick={() => {
                            setEditingMeal(log)
                            setActiveMenu(null)
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 hover:bg-zinc-50"
                        >
                          <Edit2 className="h-4 w-4" /> Edit
                        </button>

                        <button
                          onClick={() => saveAsTemplate(log)}
                          className="flex w-full items-center gap-2 px-3 py-2 hover:bg-zinc-50"
                        >
                          <Bookmark className="h-4 w-4" /> Template
                        </button>

                        <button
                          onClick={() => {
                            deleteLog(log._id)
                            setActiveMenu(null)
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Meal Items */}
                {log.mealItems && log.mealItems.length > 1 && (
                  <div className="text-xs text-zinc-600 space-y-1">
                    {log.mealItems.map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span>
                          {item.quantity}× {item.name}
                        </span>
                        <span>{item.calories} kcal</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bottom Row */}
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <div className="flex gap-3">
                    {log.protein ? <span>P {log.protein}g</span> : null}
                    {log.carbs ? <span>C {log.carbs}g</span> : null}
                    {log.fat ? <span>F {log.fat}g</span> : null}
                  </div>

                  <span>
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-zinc-400">
            No entries
          </div>
        )}
      </div>

      {/* Edit */}
      {editingMeal && (
        <MealEditForm
          meal={{
            _id: editingMeal._id,
            foodName: editingMeal.foodName,
            mealItems:
              editingMeal.mealItems || [
                {
                  name: editingMeal.foodName,
                  quantity: editingMeal.quantity || 1,
                  calories: editingMeal.calories,
                  protein: editingMeal.protein || 0,
                  carbs: editingMeal.carbs || 0,
                  fat: editingMeal.fat || 0
                }
              ],
            calories: editingMeal.calories,
            protein: editingMeal.protein,
            carbs: editingMeal.carbs,
            fat: editingMeal.fat,
            mealType: editingMeal.mealType
          }}
          onSave={updateMeal}
          onCancel={() => setEditingMeal(null)}
        />
      )}

      <TemplateExistsDialog
        open={showDuplicateDialog}
        onOpenChange={setShowDuplicateDialog}
        templateName={duplicateTemplateName}
      />
    </>
  )
}
