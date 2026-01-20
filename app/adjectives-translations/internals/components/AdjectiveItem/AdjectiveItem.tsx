import React from 'react'

import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import { Box, IconButton, Tooltip, Typography } from '@mui/material'

import { Statistics } from '@/app/components/Statistics'
import { usePracticeActions } from '@/app/contexts'

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
  inputRefMasculineSingular: (el: HTMLInputElement | null) => void
  inputRefMasculinePlural: (el: HTMLInputElement | null) => void
  inputRefFeminineSingular: (el: HTMLInputElement | null) => void
  inputRefFemininePlural: (el: HTMLInputElement | null) => void
}

const AdjectiveItem = ({
  adjective,
  index,
  inputValues,
  validationState,
  statistics,
  inputRefMasculineSingular,
  inputRefMasculinePlural,
  inputRefFeminineSingular,
  inputRefFemininePlural,
}: AdjectiveItemProps) => {
  const { onClearInput, onShowAnswer, onResetStatistics } = usePracticeActions()
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
            singularInputRef={inputRefMasculineSingular}
            pluralInputRef={inputRefMasculinePlural}
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
            singularInputRef={inputRefFeminineSingular}
            pluralInputRef={inputRefFemininePlural}
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
        <span>
          <IconButton
            size="small"
            onClick={() => onResetStatistics(adjective.id)}
            color="default"
            disabled={!hasStatistics}
            sx={{ display: { xs: 'none', md: 'inline-flex' } }}
            aria-label="Reset statistics"
          >
            <DeleteSweepIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </AdjectiveListItem>
  )
}

export default React.memo(AdjectiveItem)
