'use client'
import { Typography } from '@mui/material'

import { useDeleteUserMutation, type UserData } from '@/app/store/api'
import DeleteConfirmationDialog from '../../shared/DeleteConfirmationDialog'

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

  const renderUserDetails = (user: UserData) => (
    <>
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
    </>
  )

  return (
    <DeleteConfirmationDialog
      open={open}
      item={user}
      entityName='user'
      onClose={onClose}
      onSuccess={onSuccess}
      onError={onError}
      deleteMutation={async (id) => {
        await deleteUser(id).unwrap()
        return { message: 'User deleted successfully' }
      }}
      isDeleting={deletingUser}
      renderItemDetails={renderUserDetails}
      warningMessage='This action cannot be undone. All user data will be permanently removed.'
    />
  )
}
