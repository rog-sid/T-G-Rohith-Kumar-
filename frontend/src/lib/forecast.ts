import type { Job } from './types'
import { weeklyTrend } from './analytics'

export type ForecastConfidence = 'Low' | 'Medium' | 'High'

export interface ForecastRow {
  label: string
  actual: number | null
  forecast: number | null
  type: 'actual' | 'forecast'
}

export interface ForecastResult {
  rows: ForecastRow[]
  confidence: ForecastConfidence
  direction: 'increase' | 'decrease' | 'stay flat'
  changePct: number
  recordCount: number
}

/** Simple Moving Average forecast (3-week window) for the next 4 weeks. */
export function buildForecast(jobs: Job[], windowSize = 3, horizon = 4): ForecastResult {
  const history = weeklyTrend(jobs, 8)
  const counts = history.map((h) => h.count)
  const recordCount = jobs.length

  // Build combined series for chart/table
  const rows: ForecastRow[] = history.map((h) => ({
    label: h.label,
    actual: h.count,
    forecast: null,
    type: 'actual',
  }))

  // Connect the lines: the last actual point also carries a forecast value.
  if (rows.length > 0) {
    rows[rows.length - 1].forecast = rows[rows.length - 1].actual
  }

  const working = [...counts]
  const lastDate = history.length > 0 ? new Date(history[history.length - 1].weekStart) : new Date()

  for (let i = 1; i <= horizon; i++) {
    const window = working.slice(-windowSize)
    const avg = window.length > 0 ? window.reduce((a, b) => a + b, 0) / window.length : 0
    const value = Math.max(0, Math.round(avg))
    working.push(value)

    const d = new Date(lastDate)
    d.setDate(d.getDate() + i * 7)
    const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    rows.push({ label, actual: null, forecast: value, type: 'forecast' })
  }

  // Determine direction: compare avg of last 3 actuals vs avg of forecast horizon
  const lastActuals = counts.slice(-windowSize)
  const baseAvg = lastActuals.length ? lastActuals.reduce((a, b) => a + b, 0) / lastActuals.length : 0
  const forecastVals = working.slice(counts.length)
  const fcAvg = forecastVals.length ? forecastVals.reduce((a, b) => a + b, 0) / forecastVals.length : 0
  const changePct = baseAvg === 0 ? 0 : Math.round(((fcAvg - baseAvg) / baseAvg) * 100)

  let direction: ForecastResult['direction'] = 'stay flat'
  if (changePct > 5) direction = 'increase'
  else if (changePct < -5) direction = 'decrease'

  let confidence: ForecastConfidence = 'Low'
  if (recordCount > 50) confidence = 'High'
  else if (recordCount >= 20) confidence = 'Medium'

  return { rows, confidence, direction, changePct, recordCount }
}
