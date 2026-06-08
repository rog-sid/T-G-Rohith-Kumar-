import type { ExperienceLevel, Job, JobStatus, WorkMode } from './types'
import { EXPERIENCE_LEVELS } from './types'

/** Deterministic PRNG (mulberry32) so the seed dataset is identical on every load. */
function mulberry32(seed: number) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20260608)

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)]
}

function weightedPick<T>(items: readonly T[], weights: readonly number[]): T {
  const total = weights.reduce((a, b) => a + b, 0)
  let r = rand() * total
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]
    if (r <= 0) return items[i]
  }
  return items[items.length - 1]
}

function gaussian(mean: number, std: number): number {
  let u = 0
  let v = 0
  while (u === 0) u = rand()
  while (v === 0) v = rand()
  return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step
}

// Salary ranges [min, max] by role and experience level (monthly INR)
const ROLE_SALARY: Record<string, Record<ExperienceLevel, [number, number]>> = {
  'Data Analyst': {
    Entry: [28000, 42000],
    Associate: [40000, 55000],
    Mid: [45000, 65000],
    Senior: [65000, 90000],
  },
  'Business Analyst': {
    Entry: [35000, 48000],
    Associate: [45000, 60000],
    Mid: [55000, 70000],
    Senior: [68000, 75000],
  },
  'SQL Developer': {
    Entry: [35000, 44000],
    Associate: [42000, 52000],
    Mid: [48000, 60000],
    Senior: [56000, 65000],
  },
  'Power BI Developer': {
    Entry: [35000, 45000],
    Associate: [43000, 54000],
    Mid: [50000, 60000],
    Senior: [56000, 65000],
  },
  'Python Analyst': {
    Entry: [40000, 50000],
    Associate: [48000, 60000],
    Mid: [55000, 68000],
    Senior: [66000, 75000],
  },
  'MIS Analyst': {
    Entry: [25000, 33000],
    Associate: [30000, 40000],
    Mid: [38000, 45000],
    Senior: [43000, 48000],
  },
  'Data Engineer': {
    Entry: [55000, 65000],
    Associate: [60000, 72000],
    Mid: [68000, 82000],
    Senior: [80000, 90000],
  },
}

// Role-typical skill pools for realism. First entry is always the "core" skill.
const ROLE_SKILLS: Record<string, string[]> = {
  'Data Analyst': [
    'SQL',
    'Excel',
    'Power BI',
    'Python',
    'Tableau',
    'EDA',
    'Data Cleaning',
    'Data Visualization',
    'KPI Reporting',
    'Pivot Tables',
  ],
  'Business Analyst': [
    'Excel',
    'SQL',
    'KPI Reporting',
    'Business Intelligence',
    'Power BI',
    'Data Visualization',
    'VBA',
    'Pivot Tables',
  ],
  'SQL Developer': ['SQL', 'MySQL', 'PostgreSQL', 'ETL', 'Data Cleaning', 'Business Intelligence', 'Excel'],
  'Power BI Developer': [
    'Power BI',
    'DAX',
    'SQL',
    'Data Visualization',
    'Excel',
    'ETL',
    'Business Intelligence',
  ],
  'Python Analyst': [
    'Python',
    'Pandas',
    'NumPy',
    'Matplotlib',
    'Seaborn',
    'SQL',
    'EDA',
    'Data Cleaning',
  ],
  'MIS Analyst': ['Excel', 'VBA', 'SQL', 'Pivot Tables', 'KPI Reporting', 'Data Cleaning', 'Power BI'],
  'Data Engineer': ['Python', 'SQL', 'ETL', 'PostgreSQL', 'MySQL', 'Pandas', 'Data Cleaning'],
}

const COMPANIES = [
  'InfyCore Analytics',
  'Growfast Solutions',
  'DataBridge Consulting',
  'TechSurge India',
  'FinEdge Analytics',
  'Kairox Systems',
  'BrightMind Tech',
  'NimbusData Labs',
  'Vertex Insights',
  'CloudPeak Systems',
  'Quanta Research',
  'Zenith DataWorks',
]

const CITIES: { name: string; weight: number }[] = [
  { name: 'Bengaluru', weight: 60 },
  { name: 'Bengaluru (Remote)', weight: 25 },
  { name: 'Hyderabad', weight: 10 },
  { name: 'Chennai', weight: 5 },
]

// Exact role counts (sum = 100)
const ROLE_COUNTS: { role: string; count: number }[] = [
  { role: 'Data Analyst', count: 35 },
  { role: 'Business Analyst', count: 20 },
  { role: 'SQL Developer', count: 10 },
  { role: 'Power BI Developer', count: 10 },
  { role: 'Python Analyst', count: 10 },
  { role: 'MIS Analyst', count: 10 },
  { role: 'Data Engineer', count: 5 },
]

function randomSkills(role: string): string[] {
  const pool = ROLE_SKILLS[role]
  const core = pool[0]
  const count = Math.floor(rand() * 5) + 4 // 4..8
  const chosen = new Set<string>([core])
  let guard = 0
  while (chosen.size < count && guard < 40) {
    chosen.add(pick(pool))
    guard++
  }
  return Array.from(chosen)
}

function salaryFor(role: string, exp: ExperienceLevel): number {
  const [min, max] = ROLE_SALARY[role][exp]
  const mean = (min + max) / 2
  const std = (max - min) / 4.5
  const raw = gaussian(mean, std)
  const clamped = Math.min(max, Math.max(min, raw))
  return roundTo(clamped, 500)
}

function experienceFor(role: string): ExperienceLevel {
  // Global target distribution: Entry 30, Associate 35, Mid 25, Senior 10
  // Slightly skew senior roles for Data Engineer; juniors for MIS Analyst.
  let weights = [30, 35, 25, 10]
  if (role === 'Data Engineer') weights = [10, 25, 40, 25]
  if (role === 'MIS Analyst') weights = [45, 35, 15, 5]
  if (role === 'Data Analyst') weights = [35, 35, 22, 8]
  return weightedPick(EXPERIENCE_LEVELS, weights)
}

function workModeFor(city: string): WorkMode {
  if (city === 'Bengaluru (Remote)') return 'Remote'
  // Remote 25 / Hybrid 45 / Onsite 30 across the rest
  return weightedPick<WorkMode>(['Remote', 'Hybrid', 'Onsite'], [12, 50, 38])
}

/** Posted date spread over the last 10 weeks with a slight upward (more recent) trend. */
function postedDateFor(now: Date): { iso: string; weeksAgo: number } {
  // 10 week buckets, index 0 = oldest, 9 = current; weights rise toward recent weeks.
  const weekWeights = [5, 6, 7, 8, 9, 11, 12, 13, 14, 15]
  const buckets = Array.from({ length: 10 }, (_, i) => i)
  const weekIndex = weightedPick(buckets, weekWeights)
  const weeksAgo = 9 - weekIndex
  const dayOffset = Math.floor(rand() * 7)
  const d = new Date(now)
  d.setDate(d.getDate() - (weeksAgo * 7 + dayOffset))
  const iso = d.toISOString().slice(0, 10)
  return { iso, weeksAgo }
}

function statusFor(weeksAgo: number): JobStatus {
  // Older postings more likely to be closed.
  const closeChance = weeksAgo >= 7 ? 0.45 : weeksAgo >= 4 ? 0.22 : 0.08
  return rand() < closeChance ? 'Closed' : 'Active'
}

export function generateSeedJobs(): Job[] {
  const now = new Date()
  const jobs: Job[] = []
  let counter = 1

  for (const { role, count } of ROLE_COUNTS) {
    for (let i = 0; i < count; i++) {
      const city = weightedPick(
        CITIES.map((c) => c.name),
        CITIES.map((c) => c.weight),
      )
      const exp = experienceFor(role)
      const workMode = workModeFor(city)
      const { iso, weeksAgo } = postedDateFor(now)
      const company = pick(COMPANIES)
      const job: Job = {
        id: `JS-${String(counter).padStart(3, '0')}`,
        title: role,
        company,
        city,
        workMode,
        experience: exp,
        salary: salaryFor(role, exp),
        skills: randomSkills(role),
        postedDate: iso,
        status: statusFor(weeksAgo),
      }
      jobs.push(job)
      counter++
    }
  }

  // Sort newest first for nicer default presentation
  jobs.sort((a, b) => (a.postedDate < b.postedDate ? 1 : -1))
  return jobs
}

export const SEED_JOBS: Job[] = generateSeedJobs()
