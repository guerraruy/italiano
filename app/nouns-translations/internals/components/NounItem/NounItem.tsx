import React, { useCallback } from 'react'

import ClearIcon from '@mui/icons-material/Clear'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'

import { Statistics } from '@/app/components/Statistics'

import { NounInfo, NounListItem } from './styled'

interface NounItemProps {
  noun: {
    id: string
    italian: string
    italianPlural: string
    translation: string
    translationPlural: string
  }
  index: number
  inputValues: { singular: string; plural: string }
  validationState: {
    singular: 'correct' | 'incorrect' | null
    plural: 'correct' | 'incorrect' | null
  }
  statistics: { correct: number; wrong: number }
  onInputChange: (
    nounId: string,
    field: 'singular' | 'plural',
    value: string
  ) => void
  onValidation: (nounId: string) => void
  onClearInput: (nounId: string, field: 'singular' | 'plural') => void
  onShowAnswer: (nounId: string) => void
  onResetStatistics: (nounId: string) => void
  onKeyDown: (
    e: React.KeyboardEvent,
    nounId: string,
    field: 'singular' | 'plural',
    index: number
  ) => void
  inputRefSingular: (el: HTMLInputElement | null) => void
  inputRefPlural: (el: HTMLInputElement | null) => void
}

const NounItem = ({
  noun,
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
  inputRefSingular,
  inputRefPlural,
}: NounItemProps) => {
  const getInputStyle = useCallback((state: 'correct' | 'incorrect' | null) => {
    if (state === 'correct') {
      return {
        backgroundColor: '#c8e6c9',
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#c8e6c9',
        },
      }
    }
    if (state === 'incorrect') {
      return {
        backgroundColor: '#ffcdd2',
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#ffcdd2',
        },
      }
    }
    return {}
  }, [])

  return (
    <NounListItem>
      <NounInfo>
        <Box>
          <Typography
            variant='body1'
            fontWeight='bold'
            sx={{ minWidth: '180px' }}
          >
            {noun.translation}
          </Typography>
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ minWidth: '180px' }}
          >
            {noun.translationPlural}
          </Typography>
        </Box>
      </NounInfo>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 1,
          flexGrow: 1,
        }}
      >
        <TextField
          fullWidth
          size='small'
          placeholder='Type the Italian singular...'
          value={inputValues.singular}
          onChange={(e) => onInputChange(noun.id, 'singular', e.target.value)}
          onBlur={() => onValidation(noun.id)}
          onKeyDown={(e) => onKeyDown(e, noun.id, 'singular', index)}
          sx={getInputStyle(validationState.singular)}
          autoComplete='off'
          inputRef={inputRefSingular}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <Tooltip title='Clear field'>
                    <IconButton
                      size='small'
                      onClick={() => onClearInput(noun.id, 'singular')}
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

        <TextField
          fullWidth
          size='small'
          placeholder='Type the Italian plural...'
          value={inputValues.plural}
          onChange={(e) => onInputChange(noun.id, 'plural', e.target.value)}
          onBlur={() => onValidation(noun.id)}
          onKeyDown={(e) => onKeyDown(e, noun.id, 'plural', index)}
          sx={getInputStyle(validationState.plural)}
          autoComplete='off'
          inputRef={inputRefPlural}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <Tooltip title='Clear field'>
                    <IconButton
                      size='small'
                      onClick={() => onClearInput(noun.id, 'plural')}
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
      </Box>

      <Tooltip title='Show answer'>
        <IconButton
          size='small'
          onClick={() => onShowAnswer(noun.id)}
          color='primary'
        >
          <LightbulbOutlinedIcon />
        </IconButton>
      </Tooltip>

      <Statistics correct={statistics.correct} wrong={statistics.wrong} />

      <Tooltip title='Reset statistics'>
        <IconButton
          size='small'
          onClick={() => onResetStatistics(noun.id)}
          color='default'
          disabled={statistics.correct === 0 && statistics.wrong === 0}
        >
          <DeleteSweepIcon fontSize='small' />
        </IconButton>
      </Tooltip>
    </NounListItem>
  )
}

export default React.memo(NounItem)
