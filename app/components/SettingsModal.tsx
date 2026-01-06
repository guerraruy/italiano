'use client'
import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Alert,
  Checkbox,
  FormGroup,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useGetProfileQuery, useUpdateProfileMutation } from '../store/api'

// Define all available verb tenses based on conjugation structure
const VERB_TENSES = [
  { category: 'Indicativo', tenses: [
    'Presente', 
    'Passato Prossimo', 
    'Imperfetto', 
    'Trapassato Prossimo', 
    'Futuro Semplice', 
    'Passato Remoto'
  ]},
  { category: 'Congiuntivo', tenses: [
    'Presente', 
    'Passato', 
    'Imperfetto', 
    'Trapassato'
  ]},
  { category: 'Condizionale', tenses: [
    'Presente', 
    'Passato'
  ]},
  { category: 'Imperativo', tenses: [
    'Affirmativo', 
    'Negativo'
  ]},
  { category: 'Participio', tenses: [
    'Presente', 
    'Passato'
  ]},
  { category: 'Gerundio', tenses: [
    'Presente', 
    'Passato'
  ]},
  { category: 'Infinito', tenses: [
    'Presente', 
    'Passato'
  ]},
]

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { data, isLoading, error } = useGetProfileQuery(undefined, {
    skip: !open,
  })
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation()

  // Use profile data directly as initial state and for current value
  const initialLanguage = data?.profile?.nativeLanguage || 'pt-BR'
  const initialVerbTenses = data?.profile?.enabledVerbTenses || [
    'Indicativo.Presente',
    'Indicativo.Passato Prossimo',
    'Indicativo.Futuro Semplice',
  ]
  
  const [nativeLanguage, setNativeLanguage] = useState<'pt-BR' | 'en'>(
    initialLanguage
  )
  const [enabledVerbTenses, setEnabledVerbTenses] = useState<string[]>(
    initialVerbTenses
  )
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Reset state when data loads or modal closes
  const resetForm = () => {
    setNativeLanguage(data?.profile?.nativeLanguage || 'pt-BR')
    setEnabledVerbTenses(data?.profile?.enabledVerbTenses || [
      'Indicativo.Presente',
      'Indicativo.Passato Prossimo',
      'Indicativo.Futuro Semplice',
    ])
    setSuccessMessage('')
    setErrorMessage('')
  }

  // Handle modal open - reset form
  useEffect(() => {
    if (open) {
      resetForm()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleVerbTenseToggle = (tenseKey: string) => {
    setEnabledVerbTenses((prev) => {
      if (prev.includes(tenseKey)) {
        return prev.filter((t) => t !== tenseKey)
      } else {
        return [...prev, tenseKey]
      }
    })
  }

  const handleSelectAllInCategory = (category: string) => {
    const categoryTenses = VERB_TENSES.find((vt) => vt.category === category)
    if (!categoryTenses) return

    const categoryKeys = categoryTenses.tenses.map(
      (tense) => `${category}.${tense}`
    )
    const allSelected = categoryKeys.every((key) =>
      enabledVerbTenses.includes(key)
    )

    if (allSelected) {
      // Deselect all in category
      setEnabledVerbTenses((prev) =>
        prev.filter((key) => !categoryKeys.includes(key))
      )
    } else {
      // Select all in category
      setEnabledVerbTenses((prev) => {
        const newSet = new Set([...prev, ...categoryKeys])
        return Array.from(newSet)
      })
    }
  }

  const handleSave = async () => {
    try {
      setSuccessMessage('')
      setErrorMessage('')

      await updateProfile({ nativeLanguage, enabledVerbTenses }).unwrap()

      setSuccessMessage('Profile updated successfully!')
      setTimeout(() => {
        onClose()
        setSuccessMessage('')
      }, 1500)
    } catch (err: unknown) {
      console.error('Failed to update profile:', err)
      const message =
        err &&
        typeof err === 'object' &&
        'data' in err &&
        err.data &&
        typeof err.data === 'object' &&
        'error' in err.data &&
        typeof err.data.error === 'string'
          ? err.data.error
          : 'Failed to update profile. Please try again.'
      setErrorMessage(message)
    }
  }

  const handleClose = () => {
    setSuccessMessage('')
    setErrorMessage('')
    onClose()
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth='sm' 
      fullWidth
      sx={{ zIndex: 1300 }}
    >
      <DialogTitle sx={{ py: 1.5, px: 2 }}>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Typography variant='h6' component='div' sx={{ fontSize: '18px' }}>
            Profile Settings
          </Typography>
          <IconButton aria-label='close' onClick={handleClose} size='small'>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ py: 1.5, px: 2 }}>
        <Box sx={{ py: 1 }}>
          {isLoading ? (
            <Box display='flex' justifyContent='center' py={2}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity='error' sx={{ py: 0.5 }}>
              Failed to load profile settings. Please try again.
            </Alert>
          ) : (
            <>
              <FormControl component='fieldset' fullWidth>
                <FormLabel
                  component='legend'
                  sx={{ mb: 1, fontWeight: 'bold', fontSize: '16px' }}
                >
                  Native Language
                </FormLabel>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 1, fontSize: '14px' }}
                >
                  Select your native language to see translations in your
                  preferred language.
                </Typography>
                <RadioGroup
                  value={nativeLanguage}
                  onChange={(e) =>
                    setNativeLanguage(e.target.value as 'pt-BR' | 'en')
                  }
                >
                  <FormControlLabel
                    value='pt-BR'
                    control={<Radio size='small' sx={{ py: 0.5 }} />}
                    label={<Typography sx={{ fontSize: '16px' }}>Português (Brasil)</Typography>}
                    sx={{ mb: 0, my: 0.25 }}
                  />
                  <FormControlLabel
                    value='en'
                    control={<Radio size='small' sx={{ py: 0.5 }} />}
                    label={<Typography sx={{ fontSize: '16px' }}>English</Typography>}
                    sx={{ mb: 0, my: 0.25 }}
                  />
                </RadioGroup>
              </FormControl>

              <Divider sx={{ my: 2 }} />

              <FormControl component='fieldset' fullWidth>
                <FormLabel
                  component='legend'
                  sx={{ mb: 1, fontWeight: 'bold', fontSize: '16px' }}
                >
                  Enabled Verb Tenses
                </FormLabel>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 1, fontSize: '14px' }}
                >
                  Select which verb tenses you want to practice. Only selected
                  tenses will be shown in conjugation exercises.
                </Typography>
                <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}>
                  {VERB_TENSES.map(({ category, tenses }) => {
                    const categoryKeys = tenses.map(
                      (tense) => `${category}.${tense}`
                    )
                    const allSelected = categoryKeys.every((key) =>
                      enabledVerbTenses.includes(key)
                    )
                    const someSelected = categoryKeys.some((key) =>
                      enabledVerbTenses.includes(key)
                    )

                    return (
                      <Box key={category} sx={{ mb: 1 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 0.25,
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={allSelected}
                                indeterminate={someSelected && !allSelected}
                                onChange={() =>
                                  handleSelectAllInCategory(category)
                                }
                                size='small'
                                sx={{ py: 0.5 }}
                              />
                            }
                            label={
                              <Typography
                                variant='subtitle2'
                                fontWeight='bold'
                                sx={{ fontSize: '14px' }}
                              >
                                {category}
                              </Typography>
                            }
                            sx={{ mb: 0, my: 0.25 }}
                          />
                        </Box>
                        <FormGroup sx={{ ml: 4 }}>
                          {tenses.map((tense) => {
                            const tenseKey = `${category}.${tense}`
                            return (
                              <FormControlLabel
                                key={tenseKey}
                                control={
                                  <Checkbox
                                    checked={enabledVerbTenses.includes(
                                      tenseKey
                                    )}
                                    onChange={() =>
                                      handleVerbTenseToggle(tenseKey)
                                    }
                                    size='small'
                                    sx={{ py: 0.5 }}
                                  />
                                }
                                label={
                                  <Typography variant='body2' sx={{ fontSize: '14px' }}>
                                    {tense}
                                  </Typography>
                                }
                                sx={{ mb: 0, mt: 0, my: 0.25 }}
                              />
                            )
                          })}
                        </FormGroup>
                      </Box>
                    )
                  })}
                </Box>
              </FormControl>

              {successMessage && (
                <Alert severity='success' sx={{ mt: 1.5, py: 0.5, fontSize: '14px' }}>
                  {successMessage}
                </Alert>
              )}

              {errorMessage && (
                <Alert severity='error' sx={{ mt: 1.5, py: 0.5, fontSize: '14px' }}>
                  {errorMessage}
                </Alert>
              )}
            </>
          )}
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 2, py: 1.5 }}>
        <Button 
          onClick={handleClose} 
          variant='outlined' 
          disabled={isUpdating}
          size='small'
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant='contained'
          disabled={isLoading || isUpdating}
          size='small'
        >
          {isUpdating ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
