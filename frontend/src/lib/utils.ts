import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a number as Indian Rupees, e.g. 45000 -> ₹45,000 */
export function formatINR(value: number): string {
  if (!isFinite(value)) return '₹0'
  return '₹' + Math.round(value).toLocaleString('en-IN')
}

/** Compact INR, e.g. 45000 -> ₹45K, 1250000 -> ₹12.5L */
export function formatINRCompact(value: number): string {
  if (!isFinite(value) || value === 0) return '₹0'
  if (value >= 10000000) return '₹' + (value / 10000000).toFixed(1).replace(/\.0$/, '') + 'Cr'
  if (value >= 100000) return '₹' + (value / 100000).toFixed(1).replace(/\.0$/, '') + 'L'
  if (value >= 1000) return '₹' + (value / 1000).toFixed(0) + 'K'
  return '₹' + Math.round(value).toString()
}

export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString('en-IN')
}

export function percent(part: number, whole: number): number {
  if (whole === 0) return 0
  return Math.round((part / whole) * 100)
}
