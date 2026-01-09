/**
 * Shared types for practice hooks
 */

export interface StatisticsError {
  message: string
  timestamp: number
}

export interface ResetDialogState<TId extends string = string> {
  open: boolean
  itemId: TId | null
  itemLabel: string | null
  error: string | null
}

export interface Statistics {
  correct: number
  wrong: number
}

export type SortOption =
  | 'none'
  | 'alphabetical'
  | 'random'
  | 'most-errors'
  | 'worst-performance'

export type DisplayCount = 10 | 20 | 30 | 'all'

export interface PracticeItem {
  id: string
  translation: string
}
