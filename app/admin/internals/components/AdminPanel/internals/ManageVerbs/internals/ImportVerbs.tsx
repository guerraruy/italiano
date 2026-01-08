'use client'
import { useState } from 'react'

import {
  CloudUpload,
  CheckCircle,
  Warning,
  Info,
  InfoOutlined,
} from '@mui/icons-material'
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material'

import { ConflictVerb, useImportVerbsMutation } from '@/app/store/api'

interface ImportVerbsProps {
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

export default function ImportVerbs({ onError, onSuccess }: ImportVerbsProps) {
  const [importVerbs, { isLoading: importingVerbs }] = useImportVerbsMutation()

  const [verbJsonContent, setVerbJsonContent] = useState<string>('')
  const [verbConflicts, setVerbConflicts] = useState<ConflictVerb[]>([])
  const [verbConflictResolutions, setVerbConflictResolutions] = useState<{
    [italian: string]: 'keep' | 'replace'
  }>({})
  const [showVerbConflictDialog, setShowVerbConflictDialog] = useState(false)
  const [showFormatInfoDialog, setShowFormatInfoDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)

  const handleVerbFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        // Validate JSON
        JSON.parse(content)
        setVerbJsonContent(content)
        onSuccess(
          'JSON file loaded successfully. Click "Import Verbs" to proceed.'
        )
      } catch {
        onError('Invalid JSON file. Please check the format.')
        setVerbJsonContent('')
      }
    }
    reader.readAsText(file)
  }

  const handleImportVerbs = async () => {
    if (!verbJsonContent) {
      onError('Please load a JSON file first.')
      return
    }

    try {
      const verbsData = JSON.parse(verbJsonContent)

      const result = await importVerbs({
        verbs: verbsData,
        resolveConflicts:
          Object.keys(verbConflictResolutions).length > 0
            ? verbConflictResolutions
            : undefined,
      }).unwrap()

      onSuccess(result.message)
      setVerbJsonContent('')
      setVerbConflicts([])
      setVerbConflictResolutions({})
    } catch (err: unknown) {
      // Handle conflict response (409)
      const error = err as {
        status?: number
        data?: { conflicts?: ConflictVerb[]; error?: string }
      }
      if (error?.status === 409 && error?.data?.conflicts) {
        setVerbConflicts(error.data.conflicts)
        setShowVerbConflictDialog(true)
      } else {
        onError(error?.data?.error || 'Error importing verbs')
      }
    }
  }

  const handleResolveVerbConflicts = () => {
    setShowVerbConflictDialog(false)
    handleImportVerbs()
  }

  const handleVerbConflictResolution = (
    italian: string,
    action: 'keep' | 'replace'
  ) => {
    setVerbConflictResolutions((prev) => ({
      ...prev,
      [italian]: action,
    }))
  }

  return (
    <>
      {/* Import Icon */}
      <Tooltip title='Import Verbs from JSON'>
        <IconButton
          color='primary'
          onClick={() => setShowImportDialog(true)}
          disabled={importingVerbs}
        >
          <CloudUpload />
        </IconButton>
      </Tooltip>

      {/* Import Dialog */}
      <Dialog
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          <Box display='flex' alignItems='center' gap={1}>
            Import Verbs from JSON
            <Tooltip title='View JSON Format Information'>
              <IconButton
                size='small'
                onClick={() => setShowFormatInfoDialog(true)}
                color='primary'
              >
                <InfoOutlined />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack direction='row' spacing={2} alignItems='center' sx={{ mt: 1 }}>
            <Button
              component='label'
              variant='outlined'
              startIcon={<CloudUpload />}
              disabled={importingVerbs}
            >
              Choose JSON File
              <input
                type='file'
                accept='.json'
                hidden
                onChange={handleVerbFileUpload}
              />
            </Button>
            {verbJsonContent && (
              <Chip
                icon={<CheckCircle />}
                label='File loaded'
                color='success'
                size='small'
              />
            )}
          </Stack>

          {verbJsonContent && (
            <Box sx={{ mt: 2 }}>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Preview: {Object.keys(JSON.parse(verbJsonContent)).length} verbs
                ready to import
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowImportDialog(false)}>Cancel</Button>
          {verbJsonContent && (
            <Button
              variant='contained'
              onClick={() => {
                handleImportVerbs()
                setShowImportDialog(false)
              }}
              disabled={importingVerbs}
              startIcon={
                importingVerbs ? (
                  <CircularProgress size={20} />
                ) : (
                  <CloudUpload />
                )
              }
            >
              {importingVerbs ? 'Importing...' : 'Import Verbs'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Verb Conflict Resolution Dialog */}
      <Dialog
        open={showVerbConflictDialog}
        onClose={() => setShowVerbConflictDialog(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>
          <Box display='flex' alignItems='center' gap={1}>
            <Warning color='warning' />
            Resolve Conflicts ({verbConflicts.length} verbs)
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            The following verbs already exist in the database. Choose whether to
            keep the existing data or replace it with the new data.
          </Typography>

          {verbConflicts.map((conflict) => (
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
                  <Typography
                    variant='subtitle2'
                    color='secondary'
                    gutterBottom
                  >
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
                    verbConflictResolutions[conflict.italian] === 'keep'
                      ? 'contained'
                      : 'outlined'
                  }
                  onClick={() =>
                    handleVerbConflictResolution(conflict.italian, 'keep')
                  }
                >
                  Keep Existing
                </Button>
                <Button
                  size='small'
                  variant={
                    verbConflictResolutions[conflict.italian] === 'replace'
                      ? 'contained'
                      : 'outlined'
                  }
                  color='secondary'
                  onClick={() =>
                    handleVerbConflictResolution(conflict.italian, 'replace')
                  }
                >
                  Replace with New
                </Button>
              </Stack>
            </Paper>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowVerbConflictDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleResolveVerbConflicts}
            variant='contained'
            disabled={
              Object.keys(verbConflictResolutions).length !==
              verbConflicts.length
            }
          >
            Continue Import
          </Button>
        </DialogActions>
      </Dialog>

      {/* Format Information Dialog */}
      <Dialog
        open={showFormatInfoDialog}
        onClose={() => setShowFormatInfoDialog(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          <Box display='flex' alignItems='center' gap={1}>
            <Info color='primary' />
            JSON Format Information
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            Upload a JSON file with Italian verbs and their translations.
            Expected format:
          </Typography>
          <Paper sx={{ p: 2, backgroundColor: 'grey.100' }}>
            <Typography
              variant='body2'
              component='pre'
              sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
            >
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFormatInfoDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
