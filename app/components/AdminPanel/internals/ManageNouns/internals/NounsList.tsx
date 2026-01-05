'use client'
import { useState } from 'react'
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
} from '@mui/material'
import { Info, EditOutlined, DeleteOutlined } from '@mui/icons-material'
import {
  useGetNounsQuery,
  type NounTranslations,
  type ImportedNoun,
} from '../../../../../store/api'
import { EditNounDialog, DeleteNounDialog } from './'

interface NounsListProps {
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

export default function NounsList({ onError, onSuccess }: NounsListProps) {
  const { data: nounsData, isLoading: loadingNouns } = useGetNounsQuery()

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

  const nouns = nounsData?.nouns || []

  return (
    <>
      {/* Existing Nouns Table */}
      <Card>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Current Nouns in Database ({nouns.length})
          </Typography>

          {loadingNouns ? (
            <Box display='flex' justifyContent='center' p={3}>
              <CircularProgress />
            </Box>
          ) : nouns.length === 0 ? (
            <Alert severity='info' icon={<Info />}>
              No nouns in the database yet. Import some using the form above.
            </Alert>
          ) : (
            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Italian</TableCell>
                    <TableCell>Italian</TableCell>
                    <TableCell>Portuguese</TableCell>
                    <TableCell>English</TableCell>
                    <TableCell>Last Updated</TableCell>
                    <TableCell align='center' sx={{ minWidth: 100 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {nouns.map((noun) => {
                    const singolare = noun.singolare as NounTranslations
                    const plurale = noun.plurale as NounTranslations
                    return (
                      <TableRow key={noun.italian}>
                        <TableCell>
                          <strong>{noun.italian}</strong>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant='body2'>
                              {singolare.it}
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                              {plurale.it}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant='body2'>
                              {singolare.pt}
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                              {plurale.pt}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant='body2'>
                              {singolare.en}
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                              {plurale.en}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {new Date(noun.updatedAt).toLocaleDateString('en-US')}
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
                              onClick={() => handleOpenEditDialog(noun)}
                            >
                              <EditOutlined fontSize='small' />
                            </IconButton>
                            <IconButton
                              size='small'
                              color='error'
                              onClick={() => handleOpenDeleteDialog(noun)}
                            >
                              <DeleteOutlined fontSize='small' />
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

