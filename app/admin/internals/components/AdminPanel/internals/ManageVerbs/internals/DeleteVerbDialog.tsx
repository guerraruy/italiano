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
  Chip,
} from '@mui/material'

import { ImportedVerb, useDeleteVerbMutation } from '@/app/store/api'

interface DeleteVerbDialogProps {
  open: boolean
  verb: ImportedVerb | null
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export default function DeleteVerbDialog({
  open,
  verb,
  onClose,
  onSuccess,
  onError,
}: DeleteVerbDialogProps) {
  const [deleteVerb, { isLoading: deletingVerb }] = useDeleteVerbMutation()

  const handleDeleteVerb = async () => {
    if (!verb) return

    try {
      const result = await deleteVerb(verb.id).unwrap()
      onSuccess(result.message)
      onClose()
    } catch (err: unknown) {
      const error = err as { data?: { error?: string } }
      onError(error?.data?.error || 'Error deleting verb')
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
          Are you sure you want to delete this verb?
        </Typography>
        {verb && (
          <Paper sx={{ p: 2, mt: 2, backgroundColor: 'grey.100' }}>
            <Typography variant='h6' gutterBottom>
              {verb.italian}
            </Typography>
            <Typography variant='body2'>
              <strong>Portuguese:</strong> {verb.tr_ptBR}
            </Typography>
            <Typography variant='body2'>
              <strong>English:</strong> {verb.tr_en || 'N/A'}
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              {verb.regular ? (
                <Chip label='Regular' size='small' color='success' />
              ) : (
                <Chip label='Irregular' size='small' color='warning' />
              )}
              {verb.reflexive && (
                <Chip label='Reflexive' size='small' color='info' />
              )}
            </Box>
          </Paper>
        )}
        <Alert severity='warning' sx={{ mt: 2 }}>
          This action cannot be undone. All associated conjugations and
          statistics will also be deleted.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={deletingVerb}>
          Cancel
        </Button>
        <Button
          onClick={handleDeleteVerb}
          variant='contained'
          color='error'
          disabled={deletingVerb}
        >
          {deletingVerb ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
