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
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  CircularProgress,
} from '@mui/material'
import {
  Delete,
  AdminPanelSettings,
  PersonRemove,
} from '@mui/icons-material'
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  type UserData,
} from '../../../store/api'
import { useAuth } from '../../../contexts/AuthContext'

interface ManageUsersProps {
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

export default function ManageUsers({ onError, onSuccess }: ManageUsersProps) {
  const { user } = useAuth()
  const {
    data: usersData,
    isLoading: loadingUsers,
  } = useGetUsersQuery()
  const [updateUser] = useUpdateUserMutation()
  const [deleteUser] = useDeleteUserMutation()

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    user: UserData | null
  }>({
    open: false,
    user: null,
  })

  const handleToggleAdmin = async (
    userId: string,
    currentAdminStatus: boolean
  ) => {
    try {
      await updateUser({
        userId,
        admin: !currentAdminStatus,
      }).unwrap()

      onSuccess(
        currentAdminStatus
          ? 'Admin permission removed successfully'
          : 'User promoted to admin successfully'
      )
    } catch (err) {
      const error = err as { data?: { error?: string } }
      onError(error?.data?.error || 'Error updating user')
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteDialog.user) return

    try {
      await deleteUser(deleteDialog.user.id).unwrap()

      onSuccess('User deleted successfully')
      setDeleteDialog({ open: false, user: null })
    } catch (err) {
      const error = err as { data?: { error?: string } }
      onError(error?.data?.error || 'Error deleting user')
    }
  }

  if (loadingUsers) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='400px'
      >
        <CircularProgress />
      </Box>
    )
  }

  const users = usersData?.users || []

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Manage Users ({users.length})
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align='center'>Admin</TableCell>
                  <TableCell align='center'>Lessons</TableCell>
                  <TableCell align='center'>Registered</TableCell>
                  <TableCell align='center'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((userData) => (
                  <TableRow key={userData.id}>
                    <TableCell>{userData.username}</TableCell>
                    <TableCell>{userData.email}</TableCell>
                    <TableCell>{userData.name || '-'}</TableCell>
                    <TableCell align='center'>
                      {userData.admin ? (
                        <Chip
                          label='Admin'
                          color='primary'
                          size='small'
                          icon={<AdminPanelSettings />}
                        />
                      ) : (
                        <Chip label='User' size='small' />
                      )}
                    </TableCell>
                    <TableCell align='center'>
                      {userData._count.lessons}
                    </TableCell>
                    <TableCell align='center'>
                      {userData.createdAt
                        ? new Date(userData.createdAt).toLocaleDateString(
                            'en-US'
                          )
                        : '-'}
                    </TableCell>
                    <TableCell align='center'>
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 1,
                          justifyContent: 'center',
                        }}
                      >
                        <Tooltip
                          title={
                            userData.admin
                              ? 'Remove admin permission'
                              : 'Make admin'
                          }
                        >
                          <span>
                            <IconButton
                              color={userData.admin ? 'warning' : 'primary'}
                              size='small'
                              onClick={() =>
                                handleToggleAdmin(userData.id, userData.admin)
                              }
                              disabled={userData.id === user?.id}
                            >
                              {userData.admin ? (
                                <PersonRemove />
                              ) : (
                                <AdminPanelSettings />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title='Delete user'>
                          <span>
                            <IconButton
                              color='error'
                              size='small'
                              onClick={() =>
                                setDeleteDialog({
                                  open: true,
                                  user: userData,
                                })
                              }
                              disabled={userData.id === user?.id}
                            >
                              <Delete />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, user: null })}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the user{' '}
            <strong>{deleteDialog.user?.username}</strong>?
          </Typography>
          <Typography color='error' sx={{ mt: 2 }}>
            This action cannot be undone. All user data will be permanently
            removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, user: null })}>
            Cancel
          </Button>
          <Button onClick={handleDeleteUser} color='error' variant='contained'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

