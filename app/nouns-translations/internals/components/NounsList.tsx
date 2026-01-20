import React from 'react'

import { List, Alert } from '@mui/material'

import { usePracticeActions } from '@/app/contexts'

import { NounItem } from '../components/NounItem'
import { FilterControls } from '../components/NounItem/internals'
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
}

export const NounsList: React.FC<NounsListProps> = ({
  nouns,
  filteredAndSortedNouns,
  inputValues,
  validationState,
}) => {
  const { getStatistics, getInputRef } = usePracticeActions()
  if (nouns.length === 0) {
    return (
      <Alert severity="info">
        No nouns available. Please ask your administrator to import nouns.
      </Alert>
    )
  }

  return (
    <>
      <FilterControls />

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
            inputRefSingular={getInputRef(noun.id, 'singular')}
            inputRefPlural={getInputRef(noun.id, 'plural')}
          />
        ))}
      </List>
    </>
  )
}
