'use client'
import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Chip,
  Stack,
  TextField,
} from '@mui/material'
import {
  CloudUpload,
  CheckCircle,
  Warning,
  Info,
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  useGetVerbsQuery, 
  useImportVerbsMutation,
  type VerbData,
  type ConflictVerb,
  type ImportedVerb 
} from '../../store/api'

export default function AdminVerbsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const { data, isLoading: loadingVerbs } = useGetVerbsQuery(undefined, {
    skip: !isAuthenticated || !user?.admin,
  })
  const [importVerbs, { isLoading: importing }] = useImportVerbsMutation()
  
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [jsonContent, setJsonContent] = useState<string>('')
  const [conflicts, setConflicts] = useState<ConflictVerb[]>([])
  const [conflictResolutions, setConflictResolutions] = useState<{
    [italian: string]: 'keep' | 'replace'
  }>({})
  const [showConflictDialog, setShowConflictDialog] = useState(false)

  // Track when component is mounted (client-side only)
  useEffect(() => {
    // Use setTimeout to avoid setState in effect warning
    const timer = setTimeout(() => setIsMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Wait for component to mount before checking auth
    if (!isMounted) return

    if (!isAuthenticated || !user?.admin) {
      router.push('/')
      return
    }
  }, [isAuthenticated, user, router, isMounted])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        // Validate JSON
        JSON.parse(content)
        setJsonContent(content)
        setError(null)
        setSuccessMessage('JSON file loaded successfully. Click "Import Verbs" to proceed.')
      } catch (err) {
        setError('Invalid JSON file. Please check the format.')
        setJsonContent('')
      }
    }
    reader.readAsText(file)
  }

  const handleImportVerbs = async () => {
    if (!jsonContent) {
      setError('Please load a JSON file first.')
      return
    }

    try {
      setError(null)

      const verbsData = JSON.parse(jsonContent)

      const result = await importVerbs({
        verbs: verbsData,
        resolveConflicts: Object.keys(conflictResolutions).length > 0
          ? conflictResolutions
          : undefined,
      }).unwrap()

      setSuccessMessage(result.message)
      setJsonContent('')
      setConflicts([])
      setConflictResolutions({})
    } catch (err: any) {
      // Handle conflict response (409)
      if (err?.status === 409 && err?.data?.conflicts) {
        setConflicts(err.data.conflicts)
        setShowConflictDialog(true)
        setError(null)
      } else {
        setError(err?.data?.error || 'Error importing verbs')
      }
    }
  }

  const handleResolveConflicts = () => {
    setShowConflictDialog(false)
    handleImportVerbs()
  }

  const handleConflictResolution = (italian: string, action: 'keep' | 'replace') => {
    setConflictResolutions((prev) => ({
      ...prev,
      [italian]: action,
    }))
  }

  // Show loading while checking authentication
  if (!isMounted) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (!user?.admin) {
    return null
  }

  const verbs = data?.verbs || []

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      <Typography variant='h4' gutterBottom sx={{ mb: 3 }}>
        Verb Management - Admin
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

      {/* Import Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Import Verbs from JSON
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            Upload a JSON file with Italian verbs and their translations. Expected format:
          </Typography>
          <Paper sx={{ p: 2, mb: 2, backgroundColor: 'grey.100' }}>
            <Typography variant='body2' component='pre' sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
{`{
  "accendere": {
    "regular": false,
    "reflexive": false,
    "tr_ptBR": "acender",
    "tr_en": "to light"
  },
  "accettare": {
    "regular": true,
    "reflexive": false,
    "tr_ptBR": "aceitar",
    "tr_en": "to accept"
  }
}`}
            </Typography>
          </Paper>

          <Stack direction='row' spacing={2} alignItems='center'>
            <Button
              component='label'
              variant='outlined'
              startIcon={<CloudUpload />}
              disabled={importing}
            >
              Choose JSON File
              <input
                type='file'
                accept='.json'
                hidden
                onChange={handleFileUpload}
              />
            </Button>
            {jsonContent && (
              <Chip
                icon={<CheckCircle />}
                label='File loaded'
                color='success'
                size='small'
              />
            )}
          </Stack>

          {jsonContent && (
            <Box sx={{ mt: 2 }}>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Preview: {Object.keys(JSON.parse(jsonContent)).length} verbs ready to import
              </Typography>
              <Button
                variant='contained'
                onClick={handleImportVerbs}
                disabled={importing}
                startIcon={importing ? <CircularProgress size={20} /> : <CloudUpload />}
              >
                {importing ? 'Importing...' : 'Import Verbs'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Existing Verbs Table */}
      <Card>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Current Verbs in Database ({verbs.length})
          </Typography>

          {loadingVerbs ? (
            <Box display='flex' justifyContent='center' p={3}>
              <CircularProgress />
            </Box>
          ) : verbs.length === 0 ? (
            <Alert severity='info' icon={<Info />}>
              No verbs in the database yet. Import some using the form above.
            </Alert>
          ) : (
            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Italian</TableCell>
                    <TableCell>Portuguese (BR)</TableCell>
                    <TableCell>English</TableCell>
                    <TableCell align='center'>Regular</TableCell>
                    <TableCell align='center'>Reflexive</TableCell>
                    <TableCell>Last Updated</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {verbs.map((verb) => (
                    <TableRow key={verb.italian}>
                      <TableCell>
                        <strong>{verb.italian}</strong>
                      </TableCell>
                      <TableCell>{verb.tr_ptBR}</TableCell>
                      <TableCell>{verb.tr_en || '-'}</TableCell>
                      <TableCell align='center'>
                        {verb.regular ? (
                          <Chip label='Regular' size='small' color='success' />
                        ) : (
                          <Chip label='Irregular' size='small' color='warning' />
                        )}
                      </TableCell>
                      <TableCell align='center'>
                        {verb.reflexive ? (
                          <Chip label='Yes' size='small' color='info' />
                        ) : (
                          <Chip label='No' size='small' />
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(verb.updatedAt).toLocaleDateString('en-US')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Conflict Resolution Dialog */}
      <Dialog
        open={showConflictDialog}
        onClose={() => setShowConflictDialog(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>
          <Box display='flex' alignItems='center' gap={1}>
            <Warning color='warning' />
            Resolve Conflicts ({conflicts.length} verbs)
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            The following verbs already exist in the database. Choose whether to keep the existing data or replace it with the new data.
          </Typography>

          {conflicts.map((conflict) => (
            <Paper key={conflict.italian} sx={{ p: 2, mb: 2 }}>
              <Typography variant='h6' gutterBottom>
                {conflict.italian}
              </Typography>

              <Stack direction='row' spacing={3} sx={{ mb: 2 }}>
                <Box flex={1}>
                  <Typography variant='subtitle2' color='primary' gutterBottom>
                    Existing Data
                  </Typography>
                  <Typography variant='body2'>
                    Portuguese: {conflict.existing.tr_ptBR}
                  </Typography>
                  <Typography variant='body2'>
                    English: {conflict.existing.tr_en || 'N/A'}
                  </Typography>
                  <Typography variant='body2'>
                    Regular: {conflict.existing.regular ? 'Yes' : 'No'}
                  </Typography>
                  <Typography variant='body2'>
                    Reflexive: {conflict.existing.reflexive ? 'Yes' : 'No'}
                  </Typography>
                </Box>

                <Box flex={1}>
                  <Typography variant='subtitle2' color='secondary' gutterBottom>
                    New Data
                  </Typography>
                  <Typography variant='body2'>
                    Portuguese: {conflict.new.tr_ptBR}
                  </Typography>
                  <Typography variant='body2'>
                    English: {conflict.new.tr_en || 'N/A'}
                  </Typography>
                  <Typography variant='body2'>
                    Regular: {conflict.new.regular ? 'Yes' : 'No'}
                  </Typography>
                  <Typography variant='body2'>
                    Reflexive: {conflict.new.reflexive ? 'Yes' : 'No'}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction='row' spacing={2}>
                <Button
                  size='small'
                  variant={
                    conflictResolutions[conflict.italian] === 'keep'
                      ? 'contained'
                      : 'outlined'
                  }
                  onClick={() => handleConflictResolution(conflict.italian, 'keep')}
                >
                  Keep Existing
                </Button>
                <Button
                  size='small'
                  variant={
                    conflictResolutions[conflict.italian] === 'replace'
                      ? 'contained'
                      : 'outlined'
                  }
                  color='secondary'
                  onClick={() =>
                    handleConflictResolution(conflict.italian, 'replace')
                  }
                >
                  Replace with New
                </Button>
              </Stack>
            </Paper>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConflictDialog(false)}>Cancel</Button>
          <Button
            onClick={handleResolveConflicts}
            variant='contained'
            disabled={
              Object.keys(conflictResolutions).length !== conflicts.length
            }
          >
            Continue Import
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

