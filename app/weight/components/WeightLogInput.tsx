'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Field, FieldError, FieldGroup } from '@/components/ui/field'

const weightFormSchema = z.object({
  weight: z.string()
    .min(1, 'Weight is required')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Please enter a valid weight',
    }),
  unit: z.enum(['kg', 'lbs']),
}).superRefine((data, ctx) => {
  const weightValue = parseFloat(data.weight);
  if (!isNaN(weightValue)) {
    if (data.unit === 'kg' && weightValue > 635) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_big,
        maximum: 635,
        type: 'number',
        inclusive: true,
        message: 'Weight must be 635 kg or less',
        path: ['weight'],
        origin: 'number',
      });
    } else if (data.unit === 'lbs' && weightValue > 1400) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_big,
        maximum: 1400,
        type: 'number',
        inclusive: true,
        message: 'Weight must be 1400 lbs or less',
        path: ['weight'],
        origin: 'number',
      });
    }
  }
});

type WeightFormValues = z.infer<typeof weightFormSchema>

interface WeightLogInputProps {
  weight: string
  setWeight: (weight: string) => void
  unit: string
  setUnit: (unit: string) => void
  onLog: (weight: string, unit: string) => void
  logged: boolean
}

export default function WeightLogInput({
  weight,
  setWeight,
  unit,
  setUnit,
  onLog,
  logged
}: WeightLogInputProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<WeightFormValues>({
    resolver: zodResolver(weightFormSchema),
    mode: "onChange",
    defaultValues: {
      weight: weight,
      unit: unit as 'kg' | 'lbs',
    },
  })

  const onSubmit = async (values: WeightFormValues) => {
    setIsSubmitting(true)
    try {
      // Call parent onLog function with form values
      onLog(values.weight, values.unit)

      // Update parent state
      setWeight(values.weight)
      setUnit(values.unit)

      // Reset form with current values
      form.reset(values)
    } catch (error) {
      console.error('Error logging weight:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.3 }}
      className="p-4 mb-5"
    >
      <p className="text-sm font-semibold text-gray-900 mb-4">Log Today</p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FieldGroup>
          <div className="flex items-center gap-2 flex-nowrap w-full max-w-[350px]">
            <Controller
              name="weight"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="flex-shrink-0 w-50">
                  <Input
                    placeholder="e.g. 65.5"
                    {...field}
                    className="h-14 text-md px-4 bg-white shadow-sm ring-blue-500 border-none"
                    type="number"
                    step="0.1"
                    min="0"
                    max={form.getValues('unit') === 'kg' ? '635' : '1400'}
                    disabled={isSubmitting}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="unit"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="flex-shrink-0 w-[100px]">
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger
                      className="min-h-14 w-full bg-white shadow-sm"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent className='p-2'>
                      <SelectItem className='p-2' value="kg">kg</SelectItem>
                      <SelectItem className='p-2' value="lbs">lbs</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
            className="w-full min-h-12 bg-blue-400 hover:bg-blue-500"
            size="default"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={logged ? 'done' : isSubmitting ? 'loading' : 'log'}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="block"
              >
                {isSubmitting ? '...' : logged ? '✓ Done' : 'Log'}
              </motion.span>
            </AnimatePresence>
          </Button>
        </FieldGroup>
      </form>
    </motion.div>
  )
}
