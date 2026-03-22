'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'

// Zod schemas for calorie tracking
export const calorieLogSchema = z.object({
  foodName: z.string().min(1, 'Food name is required'),
  calories: z.number().min(1, 'Calories must be at least 1').max(5000, 'Calories must be less than 5000'),
  protein: z.number().min(0, 'Protein must be positive').max(500, 'Protein must be less than 500g').optional(),
  carbs: z.number().min(0, 'Carbs must be positive').max(500, 'Carbs must be less than 500g').optional(),
  fat: z.number().min(0, 'Fat must be positive').max(500, 'Fat must be less than 500g').optional(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  quantity: z.number().min(0.1, 'Quantity must be positive').max(10, 'Quantity must be less than 10').optional()
})

export type CalorieLogForm = z.infer<typeof calorieLogSchema>

interface ManualEntryFormProps {
  showManualEntry: boolean
  setShowManualEntry: (show: boolean) => void
  isSubmitting: boolean
  onSubmit: (data: CalorieLogForm) => void
  onToggleMode?: () => void
}

export function ManualEntryForm({ 
  showManualEntry, 
  setShowManualEntry, 
  isSubmitting, 
  onSubmit,
  onToggleMode 
}: ManualEntryFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CalorieLogForm>({
    resolver: zodResolver(calorieLogSchema)
  })

  if (!showManualEntry) {
    return (
      <div className="flex justify-center">
        <Button
          onClick={() => setShowManualEntry(true)}
          variant="outline"
          className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-gray-900 px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
        >
          <Plus className="h-4 w-4 mr-2" />
          Manual Entry
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 text-lg">Manual Entry</h3>
        <Button
          onClick={onToggleMode}
          variant="outline"
          className="bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
        >
          Food Analysis
        </Button>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-3">
          <Input
            type="text"
            {...register('foodName')}
            placeholder="Food name"
            className={errors.foodName ? 'ring-2 ring-red-400 focus:ring-red-400' : 'ring-2 focus:ring-blue-400'}
          />
          {errors.foodName && (
            <p className="text-sm text-red-500 mt-1">{errors.foodName.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            {...register('calories', { valueAsNumber: true })}
            placeholder="Calories"
            className={'text-xs ring-2 focus:ring-blue-400'}
          />
          <Input
            type="number"
            {...register('quantity', { valueAsNumber: true })}
            placeholder="Quantity"
            className={'text-xs ring-2 focus:ring-blue-400'}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            type="number"
            {...register('protein', { valueAsNumber: true })}
            placeholder="Protein"
            className={'text-xs ring-2 focus:ring-blue-400'}
          />
          <Input
            type="number"
            {...register('carbs', { valueAsNumber: true })}
            placeholder="Carbs"
            className={'text-xs ring-2 focus:ring-blue-400'}
          />
          <Input
            type="number"
            {...register('fat', { valueAsNumber: true })}
            placeholder="Fats"
            className={'text-xs ring-2 focus:ring-blue-400'}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <select
            {...register('mealType')}
            className="w-full h-10 px-3 text-xs rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            onClick={() => setShowManualEntry(false)}
            variant="outline"
            className="flex-1 bg-red-400 hover:bg-gray-100 h-11 border-gray-200 text-white"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-sm h-11 text-white"
          >
            {isSubmitting ? 'Adding...' : 'Add Entry'}
          </Button>
        </div>
      </form>
    </div>
  )
}
