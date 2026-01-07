'use client'
import { useState } from 'react'

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
  CircularProgress,
  Alert,
} from '@mui/material'

import { useAuth } from '../contexts/AuthContext'

export default function LoginModal() {
  const { login, register, isAuthenticated, isLoading } = useAuth()
  const [isRegisterMode, setIsRegisterMode] = useState(false)

  // Form fields
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')

  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim()) {
      setError(
        isRegisterMode
          ? 'Please enter a username'
          : 'Please enter your username or email'
      )
      return
    }

    if (!password.trim()) {
      setError('Please enter a password')
      return
    }

    if (isRegisterMode) {
      // Registration validation
      if (!email.trim()) {
        setError('Please enter an email')
        return
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }

      const result = await register(
        username.trim(),
        email.trim(),
        password,
        name.trim() || undefined
      )

      if (!result.success) {
        setError(result.error || 'Registration failed')
      }
    } else {
      // Login
      const result = await login(username.trim(), password)

      if (!result.success) {
        setError(result.error || 'Login failed')
      }
    }
  }

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode)
    setError('')
    setUsername('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setName('')
  }

  // Don't render the dialog at all if authenticated
  if (isAuthenticated) {
    return null
  }

  return (
    <Dialog open={true} maxWidth='sm' fullWidth disableEscapeKeyDown>
      <DialogTitle>
        <Typography
          variant='h5'
          component='div'
          fontWeight='bold'
          textAlign='center'
        >
          {isRegisterMode ? 'Create Account' : 'Welcome to Italiano'}
        </Typography>
      </DialogTitle>
      <Divider />
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 2 }}
          >
            <Typography
              variant='body1'
              color='text.secondary'
              textAlign='center'
            >
              {isRegisterMode
                ? 'Create a new account to start learning'
                : 'Please login to continue'}
            </Typography>

            {error && (
              <Alert severity='error' onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <TextField
              label={isRegisterMode ? 'Username' : 'Username or Email'}
              variant='outlined'
              fullWidth
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError('')
              }}
              autoFocus
              required
              disabled={isLoading}
              helperText={
                isRegisterMode
                  ? ''
                  : 'You can use your username or email to login'
              }
            />

            {isRegisterMode && (
              <>
                <TextField
                  label='Email'
                  type='email'
                  variant='outlined'
                  fullWidth
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                  }}
                  required
                  disabled={isLoading}
                />

                <TextField
                  label='Name (optional)'
                  variant='outlined'
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </>
            )}

            <TextField
              label='Password'
              type='password'
              variant='outlined'
              fullWidth
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              required
              disabled={isLoading}
              helperText={isRegisterMode ? 'Minimum 6 characters' : ''}
            />

            {isRegisterMode && (
              <TextField
                label='Confirm Password'
                type='password'
                variant='outlined'
                fullWidth
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setError('')
                }}
                required
                disabled={isLoading}
              />
            )}
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ flexDirection: 'column', px: 3, py: 2, gap: 1.5 }}>
          <Button
            type='submit'
            variant='contained'
            fullWidth
            size='large'
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading
              ? 'Please wait...'
              : isRegisterMode
                ? 'Register'
                : 'Login'}
          </Button>

          <Button
            onClick={toggleMode}
            variant='text'
            fullWidth
            disabled={isLoading}
          >
            {isRegisterMode
              ? 'Already have an account? Login'
              : "Don't have an account? Register"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
