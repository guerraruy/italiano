'use client'
import { useState, useEffect, Fragment } from 'react'
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
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material'
import {
  CloudUpload,
  CheckCircle,
  Warning,
  Info,
  Delete as DeleteIcon,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material'
import { useAuth } from '../../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import {
  useGetConjugationsQuery,
  useImportConjugationsMutation,
  type ConjugationData,
  type ConflictConjugation,
  type VerbConjugation,
} from '../../../store/api'

interface FileWithContent {
  file: File
  verbName: string
  content: ConjugationData
}

export default function AdminVerbConjugationsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const { data, isLoading: loadingConjugations } = useGetConjugationsQuery(
    undefined,
    {
      skip: !isAuthenticated || !user?.admin,
    }
  )
  const [importConjugations, { isLoading: importing }] =
    useImportConjugationsMutation()

  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<FileWithContent[]>([])
  const [conflicts, setConflicts] = useState<ConflictConjugation[]>([])
  const [conflictResolutions, setConflictResolutions] = useState<{
    [verbName: string]: 'keep' | 'replace'
  }>({})
  const [showConflictDialog, setShowConflictDialog] = useState(false)
  const [expandedConjugations, setExpandedConjugations] = useState<Set<string>>(
    new Set()
  )

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

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const newFiles: FileWithContent[] = []
    const errors: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
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
      setError(`Errors loading files:\n${errors.join('\n')}`)
    } else {
      setError(null)
      setSuccessMessage(
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
      setError('Please load at least one JSON file first.')
      return
    }

    try {
      setError(null)

      // Build conjugations object from selected files
      const conjugationsData: Record<string, ConjugationData> = {}
      selectedFiles.forEach((fileData) => {
        conjugationsData[fileData.verbName] = fileData.content
      })

      const result = await importConjugations({
        conjugations: conjugationsData,
        resolveConflicts:
          Object.keys(conflictResolutions).length > 0
            ? conflictResolutions
            : undefined,
      }).unwrap()

      setSuccessMessage(result.message)
      setSelectedFiles([])
      setConflicts([])
      setConflictResolutions({})
    } catch (err: unknown) {
      // Handle conflict response (409)
      const error = err as {
        status?: number
        data?: { conflicts?: ConflictConjugation[]; error?: string }
      }
      if (error?.status === 409 && error?.data?.conflicts) {
        setConflicts(error.data.conflicts)
        setShowConflictDialog(true)
        setError(null)
      } else {
        setError(error?.data?.error || 'Error importing conjugations')
      }
    }
  }

  const handleResolveConflicts = () => {
    setShowConflictDialog(false)
    handleImportConjugations()
  }

  const handleConflictResolution = (
    verbName: string,
    action: 'keep' | 'replace'
  ) => {
    setConflictResolutions((prev) => ({
      ...prev,
      [verbName]: action,
    }))
  }

  const toggleExpanded = (verbId: string) => {
    setExpandedConjugations((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(verbId)) {
        newSet.delete(verbId)
      } else {
        newSet.add(verbId)
      }
      return newSet
    })
  }

  const renderConjugationPreview = (conjugation: ConjugationData) => {
    const moods = Object.keys(conjugation)
    return (
      <Box sx={{ fontSize: '0.85rem' }}>
        {moods.slice(0, 2).map((mood) => (
          <Typography key={mood} variant='caption' display='block'>
            {mood}: {Object.keys(conjugation[mood]).length} tense(s)
          </Typography>
        ))}
        {moods.length > 2 && (
          <Typography variant='caption' color='text.secondary'>
            +{moods.length - 2} more mood(s)
          </Typography>
        )}
      </Box>
    )
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

  const conjugations = data?.conjugations || []

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      <Typography variant='h4' gutterBottom sx={{ mb: 3 }}>
        Verb Conjugations Management - Admin
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
            Import Verb Conjugations from JSON Files
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            Upload one or multiple JSON files with Italian verb conjugations.
            The filename (without .json extension) will be used as the verb
            name.
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            Expected format (example for &quot;aiutare.json&quot;):
          </Typography>
          <Paper sx={{ p: 2, mb: 2, backgroundColor: 'grey.100' }}>
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

          <Stack direction='row' spacing={2} alignItems='center' sx={{ mb: 2 }}>
            <Button
              component='label'
              variant='outlined'
              startIcon={<CloudUpload />}
              disabled={importing}
            >
              Choose JSON File(s)
              <input
                type='file'
                accept='.json'
                multiple
                hidden
                onChange={handleFileUpload}
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
            <Box sx={{ mb: 2 }}>
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
              <Button
                variant='contained'
                onClick={handleImportConjugations}
                disabled={importing}
                startIcon={
                  importing ? <CircularProgress size={20} /> : <CloudUpload />
                }
              >
                {importing ? 'Importing...' : 'Import Conjugations'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Existing Conjugations Table */}
      <Card>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Current Conjugations in Database ({conjugations.length})
          </Typography>

          {loadingConjugations ? (
            <Box display='flex' justifyContent='center' p={3}>
              <CircularProgress />
            </Box>
          ) : conjugations.length === 0 ? (
            <Alert severity='info' icon={<Info />}>
              No conjugations in the database yet. Import some using the form
              above.
            </Alert>
          ) : (
            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Italian Verb</TableCell>
                    <TableCell>Regular</TableCell>
                    <TableCell>Reflexive</TableCell>
                    <TableCell>Conjugation Summary</TableCell>
                    <TableCell>Last Updated</TableCell>
                    <TableCell align='center'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {conjugations.map((conj: VerbConjugation) => (
                    <Fragment key={conj.id}>
                      <TableRow>
                        <TableCell>
                          <strong>{conj.verb.italian}</strong>
                        </TableCell>
                        <TableCell>
                          {conj.verb.regular ? (
                            <Chip
                              label='Regular'
                              size='small'
                              color='success'
                            />
                          ) : (
                            <Chip
                              label='Irregular'
                              size='small'
                              color='warning'
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {conj.verb.reflexive ? (
                            <Chip label='Yes' size='small' color='info' />
                          ) : (
                            <Chip label='No' size='small' />
                          )}
                        </TableCell>
                        <TableCell>
                          {renderConjugationPreview(
                            conj.conjugation as ConjugationData
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(conj.updatedAt).toLocaleDateString('en-US')}
                        </TableCell>
                        <TableCell align='center'>
                          <IconButton
                            size='small'
                            onClick={() => toggleExpanded(conj.id)}
                          >
                            {expandedConjugations.has(conj.id) ? (
                              <ExpandLess />
                            ) : (
                              <ExpandMore />
                            )}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      {expandedConjugations.has(conj.id) && (
                        <TableRow>
                          <TableCell colSpan={6}>
                            {renderFullConjugation(
                              conj.conjugation as ConjugationData
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
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
        maxWidth='lg'
        fullWidth
      >
        <DialogTitle>
          <Box display='flex' alignItems='center' gap={1}>
            <Warning color='warning' />
            Resolve Conflicts ({conflicts.length} verb(s))
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            The following verbs already have conjugations in the database.
            Choose whether to keep the existing data or replace it with the new
            data.
          </Typography>

          {conflicts.map((conflict) => (
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
                    conflictResolutions[conflict.verbName] === 'keep'
                      ? 'contained'
                      : 'outlined'
                  }
                  onClick={() =>
                    handleConflictResolution(conflict.verbName, 'keep')
                  }
                >
                  Keep Existing
                </Button>
                <Button
                  size='small'
                  variant={
                    conflictResolutions[conflict.verbName] === 'replace'
                      ? 'contained'
                      : 'outlined'
                  }
                  color='secondary'
                  onClick={() =>
                    handleConflictResolution(conflict.verbName, 'replace')
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
