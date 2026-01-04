'use client'
import { useState, useEffect, Fragment } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Tabs,
  Tab,
  Paper,
  Stack,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import {
  Delete,
  AdminPanelSettings,
  PersonRemove,
  CloudUpload,
  CheckCircle,
  Warning,
  Info,
  Delete as DeleteIcon,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetVerbsQuery,
  useImportVerbsMutation,
  useGetConjugationsQuery,
  useImportConjugationsMutation,
  type UserData,
  type ConflictVerb,
  type ConjugationData,
  type ConflictConjugation,
  type VerbConjugation,
} from '../store/api'

interface FileWithContent {
  file: File
  verbName: string
  content: ConjugationData
}

export default function AdminPanel() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [currentTab, setCurrentTab] = useState(0)

  // Users queries
  const {
    data: usersData,
    isLoading: loadingUsers,
    error: queryError,
  } = useGetUsersQuery(undefined, {
    skip: !isAuthenticated || !user?.admin,
  })
  const [updateUser] = useUpdateUserMutation()
  const [deleteUser] = useDeleteUserMutation()

  // Verbs queries
  const { data: verbsData, isLoading: loadingVerbs } = useGetVerbsQuery(
    undefined,
    {
      skip: !isAuthenticated || !user?.admin,
    }
  )
  const [importVerbs, { isLoading: importingVerbs }] = useImportVerbsMutation()

  // Conjugations queries
  const { data: conjugationsData, isLoading: loadingConjugations } =
    useGetConjugationsQuery(undefined, {
      skip: !isAuthenticated || !user?.admin,
    })
  const [importConjugations, { isLoading: importingConjugations }] =
    useImportConjugationsMutation()

  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    user: UserData | null
  }>({
    open: false,
    user: null,
  })

  // Verbs state
  const [verbJsonContent, setVerbJsonContent] = useState<string>('')
  const [verbConflicts, setVerbConflicts] = useState<ConflictVerb[]>([])
  const [verbConflictResolutions, setVerbConflictResolutions] = useState<{
    [italian: string]: 'keep' | 'replace'
  }>({})
  const [showVerbConflictDialog, setShowVerbConflictDialog] = useState(false)

  // Conjugations state
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
  const [expandedConjugations, setExpandedConjugations] = useState<Set<string>>(
    new Set()
  )

  useEffect(() => {
    if (!isAuthenticated || !user?.admin) {
      router.push('/')
      return
    }
  }, [isAuthenticated, user, router])

  // User handlers
  const handleToggleAdmin = async (
    userId: string,
    currentAdminStatus: boolean
  ) => {
    try {
      await updateUser({
        userId,
        admin: !currentAdminStatus,
      }).unwrap()

      setSuccessMessage(
        currentAdminStatus
          ? 'Admin permission removed successfully'
          : 'User promoted to admin successfully'
      )
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      const error = err as { data?: { error?: string } }
      setError(error?.data?.error || 'Error updating user')
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteDialog.user) return

    try {
      await deleteUser(deleteDialog.user.id).unwrap()

      setSuccessMessage('User deleted successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
      setDeleteDialog({ open: false, user: null })
    } catch (err) {
      const error = err as { data?: { error?: string } }
      setError(error?.data?.error || 'Error deleting user')
      setTimeout(() => setError(null), 3000)
    }
  }

  // Verb handlers
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
        setError(null)
        setSuccessMessage(
          'JSON file loaded successfully. Click "Import Verbs" to proceed.'
        )
        setTimeout(() => setSuccessMessage(null), 3000)
      } catch {
        setError('Invalid JSON file. Please check the format.')
        setVerbJsonContent('')
      }
    }
    reader.readAsText(file)
  }

  const handleImportVerbs = async () => {
    if (!verbJsonContent) {
      setError('Please load a JSON file first.')
      return
    }

    try {
      setError(null)

      const verbsData = JSON.parse(verbJsonContent)

      const result = await importVerbs({
        verbs: verbsData,
        resolveConflicts:
          Object.keys(verbConflictResolutions).length > 0
            ? verbConflictResolutions
            : undefined,
      }).unwrap()

      setSuccessMessage(result.message)
      setTimeout(() => setSuccessMessage(null), 3000)
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
        setError(null)
      } else {
        setError(error?.data?.error || 'Error importing verbs')
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

  // Conjugation handlers
  const handleConjugationFileUpload = async (
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
      setTimeout(() => setSuccessMessage(null), 3000)
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
          Object.keys(conjugationConflictResolutions).length > 0
            ? conjugationConflictResolutions
            : undefined,
      }).unwrap()

      setSuccessMessage(result.message)
      setTimeout(() => setSuccessMessage(null), 3000)
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
        setError(null)
      } else {
        setError(error?.data?.error || 'Error importing conjugations')
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

  if (!user?.admin) {
    return null
  }

  if (loadingUsers) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='400px'
      >
        <CircularProgress />
      </Box>
    )
  }

  const users = usersData?.users || []
  const verbs = verbsData?.verbs || []
  const conjugations = conjugationsData?.conjugations || []

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant='h4' sx={{ mb: 3 }}>
        Administration Panel
      </Typography>

      {(error || queryError) && (
        <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error || 'Error loading data'}
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
        </Tabs>
      </Box>

      {/* Tab 0: Manage Users */}
      {currentTab === 0 && (
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Manage Users ({users.length})
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell align='center'>Admin</TableCell>
                    <TableCell align='center'>Lessons</TableCell>
                    <TableCell align='center'>Registered</TableCell>
                    <TableCell align='center'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((userData) => (
                    <TableRow key={userData.id}>
                      <TableCell>{userData.username}</TableCell>
                      <TableCell>{userData.email}</TableCell>
                      <TableCell>{userData.name || '-'}</TableCell>
                      <TableCell align='center'>
                        {userData.admin ? (
                          <Chip
                            label='Admin'
                            color='primary'
                            size='small'
                            icon={<AdminPanelSettings />}
                          />
                        ) : (
                          <Chip label='User' size='small' />
                        )}
                      </TableCell>
                      <TableCell align='center'>
                        {userData._count.lessons}
                      </TableCell>
                      <TableCell align='center'>
                        {userData.createdAt
                          ? new Date(userData.createdAt).toLocaleDateString(
                              'en-US'
                            )
                          : '-'}
                      </TableCell>
                      <TableCell align='center'>
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 1,
                            justifyContent: 'center',
                          }}
                        >
                          <Tooltip
                            title={
                              userData.admin
                                ? 'Remove admin permission'
                                : 'Make admin'
                            }
                          >
                            <span>
                              <IconButton
                                color={userData.admin ? 'warning' : 'primary'}
                                size='small'
                                onClick={() =>
                                  handleToggleAdmin(userData.id, userData.admin)
                                }
                                disabled={userData.id === user.id}
                              >
                                {userData.admin ? (
                                  <PersonRemove />
                                ) : (
                                  <AdminPanelSettings />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title='Delete user'>
                            <span>
                              <IconButton
                                color='error'
                                size='small'
                                onClick={() =>
                                  setDeleteDialog({
                                    open: true,
                                    user: userData,
                                  })
                                }
                                disabled={userData.id === user.id}
                              >
                                <Delete />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Tab 1: Manage Verbs */}
      {currentTab === 1 && (
        <>
          {/* Import Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Import Verbs from JSON
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                Upload a JSON file with Italian verbs and their translations.
                Expected format:
              </Typography>
              <Paper sx={{ p: 2, mb: 2, backgroundColor: 'grey.100' }}>
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

              <Stack direction='row' spacing={2} alignItems='center'>
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
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    gutterBottom
                  >
                    Preview: {Object.keys(JSON.parse(verbJsonContent)).length}{' '}
                    verbs ready to import
                  </Typography>
                  <Button
                    variant='contained'
                    onClick={handleImportVerbs}
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
                  No verbs in the database yet. Import some using the form
                  above.
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
                          <TableCell align='center'>
                            {verb.reflexive ? (
                              <Chip label='Yes' size='small' color='info' />
                            ) : (
                              <Chip label='No' size='small' />
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(verb.updatedAt).toLocaleDateString(
                              'en-US'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Tab 2: Manage Conjugations */}
      {currentTab === 2 && (
        <>
          {/* Import Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Import Verb Conjugations from JSON Files
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                Upload one or multiple JSON files with Italian verb
                conjugations. The filename (without .json extension) will be
                used as the verb name.
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

              <Stack
                direction='row'
                spacing={2}
                alignItems='center'
                sx={{ mb: 2 }}
              >
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
                    disabled={importingConjugations}
                    startIcon={
                      importingConjugations ? (
                        <CircularProgress size={20} />
                      ) : (
                        <CloudUpload />
                      )
                    }
                  >
                    {importingConjugations
                      ? 'Importing...'
                      : 'Import Conjugations'}
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
                  No conjugations in the database yet. Import some using the
                  form above.
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
                              {new Date(conj.updatedAt).toLocaleDateString(
                                'en-US'
                              )}
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
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, user: null })}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the user{' '}
            <strong>{deleteDialog.user?.username}</strong>?
          </Typography>
          <Typography color='error' sx={{ mt: 2 }}>
            This action cannot be undone. All user data will be permanently
            removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, user: null })}>
            Cancel
          </Button>
          <Button onClick={handleDeleteUser} color='error' variant='contained'>
            Delete
          </Button>
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
    </Box>
  )
}
