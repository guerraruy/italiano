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
  IconButton,
  TextField,
  InputAdornment,
  TablePagination,
} from '@mui/material'

import { SkeletonTable } from '@/app/components/Skeleton'
import {
  useGetNounsQuery,
  type NounTranslations,
  type ImportedNoun,
} from '@/app/store/api'

import { EditNounDialog, DeleteNounDialog, ImportNouns } from './'

interface NounsListProps {
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

export default function NounsList({ onError, onSuccess }: NounsListProps) {
  const { data: nounsData, isLoading: loadingNouns } = useGetNounsQuery()

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
  const [editingNoun, setEditingNoun] = useState<ImportedNoun | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [nounToDelete, setNounToDelete] = useState<ImportedNoun | null>(null)

  // Edit handlers
  const handleOpenEditDialog = (noun: ImportedNoun) => {
    setEditingNoun(noun)
    setShowEditDialog(true)
  }

  const handleCloseEditDialog = () => {
    setShowEditDialog(false)
    setEditingNoun(null)
  }

  // Delete handlers
  const handleOpenDeleteDialog = (noun: ImportedNoun) => {
    setNounToDelete(noun)
    setShowDeleteDialog(true)
  }

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false)
    setNounToDelete(null)
  }

  // Filter nouns based on deferred search text (memoized for performance)
  const filteredNouns = useMemo(() => {
    const nouns = nounsData?.nouns || []
    if (!deferredFilterText) return nouns
    const searchTerm = deferredFilterText.toLowerCase()
    return nouns.filter((noun) =>
      noun.italian.toLowerCase().includes(searchTerm)
    )
  }, [nounsData?.nouns, deferredFilterText])

  // Paginated nouns
  const paginatedNouns = useMemo(() => {
    const startIndex = page * rowsPerPage
    return filteredNouns.slice(startIndex, startIndex + rowsPerPage)
  }, [filteredNouns, page, rowsPerPage])

  return (
    <>
      {/* Existing Nouns Table */}
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
                Current Nouns in Database ({filteredNouns.length}
                {deferredFilterText && ` of ${nounsData?.nouns?.length || 0}`})
              </Typography>
              <ImportNouns onError={onError} onSuccess={onSuccess} />
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
              disabled={loadingNouns}
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

          {loadingNouns ? (
            <SkeletonTable
              columns={6}
              rows={5}
              showCard={false}
              showSearch={false}
            />
          ) : (nounsData?.nouns?.length || 0) === 0 ? (
            <Alert severity="info" icon={<Info />}>
              No nouns in the database yet. Import some using the form above.
            </Alert>
          ) : filteredNouns.length === 0 ? (
            <Alert severity="info" icon={<Info />}>
              No nouns found matching &quot;{deferredFilterText}&quot;
            </Alert>
          ) : (
            <TableContainer
              sx={{ opacity: isPending ? 0.5 : 1, transition: 'opacity 0.2s' }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Italian</TableCell>
                    <TableCell>Italian</TableCell>
                    <TableCell>Portuguese</TableCell>
                    <TableCell>English</TableCell>
                    <TableCell>Last Updated</TableCell>
                    <TableCell align="center" sx={{ minWidth: 100 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedNouns.map((noun) => {
                    const singolare = noun.singolare as NounTranslations
                    const plurale = noun.plurale as NounTranslations
                    return (
                      <TableRow key={noun.italian}>
                        <TableCell>
                          <strong>{noun.italian}</strong>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {singolare.it}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {plurale.it}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {singolare.pt}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {plurale.pt}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {singolare.en}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {plurale.en}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {new Date(noun.updatedAt).toLocaleDateString('en-US')}
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
                              onClick={() => handleOpenEditDialog(noun)}
                            >
                              <EditOutlined fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenDeleteDialog(noun)}
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
          {filteredNouns.length > 0 && (
            <TablePagination
              component="div"
              count={filteredNouns.length}
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

      {/* Edit Noun Dialog */}
      <EditNounDialog
        open={showEditDialog}
        noun={editingNoun}
        onClose={handleCloseEditDialog}
        onSuccess={onSuccess}
        onError={onError}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteNounDialog
        open={showDeleteDialog}
        noun={nounToDelete}
        onClose={handleCloseDeleteDialog}
        onSuccess={onSuccess}
        onError={onError}
      />
    </>
  )
}
