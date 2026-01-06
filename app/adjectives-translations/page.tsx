'use client'
import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useTransition,
} from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import TranslateIcon from '@mui/icons-material/Translate'
import RefreshIcon from '@mui/icons-material/Refresh'
import {
  useGetAdjectivesForPracticeQuery,
  useGetAdjectiveStatisticsQuery,
  useUpdateAdjectiveStatisticMutation,
  useResetAdjectiveStatisticMutation,
} from '../store/api'
import { MemoizedAdjectiveItem } from './internals/AdjectiveItem'

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

type SortOption =
  | 'none'
  | 'alphabetical'
  | 'random'
  | 'most-errors'
  | 'worst-performance'
type DisplayCount = 10 | 20 | 30 | 'all'

interface InputValues {
  [key: string]: {
    masculineSingular: string
    masculinePlural: string
    feminineSingular: string
    femininePlural: string
  }
}

interface ResetDialogState {
  open: boolean
  adjectiveId: string | null
  adjectiveTranslation: string | null
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

export default function AdjectivesTranslationsPage() {
  const { data, isLoading, error } = useGetAdjectivesForPracticeQuery()
  const { data: statisticsData, refetch: refetchStatistics } =
    useGetAdjectiveStatisticsQuery(undefined, {
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
    })
  const [updateAdjectiveStatistic] = useUpdateAdjectiveStatisticMutation()
  const [resetAdjectiveStatistic, { isLoading: isResetting }] =
    useResetAdjectiveStatisticMutation()
  const [inputValues, setInputValues] = useState<InputValues>({})
  const [validationState, setValidationState] = useState<{
    [key: string]: {
      masculineSingular: 'correct' | 'incorrect' | null
      masculinePlural: 'correct' | 'incorrect' | null
      feminineSingular: 'correct' | 'incorrect' | null
      femininePlural: 'correct' | 'incorrect' | null
    }
  }>({})
  const [resetDialog, setResetDialog] = useState<ResetDialogState>({
    open: false,
    adjectiveId: null,
    adjectiveTranslation: null,
  })
  const [sortOption, setSortOption] = useState<SortOption>('none')
  const [displayCount, setDisplayCount] = useState<DisplayCount>('all')
  const [randomSeed, setRandomSeed] = useState(0)
  const [, startTransition] = useTransition()
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
  const lastValidatedRef = useRef<{ [key: string]: number }>({})

  const handleInputChange = useCallback(
    (adjectiveId: string, field: keyof InputValues[string], value: string) => {
      setInputValues((prev) => ({
        ...prev,
        [adjectiveId]: {
          ...(prev[adjectiveId] || {
            masculineSingular: '',
            masculinePlural: '',
            feminineSingular: '',
            femininePlural: '',
          }),
          [field]: value,
        },
      }))
      // Clear validation visual feedback when user starts typing again
      setValidationState((prev) => {
        if (!prev[adjectiveId]) return prev
        return {
          ...prev,
          [adjectiveId]: {
            ...prev[adjectiveId],
            [field]: null,
          },
        }
      })
    },
    []
  )

  const handleValidation = useCallback(
    (
      adjectiveId: string,
      field: keyof InputValues[string],
      correctAnswer: string
    ) => {
      const userInput = inputValues[adjectiveId]?.[field] || ''
      if (!userInput.trim()) return

      // Prevent duplicate validation within 100ms
      const now = Date.now()
      const key = `${adjectiveId}-${field}`
      const lastValidated = lastValidatedRef.current[key] || 0
      if (now - lastValidated < 100) {
        return
      }
      lastValidatedRef.current[key] = now

      const isCorrect = validateAnswer(userInput, correctAnswer)

      // Use startTransition to defer non-urgent state updates
      startTransition(() => {
        setValidationState((prev) => ({
          ...prev,
          [adjectiveId]: {
            ...(prev[adjectiveId] || {
              masculineSingular: null,
              masculinePlural: null,
              feminineSingular: null,
              femininePlural: null,
            }),
            [field]: isCorrect ? 'correct' : 'incorrect',
          },
        }))
      })

      // Check if all fields are validated
      const currentState = validationState[adjectiveId] || {
        masculineSingular: null,
        masculinePlural: null,
        feminineSingular: null,
        femininePlural: null,
      }
      const updatedState = {
        ...currentState,
        [field]: isCorrect ? 'correct' : 'incorrect',
      }

      // Check if all fields are filled and validated
      const allFields = [
        'masculineSingular',
        'masculinePlural',
        'feminineSingular',
        'femininePlural',
      ]
      const allFilled = allFields.every((f) =>
        f === field
          ? userInput.trim()
          : inputValues[adjectiveId]?.[f as keyof InputValues[string]]?.trim()
      )
      const allValidated = allFields.every((f) =>
        f === field
          ? isCorrect
            ? 'correct'
            : 'incorrect'
          : updatedState[f as keyof typeof updatedState]
      )

      // Only save statistics if all fields are validated
      if (allFilled && allValidated) {
        const allCorrect = allFields.every((f) =>
          f === field
            ? isCorrect
            : updatedState[f as keyof typeof updatedState] === 'correct'
        )

        // Save statistics to backend asynchronously (fire and forget)
        updateAdjectiveStatistic({ adjectiveId, correct: allCorrect }).catch(
          (error) => {
            console.error('Failed to update statistics:', error)
          }
        )
      }
    },
    [inputValues, validationState, updateAdjectiveStatistic, startTransition]
  )

  const handleClearInput = useCallback(
    (adjectiveId: string, field?: keyof InputValues[string]) => {
      if (field) {
        // Clear specific field
        setInputValues((prev) => ({
          ...prev,
          [adjectiveId]: {
            ...(prev[adjectiveId] || {
              masculineSingular: '',
              masculinePlural: '',
              feminineSingular: '',
              femininePlural: '',
            }),
            [field]: '',
          },
        }))
        setValidationState((prev) => ({
          ...prev,
          [adjectiveId]: {
            ...(prev[adjectiveId] || {
              masculineSingular: null,
              masculinePlural: null,
              feminineSingular: null,
              femininePlural: null,
            }),
            [field]: null,
          },
        }))
        // Focus the input
        setTimeout(() => {
          const input = inputRefs.current[`${adjectiveId}-${field}`]
          if (input) {
            input.focus()
          }
        }, 0)
      } else {
        // Clear all fields
        setInputValues((prev) => ({
          ...prev,
          [adjectiveId]: {
            masculineSingular: '',
            masculinePlural: '',
            feminineSingular: '',
            femininePlural: '',
          },
        }))
        setValidationState((prev) => ({
          ...prev,
          [adjectiveId]: {
            masculineSingular: null,
            masculinePlural: null,
            feminineSingular: null,
            femininePlural: null,
          },
        }))
      }
    },
    []
  )

  const handleShowAnswer = useCallback(
    (adjectiveId: string) => {
      const adjective = data?.adjectives.find((a) => a.id === adjectiveId)
      if (adjective) {
        setInputValues((prev) => ({
          ...prev,
          [adjectiveId]: {
            masculineSingular: adjective.masculineSingular,
            masculinePlural: adjective.masculinePlural,
            feminineSingular: adjective.feminineSingular,
            femininePlural: adjective.femininePlural,
          },
        }))
        setValidationState((prev) => ({
          ...prev,
          [adjectiveId]: {
            masculineSingular: 'correct',
            masculinePlural: 'correct',
            feminineSingular: 'correct',
            femininePlural: 'correct',
          },
        }))
      }
    },
    [data?.adjectives]
  )

  const handleOpenResetDialog = useCallback(
    (adjectiveId: string) => {
      const adjective = data?.adjectives.find((a) => a.id === adjectiveId)
      if (adjective) {
        setResetDialog({
          open: true,
          adjectiveId,
          adjectiveTranslation: adjective.translation,
        })
      }
    },
    [data?.adjectives]
  )

  const handleCloseResetDialog = useCallback(() => {
    setResetDialog({
      open: false,
      adjectiveId: null,
      adjectiveTranslation: null,
    })
  }, [])

  const handleConfirmReset = useCallback(async () => {
    if (!resetDialog.adjectiveId) return

    try {
      await resetAdjectiveStatistic(resetDialog.adjectiveId).unwrap()
      handleCloseResetDialog()
    } catch (error) {
      console.error('Failed to reset statistics:', error)
    }
  }, [resetDialog.adjectiveId, resetAdjectiveStatistic, handleCloseResetDialog])

  // Memoize adjectives array to prevent unnecessary re-renders
  const adjectives = useMemo(() => data?.adjectives || [], [data?.adjectives])

  // Pre-calculate all statistics once to avoid repeated calls during sorting
  const statisticsMap = useMemo(() => {
    const map = new Map<string, { correct: number; wrong: number }>()
    adjectives.forEach((adj) => {
      const stats = statisticsData?.statistics[adj.id]
      map.set(adj.id, {
        correct: stats?.correctAttempts || 0,
        wrong: stats?.wrongAttempts || 0,
      })
    })
    return map
  }, [adjectives, statisticsData?.statistics])

  const getStatistics = useCallback(
    (adjectiveId: string) => {
      return statisticsMap.get(adjectiveId) || { correct: 0, wrong: 0 }
    },
    [statisticsMap]
  )

  // Apply filters, sorting, and limit
  const filteredAndSortedAdjectives = useMemo(() => {
    let result = [...adjectives]

    // Apply sorting
    if (sortOption === 'alphabetical') {
      result.sort((a, b) => a.translation.localeCompare(b.translation))
    } else if (sortOption === 'random') {
      // Use Fisher-Yates shuffle with a seeded random
      const shuffled = [...result]
      let seed = randomSeed
      const seededRandom = () => {
        seed = (seed * 9301 + 49297) % 233280
        return seed / 233280
      }
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      result = shuffled
    } else if (
      sortOption === 'most-errors' ||
      sortOption === 'worst-performance'
    ) {
      result.sort((a, b) => {
        const statsA = statisticsMap.get(a.id) || { correct: 0, wrong: 0 }
        const statsB = statisticsMap.get(b.id) || { correct: 0, wrong: 0 }

        if (sortOption === 'most-errors') {
          return statsB.wrong - statsA.wrong
        } else {
          // worst-performance: highest (errors - correct) first
          const performanceA = statsA.wrong - statsA.correct
          const performanceB = statsB.wrong - statsB.correct
          return performanceB - performanceA
        }
      })
    }

    // Apply display count limit
    if (displayCount !== 'all') {
      result = result.slice(0, displayCount)
    }

    return result
  }, [adjectives, sortOption, displayCount, statisticsMap, randomSeed])

  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent,
      adjectiveId: string,
      field: keyof InputValues[string],
      currentIndex: number
    ) => {
      if (e.key === 'Enter') {
        e.preventDefault()

        const adjective = filteredAndSortedAdjectives[currentIndex]
        const correctAnswers = {
          masculineSingular: adjective.masculineSingular,
          masculinePlural: adjective.masculinePlural,
          feminineSingular: adjective.feminineSingular,
          femininePlural: adjective.femininePlural,
        }

        handleValidation(adjectiveId, field, correctAnswers[field])

        // Move to next field or next adjective
        const fields: (keyof InputValues[string])[] = [
          'masculineSingular',
          'masculinePlural',
          'feminineSingular',
          'femininePlural',
        ]
        const currentFieldIndex = fields.indexOf(field)

        if (currentFieldIndex < fields.length - 1) {
          // Move to next field
          const nextField = fields[currentFieldIndex + 1]
          const nextInput = inputRefs.current[`${adjectiveId}-${nextField}`]
          if (nextInput) {
            nextInput.focus()
          }
        } else if (currentIndex < filteredAndSortedAdjectives.length - 1) {
          // Move to first field of next adjective
          const nextAdjective = filteredAndSortedAdjectives[currentIndex + 1]
          const nextInput =
            inputRefs.current[`${nextAdjective.id}-masculineSingular`]
          if (nextInput) {
            nextInput.focus()
          }
        }
      }
    },
    [filteredAndSortedAdjectives, handleValidation]
  )

  const handleRefresh = useCallback(() => {
    if (sortOption === 'random') {
      // Update random seed to reshuffle
      setRandomSeed(Date.now())
    } else if (
      sortOption === 'most-errors' ||
      sortOption === 'worst-performance'
    ) {
      // Refetch statistics to get latest data
      refetchStatistics()
    }
  }, [sortOption, refetchStatistics])

  const shouldShowRefreshButton =
    sortOption === 'random' ||
    sortOption === 'most-errors' ||
    sortOption === 'worst-performance'

  if (isLoading) {
    return (
      <PageContainer maxWidth='lg'>
        <HeaderBox>
          <TranslateIcon color='primary' sx={{ fontSize: 40 }} />
          <Typography variant='h3' component='h1' fontWeight='bold'>
            Adjectives Translations
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
          <TranslateIcon color='primary' sx={{ fontSize: 40 }} />
          <Typography variant='h3' component='h1' fontWeight='bold'>
            Adjectives Translations
          </Typography>
        </HeaderBox>
        <ContentPaper elevation={3}>
          <Alert severity='error'>
            Error loading adjectives. Please try again later.
          </Alert>
        </ContentPaper>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth='lg'>
      <HeaderBox>
        <TranslateIcon color='primary' sx={{ fontSize: 40 }} />
        <Typography variant='h3' component='h1' fontWeight='bold'>
          Adjectives Translations
        </Typography>
      </HeaderBox>

      <ContentPaper elevation={3}>
        <Typography
          variant='h6'
          color='text.secondary'
          gutterBottom
          sx={{ mb: 3 }}
        >
          Translate each adjective from your native language to Italian (all 4
          forms: masculine/feminine, singular/plural)
        </Typography>

        <FilterBox>
          <FormControl size='small' sx={{ minWidth: 180 }}>
            <InputLabel id='sort-option-label'>Sort By</InputLabel>
            <Select
              labelId='sort-option-label'
              id='sort-option'
              value={sortOption}
              label='Sort By'
              onChange={(e) => {
                const newSort = e.target.value as SortOption
                setSortOption(newSort)
                if (newSort === 'random') {
                  setRandomSeed(Date.now())
                }
              }}
            >
              <MenuItem value='none'>None</MenuItem>
              <MenuItem value='alphabetical'>Alphabetical</MenuItem>
              <MenuItem value='random'>Random</MenuItem>
              <MenuItem value='most-errors'>Most Errors</MenuItem>
              <MenuItem value='worst-performance'>Worst Performance</MenuItem>
            </Select>
          </FormControl>

          <FormControl size='small' sx={{ minWidth: 140 }}>
            <InputLabel id='display-count-label'>Display</InputLabel>
            <Select
              labelId='display-count-label'
              id='display-count'
              value={displayCount}
              label='Display'
              onChange={(e) => setDisplayCount(e.target.value as DisplayCount)}
            >
              <MenuItem value={10}>10 adjectives</MenuItem>
              <MenuItem value={20}>20 adjectives</MenuItem>
              <MenuItem value={30}>30 adjectives</MenuItem>
              <MenuItem value='all'>All adjectives</MenuItem>
            </Select>
          </FormControl>

          {shouldShowRefreshButton && (
            <Tooltip title='Refresh list'>
              <IconButton
                onClick={handleRefresh}
                color='primary'
                size='small'
                sx={{ ml: 1 }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}

          <Typography variant='body2' color='text.secondary' sx={{ ml: 1 }}>
            Showing {filteredAndSortedAdjectives.length} of {adjectives.length}{' '}
            adjectives
          </Typography>
        </FilterBox>

        {adjectives.length === 0 ? (
          <Alert severity='info'>
            No adjectives available. Please ask your administrator to import
            adjectives.
          </Alert>
        ) : (
          <List>
            {filteredAndSortedAdjectives.map((adjective, index) => (
              <MemoizedAdjectiveItem
                key={adjective.id}
                adjective={adjective}
                index={index}
                inputValues={
                  inputValues[adjective.id] || {
                    masculineSingular: '',
                    masculinePlural: '',
                    feminineSingular: '',
                    femininePlural: '',
                  }
                }
                validationState={
                  validationState[adjective.id] || {
                    masculineSingular: null,
                    masculinePlural: null,
                    feminineSingular: null,
                    femininePlural: null,
                  }
                }
                statistics={getStatistics(adjective.id)}
                onInputChange={handleInputChange}
                onValidation={handleValidation}
                onClearInput={handleClearInput}
                onShowAnswer={handleShowAnswer}
                onResetStatistics={handleOpenResetDialog}
                onKeyDown={handleKeyDown}
                inputRefs={inputRefs}
              />
            ))}
          </List>
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
            Are you sure you want to reset all statistics for the adjective
            &quot;{resetDialog.adjectiveTranslation}&quot;? This action cannot
            be undone.
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
