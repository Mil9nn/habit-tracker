'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"

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
        setAiAnalysis(analysis)
      }
    } catch (error) {
      console.error('Error analyzing food:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const addAnalyzedFoods = async () => {
    if (!aiAnalysis?.foods) return

    setIsAddingFoods(true)

    try {
      // Add all foods in parallel for better performance
      const addPromises = aiAnalysis.foods.map((food) => {
        return fetch('/api/calories/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            foodName: food.name,
            calories: food.calories,
            protein: food.protein || 0,
            carbs: food.carbs || 0,
            fat: food.fat || 0,
            mealType: 'breakfast',
            quantity: food.quantity || 1
          })
        })
      })

      const results = await Promise.all(addPromises)
      const allSuccessful = results.every(result => result.ok)

      if (allSuccessful) {
        // Clear AI analysis and refresh data
        setAiAnalysis(null)
        setAiFoodDescription('')
        onDataAdded?.() // Notify parent component
      } else {
        console.error('Some foods failed to add')
      }
    } catch (error) {
      console.error('Error adding analyzed foods:', error)
    } finally {
      setIsAddingFoods(false)
    }
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <h3 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900">
        AI Food Analysis
      </h3>

      {/* Input Section */}
      <div className="flex flex-col gap-3">
        <textarea
          value={aiFoodDescription}
          onChange={(e) => setAiFoodDescription(e.target.value)}
          placeholder="e.g. 2 bananas, protein shake, 3 chapatis with cauliflower"
          className="w-full rounded-xl ring ring-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 resize-none h-24 transition"
          rows={3}
        />

        <Button
          onClick={analyzeFoodWithAI}
          disabled={isAnalyzing || !aiFoodDescription.trim()}
          className="w-full sm:w-fit bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50"
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Meal"}
        </Button>
      </div>

      {/* Results */}
      {aiAnalysis && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 space-y-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-zinc-900">
              Analysis Results
            </h4>
          </div>

          {/* Food List */}
          <div className="space-y-1.5">
            {aiAnalysis.foods.map((food, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-zinc-100"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-800 truncate">
                    <span className="text-zinc-500 font-normal mr-1">
                      {food.quantity}×
                    </span>
                    {food.name}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {food.unit}
                  </p>
                  {/* Macros per food */}
                  <div className="flex gap-3 mt-1 text-xs">
                    <span className="text-blue-600 font-semibold">P: {food.protein || 0}g</span>
                    <span className="text-green-600 font-semibold">C: {food.carbs || 0}g</span>
                    <span className="text-orange-600 font-semibold">F: {food.fat || 0}g</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-semibold text-amber-600">
                    {food.calories}
                    <span className="text-xs text-zinc-400 ml-1">kcal</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-200">
            <div>
              <span className="text-sm font-semibold text-zinc-800">
                Total
              </span>
              <div className="flex gap-4 mt-1 text-xs font-semibold">
                <span className="text-blue-600">Protein: {aiAnalysis.totalProtein || 0}g</span>
                <span className="text-green-600">Carbs: {aiAnalysis.totalCarbs || 0}g</span>
                <span className="text-orange-600">Fat: {aiAnalysis.totalFat || 0}g</span>
              </div>
            </div>
            <span className="text-lg font-bold text-amber-600">
              {aiAnalysis.totalCalories}
              <span className="text-sm text-zinc-400 ml-1">kcal</span>
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <Button
              onClick={addAnalyzedFoods}
              disabled={isAddingFoods}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white text-sm font-medium rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50"
            >
              {isAddingFoods ? "Adding..." : "Add All Foods"}
            </Button>

            <Button
              onClick={() => {
                setAiAnalysis(null);
                setAiFoodDescription("");
              }}
              className="flex-1 sm:flex-none bg-zinc-200 hover:bg-zinc-300 text-zinc-700 text-sm font-medium rounded-xl transition"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
