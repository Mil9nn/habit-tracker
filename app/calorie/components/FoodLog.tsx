'use client'

import { useState, useRef, useEffect } from 'react'
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

  const saveAsTemplate = async (log: CalorieLog) => {
    try {
      const templateData = {
        name: log.foodName,
        mealType: log.mealType,
        mealItems: log.mealItems || [{
          name: log.foodName,
          quantity: log.quantity || 1,
          calories: log.calories,
          protein: log.protein || 0,
          carbs: log.carbs || 0,
          fat: log.fat || 0
        }]
      }

      const response = await fetch('/api/calories/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      })

      if (response.status === 409) {
        // Template already exists
        const errorData = await response.json()
        setDuplicateTemplateName(log.foodName)
        setShowDuplicateDialog(true)
        setActiveMenu(null)
        return
      }

      if (response.ok) {
        setActiveMenu(null)
        toast.success(`Template "${log.foodName}" saved successfully!`)
      } else {
        const errorData = await response.json()
        console.error('Failed to save template:', errorData.error)
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

  const updateMeal = async (updatedLog: any) => {
    try {
      const response = await fetch(`/api/calories/log/${updatedLog._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLog)
      })
      if (response.ok) {
        setEditingMeal(null)
        onDataUpdated?.()
      }
    } catch (error) {
      console.error('Error updating meal:', error)
    }
  }

  return (
    <>
      <div className="mt-4" onClick={() => setActiveMenu(null)}>
        {/* Header */}
        <div className="flex items-center justify-between text-base font-semibold mb-3 text-gray-900">
          <h3 className="tracking-tight">
            {selectedDate === new Date().toISOString().split('T')[0]
              ? "Daily Log"
              : `${format(new Date(selectedDate), "do MMMM")} Log`}
          </h3>
        </div>

        {/* Content */}
        {logs.length > 0 ? (
          <div className="space-y-3">
            {logs.slice(0, 5).map((log) => (
              <div
                key={log._id}
                className="bg-white group rounded-md border border-zinc-200/60 p-4 shadow-sm hover:shadow-md transition-all"
              >
                {/* Main Title with Overall Calories */}
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-zinc-900">
                    {log.foodName} <span className="font-bold text-amber-500">
                      {log.calories} kcal
                    </span>
                  </h4>

                </div>

                {/* Individual Food Items (for meals) */}
                {log.mealItems && log.mealItems.length > 1 && (
                  <div className="C">
                    {log.mealItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
                        <div className="flex-1">
                          <div className='flex items-center justify-between gap-4'>
                            <p className="text-xs text-zinc-700">
                              <span className="text-zinc-400 mr-1">
                                {item.quantity}×
                              </span>
                              {item.name}
                            </p>
                            <div className="text-xs font-medium text-zinc-600">
                              {item.calories} kcal
                            </div>
                          </div>
                          {/* Macros for individual item */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {item.protein && (
                              <span className="text-[11px] text-zinc-600">
                                Protein: {item.protein}g
                              </span>
                            )}
                            {item.carbs && (
                              <span className="text-[11px] text-zinc-600">
                                Carbs: {item.carbs}g
                              </span>
                            )}
                            {item.fat && (
                              <span className="text-[11px] text-zinc-600">
                                Fat: {item.fat}g
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer with Time, Total Macros, and Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-100">

                  {/* Total Macros (for single items or summary) */}
                  <div className="flex items-center gap-3">
                    {(log.protein || log.carbs || log.fat) && (
                      <>
                        {log.protein && (
                          <span className="text-xs text-emerald-600 font-medium">
                            Protein: {log.protein}g
                          </span>
                        )}
                        {log.carbs && (
                          <span className="text-xs text-sky-600 font-medium">
                            Carbs: {log.carbs}g
                          </span>
                        )}
                        {log.fat && (
                          <span className="text-xs text-rose-600 font-medium">
                            Fat: {log.fat}g
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Time */}
                  <div className="text-xs text-zinc-400">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>

                  {/* Actions Menu */}
                  <div
                    className="relative opacity-0 group-hover:opacity-100 transition"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      onClick={() => setActiveMenu(activeMenu === log._id ? null : log._id)}
                      className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {activeMenu === log._id && (
                      <div className="absolute right-0 top-8 w-50 rounded-lg border border-zinc-200 bg-white shadow-md overflow-hidden z-50">
                        <button
                          onClick={() => {
                            setEditingMeal(log)
                            setActiveMenu(null)
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50"
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </button>

                        <button
                          onClick={() => saveAsTemplate(log)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50"
                        >
                          <Bookmark className="h-4 w-4" />
                          Save as Template
                        </button>

                        <button
                          onClick={() => {
                            deleteLog(log._id)
                            setActiveMenu(null)
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
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

            {/* More indicator */}
            {logs.length > 5 && (
              <div className="text-center text-xs text-zinc-400 pt-2">
                +{logs.length - 5} more entries
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-zinc-400">
              No food entries for this date
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingMeal && (
        <MealEditForm
          meal={{
            _id: editingMeal._id,
            foodName: editingMeal.foodName,
            mealItems: editingMeal.mealItems || [{
              name: editingMeal.foodName,
              quantity: editingMeal.quantity || 1,
              calories: editingMeal.calories,
              protein: editingMeal.protein || 0,
              carbs: editingMeal.carbs || 0,
              fat: editingMeal.fat || 0
            }],
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

      {/* Duplicate Template Dialog */}
      <TemplateExistsDialog
        open={showDuplicateDialog}
        onOpenChange={setShowDuplicateDialog}
        templateName={duplicateTemplateName}
      />
    </>
  )
}
