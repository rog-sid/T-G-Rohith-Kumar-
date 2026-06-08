import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UploadCloud,
  FileDown,
  FileSpreadsheet,
  Braces,
  PencilLine,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { PageHeading } from '@/components/common'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  parseCsv,
  parseJsonArray,
  validateRecords,
  downloadText,
  TEMPLATE_CSV,
  type ValidationResult,
} from '@/lib/csv'
import { jobSchema, WORK_MODES, EXPERIENCE_LEVELS, JOB_STATUSES, type Job } from '@/lib/types'
import { useDataStore } from '@/store/useDataStore'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

export default function ImportData() {
  const navigate = useNavigate()
  const addJobs = useDataStore((s) => s.addJobs)

  const confirmImport = (jobs: Job[]) => {
    addJobs(jobs)
    toast({
      variant: 'success',
      title: 'Import successful',
      description: `${jobs.length} job${jobs.length === 1 ? '' : 's'} added to your dataset.`,
    })
    navigate('/dashboard')
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="Import Data"
        subtitle="Bring your own job market data via CSV, JSON, or manual entry."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            downloadText('jobscope-template.csv', TEMPLATE_CSV)
            toast({ title: 'Template downloaded', description: 'jobscope-template.csv with 3 example rows.' })
          }}
          data-testid="download-template-btn"
        >
          <FileDown className="h-4 w-4" />
          Download CSV Template
        </Button>
      </PageHeading>

      <Tabs defaultValue="csv">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="csv" data-testid="tab-csv">
            <FileSpreadsheet className="mr-1.5 h-4 w-4" /> CSV
          </TabsTrigger>
          <TabsTrigger value="json" data-testid="tab-json">
            <Braces className="mr-1.5 h-4 w-4" /> JSON
          </TabsTrigger>
          <TabsTrigger value="manual" data-testid="tab-manual">
            <PencilLine className="mr-1.5 h-4 w-4" /> Manual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="csv">
          <CsvImport onConfirm={confirmImport} />
        </TabsContent>
        <TabsContent value="json">
          <JsonImport onConfirm={confirmImport} />
        </TabsContent>
        <TabsContent value="manual">
          <ManualEntry onAdded={confirmImport} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ValidationPreview({ result }: { result: ValidationResult }) {
  const preview = result.validJobs.slice(0, 5)
  return (
    <div className="space-y-4" data-testid="validation-preview">
      <div className="flex flex-wrap gap-3">
        <Badge variant="muted">Total rows: {result.totalRows}</Badge>
        <Badge variant="success" data-testid="valid-count">
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> {result.validJobs.length} valid
        </Badge>
        {result.errors.length > 0 && (
          <Badge variant="danger" data-testid="error-count">
            <AlertTriangle className="mr-1 h-3.5 w-3.5" /> {result.errors.length} errors
          </Badge>
        )}
      </div>

      {result.errors.length > 0 && (
        <div className="max-h-40 overflow-y-auto rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
          <p className="mb-1 font-semibold text-destructive">Validation errors</p>
          <ul className="list-inside list-disc space-y-0.5 text-destructive/90">
            {result.errors.slice(0, 12).map((e, i) => (
              <li key={i}>{e.message}</li>
            ))}
            {result.errors.length > 12 && <li>…and {result.errors.length - 12} more</li>}
          </ul>
        </div>
      )}

      {preview.length > 0 && (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Exp</TableHead>
                <TableHead className="text-right">Salary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {preview.map((j) => (
                <TableRow key={j.id}>
                  <TableCell className="font-medium">{j.title}</TableCell>
                  <TableCell>{j.company}</TableCell>
                  <TableCell>{j.city}</TableCell>
                  <TableCell>{j.workMode}</TableCell>
                  <TableCell>{j.experience}</TableCell>
                  <TableCell className="text-right tabular-nums">₹{j.salary.toLocaleString('en-IN')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="border-t border-border p-3 text-xs text-muted-foreground">
            Showing first {preview.length} of {result.validJobs.length} valid rows.
          </p>
        </div>
      )}
    </div>
  )
}

function CsvImport({ onConfirm }: { onConfirm: (jobs: Job[]) => void }) {
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState('')
  const [result, setResult] = useState<ValidationResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    setFileName(file.name)
    setLoading(true)
    setResult(null)
    const reader = new FileReader()
    reader.onload = () => {
      // Small artificial delay so the loading state is visible for large files.
      setTimeout(() => {
        try {
          const records = parseCsv(String(reader.result))
          const validated = validateRecords(records)
          setResult(validated)
          if (validated.validJobs.length === 0) {
            toast({ variant: 'destructive', title: 'No valid rows', description: 'Check your CSV headers and values.' })
          }
        } catch (err) {
          toast({ variant: 'destructive', title: 'Could not parse CSV', description: (err as Error).message })
        } finally {
          setLoading(false)
        }
      }, 400)
    }
    reader.onerror = () => {
      setLoading(false)
      toast({ variant: 'destructive', title: 'File read error', description: 'Please try a different file.' })
    }
    reader.readAsText(file)
  }

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            const file = e.dataTransfer.files?.[0]
            if (file) handleFile(file)
          }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
          }}
          data-testid="csv-dropzone"
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors',
            dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-accent/40',
          )}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            {loading ? <Loader2 className="h-7 w-7 animate-spin" /> : <UploadCloud className="h-7 w-7" />}
          </div>
          <div>
            <p className="font-semibold text-foreground">
              {loading ? 'Parsing file…' : 'Drag & drop your CSV here'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {fileName ? `Selected: ${fileName}` : 'or click to browse files'}
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            data-testid="csv-file-input"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
              e.target.value = ''
            }}
          />
        </div>

        {result && <ValidationPreview result={result} />}

        {result && result.validJobs.length > 0 && (
          <div className="flex justify-end">
            <Button onClick={() => onConfirm(result.validJobs)} data-testid="confirm-import-btn">
              <CheckCircle2 className="h-4 w-4" />
              Confirm Import ({result.validJobs.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const SAMPLE_JSON = `[
  {
    "title": "Data Analyst",
    "company": "InfyCore Analytics",
    "city": "Bengaluru",
    "workMode": "Hybrid",
    "experience": "Entry",
    "salary": 38000,
    "skills": ["SQL", "Excel", "Power BI"],
    "postedDate": "2026-05-22",
    "status": "Active"
  }
]`

function JsonImport({ onConfirm }: { onConfirm: (jobs: Job[]) => void }) {
  const [text, setText] = useState('')
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleValidate = () => {
    setLoading(true)
    setResult(null)
    setTimeout(() => {
      try {
        const records = parseJsonArray(text)
        const validated = validateRecords(records)
        setResult(validated)
        if (validated.validJobs.length === 0) {
          toast({ variant: 'destructive', title: 'No valid records', description: 'Check the JSON structure and fields.' })
        }
      } catch (err) {
        toast({ variant: 'destructive', title: 'Invalid JSON', description: (err as Error).message })
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="json-input">Paste a JSON array of job objects</Label>
            <Button variant="ghost" size="sm" onClick={() => setText(SAMPLE_JSON)} data-testid="json-sample-btn">
              Insert sample
            </Button>
          </div>
          <Textarea
            id="json-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={SAMPLE_JSON}
            className="min-h-[220px] font-mono text-xs"
            data-testid="json-input"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleValidate} disabled={!text.trim() || loading} data-testid="json-validate-btn">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Validate
          </Button>
        </div>

        {result && <ValidationPreview result={result} />}

        {result && result.validJobs.length > 0 && (
          <div className="flex justify-end">
            <Button onClick={() => onConfirm(result.validJobs)} data-testid="json-confirm-btn">
              <CheckCircle2 className="h-4 w-4" />
              Confirm Import ({result.validJobs.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const EMPTY_FORM = {
  title: '',
  company: '',
  city: 'Bengaluru',
  workMode: 'Hybrid',
  experience: 'Entry',
  salary: '',
  skills: '',
  postedDate: new Date().toISOString().slice(0, 10),
  status: 'Active',
}

function ManualEntry({ onAdded }: { onAdded: (jobs: Job[]) => void }) {
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const skillsArr = form.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const parsed = jobSchema.safeParse({
      ...form,
      salary: form.salary,
      skills: skillsArr.length ? skillsArr : form.skills,
    })

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as string
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
      })
      setErrors(fieldErrors)
      toast({ variant: 'destructive', title: 'Please fix the form', description: 'Some fields need attention.' })
      return
    }

    setErrors({})
    const d = parsed.data
    const job: Job = {
      id: `JS-M${Date.now().toString().slice(-6)}`,
      title: d.title,
      company: d.company,
      city: d.city,
      workMode: d.workMode,
      experience: d.experience,
      salary: d.salary,
      skills: d.skills,
      postedDate: new Date(d.postedDate).toISOString().slice(0, 10),
      status: d.status,
    }
    onAdded([job])
  }

  const fieldError = (key: string) => errors[key] && <p className="text-xs text-destructive">{errors[key]}</p>

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2" data-testid="manual-form">
          <div className="space-y-1.5">
            <Label htmlFor="m-title">Job Title</Label>
            <Input id="m-title" value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Data Analyst" data-testid="manual-title" />
            {fieldError('title')}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-company">Company</Label>
            <Input id="m-company" value={form.company} onChange={(e) => update('company', e.target.value)} placeholder="InfyCore Analytics" data-testid="manual-company" />
            {fieldError('company')}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-city">City</Label>
            <Input id="m-city" value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="Bengaluru" data-testid="manual-city" />
            {fieldError('city')}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-salary">Monthly Salary (INR)</Label>
            <Input id="m-salary" type="number" value={form.salary} onChange={(e) => update('salary', e.target.value)} placeholder="45000" data-testid="manual-salary" />
            {fieldError('salary')}
          </div>

          <div className="space-y-1.5">
            <Label>Work Mode</Label>
            <Select value={form.workMode} onValueChange={(v) => update('workMode', v)}>
              <SelectTrigger data-testid="manual-workmode"><SelectValue /></SelectTrigger>
              <SelectContent>
                {WORK_MODES.map((w) => (
                  <SelectItem key={w} value={w}>{w}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Experience</Label>
            <Select value={form.experience} onValueChange={(v) => update('experience', v)}>
              <SelectTrigger data-testid="manual-experience"><SelectValue /></SelectTrigger>
              <SelectContent>
                {EXPERIENCE_LEVELS.map((x) => (
                  <SelectItem key={x} value={x}>{x}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="m-date">Posted Date</Label>
            <Input id="m-date" type="date" value={form.postedDate} onChange={(e) => update('postedDate', e.target.value)} data-testid="manual-date" />
            {fieldError('postedDate')}
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => update('status', v)}>
              <SelectTrigger data-testid="manual-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                {JOB_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="m-skills">Skills (comma separated)</Label>
            <Input id="m-skills" value={form.skills} onChange={(e) => update('skills', e.target.value)} placeholder="SQL, Excel, Power BI, Python" data-testid="manual-skills" />
            {fieldError('skills')}
          </div>

          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => setForm({ ...EMPTY_FORM })} data-testid="manual-reset">
              Clear
            </Button>
            <Button type="submit" data-testid="manual-submit">
              <CheckCircle2 className="h-4 w-4" />
              Add Job
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
