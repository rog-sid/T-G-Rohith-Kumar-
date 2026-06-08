import { useMemo } from 'react'
import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useFilterStore } from '@/store/useFilterStore'
import { useDataStore } from '@/store/useDataStore'
import { DATE_RANGE_OPTIONS, type Filters } from '@/lib/analytics'
import { WORK_MODES, EXPERIENCE_LEVELS } from '@/lib/types'

interface FieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  testId: string
}

function FilterField({ label, value, onChange, options, testId }: FieldProps) {
  return (
    <div className="flex min-w-[140px] flex-1 flex-col gap-1">
      <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger data-testid={testId} className="h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value} data-testid={`${testId}-opt-${o.value}`}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function FilterBar() {
  const { filters, setFilter, reset, activeCount } = useFilterStore()
  const jobs = useDataStore((s) => s.jobs)
  const active = activeCount()

  const { roleOptions, cityOptions, skillOptions } = useMemo(() => {
    const roles = Array.from(new Set(jobs.map((j) => j.title))).sort()
    const cities = Array.from(new Set(jobs.map((j) => j.city))).sort()
    const skills = Array.from(new Set(jobs.flatMap((j) => j.skills))).sort()
    return {
      roleOptions: [{ value: 'all', label: 'All roles' }, ...roles.map((r) => ({ value: r, label: r }))],
      cityOptions: [{ value: 'all', label: 'All cities' }, ...cities.map((c) => ({ value: c, label: c }))],
      skillOptions: [{ value: 'all', label: 'All skills' }, ...skills.map((s) => ({ value: s, label: s }))],
    }
  }, [jobs])

  const set =
    <K extends keyof Filters>(key: K) =>
    (v: string) =>
      setFilter(key, v as Filters[K])

  return (
    <div
      data-testid="filter-bar"
      className="card-surface flex flex-col gap-3 p-4 transition-theme"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Filters
          {active > 0 && (
            <Badge variant="default" className="ml-1" data-testid="active-filter-count">
              {active} active
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          data-testid="reset-filters-btn"
          disabled={active === 0}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Filters
        </Button>
      </div>
      <div className="flex flex-wrap gap-3">
        <FilterField label="Role" value={filters.role} onChange={set('role')} options={roleOptions} testId="filter-role" />
        <FilterField label="City" value={filters.city} onChange={set('city')} options={cityOptions} testId="filter-city" />
        <FilterField label="Skill" value={filters.skill} onChange={set('skill')} options={skillOptions} testId="filter-skill" />
        <FilterField
          label="Work Mode"
          value={filters.workMode}
          onChange={set('workMode')}
          options={[{ value: 'all', label: 'All modes' }, ...WORK_MODES.map((w) => ({ value: w, label: w }))]}
          testId="filter-workmode"
        />
        <FilterField
          label="Experience"
          value={filters.experience}
          onChange={set('experience')}
          options={[{ value: 'all', label: 'All levels' }, ...EXPERIENCE_LEVELS.map((e) => ({ value: e, label: e }))]}
          testId="filter-experience"
        />
        <FilterField
          label="Date Range"
          value={filters.dateRange}
          onChange={set('dateRange')}
          options={DATE_RANGE_OPTIONS}
          testId="filter-daterange"
        />
      </div>
    </div>
  )
}
