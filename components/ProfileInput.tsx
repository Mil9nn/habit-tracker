'use client'

import { Input } from '@/components/ui/input'

interface ProfileInputProps {
  type?: 'number' | 'text'
  placeholder: string
  className?: string
  width?: string
  textSize?: string
  register: any
  name: string
  validation?: any
}

export default function ProfileInput({
  type = 'number',
  placeholder,
  className = "rounded-xl focus:ring-2 focus:ring-indigo-400 transition",
  width = "w-20",
  textSize = "text-sm",
  register,
  name,
  validation
}: ProfileInputProps) {
  return (
    <Input
      type={type}
      placeholder={placeholder}
      className={`h-10 ${textSize} ${width} ${className}`}
      {...register(name, validation)}
    />
  )
}
