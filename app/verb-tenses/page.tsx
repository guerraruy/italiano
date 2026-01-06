'use client'
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Chip,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import ScheduleIcon from '@mui/icons-material/Schedule'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import ClearIcon from '@mui/icons-material/Clear'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import {
  useGetVerbsForConjugationPracticeQuery,
  useGetConjugationStatisticsQuery,
  useUpdateConjugationStatisticMutation,
  useResetConjugationStatisticsMutation,
  useGetProfileQuery,
} from '../store/api'

const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}))

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(4),
}))

const ContentPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  minHeight: '400px',
}))

const FilterBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  flexWrap: 'wrap',
  alignItems: 'center',
}))

const ConjugationGrid = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
}))

const TenseSection = styled(Paper)(({ theme }) => ({
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

type VerbTypeFilter = 'all' | 'regular' | 'irregular' | 'reflexive'

interface ValidationState {
  [key: string]: 'correct' | 'incorrect' | null
}

interface InputValues {
  [key: string]: string
}

interface ResetDialogState {
  open: boolean
  verbId: string | null
  verbName: string | null
}

// Normalize strings for comparison (remove accents, lowercase, trim)
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

const validateAnswer = (userInput: string, correctAnswer: string) => {
  const normalizedInput = normalizeString(userInput)
  const normalizedAnswer = normalizeString(correctAnswer)

  return normalizedInput === normalizedAnswer
}

// Get localStorage key for verb type filter
const getFilterStorageKey = (userId: string) => `verbTypeFilter_${userId}`

export default function VerbTensesPage() {
  const { data, isLoading, error } = useGetVerbsForConjugationPracticeQuery()
  const { data: profileData } = useGetProfileQuery()
  const { data: statisticsData, refetch: refetchStatistics } =
    useGetConjugationStatisticsQuery(undefined, {
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
    })
  const [updateConjugationStatistic] = useUpdateConjugationStatisticMutation()
  const [resetConjugationStatistics, { isLoading: isResetting }] =
    useResetConjugationStatisticsMutation()

  // Get user ID from profile
  const userId = profileData?.profile?.userId || ''

  // Track the last userId that we loaded/saved preferences for
  const lastUserIdRef = useRef<string>('')

  // Initialize verb type filter with localStorage value if available
  const [verbTypeFilter, setVerbTypeFilter] = useState<VerbTypeFilter>(() => {
    // Try to load from localStorage on initial mount
    if (typeof window !== 'undefined') {
      // Try to find any existing filter in localStorage
      // This is a best-effort attempt - will be properly synced when userId is available
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith('verbTypeFilter_')
      )
      if (keys.length > 0) {
        const saved = localStorage.getItem(keys[0])
        if (
          saved &&
          ['all', 'regular', 'irregular', 'reflexive'].includes(saved)
        ) {
          return saved as VerbTypeFilter
        }
      }
    }
    return 'all'
  })

  const [selectedVerbId, setSelectedVerbId] = useState<string>('')
  const [inputValues, setInputValues] = useState<InputValues>({})
  const [validationState, setValidationState] = useState<ValidationState>({})
  const [resetDialog, setResetDialog] = useState<ResetDialogState>({
    open: false,
    verbId: null,
    verbName: null,
  })
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
  const lastValidatedRef = useRef<{ [key: string]: number }>({})

  // Load and save verb type filter to/from localStorage
  useEffect(() => {
    if (!userId || typeof window === 'undefined') return

    const storageKey = getFilterStorageKey(userId)

    // If this is a new user (different from last one), load their preference
    if (lastUserIdRef.current !== userId) {
      const saved = localStorage.getItem(storageKey)
      if (
        saved &&
        ['all', 'regular', 'irregular', 'reflexive'].includes(saved)
      ) {
        // Only update if different from current value
        if (saved !== verbTypeFilter) {
          // Using a microtask to avoid synchronous setState in effect
          Promise.resolve().then(() => {
            setVerbTypeFilter(saved as VerbTypeFilter)
          })
        }
      }
      lastUserIdRef.current = userId
    } else {
      // Save current preference
      localStorage.setItem(storageKey, verbTypeFilter)
    }
  }, [userId, verbTypeFilter])

  const verbs = useMemo(() => data?.verbs || [], [data?.verbs])

  // Get enabled verb tenses from profile
  const enabledVerbTenses = useMemo(
    () => profileData?.profile?.enabledVerbTenses || ['Indicativo.Presente'],
    [profileData?.profile?.enabledVerbTenses]
  )

  // Filter verbs by type
  const filteredVerbs = useMemo(() => {
    if (verbTypeFilter === 'all') return verbs

    return verbs.filter((verb) => {
      if (verbTypeFilter === 'reflexive') return verb.reflexive
      if (verbTypeFilter === 'regular') return verb.regular && !verb.reflexive
      if (verbTypeFilter === 'irregular')
        return !verb.regular && !verb.reflexive
      return true
    })
  }, [verbs, verbTypeFilter])

  // Get selected verb
  const selectedVerb = useMemo(
    () => verbs.find((v) => v.id === selectedVerbId),
    [verbs, selectedVerbId]
  )

  // Get verb icon
  const getVerbIcon = useCallback((regular: boolean, reflexive: boolean) => {
    if (reflexive) {
      return (
        <Tooltip title='Reflexive'>
          <AutorenewIcon color='secondary' fontSize='small' />
        </Tooltip>
      )
    }
    if (regular) {
      return (
        <Tooltip title='Regular'>
          <RadioButtonCheckedIcon color='info' fontSize='small' />
        </Tooltip>
      )
    }
    return (
      <Tooltip title='Irregular'>
        <ShowChartIcon color='warning' fontSize='small' />
      </Tooltip>
    )
  }, [])

  // Get statistics for a specific conjugation
  const getStatistics = useCallback(
    (verbId: string, mood: string, tense: string, person: string) => {
      const key = `${verbId}:${mood}:${tense}:${person}`
      const stats = statisticsData?.statistics[key]
      return {
        correct: stats?.correctAttempts || 0,
        wrong: stats?.wrongAttempts || 0,
      }
    },
    [statisticsData?.statistics]
  )

  // Create input key
  const createInputKey = (mood: string, tense: string, person: string) =>
    `${mood}:${tense}:${person}`

  const handleInputChange = useCallback((key: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [key]: value }))
    setValidationState((prev) => {
      if (!prev[key]) return prev
      return { ...prev, [key]: null }
    })
  }, [])

  const handleValidation = useCallback(
    (
      key: string,
      correctAnswer: string,
      verbId: string,
      mood: string,
      tense: string,
      person: string
    ) => {
      const userInput = inputValues[key] || ''
      if (!userInput.trim()) return

      // Prevent duplicate validation within 100ms
      const now = Date.now()
      const lastValidated = lastValidatedRef.current[key] || 0
      if (now - lastValidated < 100) {
        return
      }
      lastValidatedRef.current[key] = now

      const isCorrect = validateAnswer(userInput, correctAnswer)

      setValidationState((prev) => ({
        ...prev,
        [key]: isCorrect ? 'correct' : 'incorrect',
      }))

      // Save statistics to backend asynchronously
      updateConjugationStatistic({
        verbId,
        mood,
        tense,
        person,
        correct: isCorrect,
      }).catch((error) => {
        console.error('Failed to update statistics:', error)
      })
    },
    [inputValues, updateConjugationStatistic]
  )

  const handleClearInput = useCallback((key: string) => {
    setInputValues((prev) => ({ ...prev, [key]: '' }))
    setValidationState((prev) => ({ ...prev, [key]: null }))
    setTimeout(() => {
      const input = inputRefs.current[key]
      if (input) {
        input.focus()
      }
    }, 0)
  }, [])

  const handleShowAnswer = useCallback((key: string, correctAnswer: string) => {
    setInputValues((prev) => ({ ...prev, [key]: correctAnswer }))
    setValidationState((prev) => ({ ...prev, [key]: 'correct' }))
  }, [])

  const handleOpenResetDialog = useCallback(() => {
    if (selectedVerb) {
      setResetDialog({
        open: true,
        verbId: selectedVerb.id,
        verbName: selectedVerb.italian,
      })
    }
  }, [selectedVerb])

  const handleCloseResetDialog = useCallback(() => {
    setResetDialog({
      open: false,
      verbId: null,
      verbName: null,
    })
  }, [])

  const handleConfirmReset = useCallback(async () => {
    if (!resetDialog.verbId) return

    try {
      await resetConjugationStatistics(resetDialog.verbId).unwrap()
      handleCloseResetDialog()
      refetchStatistics()
    } catch (error) {
      console.error('Failed to reset statistics:', error)
    }
  }, [
    resetDialog.verbId,
    resetConjugationStatistics,
    handleCloseResetDialog,
    refetchStatistics,
  ])

  // Get all input keys in order based on enabled tenses
  const getAllInputKeys = useCallback(() => {
    if (!selectedVerb) return []

    const keys: string[] = []
    const conjugation = selectedVerb.conjugation

    enabledVerbTenses.forEach((tenseKey) => {
      const [mood, tense] = tenseKey.split('.')
      const moodData = conjugation[mood]

      if (!moodData || !moodData[tense]) return

      const tenseData = moodData[tense]

      // Simple form (string value)
      if (typeof tenseData === 'string') {
        keys.push(createInputKey(mood, tense, 'form'))
      } else {
        // Person-based conjugations
        Object.keys(tenseData).forEach((person) => {
          keys.push(createInputKey(mood, tense, person))
        })
      }
    })

    return keys
  }, [selectedVerb, enabledVerbTenses])

  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent,
      key: string,
      correctAnswer: string,
      verbId: string,
      mood: string,
      tense: string,
      person: string
    ) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleValidation(key, correctAnswer, verbId, mood, tense, person)

        // Move focus to next input
        const allKeys = getAllInputKeys()
        const currentIndex = allKeys.indexOf(key)

        if (currentIndex !== -1 && currentIndex < allKeys.length - 1) {
          const nextKey = allKeys[currentIndex + 1]
          setTimeout(() => {
            const nextInput = inputRefs.current[nextKey]
            if (nextInput) {
              nextInput.focus()
            }
          }, 0)
        }
      }
    },
    [handleValidation, getAllInputKeys]
  )

  // Render conjugation inputs for enabled tenses
  const renderConjugationInputs = () => {
    if (!selectedVerb) return null

    const conjugation = selectedVerb.conjugation

    return enabledVerbTenses.map((tenseKey) => {
      const [mood, tense] = tenseKey.split('.')
      const moodData = conjugation[mood]

      if (!moodData || !moodData[tense]) {
        return null
      }

      const tenseData = moodData[tense]

      // Handle simple forms (string values like Participio, Gerundio, Infinito)
      if (typeof tenseData === 'string') {
        const key = createInputKey(mood, tense, 'form')
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
        const inputStyle = getInputStyle(validationState[key])

        const stats = getStatistics(selectedVerb.id, mood, tense, 'form')

        return (
          <TenseSection key={tenseKey} elevation={2}>
            <Box
              display='flex'
              alignItems='center'
              justifyContent='space-between'
              mb={2}
            >
              <Typography variant='h6' fontWeight='bold'>
                {mood} - {tense}
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
                  size='small'
                  placeholder='Type the conjugation...'
                  value={inputValues[key] || ''}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  onBlur={() =>
                    handleValidation(
                      key,
                      tenseData,
                      selectedVerb.id,
                      mood,
                      tense,
                      'form'
                    )
                  }
                  onKeyDown={(e) =>
                    handleKeyDown(
                      e,
                      key,
                      tenseData,
                      selectedVerb.id,
                      mood,
                      tense,
                      'form'
                    )
                  }
                  sx={inputStyle}
                  autoComplete='off'
                  inputRef={(el) => (inputRefs.current[key] = el)}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position='end'>
                          <Tooltip title='Clear field'>
                            <IconButton
                              size='small'
                              onClick={() => handleClearInput(key)}
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
                    onClick={() => handleShowAnswer(key, tenseData)}
                    color='primary'
                  >
                    <LightbulbIcon fontSize='small' />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box
                sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 2 }}
              >
                <Tooltip title='Correct attempts'>
                  <Chip
                    icon={<CheckIcon sx={{ fontSize: 16 }} />}
                    label={stats.correct}
                    size='small'
                    color='success'
                    variant='outlined'
                  />
                </Tooltip>
                <Tooltip title='Wrong attempts'>
                  <Chip
                    icon={<CloseIcon sx={{ fontSize: 16 }} />}
                    label={stats.wrong}
                    size='small'
                    color='error'
                    variant='outlined'
                  />
                </Tooltip>
              </Box>
            </PersonRow>
          </TenseSection>
        )
      }

      // Handle person-based conjugations (object values)
      const persons = Object.keys(tenseData)

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

      return (
        <TenseSection key={tenseKey} elevation={2}>
          <Box
            display='flex'
            alignItems='center'
            justifyContent='space-between'
            mb={2}
          >
            <Typography variant='h6' fontWeight='bold'>
              {mood} - {tense}
            </Typography>
          </Box>
          {persons.map((person) => {
            const correctAnswer = tenseData[person]
            const key = createInputKey(mood, tense, person)
            const inputStyle = getInputStyle(validationState[key])

            const stats = getStatistics(selectedVerb.id, mood, tense, person)

            return (
              <PersonRow key={person}>
                <PersonLabel variant='body1'>{person}</PersonLabel>
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
                    size='small'
                    placeholder='Type the conjugation...'
                    value={inputValues[key] || ''}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    onBlur={() =>
                      handleValidation(
                        key,
                        correctAnswer,
                        selectedVerb.id,
                        mood,
                        tense,
                        person
                      )
                    }
                    onKeyDown={(e) =>
                      handleKeyDown(
                        e,
                        key,
                        correctAnswer,
                        selectedVerb.id,
                        mood,
                        tense,
                        person
                      )
                    }
                    sx={inputStyle}
                    autoComplete='off'
                    inputRef={(el) => (inputRefs.current[key] = el)}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position='end'>
                            <Tooltip title='Clear field'>
                              <IconButton
                                size='small'
                                onClick={() => handleClearInput(key)}
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
                      onClick={() => handleShowAnswer(key, correctAnswer)}
                      color='primary'
                    >
                      <LightbulbIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box
                  sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 2 }}
                >
                  <Tooltip title='Correct attempts'>
                    <Chip
                      icon={<CheckIcon sx={{ fontSize: 16 }} />}
                      label={stats.correct}
                      size='small'
                      color='success'
                      variant='outlined'
                    />
                  </Tooltip>
                  <Tooltip title='Wrong attempts'>
                    <Chip
                      icon={<CloseIcon sx={{ fontSize: 16 }} />}
                      label={stats.wrong}
                      size='small'
                      color='error'
                      variant='outlined'
                    />
                  </Tooltip>
                </Box>
              </PersonRow>
            )
          })}
        </TenseSection>
      )
    })
  }

  if (isLoading) {
    return (
      <PageContainer maxWidth='lg'>
        <HeaderBox>
          <ScheduleIcon color='primary' sx={{ fontSize: 40 }} />
          <Typography variant='h3' component='h1' fontWeight='bold'>
            Verb Tenses
          </Typography>
        </HeaderBox>
        <ContentPaper elevation={3}>
          <Box
            display='flex'
            justifyContent='center'
            alignItems='center'
            minHeight='400px'
          >
            <CircularProgress />
          </Box>
        </ContentPaper>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer maxWidth='lg'>
        <HeaderBox>
          <ScheduleIcon color='primary' sx={{ fontSize: 40 }} />
          <Typography variant='h3' component='h1' fontWeight='bold'>
            Verb Tenses
          </Typography>
        </HeaderBox>
        <ContentPaper elevation={3}>
          <Alert severity='error'>
            Error loading verbs. Please try again later.
          </Alert>
        </ContentPaper>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth='lg'>
      <HeaderBox>
        <ScheduleIcon color='primary' sx={{ fontSize: 40 }} />
        <Typography variant='h3' component='h1' fontWeight='bold'>
          Verb Tenses
        </Typography>
      </HeaderBox>

      <ContentPaper elevation={3}>
        <Typography
          variant='h6'
          color='text.secondary'
          gutterBottom
          sx={{ mb: 3 }}
        >
          Practice verb conjugations for all selected tenses
        </Typography>

        <FilterBox>
          <FormControl size='small' sx={{ minWidth: 150 }}>
            <InputLabel id='verb-type-filter-label'>Verb Type</InputLabel>
            <Select
              labelId='verb-type-filter-label'
              id='verb-type-filter'
              value={verbTypeFilter}
              label='Verb Type'
              onChange={(e) =>
                setVerbTypeFilter(e.target.value as VerbTypeFilter)
              }
            >
              <MenuItem value='all'>All</MenuItem>
              <MenuItem value='regular'>Regular</MenuItem>
              <MenuItem value='irregular'>Irregular</MenuItem>
              <MenuItem value='reflexive'>Reflexive</MenuItem>
            </Select>
          </FormControl>

          <FormControl size='small' sx={{ minWidth: 300 }}>
            <InputLabel id='verb-select-label'>Select Verb</InputLabel>
            <Select
              labelId='verb-select-label'
              id='verb-select'
              value={selectedVerbId}
              label='Select Verb'
              onChange={(e) => {
                setSelectedVerbId(e.target.value)
                setInputValues({})
                setValidationState({})
              }}
            >
              <MenuItem value=''>
                <em>Choose a verb</em>
              </MenuItem>
              {filteredVerbs.map((verb) => (
                <MenuItem key={verb.id} value={verb.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getVerbIcon(verb.regular, verb.reflexive)}
                    <span>
                      {verb.italian} - {verb.translation}
                    </span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedVerb && (
            <Tooltip title='Reset all statistics for this verb'>
              <IconButton
                size='small'
                onClick={handleOpenResetDialog}
                color='default'
              >
                <DeleteSweepIcon />
              </IconButton>
            </Tooltip>
          )}

          <Typography variant='body2' color='text.secondary' sx={{ ml: 1 }}>
            {filteredVerbs.length} verb{filteredVerbs.length !== 1 ? 's' : ''}{' '}
            available
          </Typography>
        </FilterBox>

        {verbs.length === 0 ? (
          <Alert severity='info'>
            No verbs with conjugations available. Please ask your administrator
            to import verb conjugations.
          </Alert>
        ) : !selectedVerbId ? (
          <Alert severity='info'>
            Please select a verb to start practicing conjugations.
          </Alert>
        ) : (
          <ConjugationGrid>{renderConjugationInputs()}</ConjugationGrid>
        )}
      </ContentPaper>

      {/* Reset Statistics Confirmation Dialog */}
      <Dialog
        open={resetDialog.open}
        onClose={handleCloseResetDialog}
        aria-labelledby='reset-dialog-title'
        aria-describedby='reset-dialog-description'
      >
        <DialogTitle id='reset-dialog-title'>Reset Statistics</DialogTitle>
        <DialogContent>
          <DialogContentText id='reset-dialog-description'>
            Are you sure you want to reset all conjugation statistics for the
            verb &quot;
            {resetDialog.verbName}&quot;? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResetDialog} disabled={isResetting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmReset}
            color='error'
            variant='contained'
            disabled={isResetting}
            autoFocus
          >
            {isResetting ? 'Resetting...' : 'Reset'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  )
}
