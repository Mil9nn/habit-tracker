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
  register,
  name,
  validation
}: ProfileInputProps) {
  return (
    <input
  type={type}
  placeholder={placeholder}
  className="h-10 w-15 border-0 border-b-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-0"
  {...register(name, validation)}
/>
  )
}
