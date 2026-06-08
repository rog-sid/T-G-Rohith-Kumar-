import { create } from 'zustand'
import type { Job } from '@/lib/types'
import { SEED_JOBS } from '@/lib/seedData'

interface DataState {
  jobs: Job[]
  learningList: string[]
  setJobs: (jobs: Job[]) => void
  addJobs: (jobs: Job[]) => void
  addJob: (job: Job) => void
  resetToSeed: () => void
  addToLearning: (skill: string) => void
  removeFromLearning: (skill: string) => void
  clearLearning: () => void
}

// In-memory store seeded with 100 synthetic records.
export const useDataStore = create<DataState>((set) => ({
  jobs: SEED_JOBS,
  learningList: [],
  setJobs: (jobs) => set({ jobs }),
  addJobs: (jobs) => set((s) => ({ jobs: [...jobs, ...s.jobs] })),
  addJob: (job) => set((s) => ({ jobs: [job, ...s.jobs] })),
  resetToSeed: () => set({ jobs: SEED_JOBS }),
  addToLearning: (skill) =>
    set((s) => (s.learningList.includes(skill) ? s : { learningList: [...s.learningList, skill] })),
  removeFromLearning: (skill) =>
    set((s) => ({ learningList: s.learningList.filter((x) => x !== skill) })),
  clearLearning: () => set({ learningList: [] }),
}))
