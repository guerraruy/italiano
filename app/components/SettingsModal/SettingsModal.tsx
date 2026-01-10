'use client'
import { useState, useEffect } from 'react'

import CloseIcon from '@mui/icons-material/Close'
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
  CircularProgress,
  Alert,
} from '@mui/material'

import { extractApiErrorMessage } from '@/lib/utils'

import { LanguageSelector, VerbTenseSelector, VERB_TENSES } from './internals'
import { useGetProfileQuery, useUpdateProfileMutation } from '../../store/api'

const DEFAULT_VERB_TENSES = [
  'Indicativo.Presente',
  'Indicativo.Passato Prossimo',
  'Indicativo.Futuro Semplice',
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

  const [nativeLanguage, setNativeLanguage] = useState<'pt-BR' | 'en'>('pt-BR')
  const [enabledVerbTenses, setEnabledVerbTenses] =
    useState<string[]>(DEFAULT_VERB_TENSES)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const resetForm = () => {
    setNativeLanguage(data?.profile?.nativeLanguage || 'pt-BR')
    setEnabledVerbTenses(
      data?.profile?.enabledVerbTenses || DEFAULT_VERB_TENSES
    )
    setSuccessMessage('')
    setErrorMessage('')
  }

  useEffect(() => {
    if (open) {
      resetForm()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleVerbTenseToggle = (tenseKey: string) => {
    setEnabledVerbTenses((prev) =>
      prev.includes(tenseKey)
        ? prev.filter((t) => t !== tenseKey)
        : [...prev, tenseKey]
    )
  }

  const handleCategoryToggle = (category: string) => {
    const categoryTenses = VERB_TENSES.find((vt) => vt.category === category)
    if (!categoryTenses) return

    const categoryKeys = categoryTenses.tenses.map(
      (tense) => `${category}.${tense}`
    )
    const allSelected = categoryKeys.every((key) =>
      enabledVerbTenses.includes(key)
    )

    if (allSelected) {
      setEnabledVerbTenses((prev) =>
        prev.filter((key) => !categoryKeys.includes(key))
      )
    } else {
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
      setErrorMessage(
        extractApiErrorMessage(
          err,
          'Failed to update profile. Please try again.'
        )
      )
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
      maxWidth="sm"
      fullWidth
      sx={{
        zIndex: 1300,
        '& .MuiDialog-paper': {
          maxHeight: 'calc(100vh - 100px)',
          marginTop: '64px',
        },
      }}
    >
      <DialogTitle sx={{ py: 1.5, px: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="div" sx={{ fontSize: '18px' }}>
            Profile Settings
          </Typography>
          <IconButton aria-label="close" onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ py: 1.5, px: 2 }}>
        <Box sx={{ py: 1 }}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ py: 0.5 }}>
              Failed to load profile settings. Please try again.
            </Alert>
          ) : (
            <>
              <LanguageSelector
                value={nativeLanguage}
                onChange={setNativeLanguage}
              />

              <Divider sx={{ my: 2 }} />

              <VerbTenseSelector
                enabledTenses={enabledVerbTenses}
                onTenseToggle={handleVerbTenseToggle}
                onCategoryToggle={handleCategoryToggle}
              />

              {successMessage && (
                <Alert
                  severity="success"
                  sx={{ mt: 1.5, py: 0.5, fontSize: '14px' }}
                >
                  {successMessage}
                </Alert>
              )}

              {errorMessage && (
                <Alert
                  severity="error"
                  sx={{ mt: 1.5, py: 0.5, fontSize: '14px' }}
                >
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
          variant="outlined"
          disabled={isUpdating}
          size="small"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isLoading || isUpdating}
          size="small"
        >
          {isUpdating ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
