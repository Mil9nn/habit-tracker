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

export function AIFoodAnalysis({ onDataAdded }: AIFoodAnalysisProps) {
  const [aiFoodDescription, setAiFoodDescription] = useState('')
  const [aiAnalysis, setAiAnalysis] = useState<FoodAnalysis | null>(null)
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
    if (!aiFoodDescription.trim()) return
    setIsAnalyzing(true)
    try {
      // Use smart time-based meal categorization instead of hardcoded 'breakfast'
      const currentMealType = categorizeMeal(new Date())
      const response = await fetch('/api/ai/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodDescription: aiFoodDescription, mealType: currentMealType })
      })
      if (response.ok) setAiAnalysis(await response.json())
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
      const { macros, micros } = aiAnalysis.totals
      // Use smart time-based meal categorization for the logged meal
      const currentMealType = categorizeMeal(new Date())
      const mealData = {
        foodName: aiAnalysis.foods.map((f) => `${f.quantity}× ${f.name}`).join(', '),
        calories: aiAnalysis.totals.calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat,
        fiber: macros.fiber,
        mealType: currentMealType, // Use time-based categorization
        quantity: 1,
        vitamins: micros.vitamins,
        minerals: micros.minerals,
        cholesterol: micros.other.cholesterol,
        sugar: micros.other.sugar,
        mealItems: aiAnalysis.foods.map((food) => ({
          name: food.name,
          quantity: food.quantity,
          calories: food.calories,
          protein: food.macros.protein,
          carbs: food.macros.carbs,
          fat: food.macros.fat,
          fiber: food.macros.fiber,
          vitamins: food.micros.vitamins,
          minerals: food.micros.minerals,
          cholesterol: food.micros.other.cholesterol,
          sugar: food.micros.other.sugar
        }))
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
        className="bg-white rounded-2xl p-4 space-y-2"
        style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)' }}
      >

        <textarea
          value={aiFoodDescription}
          onChange={(e) => setAiFoodDescription(e.target.value)}
          placeholder="e.g. 2 eggs, toast with butter, black coffee…"
          rows={3}
          className="w-full resize-none text-sm bg-zinc-50 rounded-xl px-3 py-2.5 text-zinc-800 placeholder:text-zinc-400 focus:outline-none leading-relaxed"
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

      {/* ── Results Card ── */}
      {aiAnalysis && (
        <div className="relative mt-6">

          {/* Floating total kcal badge — overlaps top border */}
          <div
            className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white text-xs font-bold"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
              boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
              letterSpacing: '0.03em',
              whiteSpace: 'nowrap'
            }}
          >
            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343M12 3v1m6.364 1.636l-.707.707M21 12h-1M17.657 5.343l-.707.707" />
            </svg>
            {aiAnalysis.totals.calories} kcal total
          </div>

          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: '0 4px 28px -4px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)' }}
          >
            {/* Header strip */}
            <div
              className="px-4 pt-6 pb-3 flex items-center justify-between"
              style={{ borderBottom: '1px solid #f4f4f5' }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="block w-1 h-4 rounded-full"
                  style={{ background: 'linear-gradient(180deg, #0ea5e9, #6366f1)' }}
                />
                <span className="text-xs font-semibold text-zinc-700" style={{ letterSpacing: '0.04em' }}>
                  ANALYSIS COMPLETE
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-medium">
                {aiAnalysis.foods.length} item{aiAnalysis.foods.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Food items */}
            <div className="px-3 py-2 space-y-1">
              {aiAnalysis.foods.map((food, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors"
                  style={{ background: i % 2 === 0 ? '#fafafa' : '#ffffff' }}
                >
                  <div className="min-w-0 flex-1 flex items-center gap-2">
                    <span
                      className="shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
                    >
                      {food.quantity}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-800 truncate leading-tight">{food.name}</p>
                      <p className="text-[10px] text-zinc-400 leading-tight">{food.unit}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-zinc-700 shrink-0 ml-2">
                    {food.calories}
                    <span className="text-[10px] font-normal text-zinc-400 ml-0.5">kcal</span>
                  </span>
                </div>
              ))}
            </div>

            {/* Macros strip — dark floating panel overlapping food/micro boundary */}
            <div className="px-3 pb-1">
              <div
                className="relative -mb-2 rounded-xl px-4 py-3 grid grid-cols-4 gap-2"
                style={{
                  background: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
                  boxShadow: '0 8px 20px -4px rgba(0,0,0,0.25)'
                }}
              >
                <div className="text-center">
                  <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">Protein</p>
                  <p className="text-sm font-bold text-sky-400">
                    {aiAnalysis.totals.macros.protein}
                    <span className="text-[10px] font-normal text-zinc-500">g</span>
                  </p>
                </div>
                <div className="text-center" style={{ borderLeft: '1px solid #3f3f46' }}>
                  <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">Carbs</p>
                  <p className="text-sm font-bold text-amber-400">
                    {aiAnalysis.totals.macros.carbs}
                    <span className="text-[10px] font-normal text-zinc-500">g</span>
                  </p>
                </div>
                <div className="text-center" style={{ borderLeft: '1px solid #3f3f46' }}>
                  <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">Fat</p>
                  <p className="text-sm font-bold text-rose-400">
                    {aiAnalysis.totals.macros.fat}
                    <span className="text-[10px] font-normal text-zinc-500">g</span>
                  </p>
                </div>
                <div className="text-center" style={{ borderLeft: '1px solid #3f3f46' }}>
                  <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">Fiber</p>
                  <p className="text-sm font-bold text-emerald-400">
                    {aiAnalysis.totals.macros.fiber}
                    <span className="text-[10px] font-normal text-zinc-500">g</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Micro-nutrients */}
            {microEntries.length > 0 && (
              <div className="px-4 pt-5 pb-3" style={{ borderTop: '0px' }}>
                <p className="text-[9px] font-bold tracking-widest uppercase text-zinc-400 mb-2">Micronutrients</p>
                <div className="flex flex-wrap gap-1.5">
                  {microEntries.map(({ label, val, color }) => (
                    <span
                      key={label}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: `${color}15`,
                        color,
                        border: `1px solid ${color}30`
                      }}
                    >
                      {label} · {val}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div
              className="flex gap-2 px-3 py-3 mt-1"
              style={{ borderTop: '1px solid #f4f4f5' }}
            >
              <button
                onClick={addAnalyzedFoods}
                disabled={isAddingFoods}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-95 disabled:opacity-40"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  boxShadow: '0 2px 10px rgba(16,185,129,0.25)'
                }}
              >
                {isAddingFoods ? 'Adding…' : '+ Confirm Meal'}
              </button>
              <button
                onClick={() => { setAiAnalysis(null); setAiFoodDescription('') }}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-500 bg-zinc-100 hover:bg-zinc-200 transition-all duration-200 active:scale-95"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}