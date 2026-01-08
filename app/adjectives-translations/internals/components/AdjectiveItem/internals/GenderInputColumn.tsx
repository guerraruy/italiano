import React from 'react'

import { Box, Typography } from '@mui/material'

import AdjectiveInputField from './AdjectiveInputField'
import { InputValues } from '../../../types'

type FieldKey = keyof InputValues[string]
type ValidationStatus = 'correct' | 'incorrect' | null

interface GenderInputColumnProps {
  gender: 'Masculine' | 'Feminine'
  singularField: FieldKey
  pluralField: FieldKey
  singularValue: string
  pluralValue: string
  singularCorrectAnswer: string
  pluralCorrectAnswer: string
  singularValidation: ValidationStatus
  pluralValidation: ValidationStatus
  adjectiveId: string
  index: number
  onInputChange: (adjectiveId: string, field: FieldKey, value: string) => void
  onValidation: (
    adjectiveId: string,
    field: FieldKey,
    correctAnswer: string
  ) => void
  onClearInput: (adjectiveId: string, field?: FieldKey) => void
  onKeyDown: (
    e: React.KeyboardEvent,
    adjectiveId: string,
    field: FieldKey,
    index: number
  ) => void
  setInputRef: (
    adjectiveId: string,
    field: FieldKey
  ) => (el: HTMLInputElement | null) => void
}

function GenderInputColumn({
  gender,
  singularField,
  pluralField,
  singularValue,
  pluralValue,
  singularCorrectAnswer,
  pluralCorrectAnswer,
  singularValidation,
  pluralValidation,
  adjectiveId,
  index,
  onInputChange,
  onValidation,
  onClearInput,
  onKeyDown,
  setInputRef,
}: GenderInputColumnProps) {
  const genderLower = gender.toLowerCase()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: -1 }}>
        {gender}
      </Typography>
      <AdjectiveInputField
        label="Singular"
        placeholder={`Type the ${genderLower} singular form...`}
        value={singularValue}
        validationStatus={singularValidation}
        adjectiveId={adjectiveId}
        field={singularField}
        index={index}
        correctAnswer={singularCorrectAnswer}
        onInputChange={onInputChange}
        onValidation={onValidation}
        onClearInput={onClearInput}
        onKeyDown={onKeyDown}
        setInputRef={setInputRef}
      />
      <AdjectiveInputField
        label="Plural"
        placeholder={`Type the ${genderLower} plural form...`}
        value={pluralValue}
        validationStatus={pluralValidation}
        adjectiveId={adjectiveId}
        field={pluralField}
        index={index}
        correctAnswer={pluralCorrectAnswer}
        onInputChange={onInputChange}
        onValidation={onValidation}
        onClearInput={onClearInput}
        onKeyDown={onKeyDown}
        setInputRef={setInputRef}
      />
    </Box>
  )
}

export default React.memo(GenderInputColumn)
