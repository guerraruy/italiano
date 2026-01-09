export type VerbTypeFilter = 'all' | 'regular' | 'irregular' | 'reflexive'

export interface ValidationState {
  [key: string]: 'correct' | 'incorrect' | null
}

export interface InputValues {
  [key: string]: string
}

export interface ResetDialogState {
  open: boolean
  verbId: string | null
  verbName: string | null
  error: string | null
}

export interface StatisticsError {
  message: string
  timestamp: number
}
