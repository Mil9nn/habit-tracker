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
    category?: string
    vitamins?: {
      vitaminD?: number
      vitaminB6?: number
      vitaminB7?: number
      vitaminB12?: number
    }
    minerals?: {
      iron?: number
      magnesium?: number
      zinc?: number
      calcium?: number
      potassium?: number
    }
  }>
  totalCalories: number
  totalProtein?: number
  totalCarbs?: number
  totalFat?: number
  totalVitamins?: {
    vitaminA?: number
    vitaminB6?: number
    vitaminB12?: number
  }
  totalMinerals?: {
    iron?: number
    magnesium?: number
    zinc?: number
    calcium?: number
    potassium?: number
  }
  confidence?: string
  method?: string
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
        vitamins: aiAnalysis.totalVitamins,
        minerals: aiAnalysis.totalMinerals,
        mealItems: aiAnalysis.foods.map((food) => ({
          name: food.name,
          quantity: food.quantity,
          calories: food.calories,
          protein: food.protein || 0,
          carbs: food.carbs || 0,
          fat: food.fat || 0,
          vitamins: food.vitamins,
          minerals: food.minerals
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

      {/* Results - Single slide with minimal micro-nutrients */}
      {aiAnalysis && (
        <div className="rounded-xl border border-violet-500/30 bg-violet-900/10 p-4 space-y-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-violet-300">
              ✅ AI Analysis Complete
            </h4>
            <span className="text-xs text-violet-400 bg-violet-800/50 px-2 py-1 rounded">
              {aiAnalysis.confidence || 'medium'} confidence
            </span>
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

          {/* Macros Summary */}
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-zinc-700">
            <div className="text-center">
              <p className="text-xs text-zinc-500">Calories</p>
              <p className="text-sm font-semibold text-white">{aiAnalysis.totalCalories}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-zinc-500">Protein</p>
              <p className="text-sm font-semibold text-blue-400">{aiAnalysis.totalProtein || 0}g</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-zinc-500">Carbs</p>
              <p className="text-sm font-semibold text-amber-400">{aiAnalysis.totalCarbs || 0}g</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-zinc-500">Fat</p>
              <p className="text-sm font-semibold text-rose-400">{aiAnalysis.totalFat || 0}g</p>
            </div>
          </div>

          {/* Key Micro-nutrients - Only what API returns */}
          {(aiAnalysis.totalVitamins || aiAnalysis.totalMinerals) && (
            <div className="pt-3 border-t border-zinc-700">
              <p className="text-xs text-zinc-400 mb-2">Key Micro-nutrients</p>
              <div className="flex flex-wrap gap-2">
                {aiAnalysis.totalVitamins?.vitaminA && (
                  <span className="text-xs bg-green-800/30 text-green-400 px-2 py-1 rounded">
                    A: {aiAnalysis.totalVitamins.vitaminA}
                  </span>
                )}
                {aiAnalysis.totalVitamins?.vitaminB6 && (
                  <span className="text-xs bg-green-800/30 text-green-400 px-2 py-1 rounded">
                    B6: {aiAnalysis.totalVitamins.vitaminB6}
                  </span>
                )}
                {aiAnalysis.totalVitamins?.vitaminB12 && (
                  <span className="text-xs bg-green-800/30 text-green-400 px-2 py-1 rounded">
                    B12: {aiAnalysis.totalVitamins.vitaminB12}
                  </span>
                )}
                {aiAnalysis.totalMinerals?.iron && (
                  <span className="text-xs bg-orange-800/30 text-orange-400 px-2 py-1 rounded">
                    Iron: {aiAnalysis.totalMinerals.iron}
                  </span>
                )}
                {aiAnalysis.totalMinerals?.magnesium && (
                  <span className="text-xs bg-orange-800/30 text-orange-400 px-2 py-1 rounded">
                    Magnesium: {aiAnalysis.totalMinerals.magnesium}
                  </span>
                )}
                {aiAnalysis.totalMinerals?.zinc && (
                  <span className="text-xs bg-orange-800/30 text-orange-400 px-2 py-1 rounded">
                    Zinc: {aiAnalysis.totalMinerals.zinc}
                  </span>
                )}
                {aiAnalysis.totalMinerals?.calcium && (
                  <span className="text-xs bg-orange-800/30 text-orange-400 px-2 py-1 rounded">
                    Calcium: {aiAnalysis.totalMinerals.calcium}
                  </span>
                )}
                {aiAnalysis.totalMinerals?.potassium && (
                  <span className="text-xs bg-orange-800/30 text-orange-400 px-2 py-1 rounded">
                    K: {aiAnalysis.totalMinerals.potassium}
                  </span>
                )}
              </div>
            </div>
          )}

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
