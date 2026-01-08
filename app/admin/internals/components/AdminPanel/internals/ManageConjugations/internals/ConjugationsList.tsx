'use client'
import {
  useState,
  useMemo,
  useDeferredValue,
  useTransition,
  Fragment,
} from 'react'

import {
  Info,
  EditOutlined,
  DeleteOutlined,
  Search,
  Clear,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material'
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
  Alert,
  CircularProgress,
  IconButton,
  TextField,
  InputAdornment,
  TablePagination,
  Chip,
} from '@mui/material'

import {
  ConjugationData,
  useGetConjugationsQuery,
  VerbConjugation,
} from '@/app/store/api'

import {
  EditConjugationDialog,
  DeleteConjugationDialog,
  ImportConjugations,
} from './'

interface ConjugationsListProps {
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

export default function ConjugationsList({
  onError,
  onSuccess,
}: ConjugationsListProps) {
  const { data: conjugationsData, isLoading: loadingConjugations } =
    useGetConjugationsQuery()

  // Filter state with transition
  const [filterText, setFilterText] = useState('')
  const [isPending, startTransition] = useTransition()

  // Pagination state
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  // Defer the filter text to keep input responsive
  const deferredFilterText = useDeferredValue(filterText)

  // Edit and Delete modal states
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingConjugation, setEditingConjugation] =
    useState<VerbConjugation | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [conjugationToDelete, setConjugationToDelete] =
    useState<VerbConjugation | null>(null)

  // Expanded conjugations for preview
  const [expandedConjugations, setExpandedConjugations] = useState<Set<string>>(
    new Set()
  )

  // Edit handlers
  const handleOpenEditDialog = (conjugation: VerbConjugation) => {
    setEditingConjugation(conjugation)
    setShowEditDialog(true)
  }

  const handleCloseEditDialog = () => {
    setShowEditDialog(false)
    setEditingConjugation(null)
  }

  // Delete handlers
  const handleOpenDeleteDialog = (conjugation: VerbConjugation) => {
    setConjugationToDelete(conjugation)
    setShowDeleteDialog(true)
  }

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false)
    setConjugationToDelete(null)
  }

  const toggleExpanded = (conjugationId: string) => {
    setExpandedConjugations((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(conjugationId)) {
        newSet.delete(conjugationId)
      } else {
        newSet.add(conjugationId)
      }
      return newSet
    })
  }

  // Filter conjugations based on deferred search text (memoized for performance)
  const filteredConjugations = useMemo(() => {
    const conjugations = conjugationsData?.conjugations || []
    if (!deferredFilterText) return conjugations
    const searchTerm = deferredFilterText.toLowerCase()
    return conjugations.filter((conj) =>
      conj.verb.italian.toLowerCase().includes(searchTerm)
    )
  }, [conjugationsData?.conjugations, deferredFilterText])

  // Paginated conjugations
  const paginatedConjugations = useMemo(() => {
    const startIndex = page * rowsPerPage
    return filteredConjugations.slice(startIndex, startIndex + rowsPerPage)
  }, [filteredConjugations, page, rowsPerPage])

  const renderConjugationPreview = (conjugation: ConjugationData) => {
    const totalTenses = Object.values(conjugation).reduce(
      (total, tenses) => total + Object.keys(tenses).length,
      0
    )
    return (
      <Typography variant="body2">
        {totalTenses} tense{totalTenses !== 1 ? 's' : ''}
      </Typography>
    )
  }

  const renderFullConjugation = (conjugation: ConjugationData) => {
    return (
      <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
        {Object.entries(conjugation).map(([mood, tenses]) => (
          <Box key={mood} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              {mood}
            </Typography>
            {Object.entries(tenses).map(([tense, forms]) => (
              <Box key={tense} sx={{ ml: 2, mb: 1 }}>
                <Typography variant="body2" fontWeight="medium">
                  {tense}
                </Typography>
                {typeof forms === 'string' ? (
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    {forms}
                  </Typography>
                ) : (
                  <Box sx={{ ml: 2 }}>
                    {Object.entries(forms).map(([person, form]) => (
                      <Typography key={person} variant="body2">
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
      {/* Existing Conjugations Table */}
      <Card>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6">
                Current Conjugations in Database ({filteredConjugations.length}
                {deferredFilterText &&
                  ` of ${conjugationsData?.conjugations?.length || 0}`}
                )
              </Typography>
              <ImportConjugations onError={onError} onSuccess={onSuccess} />
            </Box>
            <TextField
              size="small"
              placeholder="Filter by verb name..."
              value={filterText}
              onChange={(e) => {
                const value = e.target.value
                setFilterText(value)
                startTransition(() => {
                  setPage(0) // Reset to first page on filter change
                })
              }}
              sx={{ minWidth: 250 }}
              disabled={loadingConjugations}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: filterText && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setFilterText('')}
                      edge="end"
                      aria-label="clear filter"
                    >
                      <Clear fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {loadingConjugations ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (conjugationsData?.conjugations?.length || 0) === 0 ? (
            <Alert severity="info" icon={<Info />}>
              No conjugations in the database yet. Import some using the form
              above.
            </Alert>
          ) : filteredConjugations.length === 0 ? (
            <Alert severity="info" icon={<Info />}>
              No conjugations found matching &quot;{deferredFilterText}&quot;
            </Alert>
          ) : (
            <TableContainer
              sx={{ opacity: isPending ? 0.5 : 1, transition: 'opacity 0.2s' }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Italian Verb</TableCell>
                    <TableCell>Regular</TableCell>
                    <TableCell>Reflexive</TableCell>
                    <TableCell>Conjugation Summary</TableCell>
                    <TableCell>Last Updated</TableCell>
                    <TableCell align="center" sx={{ minWidth: 120 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedConjugations.map((conj: VerbConjugation) => (
                    <Fragment key={conj.id}>
                      <TableRow>
                        <TableCell>
                          <strong>{conj.verb.italian}</strong>
                        </TableCell>
                        <TableCell>
                          {conj.verb.regular ? (
                            <Chip
                              label="Regular"
                              size="small"
                              color="success"
                            />
                          ) : (
                            <Chip
                              label="Irregular"
                              size="small"
                              color="warning"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {conj.verb.reflexive ? (
                            <Chip label="Yes" size="small" color="info" />
                          ) : (
                            <Chip label="No" size="small" />
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
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: 'flex',
                              gap: 0.5,
                              justifyContent: 'center',
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => toggleExpanded(conj.id)}
                              title="Toggle preview"
                            >
                              {expandedConjugations.has(conj.id) ? (
                                <ExpandLess fontSize="small" />
                              ) : (
                                <ExpandMore fontSize="small" />
                              )}
                            </IconButton>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenEditDialog(conj)}
                            >
                              <EditOutlined fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenDeleteDialog(conj)}
                            >
                              <DeleteOutlined fontSize="small" />
                            </IconButton>
                          </Box>
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

          {/* Pagination */}
          {filteredConjugations.length > 0 && (
            <TablePagination
              component="div"
              count={filteredConjugations.length}
              page={page}
              onPageChange={(_, newPage) => {
                startTransition(() => {
                  setPage(newPage)
                })
              }}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                startTransition(() => {
                  setRowsPerPage(parseInt(e.target.value, 10))
                  setPage(0)
                })
              }}
              rowsPerPageOptions={[10, 25, 50, 100]}
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Conjugation Dialog */}
      <EditConjugationDialog
        open={showEditDialog}
        conjugation={editingConjugation}
        onClose={handleCloseEditDialog}
        onSuccess={onSuccess}
        onError={onError}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConjugationDialog
        open={showDeleteDialog}
        conjugation={conjugationToDelete}
        onClose={handleCloseDeleteDialog}
        onSuccess={onSuccess}
        onError={onError}
      />
    </>
  )
}
