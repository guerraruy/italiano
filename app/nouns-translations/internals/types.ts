export interface ValidationState {
  [key: string]: {
    singular: 'correct' | 'incorrect' | null
    plural: 'correct' | 'incorrect' | null
  }
}

export interface InputValues {
  [key: string]: {
    singular: string
    plural: string
  }
}

export interface ResetDialogState {
  open: boolean
  nounId: string | null
  nounTranslation: string | null
  error: string | null
}

export interface StatisticsError {
  message: string
  timestamp: number
}
