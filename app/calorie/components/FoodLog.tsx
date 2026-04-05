'use client'

import { useState } from 'react'
import { CalorieLog } from '../page'
import { Edit2, Trash2, Bookmark, Salad, ChevronDown } from 'lucide-react'
import { MealEditForm } from '../../../components/MealEditForm'
import { TemplateExistsDialog } from '../../../components/TemplateExistsDialog'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface FoodLogProps {
  logs: CalorieLog[]
  selectedDate: string
  onDataUpdated?: () => void
}

const MEAL_TYPE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  breakfast: { color: '#f97316', bg: '#fff7ed', label: 'Breakfast' },
  lunch:     { color: '#10b981', bg: '#f0fdf4', label: 'Lunch' },
  dinner:    { color: '#6366f1', bg: '#eef2ff', label: 'Dinner' },
  snack:     { color: '#ec4899', bg: '#fdf2f8', label: 'Snack' },
}

const DEFAULT_CONFIG = { color: '#94a3b8', bg: '#f8fafc', label: 'Meal' }

function MacroPill({ label, value, color }: { label: string; value?: number; color: string }) {
  if (!value) return null
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: `${color}15`, color }}
    >
      <span className="font-semibold">{value}g</span>
      <span className="opacity-70">{label}</span>
    </span>
  )
}

export function FoodLog({ logs, selectedDate, onDataUpdated }: FoodLogProps) {
  const [editingMeal, setEditingMeal] = useState<CalorieLog | null>(null)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [duplicateTemplateName, setDuplicateTemplateName] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; logId: string; itemName: string }>({
    open: false, logId: '', itemName: ''
  })

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const saveAsTemplate = async (log: CalorieLog) => {
    try {
      const res = await fetch('/api/calories/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: log.foodName,
          mealType: log.mealType,
          mealItems: log.mealItems || [{
            name: log.foodName, quantity: log.quantity || 1,
            calories: log.calories, protein: log.protein || 0,
            carbs: log.carbs || 0, fat: log.fat || 0
          }]
        })
      })
      if (res.status === 409) {
        setDuplicateTemplateName(log.foodName)
        setShowDuplicateDialog(true)
      } else if (res.ok) {
        toast.success(`"${log.foodName}" saved as template`)
      }
    } catch (e) { console.error(e) }
  }

  const deleteLog = async (logId: string) => {
    try {
      const res = await fetch(`/api/calories/log/${logId}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Entry removed'); onDataUpdated?.() }
    } catch (e) { console.error(e); toast.error('Failed to delete') }
  }

  const updateMeal = async (updatedMeal: CalorieLog) => {
    try {
      const res = await fetch(`/api/calories/log/${updatedMeal._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMeal)
      })
      if (res.ok) { setEditingMeal(null); onDataUpdated?.() }
    } catch (e) { console.error(e) }
  }

  const totalCalories = logs.reduce((sum, l) => sum + l.calories, 0)

  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div>
            <h3 className="text-sm font-semibold text-zinc-800 tracking-tight">Food Log</h3>
            {logs.length > 0 && (
              <p className="text-xs text-zinc-400 mt-0.5">{logs.length} {logs.length === 1 ? 'entry' : 'entries'}</p>
            )}
          </div>
          {logs.length > 0 && (
            <div className="text-right">
              <p className="text-xl font-bold text-orange-500 leading-none">{totalCalories.toLocaleString()}</p>
              <p className="text-xs text-zinc-400 mt-0.5">total kcal</p>
            </div>
          )}
        </div>

        {/* Entries */}
        {logs.length > 0 ? (
          <div className="divide-y divide-zinc-50">
            {logs.map(log => {
              const config = MEAL_TYPE_CONFIG[log.mealType?.toLowerCase()] || DEFAULT_CONFIG
              const hasItems = log.mealItems && log.mealItems.length > 1
              const isExpanded = expandedItems.has(log._id)

              return (
                <div key={log._id} className="group">
                  <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-zinc-50/80 transition-colors duration-150">

                    {/* Meal type indicator */}
                    <div
                      className="w-1 self-stretch rounded-full flex-shrink-0"
                      style={{ background: config.color, minHeight: '36px' }}
                    />

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-sm font-semibold text-zinc-800 leading-snug block truncate">
                            {log.foodName}
                          </span>
                          <span
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-md inline-block mt-0.5"
                            style={{ background: config.bg, color: config.color }}
                          >
                            {config.label}
                          </span>
                          <span className="text-[10px] text-zinc-400 ml-2">
                            {format(new Date(log.timestamp), 'h:mm a')}
                          </span>
                        </div>

                        {/* Calories — hero number */}
                        <div className="flex-shrink-0 text-right">
                          <span className="text-base font-bold" style={{ color: config.color }}>
                            {log.calories}
                          </span>
                          <span className="text-xs text-zinc-400 ml-1">kcal</span>
                        </div>
                      </div>

                      {/* Macros */}
                      {(log.protein || log.carbs || log.fat) && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <MacroPill label="P" value={log.protein} color="#10b981" />
                          <MacroPill label="C" value={log.carbs}   color="#3b82f6" />
                          <MacroPill label="F" value={log.fat}     color="#f59e0b" />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
                      <button
                        onClick={() => saveAsTemplate(log)}
                        className="p-1.5 text-zinc-300 hover:text-indigo-500 rounded-lg hover:bg-indigo-50 transition-colors"
                        title="Save as template"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingMeal(log)}
                        className="p-1.5 text-zinc-300 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ open: true, logId: log._id, itemName: log.foodName })}
                        className="p-1.5 text-zinc-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {hasItems && (
                        <button
                          onClick={() => toggleExpand(log._id)}
                          className="p-1.5 text-zinc-300 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors ml-0.5"
                        >
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable meal items */}
                  {hasItems && isExpanded && (
                    <div className="px-5 pb-3 ml-4">
                      <div
                        className="rounded-xl overflow-hidden border"
                        style={{ borderColor: `${config.color}25`, background: config.bg }}
                      >
                        {log.mealItems!.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between px-3 py-2 text-xs border-b last:border-b-0"
                            style={{ borderColor: `${config.color}15` }}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ background: config.color }}
                              />
                              <span className="text-zinc-500">{item.quantity}×</span>
                              <span className="font-medium text-zinc-700">{item.name}</span>
                            </div>
                            <span className="font-semibold" style={{ color: config.color }}>
                              {item.calories} kcal
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-12 px-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
              <Salad className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-700">Nothing logged yet</h3>
            <p className="text-xs text-zinc-400 mt-1.5 max-w-[200px] leading-relaxed">
              Add your first meal to start tracking your calories and macros.
            </p>
          </div>
        )}
      </div>

      {editingMeal && (
        <MealEditForm
          meal={{
            _id: editingMeal._id,
            foodName: editingMeal.foodName,
            mealItems: editingMeal.mealItems || [{
              name: editingMeal.foodName, quantity: editingMeal.quantity || 1,
              calories: editingMeal.calories, protein: editingMeal.protein || 0,
              carbs: editingMeal.carbs || 0, fat: editingMeal.fat || 0
            }],
            calories: editingMeal.calories, protein: editingMeal.protein,
            carbs: editingMeal.carbs, fat: editingMeal.fat, mealType: editingMeal.mealType
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

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm(prev => ({ ...prev, open }))}
        title="Delete Food Log"
        description="Are you sure you want to delete this food log? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => deleteLog(deleteConfirm.logId)}
        type="delete"
        itemName={deleteConfirm.itemName}
      />
    </>
  )
}
