'use client'
import { useState } from 'react'

import {
  CloudUpload,
  CheckCircle,
  Warning,
  Info,
  Delete as DeleteIcon,
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
  List,
  ListItem,
  ListItemText,
  Tooltip,
} from '@mui/material'

import {
  ConflictConjugation,
  ConjugationData,
  useImportConjugationsMutation,
} from '@/app/store/api'

interface FileWithContent {
  file: File
  verbName: string
  content: ConjugationData
}

interface ImportConjugationsProps {
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

export default function ImportConjugations({
  onError,
  onSuccess,
}: ImportConjugationsProps) {
  const [importConjugations, { isLoading: importingConjugations }] =
    useImportConjugationsMutation()

  const [selectedFiles, setSelectedFiles] = useState<FileWithContent[]>([])
  const [conjugationConflicts, setConjugationConflicts] = useState<
    ConflictConjugation[]
  >([])
  const [conjugationConflictResolutions, setConjugationConflictResolutions] =
    useState<{
      [verbName: string]: 'keep' | 'replace'
    }>({})
  const [showConjugationConflictDialog, setShowConjugationConflictDialog] =
    useState(false)
  const [showFormatInfoDialog, setShowFormatInfoDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)

  const handleConjugationFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const newFiles: FileWithContent[] = []
    const errors: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file) continue
      const verbName = file.name.replace('.json', '')

      try {
        const content = await file.text()
        const parsed = JSON.parse(content) as ConjugationData
        newFiles.push({ file, verbName, content: parsed })
      } catch {
        errors.push(`${file.name}: Invalid JSON format`)
      }
    }

    if (errors.length > 0) {
      onError(`Errors loading files:\n${errors.join('\n')}`)
    } else {
      onSuccess(
        `${newFiles.length} file(s) loaded successfully. Click "Import Conjugations" to proceed.`
      )
    }

    setSelectedFiles((prev) => [...prev, ...newFiles])
  }

  const handleRemoveFile = (verbName: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.verbName !== verbName))
  }

  const handleImportConjugations = async () => {
    if (selectedFiles.length === 0) {
      onError('Please load at least one JSON file first.')
      return
    }

    try {
      // Build conjugations object from selected files
      const conjugationsData: Record<string, ConjugationData> = {}
      selectedFiles.forEach((fileData) => {
        conjugationsData[fileData.verbName] = fileData.content
      })

      const result = await importConjugations({
        conjugations: conjugationsData,
        resolveConflicts:
          Object.keys(conjugationConflictResolutions).length > 0
            ? conjugationConflictResolutions
            : undefined,
      }).unwrap()

      onSuccess(result.message)
      setSelectedFiles([])
      setConjugationConflicts([])
      setConjugationConflictResolutions({})
    } catch (err: unknown) {
      // Handle conflict response (409)
      const error = err as {
        status?: number
        data?: { conflicts?: ConflictConjugation[]; error?: string }
      }
      if (error?.status === 409 && error?.data?.conflicts) {
        setConjugationConflicts(error.data.conflicts)
        setShowConjugationConflictDialog(true)
      } else {
        onError(error?.data?.error || 'Error importing conjugations')
      }
    }
  }

  const handleResolveConjugationConflicts = () => {
    setShowConjugationConflictDialog(false)
    handleImportConjugations()
  }

  const handleConjugationConflictResolution = (
    verbName: string,
    action: 'keep' | 'replace'
  ) => {
    setConjugationConflictResolutions((prev) => ({
      ...prev,
      [verbName]: action,
    }))
  }

  const renderFullConjugation = (conjugation: ConjugationData) => {
    return (
      <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
        {Object.entries(conjugation).map(([mood, tenses]) => (
          <Box key={mood} sx={{ mb: 2 }}>
            <Typography variant='subtitle2' color='primary' gutterBottom>
              {mood}
            </Typography>
            {Object.entries(tenses).map(([tense, forms]) => (
              <Box key={tense} sx={{ ml: 2, mb: 1 }}>
                <Typography variant='body2' fontWeight='medium'>
                  {tense}
                </Typography>
                {typeof forms === 'string' ? (
                  <Typography variant='body2' sx={{ ml: 2 }}>
                    {forms}
                  </Typography>
                ) : (
                  <Box sx={{ ml: 2 }}>
                    {Object.entries(forms).map(([person, form]) => (
                      <Typography key={person} variant='body2'>
                        {person}: {form}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    )
  }

  return (
    <>
      {/* Import Icon */}
      <Tooltip title='Import Conjugations from JSON'>
        <IconButton
          color='primary'
          onClick={() => setShowImportDialog(true)}
          disabled={importingConjugations}
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
            Import Verb Conjugations from JSON Files
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
              disabled={importingConjugations}
            >
              Choose JSON File(s)
              <input
                type='file'
                accept='.json'
                multiple
                hidden
                onChange={handleConjugationFileUpload}
              />
            </Button>
            {selectedFiles.length > 0 && (
              <Chip
                icon={<CheckCircle />}
                label={`${selectedFiles.length} file(s) loaded`}
                color='success'
                size='small'
              />
            )}
          </Stack>

          {selectedFiles.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant='subtitle2' gutterBottom>
                Selected Files:
              </Typography>
              <List dense>
                {selectedFiles.map((fileData) => (
                  <ListItem
                    key={fileData.verbName}
                    secondaryAction={
                      <IconButton
                        edge='end'
                        aria-label='delete'
                        onClick={() => handleRemoveFile(fileData.verbName)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={fileData.file.name}
                      secondary={`Verb: ${fileData.verbName}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowImportDialog(false)}>Cancel</Button>
          {selectedFiles.length > 0 && (
            <Button
              variant='contained'
              onClick={() => {
                handleImportConjugations()
                setShowImportDialog(false)
              }}
              disabled={importingConjugations}
              startIcon={
                importingConjugations ? (
                  <CircularProgress size={20} />
                ) : (
                  <CloudUpload />
                )
              }
            >
              {importingConjugations ? 'Importing...' : 'Import Conjugations'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Conjugation Conflict Resolution Dialog */}
      <Dialog
        open={showConjugationConflictDialog}
        onClose={() => setShowConjugationConflictDialog(false)}
        maxWidth='lg'
        fullWidth
      >
        <DialogTitle>
          <Box display='flex' alignItems='center' gap={1}>
            <Warning color='warning' />
            Resolve Conflicts ({conjugationConflicts.length} verb(s))
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            The following verbs already have conjugations in the database.
            Choose whether to keep the existing data or replace it with the new
            data.
          </Typography>

          {conjugationConflicts.map((conflict) => (
            <Paper key={conflict.verbName} sx={{ p: 2, mb: 2 }}>
              <Typography variant='h6' gutterBottom>
                {conflict.verbName}
              </Typography>

              <Stack direction='row' spacing={3} sx={{ mb: 2 }}>
                <Box flex={1}>
                  <Typography variant='subtitle2' color='primary' gutterBottom>
                    Existing Data
                  </Typography>
                  <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                    {renderFullConjugation(conflict.existing)}
                  </Box>
                </Box>

                <Box flex={1}>
                  <Typography
                    variant='subtitle2'
                    color='secondary'
                    gutterBottom
                  >
                    New Data
                  </Typography>
                  <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                    {renderFullConjugation(conflict.new)}
                  </Box>
                </Box>
              </Stack>

              <Stack direction='row' spacing={2}>
                <Button
                  size='small'
                  variant={
                    conjugationConflictResolutions[conflict.verbName] === 'keep'
                      ? 'contained'
                      : 'outlined'
                  }
                  onClick={() =>
                    handleConjugationConflictResolution(
                      conflict.verbName,
                      'keep'
                    )
                  }
                >
                  Keep Existing
                </Button>
                <Button
                  size='small'
                  variant={
                    conjugationConflictResolutions[conflict.verbName] ===
                    'replace'
                      ? 'contained'
                      : 'outlined'
                  }
                  color='secondary'
                  onClick={() =>
                    handleConjugationConflictResolution(
                      conflict.verbName,
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
          <Button onClick={() => setShowConjugationConflictDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleResolveConjugationConflicts}
            variant='contained'
            disabled={
              Object.keys(conjugationConflictResolutions).length !==
              conjugationConflicts.length
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
            Upload one or multiple JSON files with Italian verb conjugations.
            The filename (without .json extension) will be used as the verb
            name.
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            Expected format (example for &quot;aiutare.json&quot;):
          </Typography>
          <Paper sx={{ p: 2, backgroundColor: 'grey.100' }}>
            <Typography
              variant='body2'
              component='pre'
              sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
            >
              {`{
  "Indicativo": {
    "Presente": {
      "io": "aiuto",
      "tu": "aiuti",
      "lui/lei": "aiuta",
      "noi": "aiutiamo",
      "voi": "aiutate",
      "loro": "aiutano"
    },
    ...
  },
  "Congiuntivo": { ... },
  ...
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
