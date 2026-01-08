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
  Chip,
} from '@mui/material'

import { ImportedVerb, useGetVerbsQuery } from '@/app/store/api'

import { EditVerbDialog, DeleteVerbDialog, ImportVerbs } from './'

interface VerbsListProps {
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

export default function VerbsList({ onError, onSuccess }: VerbsListProps) {
  const { data: verbsData, isLoading: loadingVerbs } = useGetVerbsQuery()

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
  const [editingVerb, setEditingVerb] = useState<ImportedVerb | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [verbToDelete, setVerbToDelete] = useState<ImportedVerb | null>(null)

  // Edit handlers
  const handleOpenEditDialog = (verb: ImportedVerb) => {
    setEditingVerb(verb)
    setShowEditDialog(true)
  }

  const handleCloseEditDialog = () => {
    setShowEditDialog(false)
    setEditingVerb(null)
  }

  // Delete handlers
  const handleOpenDeleteDialog = (verb: ImportedVerb) => {
    setVerbToDelete(verb)
    setShowDeleteDialog(true)
  }

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false)
    setVerbToDelete(null)
  }

  // Filter verbs based on deferred search text (memoized for performance)
  const filteredVerbs = useMemo(() => {
    const verbs = verbsData?.verbs || []
    if (!deferredFilterText) return verbs
    const searchTerm = deferredFilterText.toLowerCase()
    return verbs.filter((verb) =>
      verb.italian.toLowerCase().includes(searchTerm)
    )
  }, [verbsData?.verbs, deferredFilterText])

  // Paginated verbs
  const paginatedVerbs = useMemo(() => {
    const startIndex = page * rowsPerPage
    return filteredVerbs.slice(startIndex, startIndex + rowsPerPage)
  }, [filteredVerbs, page, rowsPerPage])

  return (
    <>
      {/* Existing Verbs Table */}
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
            <Box display='flex' alignItems='center' gap={1}>
              <Typography variant='h6'>
                Current Verbs in Database ({filteredVerbs.length}
                {deferredFilterText && ` of ${verbsData?.verbs?.length || 0}`})
              </Typography>
              <ImportVerbs onError={onError} onSuccess={onSuccess} />
            </Box>
            <TextField
              size='small'
              placeholder='Filter by Italian name...'
              value={filterText}
              onChange={(e) => {
                const value = e.target.value
                setFilterText(value)
                startTransition(() => {
                  setPage(0) // Reset to first page on filter change
                })
              }}
              sx={{ minWidth: 250 }}
              disabled={loadingVerbs}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Search fontSize='small' />
                  </InputAdornment>
                ),
                endAdornment: filterText && (
                  <InputAdornment position='end'>
                    <IconButton
                      size='small'
                      onClick={() => setFilterText('')}
                      edge='end'
                      aria-label='clear filter'
                    >
                      <Clear fontSize='small' />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {loadingVerbs ? (
            <Box display='flex' justifyContent='center' p={3}>
              <CircularProgress />
            </Box>
          ) : (verbsData?.verbs?.length || 0) === 0 ? (
            <Alert severity='info' icon={<Info />}>
              No verbs in the database yet. Import some using the form above.
            </Alert>
          ) : filteredVerbs.length === 0 ? (
            <Alert severity='info' icon={<Info />}>
              No verbs found matching &quot;{deferredFilterText}&quot;
            </Alert>
          ) : (
            <TableContainer
              sx={{ opacity: isPending ? 0.5 : 1, transition: 'opacity 0.2s' }}
            >
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Italian</TableCell>
                    <TableCell>Portuguese (BR)</TableCell>
                    <TableCell>English</TableCell>
                    <TableCell align='center'>Regular</TableCell>
                    <TableCell align='center'>Reflexive</TableCell>
                    <TableCell>Last Updated</TableCell>
                    <TableCell align='center' sx={{ minWidth: 100 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedVerbs.map((verb) => (
                    <TableRow key={verb.id}>
                      <TableCell>
                        <strong>{verb.italian}</strong>
                      </TableCell>
                      <TableCell>{verb.tr_ptBR}</TableCell>
                      <TableCell>{verb.tr_en || '-'}</TableCell>
                      <TableCell align='center'>
                        {verb.regular ? (
                          <Chip label='Regular' size='small' color='success' />
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
                        {new Date(verb.updatedAt).toLocaleDateString('en-US')}
                      </TableCell>
                      <TableCell align='center'>
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 0.5,
                            justifyContent: 'center',
                          }}
                        >
                          <IconButton
                            size='small'
                            color='primary'
                            onClick={() => handleOpenEditDialog(verb)}
                          >
                            <EditOutlined fontSize='small' />
                          </IconButton>
                          <IconButton
                            size='small'
                            color='error'
                            onClick={() => handleOpenDeleteDialog(verb)}
                          >
                            <DeleteOutlined fontSize='small' />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination */}
          {filteredVerbs.length > 0 && (
            <TablePagination
              component='div'
              count={filteredVerbs.length}
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

      {/* Edit Verb Dialog */}
      <EditVerbDialog
        open={showEditDialog}
        verb={editingVerb}
        onClose={handleCloseEditDialog}
        onSuccess={onSuccess}
        onError={onError}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteVerbDialog
        open={showDeleteDialog}
        verb={verbToDelete}
        onClose={handleCloseDeleteDialog}
        onSuccess={onSuccess}
        onError={onError}
      />
    </>
  )
}
