'use client'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Divider,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useState } from 'react'

interface ChangePasswordModalProps {
  open: boolean
  onClose: () => void
}

export default function ChangePasswordModal({
  open,
  onClose,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleClose = () => {
    if (!isLoading) {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setError('')
      setSuccess(false)
      onClose()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validation
    if (!currentPassword.trim()) {
      setError('Please enter your current password')
      return
    }

    if (!newPassword.trim()) {
      setError('Please enter a new password')
      return
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password')
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem('italiano_token')
      
      if (!token) {
        setError('Authentication required. Please login again.')
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to change password')
        return
      }

      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      
      // Close modal after 2 seconds
      setTimeout(() => {
        handleClose()
      }, 2000)
    } catch (error) {
      console.error('Change password error:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Typography variant='h6' component='div'>
            Change Password
          </Typography>
          <IconButton
            aria-label='close'
            onClick={handleClose}
            size='small'
            disabled={isLoading}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 2 }}>
            <Typography variant='body2' color='text.secondary'>
              Please enter your current password and choose a new password.
            </Typography>

            {error && (
              <Alert severity='error' onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity='success'>
                Password changed successfully!
              </Alert>
            )}

            <TextField
              label='Current Password'
              type='password'
              variant='outlined'
              fullWidth
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value)
                setError('')
              }}
              required
              disabled={isLoading || success}
              autoFocus
            />

            <TextField
              label='New Password'
              type='password'
              variant='outlined'
              fullWidth
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                setError('')
              }}
              required
              disabled={isLoading || success}
              helperText='Minimum 6 characters'
            />

            <TextField
              label='Confirm New Password'
              type='password'
              variant='outlined'
              fullWidth
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setError('')
              }}
              required
              disabled={isLoading || success}
            />
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleClose}
            variant='outlined'
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            variant='contained'
            disabled={isLoading || success}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

