import React, { useCallback } from 'react'

import ClearIcon from '@mui/icons-material/Clear'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import {
  Box,
  TextField,
  IconButton,
  Tooltip,
  InputAdornment,
  Typography,
} from '@mui/material'

import { Statistics } from '@/app/components/Statistics'

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
  const getInputStyle = useCallback(
    (field: keyof InputValues[string]) => {
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
    },
    [validationState]
  )

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
        {/* Mobile statistics - show above inputs on mobile */}
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            gap: 2,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Statistics correct={statistics.correct} wrong={statistics.wrong} />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Show all answers">
              <IconButton
                size="small"
                onClick={() => onShowAnswer(adjective.id)}
                color="primary"
              >
                <LightbulbOutlinedIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Clear all fields">
              <IconButton
                size="small"
                onClick={() => onClearInput(adjective.id)}
                color="default"
              >
                <ClearIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Reset statistics">
              <IconButton
                size="small"
                onClick={() => onResetStatistics(adjective.id)}
                color="default"
                disabled={statistics.correct === 0 && statistics.wrong === 0}
              >
                <DeleteSweepIcon fontSize="small" />
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
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: -1 }}
            >
              Masculine
            </Typography>
            <TextField
              fullWidth
              size="small"
              label="Singular"
              placeholder="Type the masculine singular form..."
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
              autoComplete="off"
              inputRef={setInputRef(adjective.id, 'masculineSingular')}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Clear field">
                        <IconButton
                          size="small"
                          onClick={() =>
                            onClearInput(adjective.id, 'masculineSingular')
                          }
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
            <TextField
              fullWidth
              size="small"
              label="Plural"
              placeholder="Type the masculine plural form..."
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
              autoComplete="off"
              inputRef={setInputRef(adjective.id, 'masculinePlural')}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Clear field">
                        <IconButton
                          size="small"
                          onClick={() =>
                            onClearInput(adjective.id, 'masculinePlural')
                          }
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
          </Box>

          {/* Feminine Column */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: -1 }}
            >
              Feminine
            </Typography>
            <TextField
              fullWidth
              size="small"
              label="Singular"
              placeholder="Type the feminine singular form..."
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
              autoComplete="off"
              inputRef={setInputRef(adjective.id, 'feminineSingular')}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Clear field">
                        <IconButton
                          size="small"
                          onClick={() =>
                            onClearInput(adjective.id, 'feminineSingular')
                          }
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
            <TextField
              fullWidth
              size="small"
              label="Plural"
              placeholder="Type the feminine plural form..."
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
              autoComplete="off"
              inputRef={setInputRef(adjective.id, 'femininePlural')}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Clear field">
                        <IconButton
                          size="small"
                          onClick={() =>
                            onClearInput(adjective.id, 'femininePlural')
                          }
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
        <Tooltip title="Show all answers">
          <IconButton
            size="small"
            onClick={() => onShowAnswer(adjective.id)}
            color="primary"
          >
            <LightbulbOutlinedIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Clear all fields">
          <IconButton
            size="small"
            onClick={() => onClearInput(adjective.id)}
            color="default"
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
        <Statistics correct={statistics.correct} wrong={statistics.wrong} />
      </Box>

      {/* Reset button - always at the end */}
      <Tooltip title="Reset statistics">
        <IconButton
          size="small"
          onClick={() => onResetStatistics(adjective.id)}
          color="default"
          disabled={statistics.correct === 0 && statistics.wrong === 0}
          sx={{
            display: { xs: 'none', md: 'inline-flex' },
          }}
        >
          <DeleteSweepIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </AdjectiveListItem>
  )
}

export default React.memo(AdjectiveItem)
