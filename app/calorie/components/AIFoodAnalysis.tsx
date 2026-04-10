'use client'

import { useState } from 'react'

interface FoodAnalysis {
  foods: Array<{
    name: string
    quantity: number
    unit: string
    calories: number
    macros: { 
      protein: number
      carbs: number
      fat: number
      fiber: number
    }
    micros: {
      vitamins: {
        vitaminA: number
        vitaminC: number
        vitaminD: number
        vitaminB6: number
        vitaminB7: number
        vitaminB12: number
      }
      minerals: {
        iron: number
        magnesium: number
        zinc: number
        calcium: number
        potassium: number
        sodium: number
      }
      other: { 
        cholesterol: number
        sugar: number
      }
    }
  }>
  totals: {
    calories: number
    macros: { 
      protein: number
      carbs: number
      fat: number
      fiber: number
    }
    micros: {
      vitamins: {
        vitaminA: number
        vitaminC: number
        vitaminD: number
        vitaminB6: number
        vitaminB7: number
        vitaminB12: number
      }
      minerals: {
        iron: number
        magnesium: number
        zinc: number
        calcium: number
        potassium: number
        sodium: number
      }
      other: { 
        cholesterol: number
        sugar: number
      }
    }
  }
}

interface AIFoodAnalysisProps {
  onDataAdded?: () => void
}

export default function AIFoodAnalysis({ onDataAdded }: { onDataAdded?: () => void }) {
  const [aiFoodDescription, setAiFoodDescription] = useState('')
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isAddingFoods, setIsAddingFoods] = useState(false)

  // Smart meal categorization based on time of day
  const categorizeMeal = (time: Date): 'breakfast' | 'lunch' | 'dinner' | 'snack' => {
    const hour = time.getHours()
    if (hour < 11) return 'breakfast'  // 5:00 AM - 10:59 AM
    if (hour < 16) return 'lunch'      // 11:00 AM - 3:59 PM  
    if (hour < 22) return 'dinner'     // 4:00 PM - 9:59 PM
    return 'snack'                       // 10:00 PM - 4:59 AM
  }

  const analyzeFoodWithAI = async () => {
    if (!aiFoodDescription.trim() || isAnalyzing || isAddingFoods) {
      return
    }
    setIsAnalyzing(true)
    try {
      // Use smart time-based meal categorization instead of hardcoded 'breakfast'
      const currentMealType = categorizeMeal(new Date())
      const response = await fetch('/api/ai/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodDescription: aiFoodDescription, mealType: currentMealType })
      })
      if (response.ok) {
        const analysis = await response.json()
        
        // Directly add analyzed foods without confirmation
        await addAnalyzedFoodsDirectly(analysis)
        setAiFoodDescription('') // Clear input
      }
    } catch (error) {
      console.error('Error analyzing food:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  
  const addAnalyzedFoodsDirectly = async (analysis: any) => {
    if (!analysis?.foods || isAddingFoods) {
      return
    }
    setIsAddingFoods(true)
    try {
      const { macros, micros } = analysis.totals
      // Use smart time-based meal categorization for the logged meal
      const currentMealType = categorizeMeal(new Date())
      const mealData = {
        inputText: analysis.foods.map((f: any) => `${f.quantity}× ${f.name}`).join(', '),
        mealType: currentMealType,
        foods: analysis.foods.map((food: any) => ({
          name: food.name,
          quantity: food.quantity,
          unit: food.unit || 'serving',
          calories: food.calories,
          macros: {
            protein: food.macros.protein,
            carbs: food.macros.carbs,
            fat: food.macros.fat,
            fiber: food.macros.fiber
          },
          micros: {
            vitamins: food.micros.vitamins,
            minerals: food.micros.minerals,
            other: {
              cholesterol: food.micros.other.cholesterol,
              sugar: food.micros.other.sugar
            }
          }
        })),
        totals: {
          calories: analysis.totals.calories,
          macros: {
            protein: macros.protein,
            carbs: macros.carbs,
            fat: macros.fat,
            fiber: macros.fiber
          },
          micros: {
            vitamins: micros.vitamins,
            minerals: micros.minerals,
            other: {
              cholesterol: micros.other.cholesterol,
              sugar: micros.other.sugar
            }
          }
        },
        method: 'ai'
      }
      const res = await fetch('/api/calories/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mealData)
      })
      if (res.ok) {
        setAiAnalysis(null)
        setAiFoodDescription('')
        onDataAdded?.()
      }
    } catch (error) {
      console.error('Error adding analyzed foods:', error)
    } finally {
      setIsAddingFoods(false)
    }
  }

  const totalVitamins = aiAnalysis?.totals.micros.vitamins
  const totalMinerals = aiAnalysis?.totals.micros.minerals
  const totalOther = aiAnalysis?.totals.micros.other

  const microEntries = [
    ...[
      { label: 'Vit A', val: totalVitamins?.vitaminA },
      { label: 'B6', val: totalVitamins?.vitaminB6 },
      { label: 'B12', val: totalVitamins?.vitaminB12 },
      { label: 'Vit C', val: totalVitamins?.vitaminC },
      { label: 'Vit D', val: totalVitamins?.vitaminD },
      { label: 'B7', val: totalVitamins?.vitaminB7 },
    ].filter(x => x.val).map(x => ({ ...x, color: '#16a34a' })),
    ...[
      { label: 'Iron', val: totalMinerals?.iron },
      { label: 'Mg', val: totalMinerals?.magnesium },
      { label: 'Zn', val: totalMinerals?.zinc },
      { label: 'Ca', val: totalMinerals?.calcium },
      { label: 'K', val: totalMinerals?.potassium },
      { label: 'Na', val: totalMinerals?.sodium },
    ].filter(x => x.val).map(x => ({ ...x, color: '#d97706' })),
    ...[
      { label: 'Chol', val: totalOther?.cholesterol },
      { label: 'Sugar', val: totalOther?.sugar },
    ].filter(x => x.val).map(x => ({ ...x, color: '#dc2626' })),
  ]

  return (
    <div
      style={{ fontFamily: "'DM Sans', 'Outfit', 'Sora', system-ui, sans-serif" }}
      className="px-3 py-3 max-w-sm mx-auto"
    >
      {/* ── Input Card ── */}
      <div
        className="bg-zinc-50 rounded-2xl p-4 space-y-2"
        style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)' }}
      >

        <textarea
          value={aiFoodDescription}
          onChange={(e) => setAiFoodDescription(e.target.value)}
          placeholder="e.g. 2 eggs, toast with butter, black coffee…"
          rows={3}
          className="w-full shadow-sm resize-none text-sm bg-white rounded-xl px-3 py-2.5 text-zinc-800 placeholder:text-zinc-400 focus:outline-none leading-relaxed"
        />

        <button
          onClick={analyzeFoodWithAI}
          disabled={isAnalyzing || !aiFoodDescription.trim()}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: isAnalyzing
              ? '#3f3f46'
              : 'linear-gradient(135deg, #18181b 0%, #3f3f46 100%)',
            letterSpacing: '0.02em',
            boxShadow: '0 2px 12px rgba(24,24,27,0.18)'
          }}
        >
          {isAnalyzing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-3.5 w-3.5 text-white/60" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Analyzing…
            </span>
          ) : (
            'Analyze Meal'
          )}
        </button>
      </div>
    </div>
  )
}