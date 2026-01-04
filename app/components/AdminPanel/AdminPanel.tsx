'use client'
import { useState, useEffect } from 'react'
import { Box, Typography, Alert, Tabs, Tab } from '@mui/material'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { ManageUsers, ManageVerbs, ManageConjugations, ManageNouns } from './internals'

export default function AdminPanel() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [currentTab, setCurrentTab] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !user?.admin) {
      router.push('/')
      return
    }
  }, [isAuthenticated, user, router])

  const handleError = (message: string) => {
    setError(message)
    setTimeout(() => setError(null), 3000)
  }

  const handleSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  if (!user?.admin) {
    return null
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant='h4' sx={{ mb: 3 }}>
        Administration Panel
      </Typography>

      {error && (
        <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert
          severity='success'
          sx={{ mb: 2 }}
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
        >
          <Tab label='Manage Users' />
          <Tab label='Manage Verbs' />
          <Tab label='Manage Conjugations' />
          <Tab label='Manage Nouns' />
        </Tabs>
      </Box>

      {currentTab === 0 && (
        <ManageUsers onError={handleError} onSuccess={handleSuccess} />
      )}

      {currentTab === 1 && (
        <ManageVerbs onError={handleError} onSuccess={handleSuccess} />
      )}

      {currentTab === 2 && (
        <ManageConjugations onError={handleError} onSuccess={handleSuccess} />
      )}

      {currentTab === 3 && (
        <ManageNouns onError={handleError} onSuccess={handleSuccess} />
      )}
    </Box>
  )
}

