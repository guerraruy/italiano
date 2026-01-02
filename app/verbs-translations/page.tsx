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
} from '@mui/material'
import { styled } from '@mui/material/styles'
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import ClearIcon from '@mui/icons-material/Clear'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import {
  useGetVerbsForPracticeQuery,
  useGetVerbStatisticsQuery,
  useUpdateVerbStatisticMutation,
  useResetVerbStatisticMutation,
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

const StatisticsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  minWidth: '50px',
}))

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
          onClick={() => onResetStatistics(verb.id)}
          color='default'
          disabled={statistics.correct === 0 && statistics.wrong === 0}
        >
          <RestartAltIcon fontSize='small' />
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
  const { data: statisticsData } = useGetVerbStatisticsQuery(undefined, {
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

        // Move to next input
        const verbs = data?.verbs || []
        if (currentIndex < verbs.length - 1) {
          const nextVerb = verbs[currentIndex + 1]
          const nextInput = inputRefs.current[nextVerb.id]
          if (nextInput) {
            nextInput.focus()
          }
        }
      }
    },
    [data?.verbs, handleValidation]
  )

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

  const verbs = data?.verbs || []

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

        {verbs.length === 0 ? (
          <Alert severity='info'>
            No verbs available. Please ask your administrator to import verbs.
          </Alert>
        ) : (
          <List>
            {verbs.map((verb, index) => (
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
