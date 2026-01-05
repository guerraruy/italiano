'use client'
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  Typography,
  Alert,
  Chip,
} from '@mui/material'
import { Warning } from '@mui/icons-material'
import {
  useDeleteConjugationMutation,
  type VerbConjugation,
  type ConjugationData,
} from '../../../../../store/api'

interface DeleteConjugationDialogProps {
  open: boolean
  conjugation: VerbConjugation | null
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export default function DeleteConjugationDialog({
  open,
  conjugation,
  onClose,
  onSuccess,
  onError,
}: DeleteConjugationDialogProps) {
  const [deleteConjugation, { isLoading: deletingConjugation }] =
    useDeleteConjugationMutation()

  const handleDeleteConjugation = async () => {
    if (!conjugation) return

    try {
      const result = await deleteConjugation(conjugation.id).unwrap()
      onSuccess(result.message)
      onClose()
    } catch (err: unknown) {
      const error = err as { data?: { error?: string } }
      onError(error?.data?.error || 'Error deleting conjugation')
    }
  }

  const renderConjugationSummary = (conjugation: ConjugationData) => {
    const moods = Object.keys(conjugation)
    const totalTenses = Object.values(conjugation).reduce(
      (total, tenses) => total + Object.keys(tenses).length,
      0
    )
    return (
      <Box>
        <Typography variant='body2'>
          <strong>Moods:</strong> {moods.join(', ')}
        </Typography>
        <Typography variant='body2'>
          <strong>Total Tenses:</strong> {totalTenses}
        </Typography>
      </Box>
    )
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' gap={1}>
          <Warning color='error' />
          Confirm Deletion
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant='body1' gutterBottom>
          Are you sure you want to delete this conjugation?
        </Typography>
        {conjugation && (
          <Paper sx={{ p: 2, mt: 2, backgroundColor: 'grey.100' }}>
            <Typography variant='h6' gutterBottom>
              {conjugation.verb.italian}
            </Typography>
            <Box sx={{ mb: 1, display: 'flex', gap: 1 }}>
              {conjugation.verb.regular ? (
                <Chip label='Regular' size='small' color='success' />
              ) : (
                <Chip label='Irregular' size='small' color='warning' />
              )}
              {conjugation.verb.reflexive && (
                <Chip label='Reflexive' size='small' color='info' />
              )}
            </Box>
            {renderConjugationSummary(
              conjugation.conjugation as ConjugationData
            )}
          </Paper>
        )}
        <Alert severity='warning' sx={{ mt: 2 }}>
          This action cannot be undone. The conjugation data will be
          permanently deleted from the database.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={deletingConjugation}>
          Cancel
        </Button>
        <Button
          onClick={handleDeleteConjugation}
          variant='contained'
          color='error'
          disabled={deletingConjugation}
        >
          {deletingConjugation ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

