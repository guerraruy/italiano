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
} from '@mui/material'
import { Warning } from '@mui/icons-material'
import {
  useDeleteAdjectiveMutation,
  type ImportedAdjective,
  type AdjectiveGenderForms,
} from '../../../../../store/api'

interface DeleteAdjectiveDialogProps {
  open: boolean
  adjective: ImportedAdjective | null
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export default function DeleteAdjectiveDialog({
  open,
  adjective,
  onClose,
  onSuccess,
  onError,
}: DeleteAdjectiveDialogProps) {
  const [deleteAdjective, { isLoading: deletingAdjective }] = useDeleteAdjectiveMutation()

  const handleDeleteAdjective = async () => {
    if (!adjective) return

    try {
      const result = await deleteAdjective(adjective.id).unwrap()
      onSuccess(result.message)
      onClose()
    } catch (err: unknown) {
      const error = err as { data?: { error?: string } }
      onError(error?.data?.error || 'Error deleting adjective')
    }
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
          Are you sure you want to delete this adjective?
        </Typography>
        {adjective && (
          <Paper sx={{ p: 2, mt: 2, backgroundColor: 'grey.100' }}>
            <Typography variant='h6' gutterBottom>
              {adjective.italian}
            </Typography>
            <Typography variant='body2'>
              <strong>Masculine Singular:</strong>{' '}
              {(adjective.maschile as AdjectiveGenderForms).singolare.it} /{' '}
              {(adjective.maschile as AdjectiveGenderForms).singolare.pt} /{' '}
              {(adjective.maschile as AdjectiveGenderForms).singolare.en}
            </Typography>
            <Typography variant='body2'>
              <strong>Masculine Plural:</strong>{' '}
              {(adjective.maschile as AdjectiveGenderForms).plurale.it} /{' '}
              {(adjective.maschile as AdjectiveGenderForms).plurale.pt} /{' '}
              {(adjective.maschile as AdjectiveGenderForms).plurale.en}
            </Typography>
            <Typography variant='body2' sx={{ mt: 1 }}>
              <strong>Feminine Singular:</strong>{' '}
              {(adjective.femminile as AdjectiveGenderForms).singolare.it} /{' '}
              {(adjective.femminile as AdjectiveGenderForms).singolare.pt} /{' '}
              {(adjective.femminile as AdjectiveGenderForms).singolare.en}
            </Typography>
            <Typography variant='body2'>
              <strong>Feminine Plural:</strong>{' '}
              {(adjective.femminile as AdjectiveGenderForms).plurale.it} /{' '}
              {(adjective.femminile as AdjectiveGenderForms).plurale.pt} /{' '}
              {(adjective.femminile as AdjectiveGenderForms).plurale.en}
            </Typography>
          </Paper>
        )}
        <Alert severity='warning' sx={{ mt: 2 }}>
          This action cannot be undone. All associated statistics will also be
          deleted.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={deletingAdjective}>
          Cancel
        </Button>
        <Button
          onClick={handleDeleteAdjective}
          variant='contained'
          color='error'
          disabled={deletingAdjective}
        >
          {deletingAdjective ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

