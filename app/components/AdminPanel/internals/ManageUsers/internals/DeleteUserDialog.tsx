'use client'
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Paper,
} from '@mui/material'
import { Warning } from '@mui/icons-material'
import {
  useDeleteUserMutation,
  type UserData,
} from '../../../../../store/api'

interface DeleteUserDialogProps {
  open: boolean
  user: UserData | null
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export default function DeleteUserDialog({
  open,
  user,
  onClose,
  onSuccess,
  onError,
}: DeleteUserDialogProps) {
  const [deleteUser, { isLoading: deletingUser }] = useDeleteUserMutation()

  const handleDeleteUser = async () => {
    if (!user) return

    try {
      await deleteUser(user.id).unwrap()
      onSuccess('User deleted successfully')
      onClose()
    } catch (err) {
      const error = err as { data?: { error?: string } }
      onError(error?.data?.error || 'Error deleting user')
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
          Are you sure you want to delete this user?
        </Typography>
        {user && (
          <Paper sx={{ p: 2, mt: 2, backgroundColor: 'grey.100' }}>
            <Typography variant='h6' gutterBottom>
              {user.username}
            </Typography>
            <Typography variant='body2'>
              <strong>Email:</strong> {user.email}
            </Typography>
            {user.name && (
              <Typography variant='body2'>
                <strong>Name:</strong> {user.name}
              </Typography>
            )}
            <Typography variant='body2'>
              <strong>Lessons:</strong> {user._count.lessons}
            </Typography>
          </Paper>
        )}
        <Alert severity='warning' sx={{ mt: 2 }}>
          This action cannot be undone. All user data will be permanently
          removed.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={deletingUser}>
          Cancel
        </Button>
        <Button
          onClick={handleDeleteUser}
          variant='contained'
          color='error'
          disabled={deletingUser}
        >
          {deletingUser ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

