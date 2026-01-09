import React from 'react'

import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import '@testing-library/jest-dom'
import { useAuth } from '@/app/contexts/AuthContext'
import { useGetUsersQuery, useUpdateUserMutation } from '@/app/store/api'

import UsersList from './UsersList'

// Mock the API hooks
jest.mock('@/app/store/api', () => ({
  useGetUsersQuery: jest.fn(),
  useUpdateUserMutation: jest.fn(),
}))

// Mock the Auth context
jest.mock('@/app/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}))

// Mock DeleteUserDialog component
jest.mock('./DeleteUserDialog', () => ({
  __esModule: true,
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
    <div data-testid="delete-dialog" data-open={open}>
      <button onClick={onClose}>Close Delete</button>
    </div>
  ),
}))

const mockUsers = [
  {
    id: '1',
    username: 'john_doe',
    email: 'john@example.com',
    name: 'John Doe',
    admin: true,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    username: 'jane_smith',
    email: 'jane@example.com',
    name: 'Jane Smith',
    admin: false,
    createdAt: '2023-01-02T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z',
  },
  {
    id: '3',
    username: 'bob_wilson',
    email: 'bob@example.com',
    name: null,
    admin: false,
    createdAt: '2023-01-03T00:00:00.000Z',
    updatedAt: '2023-01-03T00:00:00.000Z',
  },
]

const currentUser = { id: '1', username: 'john_doe', admin: true }

describe('UsersList', () => {
  const mockOnError = jest.fn()
  const mockOnSuccess = jest.fn()
  const mockUpdateUser = jest.fn()
  const mockUnwrap = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUpdateUser.mockReturnValue({ unwrap: mockUnwrap })
    ;(useAuth as jest.Mock).mockReturnValue({ user: currentUser })
    ;(useUpdateUserMutation as jest.Mock).mockReturnValue([
      mockUpdateUser,
      { isLoading: false },
    ])
  })

  it('renders loading state', () => {
    ;(useGetUsersQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    })

    const { container } = render(
      <UsersList onError={mockOnError} onSuccess={mockOnSuccess} />
    )

    // SkeletonTable renders MUI Skeleton components
    const skeletons = container.querySelectorAll('.MuiSkeleton-root')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders list of users', () => {
    ;(useGetUsersQuery as jest.Mock).mockReturnValue({
      data: { users: mockUsers },
      isLoading: false,
    })

    render(<UsersList onError={mockOnError} onSuccess={mockOnSuccess} />)

    expect(screen.getByText('john_doe')).toBeInTheDocument()
    expect(screen.getByText('jane_smith')).toBeInTheDocument()
    expect(screen.getByText('bob_wilson')).toBeInTheDocument()
    expect(screen.getByText('Manage Users (3)')).toBeInTheDocument()
  })

  it('displays user details correctly', () => {
    ;(useGetUsersQuery as jest.Mock).mockReturnValue({
      data: { users: mockUsers },
      isLoading: false,
    })

    render(<UsersList onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Check for emails
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()

    // Check for names
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('displays null name as dash', () => {
    ;(useGetUsersQuery as jest.Mock).mockReturnValue({
      data: { users: mockUsers },
      isLoading: false,
    })

    render(<UsersList onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Check that the dash is displayed for null name (bob_wilson)
    const tableRows = screen.getAllByRole('row')
    const bobRow = tableRows.find((row) =>
      row.textContent?.includes('bob_wilson')
    )
    expect(bobRow?.textContent).toContain('-')
  })

  it('displays admin chips correctly', () => {
    ;(useGetUsersQuery as jest.Mock).mockReturnValue({
      data: { users: mockUsers },
      isLoading: false,
    })

    render(<UsersList onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Check for admin chip (there's also the table header "Admin", so we get 2)
    const adminTexts = screen.getAllByText('Admin')
    // One is the header, one is the chip
    expect(adminTexts.length).toBe(2)
    // Check for user chips (jane and bob)
    expect(screen.getAllByText('User').length).toBe(2)
  })

  it('displays registration dates', () => {
    ;(useGetUsersQuery as jest.Mock).mockReturnValue({
      data: { users: mockUsers },
      isLoading: false,
    })

    render(<UsersList onError={mockOnError} onSuccess={mockOnSuccess} />)

    expect(screen.getByText('1/1/2023')).toBeInTheDocument()
    expect(screen.getByText('1/2/2023')).toBeInTheDocument()
    expect(screen.getByText('1/3/2023')).toBeInTheDocument()
  })

  it('displays dash for null registration date', () => {
    const usersWithNullDate = [
      {
        ...mockUsers[0],
        createdAt: null,
      },
    ]

    ;(useGetUsersQuery as jest.Mock).mockReturnValue({
      data: { users: usersWithNullDate },
      isLoading: false,
    })

    render(<UsersList onError={mockOnError} onSuccess={mockOnSuccess} />)

    const tableRows = screen.getAllByRole('row')
    const dataRow = tableRows.find((row) =>
      row.textContent?.includes('john_doe')
    )
    // Should have dash for null date
    expect(dataRow?.textContent).toContain('-')
  })

  describe('Filter functionality', () => {
    it('filters users by username', async () => {
      ;(useGetUsersQuery as jest.Mock).mockReturnValue({
        data: { users: mockUsers },
        isLoading: false,
      })

      render(<UsersList onError={mockOnError} onSuccess={mockOnSuccess} />)

      const searchInput = screen.getByPlaceholderText(
        'Filter by username, email, or name...'
      )
      fireEvent.change(searchInput, { target: { value: 'john' } })

      await waitFor(() => {
        expect(screen.getByText('john_doe')).toBeInTheDocument()
        expect(screen.queryByText('jane_smith')).not.toBeInTheDocument()
        expect(screen.queryByText('bob_wilson')).not.toBeInTheDocument()
      })

      expect(screen.getByText('Manage Users (1 of 3)')).toBeInTheDocument()
    })

    it('filters users by email', async () => {
      ;(useGetUsersQuery as jest.Mock).mockReturnValue({
        data: { users: mockUsers },
        isLoading: false,
      })

      render(<UsersList onError={mockOnError} onSuccess={mockOnSuccess} />)

      const searchInput = screen.getByPlaceholderText(
        'Filter by username, email, or name...'
      )
      fireEvent.change(searchInput, { target: { value: 'jane@example' } })

      await waitFor(() => {
        expect(screen.getByText('jane_smith')).toBeInTheDocument()
        expect(screen.queryByText('john_doe')).not.toBeInTheDocument()
        expect(screen.queryByText('bob_wilson')).not.toBeInTheDocument()
      })
    })

    it('filters users by name', async () => {
      ;(useGetUsersQuery as jest.Mock).mockReturnValue({
        data: { users: mockUsers },
        isLoading: false,
      })

      render(<UsersList onError={mockOnError} onSuccess={mockOnSuccess} />)

      const searchInput = screen.getByPlaceholderText(
        'Filter by username, email, or name...'
      )
      fireEvent.change(searchInput, { target: { value: 'Jane Smith' } })

      await waitFor(() => {
        expect(screen.getByText('jane_smith')).toBeInTheDocument()
        expect(screen.queryByText('john_doe')).not.toBeInTheDocument()
      })
    })

    it('filters are case-insensitive', async () => {
      ;(useGetUsersQuery as jest.Mock).mockReturnValue({
        data: { users: mockUsers },
        isLoading: false,
      })

      render(<UsersList onError={mockOnError} onSuccess={mockOnSuccess} />)

      const searchInput = screen.getByPlaceholderText(
        'Filter by username, email, or name...'
      )
      fireEvent.change(searchInput, { target: { value: 'JOHN' } })

      await waitFor(() => {
        expect(screen.getByText('john_doe')).toBeInTheDocument()
        expect(screen.queryByText('jane_smith')).not.toBeInTheDocument()
      })
    })

    it('clears filter when clear button is clicked', async () => {
      ;(useGetUsersQuery as jest.Mock).mockReturnValue({
        data: { users: mockUsers },
        isLoading: false,
      })

      render(<UsersList onError={mockOnError} onSuccess={mockOnSuccess} />)

      const searchInput = screen.getByPlaceholderText(
        'Filter by username, email, or name...'
      )
      fireEvent.change(searchInput, { target: { value: 'john' } })

      await waitFor(() => {
        expect(screen.queryByText('jane_smith')).not.toBeInTheDocument()
      })

      const clearButton = screen.getByLabelText('clear filter')
      fireEvent.click(clearButton)

      await waitFor(() => {
        expect(searchInput).toHaveValue('')
        expect(screen.getByText('john_doe')).toBeInTheDocument()
        expect(screen.getByText('jane_smith')).toBeInTheDocument()
        expect(screen.getByText('bob_wilson')).toBeInTheDocument()
      })
    })

    it('shows skeleton when loading', () => {
      ;(useGetUsersQuery as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
      })

      const { container } = render(
        <UsersList onError={mockOnError} onSuccess={mockOnSuccess} />
      )

      // When loading, the component renders SkeletonTable instead of the filter input
      const skeletons = container.querySelectorAll('.MuiSkeleton-root')
      expect(skeletons.length).toBeGreaterThan(0)

      // Filter input should not be present when showing skeleton
      expect(
        screen.queryByPlaceholderText('Filter by username, email, or name...')
      ).not.toBeInTheDocument()
    })
  })

  describe('Pagination', () => {
    it('displays pagination controls', () => {
      ;(useGetUsersQuery as jest.Mock).mockReturnValue({
        data: { users: mockUsers },
        isLoading: false,
      })

      render(<UsersList onError={mockOnError} onSuccess={mockOnSuccess} />)

      expect(screen.getByText(/1–3 of 3/)).toBeInTheDocument()
    })

    it('changes page when next page is clicked', async () => {
      const manyUsers = Array.from({ length: 30 }, (_, i) => ({
        id: `${i + 1}`,
        username: `user${i + 1}`,
        email: `user${i + 1}@example.com`,
        name: `User ${i + 1}`,
        admin: i === 0,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      }))

      ;(useGetUsersQuery as jest.Mock).mockReturnValue({
        data: { users: manyUsers },
        isLoading: false,
      })

      render(<UsersList onError={mockOnError} onSuccess={mockOnSuccess} />)

      // Should show first 25 by default
      expect(screen.getByText(/1–25 of 30/)).toBeInTheDocument()

      // Click next page
      const nextButton = screen.getByRole('button', { name: /next page/i })
      fireEvent.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText(/26–30 of 30/)).toBeInTheDocument()
      })
    })

    it('changes rows per page', async () => {
      const manyUsers = Array.from({ length: 30 }, (_, i) => ({
        id: `${i + 1}`,
        username: `user${i + 1}`,
        email: `user${i + 1}@example.com`,
        name: `User ${i + 1}`,
        admin: i === 0,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      }))

      ;(useGetUsersQuery as jest.Mock).mockReturnValue({
        data: { users: manyUsers },
        isLoading: false,
      })

      render(<UsersList onError={mockOnError} onSuccess={mockOnSuccess} />)

      // Change rows per page
      const rowsPerPageSelect = screen.getByRole('combobox', {
        name: /rows per page/i,
      })
      fireEvent.mouseDown(rowsPerPageSelect)

      const option10 = screen.getByRole('option', { name: '10' })
      fireEvent.click(option10)

      await waitFor(() => {
        expect(screen.getByText(/1–10 of 30/)).toBeInTheDocument()
      })
    })

    it('resets to first page when filtering', async () => {
      const manyUsers = Array.from({ length: 30 }, (_, i) => ({
        id: `${i + 1}`,
        username: `user${i + 1}`,
        email: `user${i + 1}@example.com`,
        name: `User ${i + 1}`,
        admin: i === 0,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      }))

      ;(useGetUsersQuery as jest.Mock).mockReturnValue({
        data: { users: manyUsers },
        isLoading: false,
      })

      render(<UsersList onError={mockOnError} onSuccess={mockOnSuccess} />)

      // Go to page 2
      const nextButton = screen.getByRole('button', { name: /next page/i })
      fireEvent.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText(/26–30 of 30/)).toBeInTheDocument()
      })

      // Apply filter
      const searchInput = screen.getByPlaceholderText(
        'Filter by username, email, or name...'
      )
      fireEvent.change(searchInput, { target: { value: 'user25' } })

      // Should reset to first page
      await waitFor(() => {
        expect(screen.getByText(/1–1 of 1/)).toBeInTheDocument()
      })
    })
  })

  describe('Toggle admin functionality', () => {
    it('promotes user to admin successfully', async () => {
      ;(useGetUsersQuery as jest.Mock).mockReturnValue({
        data: { users: mockUsers },
        isLoading: false,
      })
      mockUnwrap.mockResolvedValue({})

      render(<UsersList onError={mockOnError} onSuccess={mockOnSuccess} />)

      // Click the promote button for jane_smith (non-admin)
      const adminButtons = screen.getAllByTestId('AdminPanelSettingsIcon')
      // The second AdminPanelSettingsIcon is for promoting jane to admin
      const promoteButton = adminButtons[1]
      if (!promoteButton) throw new Error('Promote button not found')
      fireEvent.click(promoteButton.closest('button')!)

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith({
          userId: '2',
          admin: true,
        })
        expect(mockOnSuccess).toHaveBeenCalledWith(
          'User promoted to admin successfully'
        )
      })
    })

    it('removes admin permission successfully', async () => {
      // Set current user as different from the admin being demoted
      ;(useAuth as jest.Mock).mockReturnValue({
        user: { id: '999', username: 'other_admin', admin: true },
      })
      ;(useGetUsersQuery as jest.Mock).mockReturnValue({
        data: { users: mockUsers },
        isLoading: false,
      })
      mockUnwrap.mockResolvedValue({})

      render(<UsersList onError={mockOnError} onSuccess={mockOnSuccess} />)

      // Click the remove admin button for john_doe (admin)
      const removeButtons = screen.getAllByTestId('PersonRemoveIcon')
      const removeButton = removeButtons[0]
      if (!removeButton) throw new Error('Remove button not found')
      fireEvent.click(removeButton.closest('button')!)

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith({
          userId: '1',
          admin: false,
        })
        expect(mockOnSuccess).toHaveBeenCalledWith(
          'Admin permission removed successfully'
        )
      })
    })

    it('handles toggle admin error', async () => {
      ;(useGetUsersQuery as jest.Mock).mockReturnValue({
        data: { users: mockUsers },
        isLoading: false,
      })
      mockUnwrap.mockRejectedValue({
        data: { error: 'Failed to update user' },
      })

      render(<UsersList onError={mockOnError} onSuccess={mockOnSuccess} />)

      // Click the promote button for jane_smith (non-admin)
      const adminButtons = screen.getAllByTestId('AdminPanelSettingsIcon')
      const promoteButton = adminButtons[1]
      if (!promoteButton) throw new Error('Promote button not found')
      fireEvent.click(promoteButton.closest('button')!)

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Failed to update user')
      })
    })

    it('handles toggle admin error without error message', async () => {
      ;(useGetUsersQuery as jest.Mock).mockReturnValue({
        data: { users: mockUsers },
        isLoading: false,
      })
      mockUnwrap.mockRejectedValue({})

      render(<UsersList onError={mockOnError} onSuccess={mockOnSuccess} />)

      // Click the promote button for jane_smith (non-admin)
      const adminButtons = screen.getAllByTestId('AdminPanelSettingsIcon')
      const promoteButton = adminButtons[1]
      if (!promoteButton) throw new Error('Promote button not found')
      fireEvent.click(promoteButton.closest('button')!)

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Error updating user')
      })
    })

    it('disables admin toggle button for current user', () => {
      ;(useGetUsersQuery as jest.Mock).mockReturnValue({
        data: { users: mockUsers },
        isLoading: false,
      })

      render(<UsersList onError={mockOnError} onSuccess={mockOnSuccess} />)

      // Find the row for john_doe (current user)
      const tableRows = screen.getAllByRole('row')
      const johnRow = tableRows.find((row) =>
        row.textContent?.includes('john_doe')
      )

      // The admin toggle button for john should be disabled
      const buttons = johnRow?.querySelectorAll('button')
      const adminButton = Array.from(buttons || []).find((btn) =>
        btn.querySelector('[data-testid="PersonRemoveIcon"]')
      )
      expect(adminButton).toBeDisabled()
    })
  })

  describe('Delete functionality', () => {
    it('opens delete dialog when delete button is clicked', () => {
      ;(useGetUsersQuery as jest.Mock).mockReturnValue({
        data: { users: mockUsers },
        isLoading: false,
      })

      render(<UsersList onError={mockOnError} onSuccess={mockOnSuccess} />)

      const deleteButtons = screen.getAllByTestId('DeleteOutlinedIcon')
      // Click delete for jane_smith (second user, not current user)
      const deleteButton = deleteButtons[1]
      if (!deleteButton) throw new Error('Delete button not found')
      fireEvent.click(deleteButton.closest('button')!)

      const dialog = screen.getByTestId('delete-dialog')
      expect(dialog).toHaveAttribute('data-open', 'true')
    })

    it('closes delete dialog when close is triggered', () => {
      ;(useGetUsersQuery as jest.Mock).mockReturnValue({
        data: { users: mockUsers },
        isLoading: false,
      })

      render(<UsersList onError={mockOnError} onSuccess={mockOnSuccess} />)

      const deleteButtons = screen.getAllByTestId('DeleteOutlinedIcon')
      const deleteButton = deleteButtons[1]
      if (!deleteButton) throw new Error('Delete button not found')
      fireEvent.click(deleteButton.closest('button')!)

      const closeButton = screen.getByText('Close Delete')
      fireEvent.click(closeButton)

      const dialog = screen.getByTestId('delete-dialog')
      expect(dialog).toHaveAttribute('data-open', 'false')
    })

    it('disables delete button for current user', () => {
      ;(useGetUsersQuery as jest.Mock).mockReturnValue({
        data: { users: mockUsers },
        isLoading: false,
      })

      render(<UsersList onError={mockOnError} onSuccess={mockOnSuccess} />)

      // Find the row for john_doe (current user)
      const tableRows = screen.getAllByRole('row')
      const johnRow = tableRows.find((row) =>
        row.textContent?.includes('john_doe')
      )

      // The delete button for john should be disabled
      const buttons = johnRow?.querySelectorAll('button')
      const deleteButton = Array.from(buttons || []).find((btn) =>
        btn.querySelector('[data-testid="DeleteOutlinedIcon"]')
      )
      expect(deleteButton).toBeDisabled()
    })
  })

  describe('Tooltips', () => {
    it('shows correct tooltip for admin user toggle', async () => {
      // Set current user as different from the admin
      ;(useAuth as jest.Mock).mockReturnValue({
        user: { id: '999', username: 'other_admin', admin: true },
      })
      ;(useGetUsersQuery as jest.Mock).mockReturnValue({
        data: { users: mockUsers },
        isLoading: false,
      })

      render(<UsersList onError={mockOnError} onSuccess={mockOnSuccess} />)

      // Find the row for john_doe (admin)
      const removeButtons = screen.getAllByTestId('PersonRemoveIcon')
      const removeButton = removeButtons[0]
      if (!removeButton) throw new Error('Remove button not found')

      // Hover over the button to show tooltip
      fireEvent.mouseOver(removeButton.closest('button')!)

      await waitFor(() => {
        expect(screen.getByText('Remove admin permission')).toBeInTheDocument()
      })
    })

    it('shows correct tooltip for non-admin user toggle', async () => {
      ;(useGetUsersQuery as jest.Mock).mockReturnValue({
        data: { users: mockUsers },
        isLoading: false,
      })

      render(<UsersList onError={mockOnError} onSuccess={mockOnSuccess} />)

      // Find the promote button for jane_smith (non-admin)
      const adminButtons = screen.getAllByTestId('AdminPanelSettingsIcon')
      const promoteButton = adminButtons[1]
      if (!promoteButton) throw new Error('Promote button not found')

      // Hover over the button to show tooltip
      fireEvent.mouseOver(promoteButton.closest('button')!)

      await waitFor(() => {
        expect(screen.getByText('Make admin')).toBeInTheDocument()
      })
    })

    it('shows delete tooltip', async () => {
      ;(useGetUsersQuery as jest.Mock).mockReturnValue({
        data: { users: mockUsers },
        isLoading: false,
      })

      render(<UsersList onError={mockOnError} onSuccess={mockOnSuccess} />)

      const deleteButtons = screen.getAllByTestId('DeleteOutlinedIcon')
      const deleteButton = deleteButtons[1]
      if (!deleteButton) throw new Error('Delete button not found')

      // Hover over the button to show tooltip
      fireEvent.mouseOver(deleteButton.closest('button')!)

      await waitFor(() => {
        expect(screen.getByText('Delete user')).toBeInTheDocument()
      })
    })
  })

  describe('Table structure', () => {
    it('renders table headers correctly', () => {
      ;(useGetUsersQuery as jest.Mock).mockReturnValue({
        data: { users: mockUsers },
        isLoading: false,
      })

      render(<UsersList onError={mockOnError} onSuccess={mockOnSuccess} />)

      expect(screen.getByText('Username')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
      // 'Admin' appears both as header and chip, use getAllByText
      expect(screen.getAllByText('Admin').length).toBeGreaterThan(0)
      expect(screen.getByText('Registered')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })
  })
})
