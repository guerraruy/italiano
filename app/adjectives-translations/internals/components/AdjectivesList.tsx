import React from 'react'

import { List, Alert } from '@mui/material'

import { InputValues, ValidationState } from '../types'
import { AdjectiveItem } from './AdjectiveItem'
import {
  FilterControls,
  SortOption,
  DisplayCount,
} from './AdjectiveItem/internals'

interface Adjective {
  id: string
  translation: string
  italian: string
  masculineSingular: string
  masculinePlural: string
  feminineSingular: string
  femininePlural: string
}

interface AdjectivesListProps {
  adjectives: Adjective[]
  filteredAndSortedAdjectives: Adjective[]
  inputValues: InputValues
  validationState: ValidationState
  sortOption: SortOption
  displayCount: DisplayCount
  shouldShowRefreshButton: boolean
  getStatistics: (adjectiveId: string) => { correct: number; wrong: number }
  onInputChange: (
    adjectiveId: string,
    field: keyof InputValues[string],
    value: string
  ) => void
  onValidation: (
    adjectiveId: string,
    field: keyof InputValues[string],
    correctAnswer: string
  ) => void
  onClearInput: (adjectiveId: string, field?: keyof InputValues[string]) => void
  onShowAnswer: (adjectiveId: string) => void
  onResetStatistics: (adjectiveId: string) => void
  onKeyDown: (
    e: React.KeyboardEvent,
    adjectiveId: string,
    field: keyof InputValues[string],
    currentIndex: number
  ) => void
  onSortChange: (newSort: SortOption) => void
  onDisplayCountChange: (count: DisplayCount) => void
  onRefresh: () => void
  setInputRef: (
    adjectiveId: string,
    field: keyof InputValues[string]
  ) => (el: HTMLInputElement | null) => void
}

export const AdjectivesList: React.FC<AdjectivesListProps> = ({
  adjectives,
  filteredAndSortedAdjectives,
  inputValues,
  validationState,
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
  onSortChange,
  onDisplayCountChange,
  onRefresh,
  setInputRef,
}) => {
  if (adjectives.length === 0) {
    return (
      <Alert severity="info">
        No adjectives available. Please ask your administrator to import
        adjectives.
      </Alert>
    )
  }

  return (
    <>
      <FilterControls
        sortOption={sortOption}
        displayCount={displayCount}
        onSortChange={onSortChange}
        onDisplayCountChange={onDisplayCountChange}
        onRefresh={onRefresh}
        showRefreshButton={shouldShowRefreshButton}
        displayedCount={filteredAndSortedAdjectives.length}
        totalCount={adjectives.length}
      />

      <List>
        {filteredAndSortedAdjectives.map((adjective, index) => (
          <AdjectiveItem
            key={adjective.id}
            adjective={adjective}
            index={index}
            inputValues={
              inputValues[adjective.id] || {
                masculineSingular: '',
                masculinePlural: '',
                feminineSingular: '',
                femininePlural: '',
              }
            }
            validationState={
              validationState[adjective.id] || {
                masculineSingular: null,
                masculinePlural: null,
                feminineSingular: null,
                femininePlural: null,
              }
            }
            statistics={getStatistics(adjective.id)}
            onInputChange={onInputChange}
            onValidation={onValidation}
            onClearInput={onClearInput}
            onShowAnswer={onShowAnswer}
            onResetStatistics={onResetStatistics}
            onKeyDown={onKeyDown}
            setInputRef={setInputRef}
          />
        ))}
      </List>
    </>
  )
}
