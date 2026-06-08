import {
  Info,
  Ruler,
  AlertTriangle,
  ListChecks,
  Layers,
  Database,
  ArrowRight,
} from 'lucide-react'
import { PageHeading } from '@/components/common'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const TECH = [
  'React 18',
  'Vite',
  'TypeScript',
  'Tailwind CSS v3',
  'shadcn/ui',
  'Recharts',
  'PapaParse',
  'Zod',
  'Zustand',
  'date-fns',
  'Lucide React',
]

const IMPORT_STEPS = [
  'Go to the Import Data page from the sidebar.',
  'Download the CSV template to see the exact required headers.',
  'Fill the template with your jobs (one row per posting), or prepare a JSON array.',
  'Drag & drop the CSV (or paste JSON) — a validation preview shows valid rows and any errors.',
  'Click "Confirm Import". Your data is added to the in-memory store and the dashboard updates instantly.',
]

const METHODOLOGY = [
  {
    label: 'Job Titles',
    text: 'Roles are normalized into 7 canonical buckets (Data Analyst, Business Analyst, SQL Developer, Power BI Developer, Python Analyst, MIS Analyst, Data Engineer) to keep comparisons consistent.',
  },
  {
    label: 'Salaries',
    text: 'Monthly salaries (INR) are generated per role and experience level using a normal distribution clamped to realistic Bengaluru ranges, then rounded to the nearest ₹500.',
  },
  {
    label: 'Skills',
    text: 'Each posting lists 4–8 skills drawn from a role-aware pool, ensuring the core skill for the role is always present. Skills are matched case-insensitively with common aliases (e.g. "PowerBI" → "Power BI").',
  },
  {
    label: 'Work Modes',
    text: 'Postings are tagged Remote, Hybrid, or Onsite. Remote-from-Bengaluru listings are always tagged Remote; the remaining split skews toward Hybrid, reflecting current market norms.',
  },
]

const LIMITATIONS = [
  'The 100 preloaded records are synthetic and generated deterministically — they are illustrative, not real vacancies.',
  'Salary figures are modeled approximations and should not be used for negotiation benchmarks.',
  'The forecast uses a simple 3-week moving average; it captures trend direction but not seasonality or external shocks.',
  'All data lives in memory only. Refreshing the page resets the dataset back to the original 100 seed records.',
]

export default function About() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="About the Data"
        subtitle="Methodology, assumptions, and how to bring your own data."
      />

      <Card>
        <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Info className="h-6 w-6" />
          </span>
          <div>
            <p className="font-semibold text-foreground">JobScope Analytics</p>
            <p className="text-sm text-muted-foreground">
              A portfolio-grade, client-side job market dashboard for tracking demand for data analyst and
              related roles in Bengaluru, India. It ships with 100 realistic synthetic records so every chart
              works on first load — no backend, no database, no external API calls.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" /> Methodology — How the data is normalized
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {METHODOLOGY.map((m) => (
            <div key={m.label} className="rounded-lg border border-border p-4">
              <p className="mb-1 text-sm font-semibold text-foreground">{m.label}</p>
              <p className="text-sm text-muted-foreground">{m.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Assumptions & Limitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {LIMITATIONS.map((l, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  {l}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-primary" /> Import your own data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {IMPORT_STEPS.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" /> CSV format
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Required columns (header row, exact names). Skills within a cell are separated by a semicolon
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs">;</code>.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-3">
            <code className="whitespace-nowrap text-xs text-foreground">
              title, company, city, workMode, experience, salary, skills, postedDate, status
            </code>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="muted">workMode: Remote | Hybrid | Onsite</Badge>
            <Badge variant="muted">experience: Entry | Associate | Mid | Senior</Badge>
            <Badge variant="muted">status: Active | Closed</Badge>
            <Badge variant="muted">postedDate: YYYY-MM-DD</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" /> Tech Stack Credits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {TECH.map((t) => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
          </div>
          <Separator />
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            Built as a single-page app · 100% client-side
            <ArrowRight className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">in-memory data store</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
