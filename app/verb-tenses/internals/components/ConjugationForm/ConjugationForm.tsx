import React from 'react'

import { Box, Alert } from '@mui/material'
import { styled } from '@mui/material/styles'

import type { ConjugationData } from '@/app/store/api'

import { TenseSection } from './internals'

const ConjugationGrid = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
}))

interface Verb {
  id: string
  conjugation: ConjugationData
}

interface ConjugationFormProps {
  selectedVerb: Verb | undefined
  enabledVerbTenses: string[]
  inputValues: { [key: string]: string }
  validationState: { [key: string]: 'correct' | 'incorrect' | null }
  inputRefs: React.MutableRefObject<{
    [key: string]: HTMLInputElement | null
  }>
  verbsCount: number
  getStatistics: (
    verbId: string,
    mood: string,
    tense: string,
    person: string
  ) => { correct: number; wrong: number }
  onInputChange: (key: string, value: string) => void
  onValidation: (
    key: string,
    correctAnswer: string,
    verbId: string,
    mood: string,
    tense: string,
    person: string
  ) => void
  onClearInput: (key: string) => void
  onShowAnswer: (key: string, correctAnswer: string) => void
  onKeyDown: (
    e: React.KeyboardEvent,
    key: string,
    correctAnswer: string,
    verbId: string,
    mood: string,
    tense: string,
    person: string
  ) => void
}

export const ConjugationForm: React.FC<ConjugationFormProps> = ({
  selectedVerb,
  enabledVerbTenses,
  inputValues,
  validationState,
  inputRefs,
  verbsCount,
  getStatistics,
  onInputChange,
  onValidation,
  onClearInput,
  onShowAnswer,
  onKeyDown,
}) => {
  if (verbsCount === 0) {
    return (
      <Alert severity="info">
        No verbs with conjugations available. Please ask your administrator to
        import verb conjugations.
      </Alert>
    )
  }

  if (!selectedVerb) {
    return (
      <Alert severity="info">
        Please select a verb to start practicing conjugations.
      </Alert>
    )
  }

  const conjugation = selectedVerb.conjugation

  if (!conjugation) {
    return (
      <Alert severity="warning">
        No conjugation data available for this verb. Please ask your
        administrator to import conjugation data.
      </Alert>
    )
  }

  return (
    <ConjugationGrid>
      {enabledVerbTenses.map((tenseKey) => {
        const [mood, tense] = tenseKey.split('.')
        if (!mood || !tense) return null

        const moodData = conjugation[mood]

        if (!moodData || !moodData[tense]) {
          return null
        }

        const tenseData = moodData[tense]

        return (
          <TenseSection
            key={tenseKey}
            mood={mood}
            tense={tense}
            tenseData={tenseData}
            verbId={selectedVerb.id}
            inputValues={inputValues}
            validationState={validationState}
            inputRefs={inputRefs}
            getStatistics={getStatistics}
            onInputChange={onInputChange}
            onValidation={onValidation}
            onClearInput={onClearInput}
            onShowAnswer={onShowAnswer}
            onKeyDown={onKeyDown}
          />
        )
      })}
    </ConjugationGrid>
  )
}
