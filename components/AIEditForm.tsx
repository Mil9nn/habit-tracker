'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { X } from 'lucide-react'
import { CalorieLog } from './CalorieTracker'

interface AIEditFormProps {
  log: CalorieLog
  onSave: (updatedLog: any) => void
  onCancel: () => void
}

export function AIEditForm({ log, onSave, onCancel }: AIEditFormProps) {
  const [aiPrompt, setAiPrompt] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeWithAI = async () => {
    if (!aiPrompt.trim()) return

    setIsAnalyzing(true)
    try {
      // Create a prompt that includes the current meal info and the user's request
      const fullPrompt = `Current meal: ${log.foodName}. Current items: ${log.mealItems?.map(item => `${item.quantity}× ${item.name}`).join(', ') || 'Single item'}. User request: ${aiPrompt}. Please update the meal based on this request and provide new nutritional information.`

      const response = await fetch('/api/ai/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodDescription: fullPrompt,
          mealType: log.mealType
        })
      })

      if (response.ok) {
        const analysis = await response.json()
        
        // Create updated meal data
        const updatedMealData = {
          ...log,
          foodName: `${analysis.foods.map((f: any) => `${f.quantity}× ${f.name}`).join(', ')}`,
          calories: analysis.totalCalories,
          protein: analysis.totalProtein || 0,
          carbs: analysis.totalCarbs || 0,
          fat: analysis.totalFat || 0,
          mealItems: analysis.foods.map((food: any) => ({
            name: food.name,
            quantity: food.quantity,
            calories: food.calories,
            protein: food.protein || 0,
            carbs: food.carbs || 0,
            fat: food.fat || 0
          }))
        }

        onSave(updatedMealData)
      }
    } catch (error) {
      console.error('Error analyzing with AI:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Edit your meal</h3>
          <Button
            onClick={onCancel}
            variant="ghost"
            className="p-2 hover:bg-zinc-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Current meal info */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-900 mb-2">Current Meal</h4>
            <p className="text-sm text-amber-800">{log.foodName}</p>
            {log.mealItems && (
              <div className="mt-2 text-xs text-amber-700">
                Items: {log.mealItems.map(item => `${item.quantity}× ${item.name}`).join(', ')}
              </div>
            )}
          </div>

          {/* AI Prompt */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              What would you like to change?
            </label>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. 'replace bananas with apples', 'add 1 more egg', 'remove the protein shake', 'double the portions'"
              className="w-full h-26 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-400 resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <Button
            onClick={onCancel}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            onClick={analyzeWithAI}
            disabled={isAnalyzing || !aiPrompt.trim()}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            {isAnalyzing ? "Analyzing..." : "Apply Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}
