'use client'
import React, { useState, useRef, useCallback, useMemo } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  List,
  ListItem,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  InputAdornment,
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
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import ClearIcon from '@mui/icons-material/Clear'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import RefreshIcon from '@mui/icons-material/Refresh'
import {
  useGetVerbsForPracticeQuery,
  useGetVerbStatisticsQuery,
  useUpdateVerbStatisticMutation,
  useResetVerbStatisticMutation,
} from '../store/api'
import { Statistics } from '../components/Statistics'

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

const VerbListItem = styled(ListItem)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}))

const VerbInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  minWidth: '250px',
}))

const IconBox = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '32px',
}))

const InputActionsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  flexGrow: 1,
  maxWidth: '500px',
}))

const FilterBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  flexWrap: 'wrap',
  alignItems: 'center',
}))

type VerbTypeFilter = 'all' | 'regular' | 'irregular' | 'reflexive'
type SortOption =
  | 'none'
  | 'alphabetical'
  | 'random'
  | 'most-errors'
  | 'worst-performance'
type DisplayCount = 10 | 20 | 30 | 'all'

interface ValidationState {
  [key: string]: 'correct' | 'incorrect' | null
}

interface InputValues {
  [key: string]: string
}

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
  getVerbIcon: (regular: boolean, reflexive: boolean) => React.ReactNode
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
  getVerbIcon,
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

const MemoizedVerbItem = React.memo(VerbItem)

interface ResetDialogState {
  open: boolean
  verbId: string | null
  verbTranslation: string | null
}

// Normalize strings for comparison (remove accents, lowercase, trim)
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

const validateAnswer = (
  verbId: string,
  userInput: string,
  correctAnswer: string
) => {
  const normalizedInput = normalizeString(userInput)
  const normalizedAnswer = normalizeString(correctAnswer)

  return normalizedInput === normalizedAnswer
}

export default function VerbsTranslationsPage() {
  const { data, isLoading, error } = useGetVerbsForPracticeQuery()
  const { data: statisticsData, refetch: refetchStatistics } =
    useGetVerbStatisticsQuery(undefined, {
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
    })
  const [updateVerbStatistic] = useUpdateVerbStatisticMutation()
  const [resetVerbStatistic, { isLoading: isResetting }] =
    useResetVerbStatisticMutation()
  const [inputValues, setInputValues] = useState<InputValues>({})
  const [validationState, setValidationState] = useState<ValidationState>({})
  const [resetDialog, setResetDialog] = useState<ResetDialogState>({
    open: false,
    verbId: null,
    verbTranslation: null,
  })
  const [verbTypeFilter, setVerbTypeFilter] = useState<VerbTypeFilter>('all')
  const [sortOption, setSortOption] = useState<SortOption>('none')
  const [displayCount, setDisplayCount] = useState<DisplayCount>(10)
  const [randomSeed, setRandomSeed] = useState(0)
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
  const lastValidatedRef = useRef<{ [key: string]: number }>({})

  const handleInputChange = useCallback((verbId: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [verbId]: value }))
    // Clear validation visual feedback when user starts typing again
    setValidationState((prev) => {
      if (!prev[verbId]) return prev // No change needed
      return { ...prev, [verbId]: null }
    })
  }, [])

  const handleValidation = useCallback(
    (verbId: string, correctAnswer: string) => {
      const userInput = inputValues[verbId] || ''
      if (!userInput.trim()) return

      // Prevent duplicate validation within 100ms
      const now = Date.now()
      const lastValidated = lastValidatedRef.current[verbId] || 0
      if (now - lastValidated < 100) {
        return
      }
      lastValidatedRef.current[verbId] = now

      const isCorrect = validateAnswer(verbId, userInput, correctAnswer)

      setValidationState((prev) => ({
        ...prev,
        [verbId]: isCorrect ? 'correct' : 'incorrect',
      }))

      // Save statistics to backend asynchronously (fire and forget)
      updateVerbStatistic({ verbId, correct: isCorrect }).catch((error) => {
        console.error('Failed to update statistics:', error)
      })
    },
    [inputValues, updateVerbStatistic]
  )

  const handleClearInput = useCallback((verbId: string) => {
    setInputValues((prev) => ({ ...prev, [verbId]: '' }))
    setValidationState((prev) => ({ ...prev, [verbId]: null }))
    // Focus the input
    setTimeout(() => {
      const input = inputRefs.current[verbId]
      if (input) {
        input.focus()
      }
    }, 0)
  }, [])

  const handleShowAnswer = useCallback(
    (verbId: string, correctAnswer: string) => {
      setInputValues((prev) => ({ ...prev, [verbId]: correctAnswer }))
      setValidationState((prev) => ({ ...prev, [verbId]: 'correct' }))
    },
    []
  )

  const handleOpenResetDialog = useCallback(
    (verbId: string) => {
      const verb = data?.verbs.find((v) => v.id === verbId)
      if (verb) {
        setResetDialog({
          open: true,
          verbId,
          verbTranslation: verb.translation,
        })
      }
    },
    [data?.verbs]
  )

  const handleCloseResetDialog = useCallback(() => {
    setResetDialog({
      open: false,
      verbId: null,
      verbTranslation: null,
    })
  }, [])

  const handleConfirmReset = useCallback(async () => {
    if (!resetDialog.verbId) return

    try {
      await resetVerbStatistic(resetDialog.verbId).unwrap()
      handleCloseResetDialog()
    } catch (error) {
      console.error('Failed to reset statistics:', error)
    }
  }, [resetDialog.verbId, resetVerbStatistic, handleCloseResetDialog])

  const verbIcons = useMemo(
    () => ({
      reflexive: (
        <Tooltip title='Reflexive'>
          <AutorenewIcon color='secondary' />
        </Tooltip>
      ),
      regular: (
        <Tooltip title='Regular'>
          <RadioButtonCheckedIcon color='info' />
        </Tooltip>
      ),
      irregular: (
        <Tooltip title='Irregular'>
          <ShowChartIcon color='warning' />
        </Tooltip>
      ),
    }),
    []
  )

  const getVerbIcon = useCallback(
    (regular: boolean, reflexive: boolean) => {
      if (reflexive) return verbIcons.reflexive
      if (regular) return verbIcons.regular
      return verbIcons.irregular
    },
    [verbIcons]
  )

  const getStatistics = useCallback(
    (verbId: string) => {
      const stats = statisticsData?.statistics[verbId]
      return {
        correct: stats?.correctAttempts || 0,
        wrong: stats?.wrongAttempts || 0,
      }
    },
    [statisticsData?.statistics]
  )

  // Memoize verbs array to prevent unnecessary re-renders
  const verbs = useMemo(() => data?.verbs || [], [data?.verbs])

  // Apply filters, sorting, and limit
  const filteredAndSortedVerbs = useMemo(() => {
    let result = [...verbs]

    // Apply verb type filter
    if (verbTypeFilter !== 'all') {
      result = result.filter((verb) => {
        if (verbTypeFilter === 'reflexive') return verb.reflexive
        if (verbTypeFilter === 'regular') return verb.regular && !verb.reflexive
        if (verbTypeFilter === 'irregular')
          return !verb.regular && !verb.reflexive
        return true
      })
    }

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
        const statsA = getStatistics(a.id)
        const statsB = getStatistics(b.id)

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
  }, [
    verbs,
    verbTypeFilter,
    sortOption,
    displayCount,
    getStatistics,
    randomSeed,
  ])

  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent,
      verbId: string,
      correctAnswer: string,
      currentIndex: number
    ) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleValidation(verbId, correctAnswer)

        // Move to next input in the filtered list
        if (currentIndex < filteredAndSortedVerbs.length - 1) {
          const nextVerb = filteredAndSortedVerbs[currentIndex + 1]
          const nextInput = inputRefs.current[nextVerb.id]
          if (nextInput) {
            nextInput.focus()
          }
        }
      }
    },
    [filteredAndSortedVerbs, handleValidation]
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
          <RecordVoiceOverIcon color='primary' sx={{ fontSize: 40 }} />
          <Typography variant='h3' component='h1' fontWeight='bold'>
            Verbs Translations
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
          <RecordVoiceOverIcon color='primary' sx={{ fontSize: 40 }} />
          <Typography variant='h3' component='h1' fontWeight='bold'>
            Verbs Translations
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
        <RecordVoiceOverIcon color='primary' sx={{ fontSize: 40 }} />
        <Typography variant='h3' component='h1' fontWeight='bold'>
          Verbs Translations
        </Typography>
      </HeaderBox>

      <ContentPaper elevation={3}>
        <Typography
          variant='h6'
          color='text.secondary'
          gutterBottom
          sx={{ mb: 3 }}
        >
          Translate each verb from your native language to Italian
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

          <FormControl size='small' sx={{ minWidth: 120 }}>
            <InputLabel id='display-count-label'>Display</InputLabel>
            <Select
              labelId='display-count-label'
              id='display-count'
              value={displayCount}
              label='Display'
              onChange={(e) => setDisplayCount(e.target.value as DisplayCount)}
            >
              <MenuItem value={10}>10 verbs</MenuItem>
              <MenuItem value={20}>20 verbs</MenuItem>
              <MenuItem value={30}>30 verbs</MenuItem>
              <MenuItem value='all'>All verbs</MenuItem>
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
            Showing {filteredAndSortedVerbs.length} of {verbs.length} verbs
          </Typography>
        </FilterBox>

        {verbs.length === 0 ? (
          <Alert severity='info'>
            No verbs available. Please ask your administrator to import verbs.
          </Alert>
        ) : (
          <List>
            {filteredAndSortedVerbs.map((verb, index) => (
              <MemoizedVerbItem
                key={verb.id}
                verb={verb}
                index={index}
                inputValue={inputValues[verb.id] || ''}
                validationState={validationState[verb.id] || null}
                statistics={getStatistics(verb.id)}
                onInputChange={handleInputChange}
                onValidation={handleValidation}
                onClearInput={handleClearInput}
                onShowAnswer={handleShowAnswer}
                onResetStatistics={handleOpenResetDialog}
                onKeyDown={handleKeyDown}
                inputRef={(el) => (inputRefs.current[verb.id] = el)}
                getVerbIcon={getVerbIcon}
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
            Are you sure you want to reset all statistics for the verb &quot;
            {resetDialog.verbTranslation}&quot;? This action cannot be undone.
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
