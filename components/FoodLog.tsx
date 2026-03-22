'use client'

import { useState, useRef, useEffect } from 'react'
import { CalorieLog } from './CalorieTracker'
import { format } from 'date-fns'
import { Edit2, Trash2, MoreVertical } from 'lucide-react'
import { MealEditForm } from './MealEditForm'

interface FoodLogProps {
  logs: CalorieLog[]
  selectedDate: string
  onDataUpdated?: () => void
}

export function FoodLog({ logs, selectedDate, onDataUpdated }: FoodLogProps) {
  const [editingMeal, setEditingMeal] = useState<CalorieLog | null>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)


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
      <div className="rounded-2xl mt-2 border border-zinc-200/60 bg-white/70 backdrop-blur-sm shadow-sm p-2 sm:p-6" onClick={() => setActiveMenu(null)}>
        {/* Header */}
        <div className="flex items-center justify-between p-2">
          <h3 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900">
            {selectedDate === new Date().toISOString().split('T')[0]
              ? "Today's Log"
              : `${format(new Date(selectedDate), "do MMMM")} Log`}
          </h3>
        </div>

        {/* Content */}
        {logs.length > 0 ? (
          <div className="space-y-1.5">
            {logs.slice(0, 5).map((log) => (
              <div
                key={log._id}
                className="group flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                {/* Left */}
                <div className="flex-1 bg-blue-50 p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm text-zinc-800 font-medium">
                        {log.foodName}
                      </p>

                      <p className="text-xs text-zinc-400 mt-0.5">
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Meal items */}
                  {log.mealItems && log.mealItems.length > 1 && (
                    <div className="mt-3 space-y-2">
                      {log.mealItems.map((item, index) => (
                        <div
                          key={index}
                          className=""
                        >
                          {/* Left */}
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-zinc-700">
                              <span className="text-zinc-400 mr-1">
                                {item.quantity}×
                              </span>
                              {item.name}
                            </p>

                            {/* Calories */}
                            <span className="text-xs font-semibold text-amber-500 whitespace-nowrap">
                              {item.calories} kcal
                            </span>
                          </div>

                          {/* Macros pills */}
                          <div className="w-full flex items-center gap-4 flex-wrap">
                            {item.protein && (
                              <p className="text-[11px] text-emerald-600 font-medium">
                                Protein: {item.protein}g
                              </p>
                            )}
                            {item.carbs && (
                              <p className="text-[11px] text-sky-600 font-medium">
                                Carbs: {item.carbs}g
                              </p>
                            )}
                            {item.fat && (
                              <p className="text-[11px] text-rose-600 font-medium">
                                Fat: {item.fat}g
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TOTAL MACROS */}
                  {(log.protein || log.carbs || log.fat) && (
                    <div className="flex items-center flex-wrap gap-4 mt-4">
                      {log.protein && (
                        <p className="font-regular text-xs text-emerald-700">
                          <span className='block'>Protein:</span> {log.protein}g
                        </p>
                      )}
                      {log.carbs && (
                        <p className="font-regular text-xs text-sky-700">
                          <span className='block'>Carbs:</span> {log.carbs}g
                        </p>
                      )}
                      {log.fat && (
                        <p className="font-regular text-xs  text-rose-700">
                          <span className='block'>Fat:</span> {log.fat}g
                        </p>
                      )}

                      <span className="text-base font-regular text-amber-500">
                        {log.calories}
                        <span className="text-xs text-zinc-400 ml-1">kcal</span>
                      </span>

                      {/* 3 dots menu at bottom */}
                      <div className="flex items-center gap-2 ml-auto">
                        {/* Actions */}
                        <div
                          className="relative opacity-0 group-hover:opacity-100 transition"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button className="p-1 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition">
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {activeMenu === log._id && (
                            <div className="absolute right-0 top-full mt-2 w-32 rounded-lg border border-zinc-200 bg-white shadow-md overflow-hidden">
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
                  )}
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
    </>
  )
}
