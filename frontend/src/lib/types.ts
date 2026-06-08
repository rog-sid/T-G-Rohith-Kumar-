import { z } from 'zod'

export const WORK_MODES = ['Remote', 'Hybrid', 'Onsite'] as const
export const EXPERIENCE_LEVELS = ['Entry', 'Associate', 'Mid', 'Senior'] as const
export const JOB_STATUSES = ['Active', 'Closed'] as const

export type WorkMode = (typeof WORK_MODES)[number]
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number]
export type JobStatus = (typeof JOB_STATUSES)[number]

export const ROLES = [
  'Data Analyst',
  'Business Analyst',
  'SQL Developer',
  'Power BI Developer',
  'Python Analyst',
  'MIS Analyst',
  'Data Engineer',
] as const

export const ALL_SKILLS = [
  'SQL',
  'Python',
  'Excel',
  'Power BI',
  'Tableau',
  'Pandas',
  'NumPy',
  'Matplotlib',
  'Seaborn',
  'MySQL',
  'PostgreSQL',
  'EDA',
  'KPI Reporting',
  'Data Cleaning',
  'Data Visualization',
  'DAX',
  'VBA',
  'Business Intelligence',
  'ETL',
  'Pivot Tables',
] as const

export interface Job {
  id: string
  title: string
  company: string
  city: string
  workMode: WorkMode
  experience: ExperienceLevel
  salary: number
  skills: string[]
  postedDate: string // ISO date string (yyyy-MM-dd)
  status: JobStatus
}

/** Zod schema used to validate imported records */
export const jobSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  company: z.string().min(1, 'Company is required'),
  city: z.string().min(1, 'City is required'),
  workMode: z.enum(WORK_MODES),
  experience: z.enum(EXPERIENCE_LEVELS),
  salary: z.coerce
    .number({ invalid_type_error: 'Salary must be a number' })
    .int('Salary must be a whole number')
    .min(1000, 'Salary looks too low')
    .max(1000000, 'Salary looks too high'),
  skills: z.union([z.array(z.string()), z.string()]).transform((val) =>
    Array.isArray(val)
      ? val.map((s) => s.trim()).filter(Boolean)
      : String(val)
          .split(/[;|]/)
          .map((s) => s.trim())
          .filter(Boolean),
  ),
  postedDate: z
    .string()
    .min(1, 'Posted date is required')
    .refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
  status: z.enum(JOB_STATUSES).default('Active'),
})

export type JobInput = z.input<typeof jobSchema>
export type JobParsed = z.output<typeof jobSchema>
