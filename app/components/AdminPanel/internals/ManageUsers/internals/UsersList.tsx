'use client'
import { useState, useMemo, useDeferredValue, useTransition } from 'react'
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
  Tooltip,
  CircularProgress,
  TextField,
  InputAdornment,
  TablePagination,
} from '@mui/material'
import {
  DeleteOutlined,
  AdminPanelSettings,
  PersonRemove,
  Search,
  Clear,
} from '@mui/icons-material'
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  type UserData,
} from '../../../../../store/api'
import { useAuth } from '../../../../../contexts/AuthContext'
import { DeleteUserDialog } from './'

interface UsersListProps {
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

export default function UsersList({ onError, onSuccess }: UsersListProps) {
  const { user } = useAuth()
  const { data: usersData, isLoading: loadingUsers } = useGetUsersQuery()
  const [updateUser] = useUpdateUserMutation()

  // Filter state with transition
  const [filterText, setFilterText] = useState('')
  const [isPending, startTransition] = useTransition()

  // Pagination state
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  // Defer the filter text to keep input responsive
  const deferredFilterText = useDeferredValue(filterText)

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

  const handleOpenDeleteDialog = (userData: UserData) => {
    setDeleteDialog({ open: true, user: userData })
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, user: null })
  }

  // Filter users based on deferred search text (memoized for performance)
  const filteredUsers = useMemo(() => {
    const users = usersData?.users || []
    if (!deferredFilterText) return users
    const searchTerm = deferredFilterText.toLowerCase()
    return users.filter(
      (userData) =>
        userData.username.toLowerCase().includes(searchTerm) ||
        userData.email.toLowerCase().includes(searchTerm) ||
        (userData.name && userData.name.toLowerCase().includes(searchTerm))
    )
  }, [usersData?.users, deferredFilterText])

  // Paginated users
  const paginatedUsers = useMemo(() => {
    const startIndex = page * rowsPerPage
    return filteredUsers.slice(startIndex, startIndex + rowsPerPage)
  }, [filteredUsers, page, rowsPerPage])

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

  return (
    <>
      <Card>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant='h6'>
              Manage Users ({filteredUsers.length}
              {deferredFilterText && ` of ${usersData?.users?.length || 0}`})
            </Typography>
            <TextField
              size='small'
              placeholder='Filter by username, email, or name...'
              value={filterText}
              onChange={(e) => {
                const value = e.target.value
                setFilterText(value)
                startTransition(() => {
                  setPage(0) // Reset to first page on filter change
                })
              }}
              sx={{ minWidth: 300 }}
              disabled={loadingUsers}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Search fontSize='small' />
                  </InputAdornment>
                ),
                endAdornment: filterText && (
                  <InputAdornment position='end'>
                    <IconButton
                      size='small'
                      onClick={() => setFilterText('')}
                      edge='end'
                      aria-label='clear filter'
                    >
                      <Clear fontSize='small' />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <TableContainer
            sx={{ opacity: isPending ? 0.5 : 1, transition: 'opacity 0.2s' }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align='center'>Admin</TableCell>
                  <TableCell align='center'>Registered</TableCell>
                  <TableCell align='center'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.map((userData) => (
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
                              onClick={() => handleOpenDeleteDialog(userData)}
                              disabled={userData.id === user?.id}
                            >
                              <DeleteOutlined />
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

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <TablePagination
              component='div'
              count={filteredUsers.length}
              page={page}
              onPageChange={(_, newPage) => {
                startTransition(() => {
                  setPage(newPage)
                })
              }}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                startTransition(() => {
                  setRowsPerPage(parseInt(e.target.value, 10))
                  setPage(0)
                })
              }}
              rowsPerPageOptions={[10, 25, 50, 100]}
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteUserDialog
        open={deleteDialog.open}
        user={deleteDialog.user}
        onClose={handleCloseDeleteDialog}
        onSuccess={onSuccess}
        onError={onError}
      />
    </>
  )
}
