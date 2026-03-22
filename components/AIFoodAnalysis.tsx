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
  onToggleMode?: () => void
}

export function AIFoodAnalysis({ onDataAdded, onToggleMode }: AIFoodAnalysisProps) {
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
        
        // Create a single meal entry instead of individual food entries
        setIsAddingFoods(true)
        
        const mealData = {
          foodName: `${analysis.foods.map((f: any) => `${f.quantity}× ${f.name}`).join(', ')}`,
          calories: analysis.totalCalories,
          protein: analysis.totalProtein || 0,
          carbs: analysis.totalCarbs || 0,
          fat: analysis.totalFat || 0,
          mealType: 'breakfast',
          quantity: 1,
          isMeal: true,
          mealItems: analysis.foods.map((food: any) => ({
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
          // Clear everything and refresh data
          setAiAnalysis(null)
          setAiFoodDescription('')
          onDataAdded?.()
        } else {
          // If adding failed, still show the analysis so user can try manually
          setAiAnalysis(analysis)
          console.error('Failed to add meal')
        }
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
        foodName: `${aiAnalysis.foods.map((f: any) => `${f.quantity}× ${f.name}`).join(', ')}`,
        calories: aiAnalysis.totalCalories,
        protein: aiAnalysis.totalProtein || 0,
        carbs: aiAnalysis.totalCarbs || 0,
        fat: aiAnalysis.totalFat || 0,
        mealType: 'breakfast',
        quantity: 1,
        isMeal: true,
        mealItems: aiAnalysis.foods.map((food: any) => ({
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
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900">
          Food Analysis
        </h3>
        <Button
          onClick={onToggleMode}
          variant="outline"
          className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
        >
          Manual Entry
        </Button>
      </div>

      {/* Input Section */}
      <div className="flex flex-col gap-3">
        <textarea
          value={aiFoodDescription}
          onChange={(e) => setAiFoodDescription(e.target.value)}
          placeholder="e.g. 2 bananas, protein shake, 3 chapatis with cauliflower"
          className="w-full h-30 rounded-xl ring ring-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-none transition"
          rows={3}
        />

        <Button
          onClick={analyzeFoodWithAI}
          disabled={isAnalyzing || !aiFoodDescription.trim()}
          className="w-full h-12 sm:w-fit bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium px-4 py-2 rounded-full shadow-sm hover:shadow-md hover:scale-105 active:scale-95 ease-in-out transition-all disabled:opacity-50"
        >
          {isAnalyzing ? "Adding..." : "Add Meal"}
        </Button>
      </div>

      {/* Results - Only show if adding failed */}
      {aiAnalysis && (
        <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 space-y-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-red-900">
              ⚠️ Adding Failed - Manual Review Required
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
                    <span className="text-blue-600 font-semibold">Protein: {food.protein || 0}g</span>
                    <span className="text-green-600 font-semibold">Carbs: {food.carbs || 0}g</span>
                    <span className="text-orange-600 font-semibold">Fat: {food.fat || 0}g</span>
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

          {/* Actions - Only manual add option */}
          <div className="flex gap-2 pt-1">
            <Button
              onClick={addAnalyzedFoods}
              disabled={isAddingFoods}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white text-sm font-medium rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50"
            >
              {isAddingFoods ? "Adding..." : "Try Adding Again"}
            </Button>

            <Button
              onClick={() => {
                setAiAnalysis(null);
                setAiFoodDescription("");
              }}
              className="bg-zinc-200 hover:bg-zinc-300 text-zinc-700 text-sm font-medium rounded-xl transition"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
