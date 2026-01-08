import React from 'react'

import { List, Alert } from '@mui/material'

import { InputValues, ValidationState } from '../types'
import { VerbItem } from './VerbItem'
import {
  FilterControls,
  SortOption,
  DisplayCount,
  VerbTypeFilter,
} from './VerbItem/internals'

interface Verb {
  id: string
  translation: string
  italian: string
  regular: boolean
  reflexive: boolean
}

interface VerbsListProps {
  verbs: Verb[]
  filteredAndSortedVerbs: Verb[]
  inputValues: InputValues
  validationState: ValidationState
  verbTypeFilter: VerbTypeFilter
  sortOption: SortOption
  displayCount: DisplayCount
  shouldShowRefreshButton: boolean
  getStatistics: (verbId: string) => { correct: number; wrong: number }
  onInputChange: (verbId: string, value: string) => void
  onValidation: (verbId: string, correctAnswer: string) => void
  onClearInput: (verbId: string) => void
  onShowAnswer: (verbId: string, correctAnswer: string) => void
  onResetStatistics: (verbId: string) => void
  onKeyDown: (
    e: React.KeyboardEvent,
    verbId: string,
    correctAnswer: string,
    currentIndex: number
  ) => void
  onVerbTypeChange: (filter: VerbTypeFilter) => void
  onSortChange: (newSort: SortOption) => void
  onDisplayCountChange: (count: DisplayCount) => void
  onRefresh: () => void
  inputRef: (verbId: string) => (el: HTMLInputElement | null) => void
}

export const VerbsList: React.FC<VerbsListProps> = ({
  verbs,
  filteredAndSortedVerbs,
  inputValues,
  validationState,
  verbTypeFilter,
  sortOption,
  displayCount,
  shouldShowRefreshButton,
  getStatistics,
  onInputChange,
  onValidation,
  onClearInput,
  onShowAnswer,
  onResetStatistics,
  onKeyDown,
  onVerbTypeChange,
  onSortChange,
  onDisplayCountChange,
  onRefresh,
  inputRef,
}) => {
  if (verbs.length === 0) {
    return (
      <Alert severity="info">
        No verbs available. Please ask your administrator to import verbs.
      </Alert>
    )
  }

  return (
    <>
      <FilterControls
        verbTypeFilter={verbTypeFilter}
        sortOption={sortOption}
        displayCount={displayCount}
        onVerbTypeChange={onVerbTypeChange}
        onSortChange={onSortChange}
        onDisplayCountChange={onDisplayCountChange}
        onRefresh={onRefresh}
        showRefreshButton={shouldShowRefreshButton}
        displayedCount={filteredAndSortedVerbs.length}
        totalCount={verbs.length}
      />

      <List>
        {filteredAndSortedVerbs.map((verb, index) => (
          <VerbItem
            key={verb.id}
            verb={verb}
            index={index}
            inputValue={inputValues[verb.id] || ''}
            validationState={validationState[verb.id] || null}
            statistics={getStatistics(verb.id)}
            onInputChange={onInputChange}
            onValidation={onValidation}
            onClearInput={onClearInput}
            onShowAnswer={onShowAnswer}
            onResetStatistics={onResetStatistics}
            onKeyDown={onKeyDown}
            inputRef={inputRef(verb.id)}
          />
        ))}
      </List>
    </>
  )
}
