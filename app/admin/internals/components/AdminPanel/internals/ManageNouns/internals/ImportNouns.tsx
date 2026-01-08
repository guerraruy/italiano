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

import { useImportNounsMutation, type ConflictNoun } from '@/app/store/api'

interface ImportNounsProps {
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

export default function ImportNouns({ onError, onSuccess }: ImportNounsProps) {
  const [importNouns, { isLoading: importingNouns }] = useImportNounsMutation()

  const [nounJsonContent, setNounJsonContent] = useState<string>('')
  const [nounConflicts, setNounConflicts] = useState<ConflictNoun[]>([])
  const [nounConflictResolutions, setNounConflictResolutions] = useState<{
    [italian: string]: 'keep' | 'replace'
  }>({})
  const [showNounConflictDialog, setShowNounConflictDialog] = useState(false)
  const [showFormatInfoDialog, setShowFormatInfoDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)

  const handleNounFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        // Validate JSON
        JSON.parse(content)
        setNounJsonContent(content)
        onSuccess(
          'JSON file loaded successfully. Click "Import Nouns" to proceed.'
        )
      } catch {
        onError('Invalid JSON file. Please check the format.')
        setNounJsonContent('')
      }
    }
    reader.readAsText(file)
  }

  const handleImportNouns = async () => {
    if (!nounJsonContent) {
      onError('Please load a JSON file first.')
      return
    }

    try {
      const nounsData = JSON.parse(nounJsonContent)

      const result = await importNouns({
        nouns: nounsData,
        resolveConflicts:
          Object.keys(nounConflictResolutions).length > 0
            ? nounConflictResolutions
            : undefined,
      }).unwrap()

      onSuccess(result.message)
      setNounJsonContent('')
      setNounConflicts([])
      setNounConflictResolutions({})
    } catch (err: unknown) {
      // Handle conflict response (409)
      const error = err as {
        status?: number
        data?: { conflicts?: ConflictNoun[]; error?: string }
      }
      if (error?.status === 409 && error?.data?.conflicts) {
        setNounConflicts(error.data.conflicts)
        setShowNounConflictDialog(true)
      } else {
        onError(error?.data?.error || 'Error importing nouns')
      }
    }
  }

  const handleResolveNounConflicts = () => {
    setShowNounConflictDialog(false)
    handleImportNouns()
  }

  const handleNounConflictResolution = (
    italian: string,
    action: 'keep' | 'replace'
  ) => {
    setNounConflictResolutions((prev) => ({
      ...prev,
      [italian]: action,
    }))
  }

  return (
    <>
      {/* Import Icon */}
      <Tooltip title="Import Nouns from JSON">
        <IconButton
          color="primary"
          onClick={() => setShowImportDialog(true)}
          disabled={importingNouns}
        >
          <CloudUpload />
        </IconButton>
      </Tooltip>

      {/* Import Dialog */}
      <Dialog
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            Import Nouns from JSON
            <Tooltip title="View JSON Format Information">
              <IconButton
                size="small"
                onClick={() => setShowFormatInfoDialog(true)}
                color="primary"
              >
                <InfoOutlined />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUpload />}
              disabled={importingNouns}
            >
              Choose JSON File
              <input
                type="file"
                accept=".json"
                hidden
                onChange={handleNounFileUpload}
              />
            </Button>
            {nounJsonContent && (
              <Chip
                icon={<CheckCircle />}
                label="File loaded"
                color="success"
                size="small"
              />
            )}
          </Stack>

          {nounJsonContent && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Preview: {Object.keys(JSON.parse(nounJsonContent)).length} nouns
                ready to import
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowImportDialog(false)}>Cancel</Button>
          {nounJsonContent && (
            <Button
              variant="contained"
              onClick={() => {
                handleImportNouns()
                setShowImportDialog(false)
              }}
              disabled={importingNouns}
              startIcon={
                importingNouns ? (
                  <CircularProgress size={20} />
                ) : (
                  <CloudUpload />
                )
              }
            >
              {importingNouns ? 'Importing...' : 'Import Nouns'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Noun Conflict Resolution Dialog */}
      <Dialog
        open={showNounConflictDialog}
        onClose={() => setShowNounConflictDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Warning color="warning" />
            Resolve Conflicts ({nounConflicts.length} nouns)
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            The following nouns already exist in the database. Choose whether to
            keep the existing data or replace it with the new data.
          </Typography>

          {nounConflicts.map((conflict) => (
            <Paper key={conflict.italian} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                {conflict.italian}
              </Typography>

              <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
                <Box flex={1}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Existing Data
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    Singular:
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    IT: {conflict.existing.singolare.it}
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    PT: {conflict.existing.singolare.pt}
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    EN: {conflict.existing.singolare.en}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
                    Plural:
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    IT: {conflict.existing.plurale.it}
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    PT: {conflict.existing.plurale.pt}
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    EN: {conflict.existing.plurale.en}
                  </Typography>
                </Box>

                <Box flex={1}>
                  <Typography
                    variant="subtitle2"
                    color="secondary"
                    gutterBottom
                  >
                    New Data
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    Singular:
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    IT: {conflict.new.singolare.it}
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    PT: {conflict.new.singolare.pt}
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    EN: {conflict.new.singolare.en}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
                    Plural:
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    IT: {conflict.new.plurale.it}
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    PT: {conflict.new.plurale.pt}
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    EN: {conflict.new.plurale.en}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={2}>
                <Button
                  size="small"
                  variant={
                    nounConflictResolutions[conflict.italian] === 'keep'
                      ? 'contained'
                      : 'outlined'
                  }
                  onClick={() =>
                    handleNounConflictResolution(conflict.italian, 'keep')
                  }
                >
                  Keep Existing
                </Button>
                <Button
                  size="small"
                  variant={
                    nounConflictResolutions[conflict.italian] === 'replace'
                      ? 'contained'
                      : 'outlined'
                  }
                  color="secondary"
                  onClick={() =>
                    handleNounConflictResolution(conflict.italian, 'replace')
                  }
                >
                  Replace with New
                </Button>
              </Stack>
            </Paper>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNounConflictDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleResolveNounConflicts}
            variant="contained"
            disabled={
              Object.keys(nounConflictResolutions).length !==
              nounConflicts.length
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
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Info color="primary" />
            JSON Format Information
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload a JSON file with Italian nouns and their translations in
            singular and plural forms. Expected format:
          </Typography>
          <Paper sx={{ p: 2, backgroundColor: 'grey.100' }}>
            <Typography
              variant="body2"
              component="pre"
              sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
            >
              {`{
  "orologio": {
    "singolare": {
      "it": "l'orologio",
      "pt": "o relógio",
      "en": "the watch"
    },
    "plurale": {
      "it": "gli orologi",
      "pt": "os relógios",
      "en": "the clocks"
    }
  },
  "libro": {
    "singolare": {
      "it": "il libro",
      "pt": "o livro",
      "en": "the book"
    },
    "plurale": {
      "it": "i libri",
      "pt": "os livros",
      "en": "the books"
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
