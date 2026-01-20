import React from 'react'

import { List, Alert } from '@mui/material'

import { usePracticeActions } from '@/app/contexts'

import { InputValues, ValidationState } from '../types'
import { VerbItem } from './VerbItem'
import { FilterControls, VerbTypeFilter } from './VerbItem/internals'

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
  onVerbTypeChange: (filter: VerbTypeFilter) => void
}

export const VerbsList: React.FC<VerbsListProps> = ({
  verbs,
  filteredAndSortedVerbs,
  inputValues,
  validationState,
  verbTypeFilter,
  onVerbTypeChange,
}) => {
  const { getStatistics, getInputRef } = usePracticeActions()
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
        onVerbTypeChange={onVerbTypeChange}
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
            inputRef={getInputRef(verb.id)}
          />
        ))}
      </List>
    </>
  )
}
