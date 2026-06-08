import { useMemo } from 'react'
import { useDataStore } from '@/store/useDataStore'
import { useFilterStore } from '@/store/useFilterStore'
import { applyFilters } from '@/lib/analytics'

/** Jobs after applying the global filter state (used across all pages). */
export function useFilteredJobs() {
  const jobs = useDataStore((s) => s.jobs)
  const filters = useFilterStore((s) => s.filters)
  return useMemo(() => applyFilters(jobs, filters), [jobs, filters])
}
