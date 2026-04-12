'use client'

import { useState } from 'react'
import { IMealLog } from '../../../lib/models/MealLog'
import { Trash2, Bookmark, ChevronDown, Salad } from 'lucide-react'
import { TemplateExistsDialog } from '../../../components/TemplateExistsDialog'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface FoodLogProps {
  logs: IMealLog[]
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

  const saveAsTemplate = async (log: IMealLog) => {
    try {
      const templateData = {
        name: log.inputText,
        mealType: log.mealType,
        mealItems: log.foods && log.foods.length > 0 ? log.foods : [{
          name: log.inputText, 
          quantity: 1,
          unit: 'serving',
          calories: log.totals.calories, 
          macros: log.totals.macros,
          micros: log.totals.micros
        }]
      }
      
      const res = await fetch('/api/calories/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      })
      
      if (res.status === 409) {
        setDuplicateTemplateName(log.inputText)
        setShowDuplicateDialog(true)
      } else if (res.ok) {
        toast.success(`"${log.inputText}" saved as template`)
        // Refresh templates list
        if ((window as any).refreshTemplates) {
          (window as any).refreshTemplates()
        }
      } else {
        const errorData = await res.json()
        console.error('Error response:', errorData)
        toast.error('Failed to save template: ' + (errorData?.error || 'Unknown error'))
      }
    } catch (e) { 
      console.error('Exception in saveAsTemplate:', e) 
      toast.error('Failed to save template') 
    }
  }

  const deleteLog = async (logId: string) => {
    try {
      const res = await fetch(`/api/calories/log/${logId}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Entry removed'); onDataUpdated?.() }
    } catch (e) { console.error(e); toast.error('Failed to delete') }
  }


  const totalCalories = logs.reduce((sum, l) => sum + l.totals.calories, 0)

  return (
    <>
      <div className="bg-white overflow-hidden p-4">

        {/* Header */}
        <div className="flex items-center justify-between">
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
              const hasItems = log.foods && log.foods.length > 1
              const isExpanded = expandedItems.has(log._id.toString())

              return (
                <div key={log._id.toString()} className="group">
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
                            {log.inputText}
                          </span>
                          <span
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-md inline-block mt-0.5"
                            style={{ background: config.bg, color: config.color }}
                          >
                            {config.label}
                          </span>
                          <span className="text-[10px] text-zinc-400 ml-2">
                            {format(new Date(log.date), 'h:mm a')}
                          </span>
                        </div>

                        {/* Calories — hero number */}
                        <div className="flex-shrink-0 text-right">
                          <span className="text-base font-bold" style={{ color: config.color }}>
                            {log.totals.calories}
                          </span>
                          <span className="text-xs text-zinc-400 ml-1">kcal</span>
                        </div>
                      </div>

                      {/* Macros */}
                      {log.totals && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <MacroPill label="P" value={log.totals.macros.protein} color="#10b981" />
                          <MacroPill label="C" value={log.totals.macros.carbs}   color="#3b82f6" />
                          <MacroPill label="F" value={log.totals.macros.fat}     color="#f59e0b" />
                          <MacroPill label="Fiber" value={log.totals.macros.fiber} color="#8b5cf6" />
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
                        onClick={() => setDeleteConfirm({ open: true, logId: log._id.toString(), itemName: log.inputText })}
                        className="p-1.5 text-zinc-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {hasItems && (
                        <button
                          onClick={() => toggleExpand(log._id.toString())}
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
                        {log.foods!.map((item, i) => (
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
                              <span className="text-zinc-500">
                              {(() => {
                                // Smart formatting: use "×" for countable items, unit for measured items
                                if (item.unit === 'serving' || item.unit === 'piece' || item.unit === 'whole') {
                                  return `${item.quantity}×`
                                } else {
                                  // For units like gm, ml, etc., show as "100g"
                                  const shortUnit = item.unit.replace('gram', 'g').replace('milliliter', 'ml').replace('liter', 'l')
                                  return `${item.quantity}${shortUnit}`
                                }
                              })()}
                            </span>
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
