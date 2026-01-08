'use client'
import { useState, useMemo, useDeferredValue, useTransition } from 'react'

import {
  Info,
  EditOutlined,
  DeleteOutlined,
  Search,
  Clear,
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
} from '@mui/material'

import {
  AdjectiveGenderForms,
  ImportedAdjective,
  useGetAdjectivesQuery,
} from '@/app/store/api'

import {
  EditAdjectiveDialog,
  DeleteAdjectiveDialog,
  ImportAdjectives,
} from './'

interface AdjectivesListProps {
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

export default function AdjectivesList({
  onError,
  onSuccess,
}: AdjectivesListProps) {
  const { data: adjectivesData, isLoading: loadingAdjectives } =
    useGetAdjectivesQuery()

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
  const [editingAdjective, setEditingAdjective] =
    useState<ImportedAdjective | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [adjectiveToDelete, setAdjectiveToDelete] =
    useState<ImportedAdjective | null>(null)

  // Edit handlers
  const handleOpenEditDialog = (adjective: ImportedAdjective) => {
    setEditingAdjective(adjective)
    setShowEditDialog(true)
  }

  const handleCloseEditDialog = () => {
    setShowEditDialog(false)
    setEditingAdjective(null)
  }

  // Delete handlers
  const handleOpenDeleteDialog = (adjective: ImportedAdjective) => {
    setAdjectiveToDelete(adjective)
    setShowDeleteDialog(true)
  }

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false)
    setAdjectiveToDelete(null)
  }

  // Filter adjectives based on deferred search text (memoized for performance)
  const filteredAdjectives = useMemo(() => {
    const adjectives = adjectivesData?.adjectives || []
    if (!deferredFilterText) return adjectives
    const searchTerm = deferredFilterText.toLowerCase()
    return adjectives.filter((adjective) =>
      adjective.italian.toLowerCase().includes(searchTerm)
    )
  }, [adjectivesData?.adjectives, deferredFilterText])

  // Paginated adjectives
  const paginatedAdjectives = useMemo(() => {
    const startIndex = page * rowsPerPage
    return filteredAdjectives.slice(startIndex, startIndex + rowsPerPage)
  }, [filteredAdjectives, page, rowsPerPage])

  return (
    <>
      {/* Existing Adjectives Table */}
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
                Current Adjectives in Database ({filteredAdjectives.length}
                {deferredFilterText &&
                  ` of ${adjectivesData?.adjectives?.length || 0}`}
                )
              </Typography>
              <ImportAdjectives onError={onError} onSuccess={onSuccess} />
            </Box>
            <TextField
              size="small"
              placeholder="Filter by Italian name..."
              value={filterText}
              onChange={(e) => {
                const value = e.target.value
                setFilterText(value)
                startTransition(() => {
                  setPage(0) // Reset to first page on filter change
                })
              }}
              sx={{ minWidth: 250 }}
              disabled={loadingAdjectives}
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

          {loadingAdjectives ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (adjectivesData?.adjectives?.length || 0) === 0 ? (
            <Alert severity="info" icon={<Info />}>
              No adjectives in the database yet. Import some using the form
              above.
            </Alert>
          ) : filteredAdjectives.length === 0 ? (
            <Alert severity="info" icon={<Info />}>
              No adjectives found matching &quot;{deferredFilterText}&quot;
            </Alert>
          ) : (
            <TableContainer
              sx={{ opacity: isPending ? 0.5 : 1, transition: 'opacity 0.2s' }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Italian</TableCell>
                    <TableCell>Italian Forms</TableCell>
                    <TableCell>Portuguese</TableCell>
                    <TableCell>English</TableCell>
                    <TableCell>Last Updated</TableCell>
                    <TableCell align="center" sx={{ minWidth: 100 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedAdjectives.map((adjective) => {
                    const maschile = adjective.maschile as AdjectiveGenderForms
                    const femminile =
                      adjective.femminile as AdjectiveGenderForms
                    return (
                      <TableRow key={adjective.italian}>
                        <TableCell>
                          <strong>{adjective.italian}</strong>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {maschile.singolare.it} / {femminile.singolare.it}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {maschile.plurale.it} / {femminile.plurale.it}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {maschile.singolare.pt} / {femminile.singolare.pt}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {maschile.plurale.pt} / {femminile.plurale.pt}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {maschile.singolare.en}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {maschile.plurale.en}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {new Date(adjective.updatedAt).toLocaleDateString(
                            'en-US'
                          )}
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
                              color="primary"
                              onClick={() => handleOpenEditDialog(adjective)}
                            >
                              <EditOutlined fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenDeleteDialog(adjective)}
                            >
                              <DeleteOutlined fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination */}
          {filteredAdjectives.length > 0 && (
            <TablePagination
              component="div"
              count={filteredAdjectives.length}
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

      {/* Edit Adjective Dialog */}
      <EditAdjectiveDialog
        open={showEditDialog}
        adjective={editingAdjective}
        onClose={handleCloseEditDialog}
        onSuccess={onSuccess}
        onError={onError}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteAdjectiveDialog
        open={showDeleteDialog}
        adjective={adjectiveToDelete}
        onClose={handleCloseDeleteDialog}
        onSuccess={onSuccess}
        onError={onError}
      />
    </>
  )
}
