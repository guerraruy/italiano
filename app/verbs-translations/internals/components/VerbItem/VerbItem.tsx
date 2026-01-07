import React, { useMemo, useCallback } from 'react'

import AutorenewIcon from '@mui/icons-material/Autorenew'
import ClearIcon from '@mui/icons-material/Clear'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import {
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'

import { Statistics } from '@/app/components/Statistics'

import { VerbListItem, VerbInfo, IconBox, InputActionsBox } from './styled'

interface VerbItemProps {
  verb: {
    id: string
    italian: string
    translation: string
    regular: boolean
    reflexive: boolean
  }
  index: number
  inputValue: string
  validationState: 'correct' | 'incorrect' | null
  statistics: { correct: number; wrong: number }
  onInputChange: (verbId: string, value: string) => void
  onValidation: (verbId: string, correctAnswer: string) => void
  onClearInput: (verbId: string) => void
  onShowAnswer: (verbId: string, correctAnswer: string) => void
  onResetStatistics: (verbId: string) => void
  onKeyDown: (
    e: React.KeyboardEvent,
    verbId: string,
    correctAnswer: string,
    index: number
  ) => void
  inputRef: (el: HTMLInputElement | null) => void
}

const VerbItem = ({
  verb,
  index,
  inputValue,
  validationState,
  statistics,
  onInputChange,
  onValidation,
  onClearInput,
  onShowAnswer,
  onResetStatistics,
  onKeyDown,
  inputRef,
}: VerbItemProps) => {
  const inputStyle = useMemo(() => {
    if (validationState === 'correct') {
      return {
        backgroundColor: '#c8e6c9',
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#c8e6c9',
        },
      }
    }
    if (validationState === 'incorrect') {
      return {
        backgroundColor: '#ffcdd2',
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#ffcdd2',
        },
      }
    }
    return {}
  }, [validationState])

  const getVerbIcon = useCallback((regular: boolean, reflexive: boolean) => {
    if (reflexive) {
      return (
        <Tooltip title='Reflexive'>
          <AutorenewIcon color='secondary' />
        </Tooltip>
      )
    }
    if (regular) {
      return (
        <Tooltip title='Regular'>
          <RadioButtonCheckedIcon color='info' />
        </Tooltip>
      )
    }
    return (
      <Tooltip title='Irregular'>
        <ShowChartIcon color='warning' />
      </Tooltip>
    )
  }, [])

  return (
    <VerbListItem>
      <IconBox>{getVerbIcon(verb.regular, verb.reflexive)}</IconBox>

      <VerbInfo>
        <Typography
          variant='body1'
          fontWeight='bold'
          sx={{ minWidth: '180px' }}
        >
          {verb.translation}
        </Typography>
      </VerbInfo>

      <InputActionsBox>
        <TextField
          fullWidth
          size='small'
          placeholder='Type the Italian translation...'
          value={inputValue}
          onChange={(e) => onInputChange(verb.id, e.target.value)}
          onBlur={() => onValidation(verb.id, verb.italian)}
          onKeyDown={(e) => onKeyDown(e, verb.id, verb.italian, index)}
          sx={inputStyle}
          autoComplete='off'
          inputRef={inputRef}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <Tooltip title='Clear field'>
                    <IconButton
                      size='small'
                      onClick={() => onClearInput(verb.id)}
                      edge='end'
                      sx={{ mr: 0.5 }}
                    >
                      <ClearIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            },
          }}
        />
        <Tooltip title='Show answer'>
          <IconButton
            size='small'
            onClick={() => onShowAnswer(verb.id, verb.italian)}
            color='primary'
          >
            <LightbulbOutlinedIcon />
          </IconButton>
        </Tooltip>
      </InputActionsBox>

      <Statistics correct={statistics.correct} wrong={statistics.wrong} />

      <Tooltip title='Reset statistics'>
        <IconButton
          size='small'
          onClick={() => onResetStatistics(verb.id)}
          color='default'
          disabled={statistics.correct === 0 && statistics.wrong === 0}
        >
          <DeleteSweepIcon fontSize='small' />
        </IconButton>
      </Tooltip>
    </VerbListItem>
  )
}

export default React.memo(VerbItem)

