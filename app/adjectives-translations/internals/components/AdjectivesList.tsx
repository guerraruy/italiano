import React from 'react'

import { List, Alert } from '@mui/material'

import { usePracticeActions } from '@/app/contexts'

import { InputValues, ValidationState } from '../types'
import { AdjectiveItem } from './AdjectiveItem'
import { FilterControls } from './AdjectiveItem/internals'

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
}

export const AdjectivesList: React.FC<AdjectivesListProps> = ({
  adjectives,
  filteredAndSortedAdjectives,
  inputValues,
  validationState,
}) => {
  const { getStatistics, getInputRef } = usePracticeActions()
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
      <FilterControls />

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
            inputRefMasculineSingular={getInputRef(
              adjective.id,
              'masculineSingular'
            )}
            inputRefMasculinePlural={getInputRef(
              adjective.id,
              'masculinePlural'
            )}
            inputRefFeminineSingular={getInputRef(
              adjective.id,
              'feminineSingular'
            )}
            inputRefFemininePlural={getInputRef(adjective.id, 'femininePlural')}
          />
        ))}
      </List>
    </>
  )
}
