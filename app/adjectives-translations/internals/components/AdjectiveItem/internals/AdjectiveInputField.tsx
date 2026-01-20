import React from 'react'

import ClearIcon from '@mui/icons-material/Clear'
import { TextField, IconButton, Tooltip, InputAdornment } from '@mui/material'

import { usePracticeActions } from '@/app/contexts'

import { InputValues } from '../../../types'

type FieldKey = keyof InputValues[string]
type ValidationStatus = 'correct' | 'incorrect' | null

interface AdjectiveInputFieldProps {
  label: string
  placeholder: string
  value: string
  validationStatus: ValidationStatus
  adjectiveId: string
  field: FieldKey
  index: number
  correctAnswer: string
  inputRef: (el: HTMLInputElement | null) => void
}

const getInputStyle = (validationStatus: ValidationStatus) => {
  if (validationStatus === 'correct') {
    return {
      backgroundColor: '#c8e6c9',
      '& .MuiOutlinedInput-root': {
        backgroundColor: '#c8e6c9',
      },
    }
  }
  if (validationStatus === 'incorrect') {
    return {
      backgroundColor: '#ffcdd2',
      '& .MuiOutlinedInput-root': {
        backgroundColor: '#ffcdd2',
      },
    }
  }
  return {}
}

function AdjectiveInputField({
  label,
  placeholder,
  value,
  validationStatus,
  adjectiveId,
  field,
  index,
  correctAnswer,
  inputRef,
}: AdjectiveInputFieldProps) {
  const { onInputChange, onValidation, onClearInput, onKeyDown } =
    usePracticeActions()
  return (
    <TextField
      fullWidth
      size="small"
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onInputChange(adjectiveId, field, e.target.value)}
      onBlur={() => onValidation(adjectiveId, field, correctAnswer)}
      onKeyDown={(e) => onKeyDown(e, adjectiveId, field, index)}
      sx={getInputStyle(validationStatus)}
      autoComplete="off"
      inputRef={inputRef}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title="Clear field">
                <IconButton
                  size="small"
                  onClick={() => onClearInput(adjectiveId, field)}
                  edge="end"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        },
      }}
    />
  )
}

export default React.memo(AdjectiveInputField)
