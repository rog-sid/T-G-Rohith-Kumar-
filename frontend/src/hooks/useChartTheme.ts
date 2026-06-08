import { useThemeStore } from '@/store/useThemeStore'

export interface ChartTheme {
  text: string
  mutedText: string
  grid: string
  tooltipBg: string
  tooltipBorder: string
  palette: string[]
}

const LIGHT: ChartTheme = {
  text: '#3f3f46',
  mutedText: '#71717a',
  grid: '#e4e4e7',
  tooltipBg: '#ffffff',
  tooltipBorder: '#e4e4e7',
  palette: ['#0d9488', '#0891b2', '#7c3aed', '#d97706', '#dc2626', '#2563eb', '#db2777', '#16a34a'],
}

const DARK: ChartTheme = {
  text: '#d4d4d8',
  mutedText: '#a1a1aa',
  grid: '#3f3f46',
  tooltipBg: '#27272a',
  tooltipBorder: '#3f3f46',
  palette: ['#2dd4bf', '#22d3ee', '#a78bfa', '#fbbf24', '#f87171', '#60a5fa', '#f472b6', '#4ade80'],
}

export function useChartTheme(): ChartTheme {
  const theme = useThemeStore((s) => s.theme)
  return theme === 'dark' ? DARK : LIGHT
}
