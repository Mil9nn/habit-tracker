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
      } else if (res.ok) {
        toast.success(`"${log.foodName}" saved as template`)
      }
    } catch (error) {
      console.error('Error saving template:', error)
    }
  }

  const deleteLog = async (logId: string) => {
    try {
      const response = await fetch(`/api/calories/log/${logId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onDataUpdated?.()
      }
    } catch (error) {
      console.error('Error deleting log:', error)
    }
  }

  const updateMeal = async (updatedMeal: CalorieLog) => {
    try {
      const response = await fetch(`/api/calories/log/${updatedMeal._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMeal)
      })

      if (response.ok) {
        setEditingMeal(null)
        onDataUpdated?.()
      }
    } catch (error) {
      console.error('Error updating meal:', error)
    }
  }

  // ---------- UI ----------

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">
            Food Log
          </h3>
          <span className="text-sm text-zinc-400">
            {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {/* Entries */}
        {logs.length > 0 ? (
          <div className="space-y-2">
            {logs.map(log => (
              <div
                key={log._id}
                className="group p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/50 hover:bg-zinc-800/50 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-medium truncate">
                        {log.foodName}
                      </span>
                      <span className="text-violet-400 font-semibold">
                        {log.calories} kcal
                      </span>
                    </div>

                    {/* Macros */}
                    <div className="flex items-center gap-4 text-sm text-zinc-400 mt-1">
                      {log.protein && <span>P {log.protein}g</span>}
                      {log.carbs && <span>C {log.carbs}g</span>}
                      {log.fat && <span>F {log.fat}g</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => saveAsTemplate(log)}
                      className="p-2 text-zinc-400 hover:text-violet-400 transition-colors rounded-lg hover:bg-zinc-700"
                      title="Save as template"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingMeal(log)}
                      className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-700"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteLog(log._id)}
                      className="p-2 text-zinc-400 hover:text-red-400 transition-colors rounded-lg hover:bg-zinc-700"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Meal Items */}
                {log.mealItems && log.mealItems.length > 1 && (
                  <div className="mt-3 pl-4 text-sm text-zinc-500 space-y-1">
                    {log.mealItems.map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{item.quantity}× {item.name}</span>
                        <span>{item.calories} kcal</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-zinc-500">
            No entries for this day
          </div>
        )}
      </div>

      {/* Edit Modal */}
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
