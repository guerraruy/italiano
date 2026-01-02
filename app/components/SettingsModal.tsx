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
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useGetProfileQuery, useUpdateProfileMutation } from '../store/api'

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
  const [nativeLanguage, setNativeLanguage] = useState<'pt-BR' | 'en'>(
    initialLanguage
  )
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Reset state when data loads or modal closes
  const resetForm = () => {
    setNativeLanguage(data?.profile?.nativeLanguage || 'pt-BR')
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

  const handleSave = async () => {
    try {
      setSuccessMessage('')
      setErrorMessage('')

      await updateProfile({ nativeLanguage }).unwrap()

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
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Typography variant='h6' component='div'>
            Profile Settings
          </Typography>
          <IconButton aria-label='close' onClick={handleClose} size='small'>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Box sx={{ py: 2 }}>
          {isLoading ? (
            <Box display='flex' justifyContent='center' py={3}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity='error'>
              Failed to load profile settings. Please try again.
            </Alert>
          ) : (
            <>
              <FormControl component='fieldset' fullWidth>
                <FormLabel
                  component='legend'
                  sx={{ mb: 2, fontWeight: 'bold' }}
                >
                  Native Language
                </FormLabel>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 2 }}
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
                    control={<Radio />}
                    label='Português (Brasil)'
                  />
                  <FormControlLabel
                    value='en'
                    control={<Radio />}
                    label='English'
                  />
                </RadioGroup>
              </FormControl>

              {successMessage && (
                <Alert severity='success' sx={{ mt: 2 }}>
                  {successMessage}
                </Alert>
              )}

              {errorMessage && (
                <Alert severity='error' sx={{ mt: 2 }}>
                  {errorMessage}
                </Alert>
              )}
            </>
          )}
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} variant='outlined' disabled={isUpdating}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant='contained'
          disabled={isLoading || isUpdating}
        >
          {isUpdating ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
