'use client'
import { createContext, useContext, ReactNode } from 'react'

// Using generic function types to support different practice page signatures
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any

export interface PracticeActionsContextType {
  onInputChange: AnyFunction
  onValidation: AnyFunction
  onClearInput: AnyFunction
  onShowAnswer: AnyFunction
  onResetStatistics: (itemId: string) => void
  onKeyDown: AnyFunction
  getStatistics: (itemId: string) => { correct: number; wrong: number }
  getInputRef: AnyFunction
}

const PracticeActionsContext = createContext<
  PracticeActionsContextType | undefined
>(undefined)

interface PracticeActionsProviderProps {
  children: ReactNode
  value: PracticeActionsContextType
}

export function PracticeActionsProvider({
  children,
  value,
}: PracticeActionsProviderProps) {
  return (
    <PracticeActionsContext.Provider value={value}>
      {children}
    </PracticeActionsContext.Provider>
  )
}

export function usePracticeActions(): PracticeActionsContextType {
  const context = useContext(PracticeActionsContext)
  if (context === undefined) {
    throw new Error(
      'usePracticeActions must be used within a PracticeActionsProvider'
    )
  }
  return context
}
