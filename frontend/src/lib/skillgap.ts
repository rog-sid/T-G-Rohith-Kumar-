import type { Job } from './types'
import { topSkills } from './analytics'

export interface SkillGapResult {
  yourSkills: string[]
  matched: { name: string; count: number }[]
  missing: { name: string; count: number }[]
  demanded: { name: string; count: number; hasIt: boolean }[]
  matchScore: number
}

export function normalizeSkill(s: string): string {
  const t = s.trim().toLowerCase()
  const aliases: Record<string, string> = {
    'power bi': 'Power BI',
    powerbi: 'Power BI',
    'ms excel': 'Excel',
    excel: 'Excel',
    sql: 'SQL',
    mysql: 'MySQL',
    postgres: 'PostgreSQL',
    postgresql: 'PostgreSQL',
    python: 'Python',
    pandas: 'Pandas',
    numpy: 'NumPy',
    matplotlib: 'Matplotlib',
    seaborn: 'Seaborn',
    tableau: 'Tableau',
    dax: 'DAX',
    vba: 'VBA',
    etl: 'ETL',
    eda: 'EDA',
    'data cleaning': 'Data Cleaning',
    'data visualization': 'Data Visualization',
    'data viz': 'Data Visualization',
    'kpi reporting': 'KPI Reporting',
    'pivot tables': 'Pivot Tables',
    'business intelligence': 'Business Intelligence',
    bi: 'Business Intelligence',
  }
  return aliases[t] ?? s.trim()
}

export function parseUserSkills(raw: string): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  raw
    .split(/[,\n]/)
    .map((s) => normalizeSkill(s))
    .filter(Boolean)
    .forEach((s) => {
      const key = s.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        out.push(s)
      }
    })
  return out
}

export function computeSkillGap(jobs: Job[], rawInput: string, topN = 15): SkillGapResult {
  const yourSkills = parseUserSkills(rawInput)
  const yourSet = new Set(yourSkills.map((s) => s.toLowerCase()))
  const demandedList = topSkills(jobs, topN)

  const demanded = demandedList.map((d) => ({
    ...d,
    hasIt: yourSet.has(d.name.toLowerCase()),
  }))

  const matched = demanded.filter((d) => d.hasIt).map(({ name, count }) => ({ name, count }))
  const missing = demanded.filter((d) => !d.hasIt).map(({ name, count }) => ({ name, count }))
  const matchScore = demanded.length === 0 ? 0 : Math.round((matched.length / demanded.length) * 100)

  return { yourSkills, matched, missing, demanded, matchScore }
}

/** Generate up to 3 resume bullet suggestions from matched skills. */
export function buildResumeBullets(matched: string[]): string[] {
  const bullets: string[] = []
  const has = (s: string) => matched.some((m) => m.toLowerCase() === s.toLowerCase())

  if (has('SQL')) {
    bullets.push(
      'Wrote and optimized complex SQL queries to extract, join, and aggregate data from relational databases, reducing manual reporting effort by 40%.',
    )
  }
  if (has('Power BI') || has('Tableau')) {
    const tool = has('Power BI') ? 'Power BI' : 'Tableau'
    bullets.push(
      `Designed interactive ${tool} dashboards tracking KPIs and business metrics, enabling stakeholders to make faster data-driven decisions.`,
    )
  }
  if (has('Python') || has('Pandas')) {
    bullets.push(
      'Automated data cleaning and exploratory analysis pipelines in Python (Pandas, NumPy), cutting report preparation time and improving data quality.',
    )
  }
  if (has('Excel') && bullets.length < 3) {
    bullets.push(
      'Built advanced Excel models with pivot tables and lookups to summarize large datasets and surface actionable trends for business teams.',
    )
  }
  if (has('ETL') && bullets.length < 3) {
    bullets.push(
      'Developed ETL workflows to consolidate data from multiple sources into a single source of truth for reliable downstream reporting.',
    )
  }

  // Fallback bullets if user has few matched skills
  const fallback = [
    'Analyzed business datasets to identify trends, outliers, and opportunities, presenting findings to non-technical stakeholders.',
    'Collaborated with cross-functional teams to define metrics and deliver recurring analytics reports on schedule.',
    'Translated ambiguous business questions into structured analyses, delivering clear, visual, and actionable recommendations.',
  ]
  let fi = 0
  while (bullets.length < 3 && fi < fallback.length) {
    bullets.push(fallback[fi])
    fi++
  }

  return bullets.slice(0, 3)
}
