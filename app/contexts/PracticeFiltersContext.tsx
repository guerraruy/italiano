'use client'
import { createContext, useContext, ReactNode } from 'react'

export type SortOption =
  | 'none'
  | 'alphabetical'
  | 'random'
  | 'most-errors'
  | 'worst-performance'

export type DisplayCount = 10 | 20 | 30 | 'all'

export interface PracticeFiltersContextType {
  sortOption: SortOption
  displayCount: DisplayCount
  excludeMastered: boolean
  masteryThreshold: number
  masteredCount: number
  shouldShowRefreshButton: boolean
  displayedCount: number
  totalCount: number
  onSortChange: (value: SortOption) => void
  onDisplayCountChange: (value: DisplayCount) => void
  onExcludeMasteredChange: (value: boolean) => void
  onRefresh: () => void
}

const PracticeFiltersContext = createContext<
  PracticeFiltersContextType | undefined
>(undefined)

interface PracticeFiltersProviderProps {
  children: ReactNode
  value: PracticeFiltersContextType
}

export function PracticeFiltersProvider({
  children,
  value,
}: PracticeFiltersProviderProps) {
  return (
    <PracticeFiltersContext.Provider value={value}>
      {children}
    </PracticeFiltersContext.Provider>
  )
}

export function usePracticeFilters(): PracticeFiltersContextType {
  const context = useContext(PracticeFiltersContext)
  if (context === undefined) {
    throw new Error(
      'usePracticeFilters must be used within a PracticeFiltersProvider'
    )
  }
  return context
}
