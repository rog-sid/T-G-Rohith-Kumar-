import { startOfWeek, subWeeks, format, parseISO, isWithinInterval, addWeeks } from 'date-fns'
import type { Job } from './types'

export interface Filters {
  role: string
  city: string
  skill: string
  workMode: string
  experience: string
  dateRange: string // 'all' | '4w' | '8w' | '12w'
  search: string
}

export const DEFAULT_FILTERS: Filters = {
  role: 'all',
  city: 'all',
  skill: 'all',
  workMode: 'all',
  experience: 'all',
  dateRange: 'all',
  search: '',
}

export const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'All time' },
  { value: '4w', label: 'Last 4 weeks' },
  { value: '8w', label: 'Last 8 weeks' },
  { value: '12w', label: 'Last 12 weeks' },
]

function dateRangeToWeeks(range: string): number | null {
  switch (range) {
    case '4w':
      return 4
    case '8w':
      return 8
    case '12w':
      return 12
    default:
      return null
  }
}

export function applyFilters(jobs: Job[], f: Filters): Job[] {
  const weeks = dateRangeToWeeks(f.dateRange)
  const cutoff = weeks ? subWeeks(new Date(), weeks) : null
  const search = f.search.trim().toLowerCase()

  return jobs.filter((j) => {
    if (f.role !== 'all' && j.title !== f.role) return false
    if (f.city !== 'all' && j.city !== f.city) return false
    if (f.workMode !== 'all' && j.workMode !== f.workMode) return false
    if (f.experience !== 'all' && j.experience !== f.experience) return false
    if (f.skill !== 'all' && !j.skills.includes(f.skill)) return false
    if (cutoff) {
      const d = parseISO(j.postedDate)
      if (d < cutoff) return false
    }
    if (search) {
      const hay = `${j.title} ${j.company}`.toLowerCase()
      if (!hay.includes(search)) return false
    }
    return true
  })
}

export function median(nums: number[]): number {
  if (nums.length === 0) return 0
  const sorted = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
}

export function mean(nums: number[]): number {
  if (nums.length === 0) return 0
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
}

export interface Kpis {
  total: number
  active: number
  medianSalary: number
  topSkill: string
  topSkillCount: number
  topCompany: string
  topCompanyCount: number
}

export function computeKpis(jobs: Job[]): Kpis {
  const total = jobs.length
  const active = jobs.filter((j) => j.status === 'Active').length
  const medianSalary = median(jobs.map((j) => j.salary))
  const skills = topSkills(jobs, 1)
  const companies = countBy(jobs, (j) => j.company)
  const topCompany = companies[0]
  return {
    total,
    active,
    medianSalary,
    topSkill: skills[0]?.name ?? '—',
    topSkillCount: skills[0]?.count ?? 0,
    topCompany: topCompany?.name ?? '—',
    topCompanyCount: topCompany?.count ?? 0,
  }
}

export function countBy<T>(arr: T[], keyFn: (item: T) => string): { name: string; count: number }[] {
  const map = new Map<string, number>()
  for (const item of arr) {
    const key = keyFn(item)
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

export function topSkills(jobs: Job[], n = 10): { name: string; count: number }[] {
  const map = new Map<string, number>()
  for (const j of jobs) {
    for (const s of j.skills) {
      map.set(s, (map.get(s) ?? 0) + 1)
    }
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n)
}

export function topRoles(jobs: Job[], n = 8): { name: string; count: number }[] {
  return countBy(jobs, (j) => j.title).slice(0, n)
}

export function salaryByRole(jobs: Job[], n = 5): { name: string; salary: number; count: number }[] {
  const groups = new Map<string, number[]>()
  for (const j of jobs) {
    if (!groups.has(j.title)) groups.set(j.title, [])
    groups.get(j.title)!.push(j.salary)
  }
  return Array.from(groups.entries())
    .map(([name, salaries]) => ({ name, salary: median(salaries), count: salaries.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n)
    .sort((a, b) => b.salary - a.salary)
}

export function workModeSplit(jobs: Job[]): { name: string; count: number }[] {
  const order = ['Remote', 'Hybrid', 'Onsite']
  const counts = countBy(jobs, (j) => j.workMode)
  return order
    .map((name) => ({ name, count: counts.find((c) => c.name === name)?.count ?? 0 }))
    .filter((c) => c.count > 0)
}

export function experienceSplit(jobs: Job[]): { name: string; count: number }[] {
  const order = ['Entry', 'Associate', 'Mid', 'Senior']
  const counts = countBy(jobs, (j) => j.experience)
  return order
    .map((name) => ({ name, count: counts.find((c) => c.name === name)?.count ?? 0 }))
    .filter((c) => c.count > 0)
}

export interface TrendPoint {
  weekStart: string
  label: string
  count: number
}

/** Weekly posting counts for the last `weeks` weeks (oldest -> newest). */
export function weeklyTrend(jobs: Job[], weeks = 8): TrendPoint[] {
  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const points: TrendPoint[] = []
  for (let i = weeks - 1; i >= 0; i--) {
    const ws = subWeeks(thisWeekStart, i)
    const we = addWeeks(ws, 1)
    const count = jobs.filter((j) => {
      const d = parseISO(j.postedDate)
      return isWithinInterval(d, { start: ws, end: we }) && d < we
    }).length
    points.push({
      weekStart: format(ws, 'yyyy-MM-dd'),
      label: format(ws, 'dd MMM'),
      count,
    })
  }
  return points
}

/** Median salary for jobs that include a given skill vs. those that don't. */
export function salaryWithSkill(jobs: Job[], skill: string): { withSkill: number; without: number } {
  const withList = jobs.filter((j) => j.skills.includes(skill)).map((j) => j.salary)
  const withoutList = jobs.filter((j) => !j.skills.includes(skill)).map((j) => j.salary)
  return { withSkill: median(withList), without: median(withoutList) }
}

export function medianSalaryByWorkMode(jobs: Job[], mode: string): number {
  return median(jobs.filter((j) => j.workMode === mode).map((j) => j.salary))
}
