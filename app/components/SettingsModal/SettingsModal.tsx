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
  TextField,
  FormControl,
  FormLabel,
} from '@mui/material'

import { TIMING, Z_INDEX } from '@/lib/constants'
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
  const [masteryThreshold, setMasteryThreshold] = useState<number>(10)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const resetForm = () => {
    setNativeLanguage(data?.profile?.nativeLanguage || 'pt-BR')
    setEnabledVerbTenses(
      data?.profile?.enabledVerbTenses || DEFAULT_VERB_TENSES
    )
    setMasteryThreshold(data?.profile?.masteryThreshold ?? 10)
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

      await updateProfile({
        nativeLanguage,
        enabledVerbTenses,
        masteryThreshold,
      }).unwrap()

      setSuccessMessage('Profile updated successfully!')
      setTimeout(() => {
        onClose()
        setSuccessMessage('')
      }, TIMING.SUCCESS_MODAL_CLOSE_DELAY_MS)
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
        zIndex: Z_INDEX.SETTINGS_MODAL,
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

              <Divider sx={{ my: 2 }} />

              <FormControl component="fieldset" fullWidth>
                <FormLabel
                  component="legend"
                  sx={{ fontSize: '14px', fontWeight: 500, mb: 1 }}
                >
                  Mastery Threshold
                </FormLabel>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1.5, fontSize: '13px' }}
                >
                  Words with (correct answers − errors) ≥ this value can be
                  excluded from practice when the filter is enabled.
                </Typography>
                <TextField
                  type="number"
                  value={masteryThreshold}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10)
                    if (!isNaN(value) && value >= 1 && value <= 100) {
                      setMasteryThreshold(value)
                    }
                  }}
                  slotProps={{ htmlInput: { min: 1, max: 100 } }}
                  size="small"
                  sx={{ width: 100 }}
                />
              </FormControl>

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
