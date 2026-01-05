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
import TranslateIcon from '@mui/icons-material/Translate'
import ClearIcon from '@mui/icons-material/Clear'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import RefreshIcon from '@mui/icons-material/Refresh'
import {
  useGetNounsForPracticeQuery,
  useGetNounStatisticsQuery,
  useUpdateNounStatisticMutation,
  useResetNounStatisticMutation,
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

const NounListItem = styled(ListItem)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}))

const NounInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  minWidth: '250px',
}))

const InputActionsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  flexGrow: 1,
  maxWidth: '500px',
}))

const StatisticsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  minWidth: '50px',
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

interface ValidationState {
  [key: string]: 'correct' | 'incorrect' | null
}

interface InputValues {
  [key: string]: string
}

interface NounItemProps {
  noun: {
    id: string
    italian: string
    italianPlural: string
    translation: string
    translationPlural: string
  }
  index: number
  inputValue: string
  validationState: 'correct' | 'incorrect' | null
  statistics: { correct: number; wrong: number }
  onInputChange: (nounId: string, value: string) => void
  onValidation: (nounId: string, correctAnswer: string) => void
  onClearInput: (nounId: string) => void
  onShowAnswer: (nounId: string, correctAnswer: string) => void
  onResetStatistics: (nounId: string) => void
  onKeyDown: (
    e: React.KeyboardEvent,
    nounId: string,
    correctAnswer: string,
    index: number
  ) => void
  inputRef: (el: HTMLInputElement | null) => void
}

const NounItem = ({
  noun,
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
}: NounItemProps) => {
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
    <NounListItem>
      <NounInfo>
        <Typography
          variant='body1'
          fontWeight='bold'
          sx={{ minWidth: '180px' }}
        >
          {noun.translation}
        </Typography>
      </NounInfo>

      <InputActionsBox>
        <TextField
          fullWidth
          size='small'
          placeholder='Type the Italian translation...'
          value={inputValue}
          onChange={(e) => onInputChange(noun.id, e.target.value)}
          onBlur={() => onValidation(noun.id, noun.italian)}
          onKeyDown={(e) => onKeyDown(e, noun.id, noun.italian, index)}
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
                      onClick={() => onClearInput(noun.id)}
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
            onClick={() => onShowAnswer(noun.id, noun.italian)}
            color='primary'
          >
            <LightbulbIcon />
          </IconButton>
        </Tooltip>
      </InputActionsBox>

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

const MemoizedNounItem = React.memo(NounItem)

interface ResetDialogState {
  open: boolean
  nounId: string | null
  nounTranslation: string | null
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
  nounId: string,
  userInput: string,
  correctAnswer: string
) => {
  const normalizedInput = normalizeString(userInput)
  const normalizedAnswer = normalizeString(correctAnswer)

  return normalizedInput === normalizedAnswer
}

export default function NounsTranslationsPage() {
  const { data, isLoading, error } = useGetNounsForPracticeQuery()
  const { data: statisticsData, refetch: refetchStatistics } =
    useGetNounStatisticsQuery(undefined, {
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
    })
  const [updateNounStatistic] = useUpdateNounStatisticMutation()
  const [resetNounStatistic, { isLoading: isResetting }] =
    useResetNounStatisticMutation()
  const [inputValues, setInputValues] = useState<InputValues>({})
  const [validationState, setValidationState] = useState<ValidationState>({})
  const [resetDialog, setResetDialog] = useState<ResetDialogState>({
    open: false,
    nounId: null,
    nounTranslation: null,
  })
  const [sortOption, setSortOption] = useState<SortOption>('none')
  const [displayCount, setDisplayCount] = useState<DisplayCount>('all')
  const [randomSeed, setRandomSeed] = useState(0)
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
  const lastValidatedRef = useRef<{ [key: string]: number }>({})

  const handleInputChange = useCallback((nounId: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [nounId]: value }))
    // Clear validation visual feedback when user starts typing again
    setValidationState((prev) => {
      if (!prev[nounId]) return prev // No change needed
      return { ...prev, [nounId]: null }
    })
  }, [])

  const handleValidation = useCallback(
    (nounId: string, correctAnswer: string) => {
      const userInput = inputValues[nounId] || ''
      if (!userInput.trim()) return

      // Prevent duplicate validation within 100ms
      const now = Date.now()
      const lastValidated = lastValidatedRef.current[nounId] || 0
      if (now - lastValidated < 100) {
        return
      }
      lastValidatedRef.current[nounId] = now

      const isCorrect = validateAnswer(nounId, userInput, correctAnswer)

      setValidationState((prev) => ({
        ...prev,
        [nounId]: isCorrect ? 'correct' : 'incorrect',
      }))

      // Save statistics to backend asynchronously (fire and forget)
      updateNounStatistic({ nounId, correct: isCorrect }).catch((error) => {
        console.error('Failed to update statistics:', error)
      })
    },
    [inputValues, updateNounStatistic]
  )

  const handleClearInput = useCallback((nounId: string) => {
    setInputValues((prev) => ({ ...prev, [nounId]: '' }))
    setValidationState((prev) => ({ ...prev, [nounId]: null }))
    // Focus the input
    setTimeout(() => {
      const input = inputRefs.current[nounId]
      if (input) {
        input.focus()
      }
    }, 0)
  }, [])

  const handleShowAnswer = useCallback(
    (nounId: string, correctAnswer: string) => {
      setInputValues((prev) => ({ ...prev, [nounId]: correctAnswer }))
      setValidationState((prev) => ({ ...prev, [nounId]: 'correct' }))
    },
    []
  )

  const handleOpenResetDialog = useCallback(
    (nounId: string) => {
      const noun = data?.nouns.find((n) => n.id === nounId)
      if (noun) {
        setResetDialog({
          open: true,
          nounId,
          nounTranslation: noun.translation,
        })
      }
    },
    [data?.nouns]
  )

  const handleCloseResetDialog = useCallback(() => {
    setResetDialog({
      open: false,
      nounId: null,
      nounTranslation: null,
    })
  }, [])

  const handleConfirmReset = useCallback(async () => {
    if (!resetDialog.nounId) return

    try {
      await resetNounStatistic(resetDialog.nounId).unwrap()
      handleCloseResetDialog()
    } catch (error) {
      console.error('Failed to reset statistics:', error)
    }
  }, [resetDialog.nounId, resetNounStatistic, handleCloseResetDialog])

  const getStatistics = useCallback(
    (nounId: string) => {
      const stats = statisticsData?.statistics[nounId]
      return {
        correct: stats?.correctAttempts || 0,
        wrong: stats?.wrongAttempts || 0,
      }
    },
    [statisticsData?.statistics]
  )

  // Memoize nouns array to prevent unnecessary re-renders
  const nouns = useMemo(() => data?.nouns || [], [data?.nouns])

  // Apply filters, sorting, and limit
  const filteredAndSortedNouns = useMemo(() => {
    let result = [...nouns]

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
  }, [nouns, sortOption, displayCount, getStatistics, randomSeed])

  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent,
      nounId: string,
      correctAnswer: string,
      currentIndex: number
    ) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleValidation(nounId, correctAnswer)

        // Move to next input in the filtered list
        if (currentIndex < filteredAndSortedNouns.length - 1) {
          const nextNoun = filteredAndSortedNouns[currentIndex + 1]
          const nextInput = inputRefs.current[nextNoun.id]
          if (nextInput) {
            nextInput.focus()
          }
        }
      }
    },
    [filteredAndSortedNouns, handleValidation]
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
            Nouns Translations
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
            Nouns Translations
          </Typography>
        </HeaderBox>
        <ContentPaper elevation={3}>
          <Alert severity='error'>
            Error loading nouns. Please try again later.
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
          Nouns Translations
        </Typography>
      </HeaderBox>

      <ContentPaper elevation={3}>
        <Typography
          variant='h6'
          color='text.secondary'
          gutterBottom
          sx={{ mb: 3 }}
        >
          Translate each noun from your native language to Italian
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

          <FormControl size='small' sx={{ minWidth: 120 }}>
            <InputLabel id='display-count-label'>Display</InputLabel>
            <Select
              labelId='display-count-label'
              id='display-count'
              value={displayCount}
              label='Display'
              onChange={(e) => setDisplayCount(e.target.value as DisplayCount)}
            >
              <MenuItem value={10}>10 nouns</MenuItem>
              <MenuItem value={20}>20 nouns</MenuItem>
              <MenuItem value={30}>30 nouns</MenuItem>
              <MenuItem value='all'>All nouns</MenuItem>
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
            Showing {filteredAndSortedNouns.length} of {nouns.length} nouns
          </Typography>
        </FilterBox>

        {nouns.length === 0 ? (
          <Alert severity='info'>
            No nouns available. Please ask your administrator to import nouns.
          </Alert>
        ) : (
          <List>
            {filteredAndSortedNouns.map((noun, index) => (
              <MemoizedNounItem
                key={noun.id}
                noun={noun}
                index={index}
                inputValue={inputValues[noun.id] || ''}
                validationState={validationState[noun.id] || null}
                statistics={getStatistics(noun.id)}
                onInputChange={handleInputChange}
                onValidation={handleValidation}
                onClearInput={handleClearInput}
                onShowAnswer={handleShowAnswer}
                onResetStatistics={handleOpenResetDialog}
                onKeyDown={handleKeyDown}
                inputRef={(el) => (inputRefs.current[noun.id] = el)}
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
            Are you sure you want to reset all statistics for the noun &quot;
            {resetDialog.nounTranslation}&quot;? This action cannot be undone.
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
