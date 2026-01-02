'use client'
import { useState, useEffect } from 'react'
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
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
} from '@mui/material'
import {
  Delete,
  AdminPanelSettings,
  PersonRemove,
  Translate,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface UserData {
  id: string
  username: string
  email: string
  name: string | null
  admin: boolean
  createdAt: string
  _count: {
    lessons: number
  }
}

export default function AdminPanel() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    user: UserData | null
  }>({
    open: false,
    user: null,
  })

  useEffect(() => {
    if (!isAuthenticated || !user?.admin) {
      router.push('/')
      return
    }
    fetchUsers()
  }, [isAuthenticated, user, router])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('italiano_token')

      const response = await fetch('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      setUsers(data.users)
    } catch (err) {
      setError('Error loading users')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAdmin = async (
    userId: string,
    currentAdminStatus: boolean
  ) => {
    try {
      const token = localStorage.getItem('italiano_token')
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ admin: !currentAdminStatus }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update user')
      }

      setSuccessMessage(
        currentAdminStatus
          ? 'Admin permission removed successfully'
          : 'User promoted to admin successfully'
      )
      setTimeout(() => setSuccessMessage(null), 3000)
      fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating user')
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteDialog.user) return

    try {
      const token = localStorage.getItem('italiano_token')
      const response = await fetch(`/api/admin/users/${deleteDialog.user.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete user')
      }

      setSuccessMessage('User deleted successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
      setDeleteDialog({ open: false, user: null })
      fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting user')
      setTimeout(() => setError(null), 3000)
    }
  }

  if (!user?.admin) {
    return null
  }

  if (loading) {
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

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant='h4'>Administration Panel</Typography>
        <Box>
          <Button
            variant='outlined'
            startIcon={<Translate />}
            onClick={() => {
              console.log('Button clicked!')
              router.push('/admin/verbs')
            }}
          >
            Manage Verbs
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert
          severity='success'
          sx={{ mb: 2 }}
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

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
                      {new Date(userData.createdAt).toLocaleDateString('en-US')}
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
                              disabled={userData.id === user.id}
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
                                setDeleteDialog({ open: true, user: userData })
                              }
                              disabled={userData.id === user.id}
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
    </Box>
  )
}
