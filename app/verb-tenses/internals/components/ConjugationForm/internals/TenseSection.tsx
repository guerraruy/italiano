import React from 'react'

import ClearIcon from '@mui/icons-material/Clear'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  InputAdornment,
  Paper,
} from '@mui/material'
import { styled } from '@mui/material/styles'

import { Statistics } from '@/app/components/Statistics'

import { createInputKey } from '../../../utils'

const StyledTenseSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}))

const PersonRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(1.5),
  '&:last-child': {
    marginBottom: 0,
  },
}))

const PersonLabel = styled(Typography)(({ theme }) => ({
  minWidth: '80px',
  fontWeight: 'bold',
  color: theme.palette.text.secondary,
}))

type TenseData = Record<string, string> | string

interface TenseSectionProps {
  mood: string
  tense: string
  tenseData: TenseData
  verbId: string
  inputValues: { [key: string]: string }
  validationState: { [key: string]: 'correct' | 'incorrect' | null }
  inputRefs: React.MutableRefObject<{
    [key: string]: HTMLInputElement | null
  }>
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

const getInputStyle = (
  validationStateValue: 'correct' | 'incorrect' | null
) => {
  if (validationStateValue === 'correct') {
    return {
      backgroundColor: '#c8e6c9',
      '& .MuiOutlinedInput-root': {
        backgroundColor: '#c8e6c9',
      },
    }
  }
  if (validationStateValue === 'incorrect') {
    return {
      backgroundColor: '#ffcdd2',
      '& .MuiOutlinedInput-root': {
        backgroundColor: '#ffcdd2',
      },
    }
  }
  return {}
}

export const TenseSection: React.FC<TenseSectionProps> = ({
  mood,
  tense,
  tenseData,
  verbId,
  inputValues,
  validationState,
  inputRefs,
  getStatistics,
  onInputChange,
  onValidation,
  onClearInput,
  onShowAnswer,
  onKeyDown,
}) => {
  // Callback factory for setting input refs
  const setInputRef = (key: string) => (el: HTMLInputElement | null) => {
    inputRefs.current[key] = el
  }
  // Handle simple forms (string values like Participio, Gerundio, Infinito)
  if (typeof tenseData === 'string') {
    const key = createInputKey(mood, tense, 'form')
    const inputStyle = getInputStyle(validationState[key] ?? null)
    const stats = getStatistics(verbId, mood, tense, 'form')

    return (
      <StyledTenseSection elevation={2}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography variant="h6" fontWeight="bold">
            {tense} ({mood})
          </Typography>
        </Box>
        <PersonRow>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexGrow: 1,
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Type the conjugation..."
              value={inputValues[key] || ''}
              onChange={(e) => onInputChange(key, e.target.value)}
              onBlur={() =>
                onValidation(key, tenseData, verbId, mood, tense, 'form')
              }
              onKeyDown={(e) =>
                onKeyDown(e, key, tenseData, verbId, mood, tense, 'form')
              }
              sx={inputStyle}
              autoComplete="off"
              inputRef={setInputRef(key)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Clear field">
                        <IconButton
                          size="small"
                          onClick={() => onClearInput(key)}
                          edge="end"
                          sx={{ mr: 0.5 }}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Tooltip title="Show answer">
              <IconButton
                size="small"
                onClick={() => onShowAnswer(key, tenseData)}
                color="primary"
              >
                <LightbulbOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ ml: 2 }}>
            <Statistics correct={stats.correct} wrong={stats.wrong} />
          </Box>
        </PersonRow>
      </StyledTenseSection>
    )
  }

  // Handle person-based conjugations (object values)
  // Define the correct order for Italian conjugation persons
  const personOrder = ['io', 'tu', 'lui/lei', 'noi', 'voi', 'loro']
  const persons = Object.keys(tenseData).sort((a, b) => {
    const indexA = personOrder.indexOf(a)
    const indexB = personOrder.indexOf(b)
    // If a person is not in the defined order, place it at the end
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })

  return (
    <StyledTenseSection elevation={2}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h6" fontWeight="bold">
          {tense} ({mood})
        </Typography>
      </Box>
      {persons.map((person) => {
        const correctAnswer = tenseData[person]
        if (!correctAnswer) return null
        const key = createInputKey(mood, tense, person)
        const inputStyle = getInputStyle(validationState[key] ?? null)
        const stats = getStatistics(verbId, mood, tense, person)

        return (
          <PersonRow key={person}>
            <PersonLabel variant="body1">{person}</PersonLabel>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexGrow: 1,
              }}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="Type the conjugation..."
                value={inputValues[key] || ''}
                onChange={(e) => onInputChange(key, e.target.value)}
                onBlur={() =>
                  onValidation(key, correctAnswer, verbId, mood, tense, person)
                }
                onKeyDown={(e) =>
                  onKeyDown(e, key, correctAnswer, verbId, mood, tense, person)
                }
                sx={inputStyle}
                autoComplete="off"
                inputRef={setInputRef(key)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Clear field">
                          <IconButton
                            size="small"
                            onClick={() => onClearInput(key)}
                            edge="end"
                            sx={{ mr: 0.5 }}
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Tooltip title="Show answer">
                <IconButton
                  size="small"
                  onClick={() => onShowAnswer(key, correctAnswer)}
                  color="primary"
                >
                  <LightbulbOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ ml: 2 }}>
              <Statistics correct={stats.correct} wrong={stats.wrong} />
            </Box>
          </PersonRow>
        )
      })}
    </StyledTenseSection>
  )
}
