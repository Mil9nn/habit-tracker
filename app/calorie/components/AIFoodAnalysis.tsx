'use client'

import { useState } from 'react'

interface FoodAnalysis {
  foods: Array<{
    name: string
    quantity: number
    unit: string
    calories: number
    protein?: number
    carbs?: number
    fat?: number
  }>
  totalCalories: number
  totalProtein?: number
  totalCarbs?: number
  totalFat?: number
}

interface AIFoodAnalysisProps {
  onDataAdded?: () => void
}

export function AIFoodAnalysis({ onDataAdded }: AIFoodAnalysisProps) {
  const [aiFoodDescription, setAiFoodDescription] = useState('')
  const [aiAnalysis, setAiAnalysis] = useState<FoodAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isAddingFoods, setIsAddingFoods] = useState(false)

  const analyzeFoodWithAI = async () => {
    if (!aiFoodDescription.trim()) return

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/ai/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodDescription: aiFoodDescription,
          mealType: 'breakfast'
        })
      })

      if (response.ok) {
        const analysis = await response.json()

        // Show parsed analysis for confirmation before adding
        setAiAnalysis(analysis)
      } else {
        console.error('AI analysis request failed')
      }
    } catch (error) {
      console.error('Error analyzing food:', error)
    } finally {
      setIsAnalyzing(false)
      setIsAddingFoods(false)
    }
  }

  const addAnalyzedFoods = async () => {
    if (!aiAnalysis?.foods) return

    setIsAddingFoods(true)

    try {
      // Create a single meal entry instead of individual food entries
      const mealData = {
        foodName: `${aiAnalysis.foods.map((f) => `${f.quantity}× ${f.name}`).join(', ')}`,
        calories: aiAnalysis.totalCalories,
        protein: aiAnalysis.totalProtein || 0,
        carbs: aiAnalysis.totalCarbs || 0,
        fat: aiAnalysis.totalFat || 0,
        mealType: 'breakfast',
        quantity: 1,
        isMeal: true,
        mealItems: aiAnalysis.foods.map((food) => ({
          name: food.name,
          quantity: food.quantity,
          calories: food.calories,
          protein: food.protein || 0,
          carbs: food.carbs || 0,
          fat: food.fat || 0
        }))
      }

      const mealResponse = await fetch('/api/calories/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mealData)
      })

      if (mealResponse.ok) {
        // Clear AI analysis and refresh data
        setAiAnalysis(null)
        setAiFoodDescription('')
        onDataAdded?.() // Notify parent component
      } else {
        console.error('Failed to add meal')
      }
    } catch (error) {
      console.error('Error adding analyzed foods:', error)
    } finally {
      setIsAddingFoods(false)
    }
  }

  return (
    <div className="px-4 py-2">
      {/* Input Section */}
      <div className="space-y-2">
        <textarea
          value={aiFoodDescription}
          onChange={(e) => setAiFoodDescription(e.target.value)}
          placeholder="Describe your meal (e.g., grilled chicken salad with avocado)"
          className="w-full rounded-xl bg-zinc-200 border-2 border-zinc-200 shadow-sm text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/70 px-4 py-3 text-sm resize-none transition-all duration-200"
          rows={3}
        />

        <button
          onClick={analyzeFoodWithAI}
          disabled={isAnalyzing || !aiFoodDescription.trim()}
          className="w-full text-sm bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 disabled:from-zinc-700 disabled:to-zinc-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:opacity-50"
        >
          {isAnalyzing ? "Analyzing..." : "Add Meal"}
        </button>
      </div>

      {/* Results - Only show if adding failed */}
      {aiAnalysis && (
        <div className="rounded-xl border border-red-800/50 bg-red-900/20 p-4 space-y-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-red-400">
              ⚠️ Analysis failed - please try again
            </h4>
          </div>

          {/* Food List */}
          <div className="space-y-2">
            {aiAnalysis.foods.map((food, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">
                    <span className="text-zinc-400 mr-2">
                      {food.quantity}×
                    </span>
                    {food.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {food.unit}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-sm font-semibold text-violet-400">
                    {food.calories} kcal
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-700">
            <span className="text-sm font-medium text-zinc-300">
              Total: {aiAnalysis.totalCalories} kcal
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={addAnalyzedFoods}
              disabled={isAddingFoods}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 text-white font-medium px-4 py-2 rounded-xl transition-all duration-200"
            >
              {isAddingFoods ? "Adding..." : "Add Meal"}
            </button>

            <button
              onClick={() => {
                setAiAnalysis(null);
                setAiFoodDescription("");
              }}
              className="bg-zinc-700 hover:bg-zinc-600 text-zinc-300 font-medium px-4 py-2 rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
