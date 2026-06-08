import Papa from 'papaparse'
import { jobSchema, type Job } from './types'

export const CSV_HEADERS = [
  'title',
  'company',
  'city',
  'workMode',
  'experience',
  'salary',
  'skills',
  'postedDate',
  'status',
] as const

export interface ValidationResult {
  validJobs: Job[]
  errors: { row: number; message: string }[]
  totalRows: number
}

let importCounter = 1000

function makeId(): string {
  importCounter += 1
  return `JS-I${importCounter}`
}

/** Validate an array of raw records (from CSV or JSON) into typed Jobs. */
export function validateRecords(records: unknown[]): ValidationResult {
  const validJobs: Job[] = []
  const errors: { row: number; message: string }[] = []

  records.forEach((rec, idx) => {
    const result = jobSchema.safeParse(rec)
    if (result.success) {
      const data = result.data
      validJobs.push({
        id: data.id || makeId(),
        title: data.title,
        company: data.company,
        city: data.city,
        workMode: data.workMode,
        experience: data.experience,
        salary: data.salary,
        skills: data.skills,
        postedDate: new Date(data.postedDate).toISOString().slice(0, 10),
        status: data.status,
      })
    } else {
      const first = result.error.issues[0]
      const field = first.path.join('.') || 'record'
      errors.push({ row: idx + 1, message: `Row ${idx + 1}: ${field} — ${first.message}` })
    }
  })

  return { validJobs, errors, totalRows: records.length }
}

/** Parse CSV text into raw records (skills column split on `;`). */
export function parseCsv(text: string): unknown[] {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  })
  return (parsed.data || []).map((row) => ({
    ...row,
    salary: row.salary,
    skills: typeof row.skills === 'string' ? row.skills : '',
  }))
}

/** Parse a raw JSON array string into records. Throws on invalid JSON. */
export function parseJsonArray(text: string): unknown[] {
  const data = JSON.parse(text)
  if (!Array.isArray(data)) {
    throw new Error('JSON must be an array of job objects.')
  }
  return data
}

/** Serialize jobs to CSV text. */
export function jobsToCsv(jobs: Job[]): string {
  const rows = jobs.map((j) => ({
    title: j.title,
    company: j.company,
    city: j.city,
    workMode: j.workMode,
    experience: j.experience,
    salary: j.salary,
    skills: j.skills.join(';'),
    postedDate: j.postedDate,
    status: j.status,
  }))
  return Papa.unparse({ fields: [...CSV_HEADERS], data: rows })
}

export function downloadText(filename: string, content: string, mime = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const TEMPLATE_CSV = `title,company,city,workMode,experience,salary,skills,postedDate,status
Data Analyst,InfyCore Analytics,Bengaluru,Hybrid,Entry,38000,SQL;Excel;Power BI;Data Cleaning,2026-05-20,Active
Business Analyst,Growfast Solutions,Bengaluru (Remote),Remote,Mid,62000,SQL;KPI Reporting;Business Intelligence;Power BI,2026-05-28,Active
Python Analyst,DataBridge Consulting,Hyderabad,Onsite,Associate,55000,Python;Pandas;NumPy;SQL;EDA,2026-06-02,Active`
