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
import { ReactNode } from 'react'

interface DeleteConfirmationDialogProps<T> {
  open: boolean
  item: T | null
  entityName: string
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
  deleteMutation: (id: string) => Promise<{ message: string }>
  isDeleting: boolean
  renderItemDetails: (item: T) => ReactNode
  warningMessage?: string
}

export default function DeleteConfirmationDialog<T extends { id: string }>({
  open,
  item,
  entityName,
  onClose,
  onSuccess,
  onError,
  deleteMutation,
  isDeleting,
  renderItemDetails,
  warningMessage = 'This action cannot be undone.',
}: DeleteConfirmationDialogProps<T>) {
  const handleDelete = async () => {
    if (!item) return

    try {
      const result = await deleteMutation(item.id)
      onSuccess(result.message)
      onClose()
    } catch (err: unknown) {
      const error = err as { data?: { error?: string } }
      onError(error?.data?.error || `Error deleting ${entityName}`)
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
          Are you sure you want to delete this {entityName}?
        </Typography>
        {item && (
          <Paper sx={{ p: 2, mt: 2, backgroundColor: 'grey.100' }}>
            {renderItemDetails(item)}
          </Paper>
        )}
        <Alert severity='warning' sx={{ mt: 2 }}>
          {warningMessage}
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          variant='contained'
          color='error'
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
