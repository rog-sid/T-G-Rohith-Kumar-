import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import {
  Search,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Building2,
  MapPin,
  CalendarDays,
  IndianRupee,
  Briefcase,
} from 'lucide-react'
import { FilterBar } from '@/components/FilterBar'
import { PageHeading, EmptyState } from '@/components/common'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { useFilteredJobs } from '@/hooks/useFilteredJobs'
import { useFilterStore } from '@/store/useFilterStore'
import { jobsToCsv, downloadText } from '@/lib/csv'
import { toast } from '@/components/ui/use-toast'
import { formatINR, cn } from '@/lib/utils'
import type { Job } from '@/lib/types'

type SortKey = 'title' | 'company' | 'city' | 'workMode' | 'experience' | 'salary' | 'postedDate' | 'status'
type SortDir = 'asc' | 'desc'

const PAGE_SIZE = 10

const COLUMNS: { key: SortKey | 'skills'; label: string; sortable: boolean; className?: string }[] = [
  { key: 'title', label: 'Title', sortable: true },
  { key: 'company', label: 'Company', sortable: true },
  { key: 'city', label: 'City', sortable: true },
  { key: 'workMode', label: 'Work Mode', sortable: true },
  { key: 'experience', label: 'Experience', sortable: true },
  { key: 'salary', label: 'Salary (INR)', sortable: true, className: 'text-right' },
  { key: 'skills', label: 'Top Skills', sortable: false },
  { key: 'postedDate', label: 'Posted', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
]

function statusVariant(status: Job['status']) {
  return status === 'Active' ? 'success' : 'muted'
}

function workModeVariant(mode: Job['workMode']) {
  if (mode === 'Remote') return 'success'
  if (mode === 'Hybrid') return 'secondary'
  return 'muted'
}

export default function JobsExplorer() {
  const jobs = useFilteredJobs()
  const { filters, setFilter } = useFilterStore()
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'postedDate', dir: 'desc' })
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Job | null>(null)

  const sorted = useMemo(() => {
    const arr = [...jobs]
    const { key, dir } = sort
    arr.sort((a, b) => {
      let av: string | number = a[key]
      let bv: string | number = b[key]
      if (key === 'salary') {
        av = a.salary
        bv = b.salary
      } else {
        av = String(av).toLowerCase()
        bv = String(bv).toLowerCase()
      }
      if (av < bv) return dir === 'asc' ? -1 : 1
      if (av > bv) return dir === 'asc' ? 1 : -1
      return 0
    })
    return arr
  }, [jobs, sort])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageRows = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const toggleSort = (key: SortKey) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))
    setPage(1)
  }

  const handleExport = () => {
    if (sorted.length === 0) {
      toast({ variant: 'destructive', title: 'Nothing to export', description: 'No jobs match the current filters.' })
      return
    }
    downloadText('jobscope-jobs.csv', jobsToCsv(sorted))
    toast({ variant: 'success', title: 'Export complete', description: `${sorted.length} jobs exported to CSV.` })
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sort.key !== col) return <ArrowUpDown className="ml-1 inline h-3.5 w-3.5 opacity-40" />
    return sort.dir === 'asc' ? (
      <ArrowUp className="ml-1 inline h-3.5 w-3.5 text-primary" />
    ) : (
      <ArrowDown className="ml-1 inline h-3.5 w-3.5 text-primary" />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeading title="Jobs Explorer" subtitle={`${jobs.length} jobs match your current filters.`}>
        <Button variant="outline" size="sm" onClick={handleExport} data-testid="export-csv-btn">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </PageHeading>

      <FilterBar />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(e) => {
                setFilter('search', e.target.value)
                setPage(1)
              }}
              placeholder="Search title or company…"
              className="pl-9"
              data-testid="jobs-search-input"
            />
          </div>
          <p className="text-sm text-muted-foreground" data-testid="jobs-count">
            Showing {pageRows.length} of {sorted.length}
          </p>
        </div>

        {sorted.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No matching jobs"
              message="Adjust your search or filters to find postings."
            />
          </div>
        ) : (
          <>
            <Table data-testid="jobs-table">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {COLUMNS.map((col) => (
                    <TableHead key={col.key} className={col.className}>
                      {col.sortable ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(col.key as SortKey)}
                          className="inline-flex items-center font-semibold uppercase tracking-wide hover:text-foreground"
                          data-testid={`sort-${col.key}`}
                        >
                          {col.label}
                          <SortIcon col={col.key as SortKey} />
                        </button>
                      ) : (
                        col.label
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((job) => (
                  <TableRow
                    key={job.id}
                    onClick={() => setSelected(job)}
                    className="cursor-pointer"
                    data-testid={`job-row-${job.id}`}
                  >
                    <TableCell className="font-medium text-foreground">{job.title}</TableCell>
                    <TableCell className="text-muted-foreground">{job.company}</TableCell>
                    <TableCell className="text-muted-foreground">{job.city}</TableCell>
                    <TableCell>
                      <Badge variant={workModeVariant(job.workMode)}>{job.workMode}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{job.experience}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{formatINR(job.salary)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {job.skills.slice(0, 3).map((s) => (
                          <Badge key={s} variant="outline" className="font-normal">
                            {s}
                          </Badge>
                        ))}
                        {job.skills.length > 3 && (
                          <Badge variant="muted" className="font-normal">
                            +{job.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {format(parseISO(job.postedDate), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(job.status)}>{job.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between gap-3 border-t border-border p-4">
              <p className="text-sm text-muted-foreground">
                Page <span className="font-semibold text-foreground">{currentPage}</span> of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  data-testid="page-prev"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  data-testid="page-next"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <JobDrawer job={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

function JobDrawer({ job, onClose }: { job: Job | null; onClose: () => void }) {
  return (
    <Sheet open={!!job} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md" data-testid="job-drawer">
        {job && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <Badge variant={statusVariant(job.status)}>{job.status}</Badge>
                <Badge variant={workModeVariant(job.workMode)}>{job.workMode}</Badge>
              </div>
              <SheetTitle className="text-xl">{job.title}</SheetTitle>
              <SheetDescription className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" /> {job.company}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-5 p-6 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <DetailItem icon={<IndianRupee className="h-4 w-4" />} label="Monthly Salary" value={formatINR(job.salary)} />
                <DetailItem icon={<Briefcase className="h-4 w-4" />} label="Experience" value={job.experience} />
                <DetailItem icon={<MapPin className="h-4 w-4" />} label="Location" value={job.city} />
                <DetailItem
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Posted"
                  value={format(parseISO(job.postedDate), 'dd MMM yyyy')}
                />
              </div>

              <Separator />

              <div>
                <p className="mb-2 text-sm font-semibold text-foreground">Skills Required</p>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills.map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                <p className="font-mono text-xs">Job ID: {job.id}</p>
                <p className="mt-2">
                  This {job.experience.toLowerCase()}-level {job.title} role at {job.company} is a{' '}
                  {job.workMode.toLowerCase()} position based in {job.city}, offering a median-aligned
                  monthly package of {formatINR(job.salary)}.
                </p>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className={cn('rounded-lg border border-border p-3')}>
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1 font-semibold text-foreground">{value}</p>
    </div>
  )
}
