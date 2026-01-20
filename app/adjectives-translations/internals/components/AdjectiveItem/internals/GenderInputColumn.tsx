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
  singularInputRef: (el: HTMLInputElement | null) => void
  pluralInputRef: (el: HTMLInputElement | null) => void
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
  singularInputRef,
  pluralInputRef,
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
        inputRef={singularInputRef}
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
        inputRef={pluralInputRef}
      />
    </Box>
  )
}

export default React.memo(GenderInputColumn)
