export interface ValidationState {
  [key: string]: {
    masculineSingular: 'correct' | 'incorrect' | null
    masculinePlural: 'correct' | 'incorrect' | null
    feminineSingular: 'correct' | 'incorrect' | null
    femininePlural: 'correct' | 'incorrect' | null
  }
}

export interface InputValues {
  [key: string]: {
    masculineSingular: string
    masculinePlural: string
    feminineSingular: string
    femininePlural: string
  }
}

export interface ResetDialogState {
  open: boolean
  adjectiveId: string | null
  adjectiveTranslation: string | null
}
