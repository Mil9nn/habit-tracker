import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function mlToL(ml: number): string {
  return `${(ml / 1000).toFixed(1)} L`
}

export function formatToOneDecimal(value: number): string {
  return value.toFixed(1)
}
