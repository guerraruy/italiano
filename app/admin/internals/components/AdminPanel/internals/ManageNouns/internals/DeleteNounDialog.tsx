'use client'
import { Warning } from '@mui/icons-material'
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

import {
  useDeleteNounMutation,
  type ImportedNoun,
  type NounTranslations,
} from '@/app/store/api'

interface DeleteNounDialogProps {
  open: boolean
  noun: ImportedNoun | null
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export default function DeleteNounDialog({
  open,
  noun,
  onClose,
  onSuccess,
  onError,
}: DeleteNounDialogProps) {
  const [deleteNoun, { isLoading: deletingNoun }] = useDeleteNounMutation()

  const handleDeleteNoun = async () => {
    if (!noun) return

    try {
      const result = await deleteNoun(noun.id).unwrap()
      onSuccess(result.message)
      onClose()
    } catch (err: unknown) {
      const error = err as { data?: { error?: string } }
      onError(error?.data?.error || 'Error deleting noun')
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
          Are you sure you want to delete this noun?
        </Typography>
        {noun && (
          <Paper sx={{ p: 2, mt: 2, backgroundColor: 'grey.100' }}>
            <Typography variant='h6' gutterBottom>
              {noun.italian}
            </Typography>
            <Typography variant='body2'>
              <strong>Singular:</strong>{' '}
              {(noun.singolare as NounTranslations).it} /{' '}
              {(noun.singolare as NounTranslations).pt} /{' '}
              {(noun.singolare as NounTranslations).en}
            </Typography>
            <Typography variant='body2'>
              <strong>Plural:</strong> {(noun.plurale as NounTranslations).it} /{' '}
              {(noun.plurale as NounTranslations).pt} /{' '}
              {(noun.plurale as NounTranslations).en}
            </Typography>
          </Paper>
        )}
        <Alert severity='warning' sx={{ mt: 2 }}>
          This action cannot be undone. All associated statistics will also be
          deleted.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={deletingNoun}>
          Cancel
        </Button>
        <Button
          onClick={handleDeleteNoun}
          variant='contained'
          color='error'
          disabled={deletingNoun}
        >
          {deletingNoun ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
