import React from 'react'

import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import '@testing-library/jest-dom'
import { useDeleteUserMutation } from '@/app/store/api'

import DeleteUserDialog from './DeleteUserDialog'

// Mock the API hook
jest.mock('@/app/store/api', () => ({
  useDeleteUserMutation: jest.fn(),
}))

// Mock the shared DeleteConfirmationDialog
jest.mock('../../shared/DeleteConfirmationDialog', () => ({
  __esModule: true,
  default: ({
    open,
    item,
    entityName,
    onClose,
    onSuccess,
    onError,
    deleteMutation,
    isDeleting,
    renderItemDetails,
    warningMessage,
  }: {
    open: boolean
    item: { id: string; username: string } | null
    entityName: string
    onClose: () => void
    onSuccess: (msg: string) => void
    onError: (msg: string) => void
    deleteMutation: (id: string) => Promise<{ message: string }>
    isDeleting: boolean
    renderItemDetails: (item: unknown) => React.ReactNode
    warningMessage: string
  }) => {
    if (!open || !item) return null
    return (
      <div data-testid="delete-confirmation-dialog">
        <h2>Delete {entityName}</h2>
        <div data-testid="item-details">{renderItemDetails(item)}</div>
        <p>{warningMessage}</p>
        <button onClick={onClose} disabled={isDeleting}>
          Cancel
        </button>
        <button
          onClick={async () => {
            try {
              const result = await deleteMutation(item.id)
              onSuccess(result.message)
              onClose()
            } catch (err) {
              onError(
                (err as { data?: { error?: string } })?.data?.error ||
                  'Failed to delete'
              )
            }
          }}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    )
  },
}))

const mockUser = {
  id: '1',
  username: 'testuser',
  email: 'testuser@example.com',
  name: 'Test User',
  admin: false,
  createdAt: '2024-01-01T00:00:00.000Z',
}

const mockUserWithoutName = {
  id: '2',
  username: 'johndoe',
  email: 'john@example.com',
  name: null,
  admin: false,
  createdAt: '2024-01-01T00:00:00.000Z',
}

describe('DeleteUserDialog', () => {
  const mockOnError = jest.fn()
  const mockOnSuccess = jest.fn()
  const mockOnClose = jest.fn()
  const mockDeleteUser = jest.fn()
  const mockUnwrap = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockDeleteUser.mockReturnValue({ unwrap: mockUnwrap })
    ;(useDeleteUserMutation as jest.Mock).mockReturnValue([
      mockDeleteUser,
      { isLoading: false },
    ])
  })

  it('does not render when open is false', () => {
    render(
      <DeleteUserDialog
        open={false}
        user={mockUser}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    expect(
      screen.queryByTestId('delete-confirmation-dialog')
    ).not.toBeInTheDocument()
  })

  it('does not render when user is null', () => {
    render(
      <DeleteUserDialog
        open={true}
        user={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    expect(
      screen.queryByTestId('delete-confirmation-dialog')
    ).not.toBeInTheDocument()
  })

  it('renders correctly when open with user', () => {
    render(
      <DeleteUserDialog
        open={true}
        user={mockUser}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    expect(screen.getByTestId('delete-confirmation-dialog')).toBeInTheDocument()
    expect(screen.getByText('Delete user')).toBeInTheDocument()
    expect(
      screen.getByText(
        /This action cannot be undone. All user data will be permanently removed./i
      )
    ).toBeInTheDocument()
  })

  it('displays user details correctly with name', () => {
    render(
      <DeleteUserDialog
        open={true}
        user={mockUser}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const itemDetails = screen.getByTestId('item-details')
    expect(itemDetails).toHaveTextContent('testuser')
    expect(itemDetails).toHaveTextContent('Email:')
    expect(itemDetails).toHaveTextContent('testuser@example.com')
    expect(itemDetails).toHaveTextContent('Name:')
    expect(itemDetails).toHaveTextContent('Test User')
  })

  it('displays user details correctly without name', () => {
    render(
      <DeleteUserDialog
        open={true}
        user={mockUserWithoutName}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const itemDetails = screen.getByTestId('item-details')
    expect(itemDetails).toHaveTextContent('johndoe')
    expect(itemDetails).toHaveTextContent('Email:')
    expect(itemDetails).toHaveTextContent('john@example.com')
    expect(itemDetails).not.toHaveTextContent('Name:')
  })

  it('calls onClose when cancel button is clicked', () => {
    render(
      <DeleteUserDialog
        open={true}
        user={mockUser}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('successfully deletes user', async () => {
    mockUnwrap.mockResolvedValue({ message: 'User deleted successfully' })

    render(
      <DeleteUserDialog
        open={true}
        user={mockUser}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockDeleteUser).toHaveBeenCalledWith('1')
      expect(mockOnSuccess).toHaveBeenCalledWith('User deleted successfully')
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('handles deletion error', async () => {
    const errorMessage = 'Failed to delete user'
    mockUnwrap.mockRejectedValue({
      data: { error: errorMessage },
    })

    render(
      <DeleteUserDialog
        open={true}
        user={mockUser}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockDeleteUser).toHaveBeenCalledWith('1')
      expect(mockOnError).toHaveBeenCalledWith(errorMessage)
    })
  })

  it('handles deletion error without error message', async () => {
    mockUnwrap.mockRejectedValue({})

    render(
      <DeleteUserDialog
        open={true}
        user={mockUser}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Failed to delete')
    })
  })

  it('disables buttons when deleting', () => {
    ;(useDeleteUserMutation as jest.Mock).mockReturnValue([
      mockDeleteUser,
      { isLoading: true },
    ])

    render(
      <DeleteUserDialog
        open={true}
        user={mockUser}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /deleting/i })
    const cancelButton = screen.getByRole('button', { name: /cancel/i })

    expect(deleteButton).toBeDisabled()
    expect(cancelButton).toBeDisabled()
  })

  it('shows deleting text when deletion is in progress', () => {
    ;(useDeleteUserMutation as jest.Mock).mockReturnValue([
      mockDeleteUser,
      { isLoading: true },
    ])

    render(
      <DeleteUserDialog
        open={true}
        user={mockUser}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    expect(screen.getByText('Deleting...')).toBeInTheDocument()
  })

  it('handles admin user deletion', async () => {
    const adminUser = { ...mockUser, admin: true }
    mockUnwrap.mockResolvedValue({ message: 'User deleted successfully' })

    render(
      <DeleteUserDialog
        open={true}
        user={adminUser}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockDeleteUser).toHaveBeenCalledWith('1')
      expect(mockOnSuccess).toHaveBeenCalledWith('User deleted successfully')
    })
  })
})
