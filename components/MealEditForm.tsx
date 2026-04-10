'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Plus, Trash2 } from 'lucide-react'
import { FoodItem } from '../app/calorie/page'

interface MealEditFormProps {
  meal: {
    _id: string
    foodName: string
    mealItems: FoodItem[]
    calories: number
    protein?: number
    carbs?: number
    fat?: number
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  }
  onSave: (updatedMeal: any) => void
  onCancel: () => void
}

export function MealEditForm({ meal, onSave, onCancel }: MealEditFormProps) {
  const [mealItems, setMealItems] = useState<FoodItem[]>(meal.mealItems)
  const [mealType, setMealType] = useState(meal.mealType)

  const addMealItem = () => {
    setMealItems([...mealItems, {
      name: '',
      quantity: 1,
      unit: 'serving',
      calories: 0,
      macros: {
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0
      },
      micros: {
        vitamins: {
          vitaminA: 0,
          vitaminC: 0,
          vitaminD: 0,
          vitaminB6: 0,
          vitaminB7: 0,
          vitaminB12: 0
        },
        minerals: {
          iron: 0,
          magnesium: 0,
          zinc: 0,
          calcium: 0,
          potassium: 0,
          sodium: 0
        },
        other: {
          cholesterol: 0,
          sugar: 0
        }
      }
    }])
  }

  const updateMealItem = (index: number, field: string, value: string | number) => {
    const updatedItems = [...mealItems]
    if (field === 'name' || field === 'quantity' || field === 'unit' || field === 'calories') {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: field === 'name' || field === 'unit' ? value : Number(value) || 0
      }
    } else if (field.startsWith('macros.')) {
      const macroField = field.replace('macros.', '') as 'protein' | 'carbs' | 'fat' | 'fiber'
      updatedItems[index] = {
        ...updatedItems[index],
        macros: {
          ...updatedItems[index].macros,
          [macroField]: Number(value) || 0
        }
      }
    }
    setMealItems(updatedItems)
  }

  const removeMealItem = (index: number) => {
    setMealItems(mealItems.filter((_, i) => i !== index))
  }

  const calculateTotals = () => {
    return mealItems.reduce((totals, item) => ({
      calories: totals.calories + (item.calories * item.quantity),
      protein: totals.protein + ((item.macros?.protein || 0) * item.quantity),
      carbs: totals.carbs + ((item.macros?.carbs || 0) * item.quantity),
      fat: totals.fat + ((item.macros?.fat || 0) * item.quantity)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
  }

  const handleSave = () => {
    const totals = calculateTotals()
    const updatedMeal = {
      ...meal,
      foodName: `${mealItems.map(item => `${item.quantity}× ${item.name}`).join(', ')}`,
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fat: totals.fat,
      mealType,
      mealItems
    }
    onSave(updatedMeal)
  }

  const totals = calculateTotals()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">Edit Meal</h3>
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
          {/* Meal Type */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Meal Type
            </label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as any)}
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          {/* Meal Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-zinc-700">
                Food Items
              </label>
              <Button
                onClick={addMealItem}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {mealItems.map((item, index) => (
                <div key={index} className="border border-zinc-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Food name"
                      value={item.name}
                      onChange={(e) => updateMealItem(index, 'name', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateMealItem(index, 'quantity', e.target.value)}
                      className="w-20"
                    />
                    <Button
                      onClick={() => removeMealItem(index)}
                      variant="ghost"
                      size="sm"
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <Input
                      type="number"
                      placeholder="Calories"
                      value={item.calories}
                      onChange={(e) => updateMealItem(index, 'calories', e.target.value)}
                      className="text-xs"
                    />
                    <Input
                      type="number"
                      placeholder="Protein (g)"
                      value={item.macros?.protein || 0}
                      onChange={(e) => updateMealItem(index, 'macros.protein', e.target.value)}
                      className="text-xs"
                    />
                    <Input
                      type="number"
                      placeholder="Carbs (g)"
                      value={item.macros?.carbs || 0}
                      onChange={(e) => updateMealItem(index, 'macros.carbs', e.target.value)}
                      className="text-xs"
                    />
                    <Input
                      type="number"
                      placeholder="Fat (g)"
                      value={item.macros?.fat || 0}
                      onChange={(e) => updateMealItem(index, 'macros.fat', e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-zinc-700 mb-2">Meal Totals</h4>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="text-center p-2 bg-amber-50 rounded-lg">
                <div className="font-semibold text-amber-600">{totals.calories}</div>
                <div className="text-xs text-zinc-500">Calories</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="font-semibold text-green-600">{totals.protein.toFixed(1)}g</div>
                <div className="text-xs text-zinc-500">Protein</div>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="font-semibold text-blue-600">{totals.carbs.toFixed(1)}g</div>
                <div className="text-xs text-zinc-500">Carbs</div>
              </div>
              <div className="text-center p-2 bg-orange-50 rounded-lg">
                <div className="font-semibold text-orange-600">{totals.fat.toFixed(1)}g</div>
                <div className="text-xs text-zinc-500">Fat</div>
              </div>
            </div>
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
            onClick={handleSave}
            className="bg-amber-500 hover:bg-amber-600"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
