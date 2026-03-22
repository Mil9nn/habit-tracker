'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from 'lucide-react'
import { CalorieLog } from './CalorieTracker'

interface SimpleEditFormProps {
  log: CalorieLog
  onSave: (updatedLog: any) => void
  onCancel: () => void
}

export function SimpleEditForm({ log, onSave, onCancel }: SimpleEditFormProps) {
  const [foodName, setFoodName] = useState(log.foodName)
  const [calories, setCalories] = useState(log.calories)
  const [protein, setProtein] = useState(log.protein || 0)
  const [carbs, setCarbs] = useState(log.carbs || 0)
  const [fat, setFat] = useState(log.fat || 0)
  const [quantity, setQuantity] = useState(log.quantity || 1)
  const [mealType, setMealType] = useState(log.mealType)

  const handleSave = () => {
    const updatedLog = {
      ...log,
      foodName,
      calories,
      protein,
      carbs,
      fat,
      quantity,
      mealType,
      isMeal: false
    }
    onSave(updatedLog)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">Edit Food Entry</h3>
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
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Food Name
            </label>
            <Input
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="Food name"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Quantity
              </label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min="0.1"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Calories
              </label>
              <Input
                type="number"
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                min="0"
              />
            </div>
          </div>

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

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Macros (optional)
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Input
                  type="number"
                  placeholder="Protein (g)"
                  value={protein}
                  onChange={(e) => setProtein(Number(e.target.value))}
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Carbs (g)"
                  value={carbs}
                  onChange={(e) => setCarbs(Number(e.target.value))}
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Fat (g)"
                  value={fat}
                  onChange={(e) => setFat(Number(e.target.value))}
                  min="0"
                  step="0.1"
                />
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
