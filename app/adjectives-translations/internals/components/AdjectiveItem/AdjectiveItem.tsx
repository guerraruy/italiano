import React from 'react'

import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import { Box, IconButton, Tooltip, Typography } from '@mui/material'

import { Statistics } from '@/app/components/Statistics'

import { GenderInputColumn, AdjectiveActions } from './internals'
import { AdjectiveListItem, AdjectiveInfo } from './styled'
import { InputValues } from '../../types'

interface ValidationState {
  masculineSingular: 'correct' | 'incorrect' | null
  masculinePlural: 'correct' | 'incorrect' | null
  feminineSingular: 'correct' | 'incorrect' | null
  femininePlural: 'correct' | 'incorrect' | null
}

interface AdjectiveItemProps {
  adjective: {
    id: string
    italian: string
    masculineSingular: string
    masculinePlural: string
    feminineSingular: string
    femininePlural: string
    translation: string
  }
  index: number
  inputValues: InputValues[string]
  validationState: ValidationState
  statistics: { correct: number; wrong: number }
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
    index: number
  ) => void
  setInputRef: (
    adjectiveId: string,
    field: keyof InputValues[string]
  ) => (el: HTMLInputElement | null) => void
}

const AdjectiveItem = ({
  adjective,
  index,
  inputValues,
  validationState,
  statistics,
  onInputChange,
  onValidation,
  onClearInput,
  onShowAnswer,
  onResetStatistics,
  onKeyDown,
  setInputRef,
}: AdjectiveItemProps) => {
  const hasStatistics = statistics.correct > 0 || statistics.wrong > 0

  return (
    <AdjectiveListItem>
      <AdjectiveInfo>
        <Typography
          variant="body1"
          fontWeight="bold"
          sx={{ minWidth: '180px' }}
        >
          {adjective.translation}
        </Typography>
      </AdjectiveInfo>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          flexGrow: 1,
        }}
      >
        {/* Mobile statistics and actions */}
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            gap: 2,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Statistics correct={statistics.correct} wrong={statistics.wrong} />
          <AdjectiveActions
            adjectiveId={adjective.id}
            hasStatistics={hasStatistics}
            onShowAnswer={onShowAnswer}
            onClearInput={onClearInput}
            onResetStatistics={onResetStatistics}
          />
        </Box>

        {/* Input fields grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
          }}
        >
          <GenderInputColumn
            gender="Masculine"
            singularField="masculineSingular"
            pluralField="masculinePlural"
            singularValue={inputValues.masculineSingular}
            pluralValue={inputValues.masculinePlural}
            singularCorrectAnswer={adjective.masculineSingular}
            pluralCorrectAnswer={adjective.masculinePlural}
            singularValidation={validationState.masculineSingular}
            pluralValidation={validationState.masculinePlural}
            adjectiveId={adjective.id}
            index={index}
            onInputChange={onInputChange}
            onValidation={onValidation}
            onClearInput={onClearInput}
            onKeyDown={onKeyDown}
            setInputRef={setInputRef}
          />

          <GenderInputColumn
            gender="Feminine"
            singularField="feminineSingular"
            pluralField="femininePlural"
            singularValue={inputValues.feminineSingular}
            pluralValue={inputValues.femininePlural}
            singularCorrectAnswer={adjective.feminineSingular}
            pluralCorrectAnswer={adjective.femininePlural}
            singularValidation={validationState.feminineSingular}
            pluralValidation={validationState.femininePlural}
            adjectiveId={adjective.id}
            index={index}
            onInputChange={onInputChange}
            onValidation={onValidation}
            onClearInput={onClearInput}
            onKeyDown={onKeyDown}
            setInputRef={setInputRef}
          />
        </Box>
      </Box>

      {/* Desktop action buttons */}
      <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
        <AdjectiveActions
          adjectiveId={adjective.id}
          hasStatistics={hasStatistics}
          onShowAnswer={onShowAnswer}
          onClearInput={onClearInput}
          onResetStatistics={onResetStatistics}
          showResetButton={false}
        />
      </Box>

      {/* Desktop statistics */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, ml: 2 }}>
        <Statistics correct={statistics.correct} wrong={statistics.wrong} />
      </Box>

      {/* Desktop reset button */}
      <Tooltip title="Reset statistics">
        <IconButton
          size="small"
          onClick={() => onResetStatistics(adjective.id)}
          color="default"
          disabled={!hasStatistics}
          sx={{ display: { xs: 'none', md: 'inline-flex' } }}
        >
          <DeleteSweepIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </AdjectiveListItem>
  )
}

export default React.memo(AdjectiveItem)
