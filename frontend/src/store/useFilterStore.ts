import { create } from 'zustand'
import { DEFAULT_FILTERS, type Filters } from '@/lib/analytics'

interface FilterState {
  filters: Filters
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  reset: () => void
  activeCount: () => number
}

export const useFilterStore = create<FilterState>((set, get) => ({
  filters: { ...DEFAULT_FILTERS },
  setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),
  reset: () => set({ filters: { ...DEFAULT_FILTERS } }),
  activeCount: () => {
    const f = get().filters
    let n = 0
    if (f.role !== 'all') n++
    if (f.city !== 'all') n++
    if (f.skill !== 'all') n++
    if (f.workMode !== 'all') n++
    if (f.experience !== 'all') n++
    if (f.dateRange !== 'all') n++
    if (f.search.trim()) n++
    return n
  },
}))
