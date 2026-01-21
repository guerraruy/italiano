import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { SortOption, DisplayCount } from '@/lib/hooks/types'

export type VerbTypeFilter = 'all' | 'regular' | 'irregular' | 'reflexive'

// Default values for easy reset
const defaultState = {
  excludeMastered: true,
  sortOption: 'none' as SortOption,
  displayCount: 10 as DisplayCount,
  verbTypeFilter: 'all' as VerbTypeFilter,
}

interface PracticeFiltersState {
  // Filter preferences
  excludeMastered: boolean
  sortOption: SortOption
  displayCount: DisplayCount
  verbTypeFilter: VerbTypeFilter

  // Actions
  setExcludeMastered: (value: boolean) => void
  setSortOption: (value: SortOption) => void
  setDisplayCount: (value: DisplayCount) => void
  setVerbTypeFilter: (value: VerbTypeFilter) => void
  resetAll: () => void
}

export const usePracticeFiltersStore = create<PracticeFiltersState>()(
  persist(
    (set) => ({
      // Default values
      ...defaultState,

      // Actions
      setExcludeMastered: (value) => set({ excludeMastered: value }),
      setSortOption: (value) => set({ sortOption: value }),
      setDisplayCount: (value) => set({ displayCount: value }),
      setVerbTypeFilter: (value) => set({ verbTypeFilter: value }),
      resetAll: () => set(defaultState),
    }),
    {
      name: 'practice-filters',
    }
  )
)
