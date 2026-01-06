import React, { useCallback } from 'react'
import {
  Box,
  TextField,
  IconButton,
  Tooltip,
  InputAdornment,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import ClearIcon from '@mui/icons-material/Clear'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import { ListItem } from '@mui/material'

const AdjectiveListItem = styled(ListItem)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  padding: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}))

const AdjectiveInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  minWidth: '200px',
}))

const StatisticsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'center',
  [theme.breakpoints.up('md')]: {
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    alignItems: 'flex-start',
  },
}))

interface InputValues {
  masculineSingular: string
  masculinePlural: string
  feminineSingular: string
  femininePlural: string
}

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
  inputValues: InputValues
  validationState: ValidationState
  statistics: { correct: number; wrong: number }
  onInputChange: (
    adjectiveId: string,
    field: keyof InputValues,
    value: string
  ) => void
  onValidation: (
    adjectiveId: string,
    field: keyof InputValues,
    correctAnswer: string
  ) => void
  onClearInput: (adjectiveId: string, field?: keyof InputValues) => void
  onShowAnswer: (adjectiveId: string) => void
  onResetStatistics: (adjectiveId: string) => void
  onKeyDown: (
    e: React.KeyboardEvent,
    adjectiveId: string,
    field: keyof InputValues,
    index: number
  ) => void
  inputRefs: React.MutableRefObject<{
    [key: string]: HTMLInputElement | null
  }>
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
  inputRefs,
}: AdjectiveItemProps) => {
  const setInputRef = useCallback(
    (key: string, el: HTMLInputElement | null) => {
      // Modifying ref.current is the correct way to use refs in React
      inputRefs.current[key] = el
    },
    // Refs are stable and don't need to be in dependency arrays
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const getInputStyle = (field: keyof InputValues) => {
    if (validationState[field] === 'correct') {
      return {
        backgroundColor: '#c8e6c9',
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#c8e6c9',
        },
      }
    }
    if (validationState[field] === 'incorrect') {
      return {
        backgroundColor: '#ffcdd2',
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#ffcdd2',
        },
      }
    }
    return {}
  }

  const allCorrect =
    validationState.masculineSingular === 'correct' &&
    validationState.masculinePlural === 'correct' &&
    validationState.feminineSingular === 'correct' &&
    validationState.femininePlural === 'correct'

  return (
    <AdjectiveListItem>
      <AdjectiveInfo>
        <Typography
          variant='body1'
          fontWeight='bold'
          sx={{ minWidth: '180px' }}
        >
          {adjective.translation}
        </Typography>
        {/* {allCorrect && (
          <CheckIcon sx={{ color: 'success.main', fontSize: 28 }} />
        )} */}
      </AdjectiveInfo>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          flexGrow: 1,
        }}
      >
        {/* Mobile statistics - show above inputs on mobile */}
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            gap: 2,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <StatisticsBox>
            <Tooltip title='Correct attempts'>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: 'success.main',
                }}
              >
                <CheckIcon sx={{ fontSize: 16 }} />
                <Typography variant='caption' fontWeight='bold'>
                  {statistics.correct}
                </Typography>
              </Box>
            </Tooltip>
            <Tooltip title='Wrong attempts'>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: 'error.main',
                }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
                <Typography variant='caption' fontWeight='bold'>
                  {statistics.wrong}
                </Typography>
              </Box>
            </Tooltip>
          </StatisticsBox>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title='Show all answers'>
              <IconButton
                size='small'
                onClick={() => onShowAnswer(adjective.id)}
                color='primary'
              >
                <LightbulbOutlinedIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title='Clear all fields'>
              <IconButton
                size='small'
                onClick={() => onClearInput(adjective.id)}
                color='default'
              >
                <ClearIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title='Reset statistics'>
              <IconButton
                size='small'
                onClick={() => onResetStatistics(adjective.id)}
                color='default'
                disabled={statistics.correct === 0 && statistics.wrong === 0}
              >
                <DeleteSweepIcon fontSize='small' />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Input fields */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
          }}
        >
          {/* Masculine Column */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography
              variant='subtitle2'
              color='text.secondary'
              sx={{ mb: -1 }}
            >
              Masculine
            </Typography>
            <TextField
              fullWidth
              size='small'
              label='Singular'
              placeholder='Type the masculine singular form...'
              value={inputValues.masculineSingular}
              onChange={(e) =>
                onInputChange(adjective.id, 'masculineSingular', e.target.value)
              }
              onBlur={() =>
                onValidation(
                  adjective.id,
                  'masculineSingular',
                  adjective.masculineSingular
                )
              }
              onKeyDown={(e) =>
                onKeyDown(e, adjective.id, 'masculineSingular', index)
              }
              sx={getInputStyle('masculineSingular')}
              autoComplete='off'
              inputRef={(el) =>
                setInputRef(`${adjective.id}-masculineSingular`, el)
              }
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <Tooltip title='Clear field'>
                        <IconButton
                          size='small'
                          onClick={() =>
                            onClearInput(adjective.id, 'masculineSingular')
                          }
                          edge='end'
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
              label='Plural'
              placeholder='Type the masculine plural form...'
              value={inputValues.masculinePlural}
              onChange={(e) =>
                onInputChange(adjective.id, 'masculinePlural', e.target.value)
              }
              onBlur={() =>
                onValidation(
                  adjective.id,
                  'masculinePlural',
                  adjective.masculinePlural
                )
              }
              onKeyDown={(e) =>
                onKeyDown(e, adjective.id, 'masculinePlural', index)
              }
              sx={getInputStyle('masculinePlural')}
              autoComplete='off'
              inputRef={(el) =>
                setInputRef(`${adjective.id}-masculinePlural`, el)
              }
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <Tooltip title='Clear field'>
                        <IconButton
                          size='small'
                          onClick={() =>
                            onClearInput(adjective.id, 'masculinePlural')
                          }
                          edge='end'
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

          {/* Feminine Column */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography
              variant='subtitle2'
              color='text.secondary'
              sx={{ mb: -1 }}
            >
              Feminine
            </Typography>
            <TextField
              fullWidth
              size='small'
              label='Singular'
              placeholder='Type the feminine singular form...'
              value={inputValues.feminineSingular}
              onChange={(e) =>
                onInputChange(adjective.id, 'feminineSingular', e.target.value)
              }
              onBlur={() =>
                onValidation(
                  adjective.id,
                  'feminineSingular',
                  adjective.feminineSingular
                )
              }
              onKeyDown={(e) =>
                onKeyDown(e, adjective.id, 'feminineSingular', index)
              }
              sx={getInputStyle('feminineSingular')}
              autoComplete='off'
              inputRef={(el) =>
                setInputRef(`${adjective.id}-feminineSingular`, el)
              }
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <Tooltip title='Clear field'>
                        <IconButton
                          size='small'
                          onClick={() =>
                            onClearInput(adjective.id, 'feminineSingular')
                          }
                          edge='end'
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
              label='Plural'
              placeholder='Type the feminine plural form...'
              value={inputValues.femininePlural}
              onChange={(e) =>
                onInputChange(adjective.id, 'femininePlural', e.target.value)
              }
              onBlur={() =>
                onValidation(
                  adjective.id,
                  'femininePlural',
                  adjective.femininePlural
                )
              }
              onKeyDown={(e) =>
                onKeyDown(e, adjective.id, 'femininePlural', index)
              }
              sx={getInputStyle('femininePlural')}
              autoComplete='off'
              inputRef={(el) =>
                setInputRef(`${adjective.id}-femininePlural`, el)
              }
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <Tooltip title='Clear field'>
                        <IconButton
                          size='small'
                          onClick={() =>
                            onClearInput(adjective.id, 'femininePlural')
                          }
                          edge='end'
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
        </Box>
      </Box>

      {/* Desktop icon buttons - show on the right on desktop */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          gap: 1,
        }}
      >
        <Tooltip title='Show all answers'>
          <IconButton
            size='small'
            onClick={() => onShowAnswer(adjective.id)}
            color='primary'
          >
            <LightbulbOutlinedIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title='Clear all fields'>
          <IconButton
            size='small'
            onClick={() => onClearInput(adjective.id)}
            color='default'
          >
            <ClearIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Desktop statistics - show on the right on desktop */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          ml: 2,
        }}
      >
        <StatisticsBox>
          <Tooltip title='Correct attempts'>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: 'success.main',
              }}
            >
              <CheckIcon sx={{ fontSize: 16 }} />
              <Typography variant='caption' fontWeight='bold'>
                {statistics.correct}
              </Typography>
            </Box>
          </Tooltip>
          <Tooltip title='Wrong attempts'>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: 'error.main',
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
              <Typography variant='caption' fontWeight='bold'>
                {statistics.wrong}
              </Typography>
            </Box>
          </Tooltip>
        </StatisticsBox>
      </Box>

      {/* Reset button - always at the end */}
      <Tooltip title='Reset statistics'>
        <IconButton
          size='small'
          onClick={() => onResetStatistics(adjective.id)}
          color='default'
          disabled={statistics.correct === 0 && statistics.wrong === 0}
          sx={{
            display: { xs: 'none', md: 'inline-flex' },
          }}
        >
          <DeleteSweepIcon fontSize='small' />
        </IconButton>
      </Tooltip>
    </AdjectiveListItem>
  )
}

// Use React.memo with custom comparison to prevent unnecessary re-renders
export const MemoizedAdjectiveItem = React.memo(AdjectiveItem, (prev, next) => {
  // Only re-render if relevant props have changed
  return (
    prev.adjective.id === next.adjective.id &&
    prev.inputValues.masculineSingular === next.inputValues.masculineSingular &&
    prev.inputValues.masculinePlural === next.inputValues.masculinePlural &&
    prev.inputValues.feminineSingular === next.inputValues.feminineSingular &&
    prev.inputValues.femininePlural === next.inputValues.femininePlural &&
    prev.validationState.masculineSingular ===
      next.validationState.masculineSingular &&
    prev.validationState.masculinePlural ===
      next.validationState.masculinePlural &&
    prev.validationState.feminineSingular ===
      next.validationState.feminineSingular &&
    prev.validationState.femininePlural ===
      next.validationState.femininePlural &&
    prev.statistics.correct === next.statistics.correct &&
    prev.statistics.wrong === next.statistics.wrong &&
    prev.index === next.index
  )
})

MemoizedAdjectiveItem.displayName = 'MemoizedAdjectiveItem'
