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
}

export function ManualEntryForm({ 
  showManualEntry, 
  setShowManualEntry, 
  isSubmitting, 
  onSubmit 
}: ManualEntryFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CalorieLogForm>({
    resolver: zodResolver(calorieLogSchema)
  })

  if (!showManualEntry) {
    return (
      <div className="text-center">
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Manual Entry</h3>
        <Button
          onClick={() => setShowManualEntry(false)}
          variant="ghost"
          className="text-gray-500 hover:text-gray-700 p-2"
        >
          ×
        </Button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex-1">
          <Input
            type="text"
            {...register('foodName')}
            placeholder="Food name"
            className={errors.foodName ? 'border-red-500 focus:border-red-500' : ''}
          />
          {errors.foodName && (
            <p className="text-sm text-red-500 mt-1">{errors.foodName.message}</p>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <Input
            type="number"
            {...register('calories', { valueAsNumber: true })}
            placeholder="Calories"
            className={errors.calories ? 'border-red-500 focus:border-red-500' : ''}
          />
          <Input
            type="number"
            {...register('protein', { valueAsNumber: true })}
            placeholder="Protein (g)"
            className={errors.protein ? 'border-red-500 focus:border-red-500' : ''}
          />
          <Input
            type="number"
            {...register('carbs', { valueAsNumber: true })}
            placeholder="Carbs (g)"
            className={errors.carbs ? 'border-red-500 focus:border-red-500' : ''}
          />
          <Input
            type="number"
            {...register('fat', { valueAsNumber: true })}
            placeholder="Fat (g)"
            className={errors.fat ? 'border-red-500 focus:border-red-500' : ''}
          />
          <select {...register('mealType')} className="border rounded px-2 py-1">
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>
        {(errors.calories || errors.protein || errors.carbs || errors.fat) && (
          <div className="text-sm text-red-500 mt-1 space-y-1">
            {errors.calories && <p>{errors.calories.message}</p>}
            {errors.protein && <p>{errors.protein.message}</p>}
            {errors.carbs && <p>{errors.carbs.message}</p>}
            {errors.fat && <p>{errors.fat.message}</p>}
          </div>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="relative overflow-hidden ring-2 ring-blue-500 rounded-full text-blue-500 bg-transparent group"
        >
          {/* Water fill span */}
          <span className="absolute inset-0 bg-blue-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></span>

          <span className="relative z-10 group-hover:text-white transition-colors duration-300">
            {isSubmitting ? "Adding..." : "Add Food"}
          </span>
        </Button>
      </form>
    </div>
  )
}
