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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  Stack,
  IconButton,
  Chip,
  CircularProgress,
  Tooltip,
} from '@mui/material'

import { ConflictAdjective, useImportAdjectivesMutation } from '@/app/store/api'

interface ImportAdjectivesProps {
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

export default function ImportAdjectives({
  onError,
  onSuccess,
}: ImportAdjectivesProps) {
  const [importAdjectives, { isLoading: importingAdjectives }] =
    useImportAdjectivesMutation()

  const [adjectiveJsonContent, setAdjectiveJsonContent] = useState<string>('')
  const [adjectiveConflicts, setAdjectiveConflicts] = useState<
    ConflictAdjective[]
  >([])
  const [adjectiveConflictResolutions, setAdjectiveConflictResolutions] =
    useState<{
      [italian: string]: 'keep' | 'replace'
    }>({})
  const [showAdjectiveConflictDialog, setShowAdjectiveConflictDialog] =
    useState(false)
  const [showFormatInfoDialog, setShowFormatInfoDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)

  const handleAdjectiveFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        // Validate JSON
        JSON.parse(content)
        setAdjectiveJsonContent(content)
        onSuccess(
          'JSON file loaded successfully. Click "Import Adjectives" to proceed.'
        )
      } catch {
        onError('Invalid JSON file. Please check the format.')
        setAdjectiveJsonContent('')
      }
    }
    reader.readAsText(file)
  }

  const handleImportAdjectives = async () => {
    if (!adjectiveJsonContent) {
      onError('Please load a JSON file first.')
      return
    }

    try {
      const adjectivesData = JSON.parse(adjectiveJsonContent)

      const result = await importAdjectives({
        adjectives: adjectivesData,
        resolveConflicts:
          Object.keys(adjectiveConflictResolutions).length > 0
            ? adjectiveConflictResolutions
            : undefined,
      }).unwrap()

      onSuccess(result.message)
      setAdjectiveJsonContent('')
      setAdjectiveConflicts([])
      setAdjectiveConflictResolutions({})
    } catch (err: unknown) {
      // Handle conflict response (409)
      const error = err as {
        status?: number
        data?: { conflicts?: ConflictAdjective[]; error?: string }
      }
      if (error?.status === 409 && error?.data?.conflicts) {
        setAdjectiveConflicts(error.data.conflicts)
        setShowAdjectiveConflictDialog(true)
      } else {
        onError(error?.data?.error || 'Error importing adjectives')
      }
    }
  }

  const handleResolveAdjectiveConflicts = () => {
    setShowAdjectiveConflictDialog(false)
    handleImportAdjectives()
  }

  const handleAdjectiveConflictResolution = (
    italian: string,
    action: 'keep' | 'replace'
  ) => {
    setAdjectiveConflictResolutions((prev) => ({
      ...prev,
      [italian]: action,
    }))
  }

  return (
    <>
      {/* Import Icon */}
      <Tooltip title='Import Adjectives from JSON'>
        <IconButton
          color='primary'
          onClick={() => setShowImportDialog(true)}
          disabled={importingAdjectives}
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
            Import Adjectives from JSON
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
              disabled={importingAdjectives}
            >
              Choose JSON File
              <input
                type='file'
                accept='.json'
                hidden
                onChange={handleAdjectiveFileUpload}
              />
            </Button>
            {adjectiveJsonContent && (
              <Chip
                icon={<CheckCircle />}
                label='File loaded'
                color='success'
                size='small'
              />
            )}
          </Stack>

          {adjectiveJsonContent && (
            <Box sx={{ mt: 2 }}>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Preview: {Object.keys(JSON.parse(adjectiveJsonContent)).length}{' '}
                adjectives ready to import
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowImportDialog(false)}>Cancel</Button>
          {adjectiveJsonContent && (
            <Button
              variant='contained'
              onClick={() => {
                handleImportAdjectives()
                setShowImportDialog(false)
              }}
              disabled={importingAdjectives}
              startIcon={
                importingAdjectives ? (
                  <CircularProgress size={20} />
                ) : (
                  <CloudUpload />
                )
              }
            >
              {importingAdjectives ? 'Importing...' : 'Import Adjectives'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Adjective Conflict Resolution Dialog */}
      <Dialog
        open={showAdjectiveConflictDialog}
        onClose={() => setShowAdjectiveConflictDialog(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>
          <Box display='flex' alignItems='center' gap={1}>
            <Warning color='warning' />
            Resolve Conflicts ({adjectiveConflicts.length} adjectives)
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            The following adjectives already exist in the database. Choose
            whether to keep the existing data or replace it with the new data.
          </Typography>

          {adjectiveConflicts.map((conflict) => (
            <Paper key={conflict.italian} sx={{ p: 2, mb: 2 }}>
              <Typography variant='h6' gutterBottom>
                {conflict.italian}
              </Typography>

              <Stack direction='row' spacing={3} sx={{ mb: 2 }}>
                <Box flex={1}>
                  <Typography variant='subtitle2' color='primary' gutterBottom>
                    Existing Data
                  </Typography>
                  <Typography variant='body2' fontWeight='bold'>
                    Masculine Singular:
                  </Typography>
                  <Typography variant='body2' sx={{ ml: 1 }}>
                    IT: {conflict.existing.maschile.singolare.it}
                  </Typography>
                  <Typography variant='body2' sx={{ ml: 1 }}>
                    PT: {conflict.existing.maschile.singolare.pt}
                  </Typography>
                  <Typography variant='body2' sx={{ ml: 1 }}>
                    EN: {conflict.existing.maschile.singolare.en}
                  </Typography>
                  <Typography variant='body2' fontWeight='bold' sx={{ mt: 1 }}>
                    Masculine Plural:
                  </Typography>
                  <Typography variant='body2' sx={{ ml: 1 }}>
                    IT: {conflict.existing.maschile.plurale.it}
                  </Typography>
                  <Typography variant='body2' sx={{ ml: 1 }}>
                    PT: {conflict.existing.maschile.plurale.pt}
                  </Typography>
                  <Typography variant='body2' sx={{ ml: 1 }}>
                    EN: {conflict.existing.maschile.plurale.en}
                  </Typography>
                  <Typography variant='body2' fontWeight='bold' sx={{ mt: 1 }}>
                    Feminine Singular:
                  </Typography>
                  <Typography variant='body2' sx={{ ml: 1 }}>
                    IT: {conflict.existing.femminile.singolare.it}
                  </Typography>
                  <Typography variant='body2' sx={{ ml: 1 }}>
                    PT: {conflict.existing.femminile.singolare.pt}
                  </Typography>
                  <Typography variant='body2' sx={{ ml: 1 }}>
                    EN: {conflict.existing.femminile.singolare.en}
                  </Typography>
                  <Typography variant='body2' fontWeight='bold' sx={{ mt: 1 }}>
                    Feminine Plural:
                  </Typography>
                  <Typography variant='body2' sx={{ ml: 1 }}>
                    IT: {conflict.existing.femminile.plurale.it}
                  </Typography>
                  <Typography variant='body2' sx={{ ml: 1 }}>
                    PT: {conflict.existing.femminile.plurale.pt}
                  </Typography>
                  <Typography variant='body2' sx={{ ml: 1 }}>
                    EN: {conflict.existing.femminile.plurale.en}
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
                  <Typography variant='body2' fontWeight='bold'>
                    Masculine Singular:
                  </Typography>
                  <Typography variant='body2' sx={{ ml: 1 }}>
                    IT: {conflict.new.maschile.singolare.it}
                  </Typography>
                  <Typography variant='body2' sx={{ ml: 1 }}>
                    PT: {conflict.new.maschile.singolare.pt}
                  </Typography>
                  <Typography variant='body2' sx={{ ml: 1 }}>
                    EN: {conflict.new.maschile.singolare.en}
                  </Typography>
                  <Typography variant='body2' fontWeight='bold' sx={{ mt: 1 }}>
                    Masculine Plural:
                  </Typography>
                  <Typography variant='body2' sx={{ ml: 1 }}>
                    IT: {conflict.new.maschile.plurale.it}
                  </Typography>
                  <Typography variant='body2' sx={{ ml: 1 }}>
                    PT: {conflict.new.maschile.plurale.pt}
                  </Typography>
                  <Typography variant='body2' sx={{ ml: 1 }}>
                    EN: {conflict.new.maschile.plurale.en}
                  </Typography>
                  <Typography variant='body2' fontWeight='bold' sx={{ mt: 1 }}>
                    Feminine Singular:
                  </Typography>
                  <Typography variant='body2' sx={{ ml: 1 }}>
                    IT: {conflict.new.femminile.singolare.it}
                  </Typography>
                  <Typography variant='body2' sx={{ ml: 1 }}>
                    PT: {conflict.new.femminile.singolare.pt}
                  </Typography>
                  <Typography variant='body2' sx={{ ml: 1 }}>
                    EN: {conflict.new.femminile.singolare.en}
                  </Typography>
                  <Typography variant='body2' fontWeight='bold' sx={{ mt: 1 }}>
                    Feminine Plural:
                  </Typography>
                  <Typography variant='body2' sx={{ ml: 1 }}>
                    IT: {conflict.new.femminile.plurale.it}
                  </Typography>
                  <Typography variant='body2' sx={{ ml: 1 }}>
                    PT: {conflict.new.femminile.plurale.pt}
                  </Typography>
                  <Typography variant='body2' sx={{ ml: 1 }}>
                    EN: {conflict.new.femminile.plurale.en}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction='row' spacing={2}>
                <Button
                  size='small'
                  variant={
                    adjectiveConflictResolutions[conflict.italian] === 'keep'
                      ? 'contained'
                      : 'outlined'
                  }
                  onClick={() =>
                    handleAdjectiveConflictResolution(conflict.italian, 'keep')
                  }
                >
                  Keep Existing
                </Button>
                <Button
                  size='small'
                  variant={
                    adjectiveConflictResolutions[conflict.italian] === 'replace'
                      ? 'contained'
                      : 'outlined'
                  }
                  color='secondary'
                  onClick={() =>
                    handleAdjectiveConflictResolution(
                      conflict.italian,
                      'replace'
                    )
                  }
                >
                  Replace with New
                </Button>
              </Stack>
            </Paper>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAdjectiveConflictDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleResolveAdjectiveConflicts}
            variant='contained'
            disabled={
              Object.keys(adjectiveConflictResolutions).length !==
              adjectiveConflicts.length
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
            Upload a JSON file with Italian adjectives and their translations in
            masculine/feminine and singular/plural forms. Expected format:
          </Typography>
          <Paper sx={{ p: 2, backgroundColor: 'grey.100' }}>
            <Typography
              variant='body2'
              component='pre'
              sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
            >
              {`{
  "basso": {
    "maschile": {
      "singolare": {
        "it": "basso",
        "pt": "baixo",
        "en": "short"
      },
      "plurale": {
        "it": "bassi",
        "pt": "baixos",
        "en": "short"
      }
    },
    "femminile": {
      "singolare": {
        "it": "bassa",
        "pt": "baixa",
        "en": "short"
      },
      "plurale": {
        "it": "basse",
        "pt": "baixas",
        "en": "short"
      }
    }
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
