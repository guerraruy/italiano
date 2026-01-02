'use client'
import { useState, useRef } from 'react'
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
  Chip,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import { useGetVerbsForPracticeQuery } from '../store/api'

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
  minWidth: '300px',
}))

const IconBox = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '40px',
}))

interface ValidationState {
  [key: string]: 'correct' | 'incorrect' | null
}

interface InputValues {
  [key: string]: string
}

export default function VerbsTranslationsPage() {
  const { data, isLoading, error } = useGetVerbsForPracticeQuery()
  const [inputValues, setInputValues] = useState<InputValues>({})
  const [validationState, setValidationState] = useState<ValidationState>({})
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

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

  const handleInputChange = (verbId: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [verbId]: value }))
    // Clear validation state when user starts typing
    if (validationState[verbId]) {
      setValidationState((prev) => ({ ...prev, [verbId]: null }))
    }
  }

  const handleValidation = (verbId: string, correctAnswer: string) => {
    const userInput = inputValues[verbId] || ''
    if (!userInput.trim()) return

    const isCorrect = validateAnswer(verbId, userInput, correctAnswer)
    setValidationState((prev) => ({
      ...prev,
      [verbId]: isCorrect ? 'correct' : 'incorrect',
    }))
  }

  const handleKeyDown = (
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
  }

  const getInputStyle = (verbId: string) => {
    const state = validationState[verbId]
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
  }

  const getVerbIcon = (regular: boolean, reflexive: boolean) => {
    if (reflexive) {
      return (
        <Chip
          icon={<AutorenewIcon />}
          label='Reflexive'
          size='small'
          color='secondary'
          variant='outlined'
        />
      )
    }
    if (regular) {
      return (
        <Chip
          icon={<CheckCircleIcon />}
          label='Regular'
          size='small'
          color='success'
          variant='outlined'
        />
      )
    }
    return (
      <Chip
        icon={<CancelIcon />}
        label='Irregular'
        size='small'
        color='warning'
        variant='outlined'
      />
    )
  }

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
              <VerbListItem key={verb.id}>
                <IconBox>{getVerbIcon(verb.regular, verb.reflexive)}</IconBox>

                <VerbInfo>
                  <Typography
                    variant='body1'
                    fontWeight='bold'
                    sx={{ minWidth: '200px' }}
                  >
                    {verb.translation}
                  </Typography>
                </VerbInfo>

                <Box sx={{ flexGrow: 1, maxWidth: '400px' }}>
                  <TextField
                    fullWidth
                    size='small'
                    placeholder='Type the Italian translation...'
                    value={inputValues[verb.id] || ''}
                    onChange={(e) => handleInputChange(verb.id, e.target.value)}
                    onBlur={() => handleValidation(verb.id, verb.italian)}
                    onKeyDown={(e) =>
                      handleKeyDown(e, verb.id, verb.italian, index)
                    }
                    sx={getInputStyle(verb.id)}
                    autoComplete='off'
                    inputRef={(el) => (inputRefs.current[verb.id] = el)}
                  />
                </Box>
              </VerbListItem>
            ))}
          </List>
        )}
      </ContentPaper>
    </PageContainer>
  )
}
