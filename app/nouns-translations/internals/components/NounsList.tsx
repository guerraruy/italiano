import React from 'react'

import { List, Alert } from '@mui/material'

import { NounItem } from '../components/NounItem'
import {
  FilterControls,
  SortOption,
  DisplayCount,
} from '../components/NounItem/internals'
import { InputValues, ValidationState } from '../types'

interface Noun {
  id: string
  translation: string
  translationPlural: string
  italian: string
  italianPlural: string
}

interface NounsListProps {
  nouns: Noun[]
  filteredAndSortedNouns: Noun[]
  inputValues: InputValues
  validationState: ValidationState
  sortOption: SortOption
  displayCount: DisplayCount
  shouldShowRefreshButton: boolean
  getStatistics: (nounId: string) => { correct: number; wrong: number }
  onInputChange: (
    nounId: string,
    field: 'singular' | 'plural',
    value: string
  ) => void
  onValidation: (nounId: string) => void
  onClearInput: (nounId: string, field: 'singular' | 'plural') => void
  onShowAnswer: (nounId: string) => void
  onResetStatistics: (nounId: string) => void
  onKeyDown: (
    e: React.KeyboardEvent,
    nounId: string,
    field: 'singular' | 'plural',
    currentIndex: number
  ) => void
  onSortChange: (newSort: SortOption) => void
  onDisplayCountChange: (count: DisplayCount) => void
  onRefresh: () => void
  inputRefSingular: (nounId: string) => (el: HTMLInputElement | null) => void
  inputRefPlural: (nounId: string) => (el: HTMLInputElement | null) => void
}

export const NounsList: React.FC<NounsListProps> = ({
  nouns,
  filteredAndSortedNouns,
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
  inputRefSingular,
  inputRefPlural,
}) => {
  if (nouns.length === 0) {
    return (
      <Alert severity="info">
        No nouns available. Please ask your administrator to import nouns.
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
        displayedCount={filteredAndSortedNouns.length}
        totalCount={nouns.length}
      />

      <List>
        {filteredAndSortedNouns.map((noun, index) => (
          <NounItem
            key={noun.id}
            noun={noun}
            index={index}
            inputValues={inputValues[noun.id] || { singular: '', plural: '' }}
            validationState={
              validationState[noun.id] || { singular: null, plural: null }
            }
            statistics={getStatistics(noun.id)}
            onInputChange={onInputChange}
            onValidation={onValidation}
            onClearInput={onClearInput}
            onShowAnswer={onShowAnswer}
            onResetStatistics={onResetStatistics}
            onKeyDown={onKeyDown}
            inputRefSingular={inputRefSingular(noun.id)}
            inputRefPlural={inputRefPlural(noun.id)}
          />
        ))}
      </List>
    </>
  )
}
