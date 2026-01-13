import React from 'react'

import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import '@testing-library/jest-dom'

import DeleteConfirmationDialog from './DeleteConfirmationDialog'

interface MockItem {
  id: string
  name: string
}

const mockItem: MockItem = {
  id: 'test-id-123',
  name: 'Test Item',
}

describe('DeleteConfirmationDialog', () => {
  const mockOnClose = jest.fn()
  const mockOnSuccess = jest.fn()
  const mockOnError = jest.fn()
  const mockDeleteMutation = jest.fn()
  const mockRenderItemDetails = jest.fn((item: MockItem) => (
    <div data-testid="item-details">
      <span>ID: {item.id}</span>
      <span>Name: {item.name}</span>
    </div>
  ))

  const defaultProps = {
    open: true,
    item: mockItem,
    entityName: 'item',
    onClose: mockOnClose,
    onSuccess: mockOnSuccess,
    onError: mockOnError,
    deleteMutation: mockDeleteMutation,
    isDeleting: false,
    renderItemDetails: mockRenderItemDetails,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders the dialog when open is true', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Confirm Deletion')).toBeInTheDocument()
    })

    it('does not render the dialog content when open is false', () => {
      render(<DeleteConfirmationDialog {...defaultProps} open={false} />)

      expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument()
    })

    it('displays the entity name in the confirmation message', () => {
      render(
        <DeleteConfirmationDialog {...defaultProps} entityName="adjective" />
      )

      expect(
        screen.getByText('Are you sure you want to delete this adjective?')
      ).toBeInTheDocument()
    })

    it('renders item details when item is provided', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />)

      expect(screen.getByTestId('item-details')).toBeInTheDocument()
      expect(screen.getByText('ID: test-id-123')).toBeInTheDocument()
      expect(screen.getByText('Name: Test Item')).toBeInTheDocument()
      expect(mockRenderItemDetails).toHaveBeenCalledWith(mockItem)
    })

    it('does not render item details when item is null', () => {
      render(<DeleteConfirmationDialog {...defaultProps} item={null} />)

      expect(screen.queryByTestId('item-details')).not.toBeInTheDocument()
      expect(mockRenderItemDetails).not.toHaveBeenCalled()
    })

    it('displays the default warning message', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />)

      expect(
        screen.getByText('This action cannot be undone.')
      ).toBeInTheDocument()
    })

    it('displays a custom warning message when provided', () => {
      const customWarning = 'All related data will be permanently deleted.'
      render(
        <DeleteConfirmationDialog
          {...defaultProps}
          warningMessage={customWarning}
        />
      )

      expect(screen.getByText(customWarning)).toBeInTheDocument()
      expect(
        screen.queryByText('This action cannot be undone.')
      ).not.toBeInTheDocument()
    })

    it('renders Cancel and Delete buttons', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /delete/i })
      ).toBeInTheDocument()
    })

    it('renders the warning icon', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />)

      expect(screen.getByTestId('WarningIcon')).toBeInTheDocument()
    })
  })

  describe('button interactions', () => {
    it('calls onClose when Cancel button is clicked', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('delete functionality', () => {
    it('calls deleteMutation with item id when Delete button is clicked', async () => {
      mockDeleteMutation.mockResolvedValue({ message: 'Deleted successfully' })
      render(<DeleteConfirmationDialog {...defaultProps} />)

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(mockDeleteMutation).toHaveBeenCalledWith('test-id-123')
      })
    })

    it('calls onSuccess and onClose on successful deletion', async () => {
      const successMessage = 'Item deleted successfully'
      mockDeleteMutation.mockResolvedValue({ message: successMessage })
      render(<DeleteConfirmationDialog {...defaultProps} />)

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(successMessage)
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('calls onError with error message on deletion failure', async () => {
      const errorMessage = 'Failed to delete item'
      mockDeleteMutation.mockRejectedValue({
        data: { error: errorMessage },
      })
      render(<DeleteConfirmationDialog {...defaultProps} />)

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(errorMessage)
      })
    })

    it('calls onError with fallback message when error has no message', async () => {
      mockDeleteMutation.mockRejectedValue({})
      render(
        <DeleteConfirmationDialog {...defaultProps} entityName="adjective" />
      )

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Error deleting adjective')
      })
    })

    it('does not call deleteMutation when item is null', async () => {
      render(<DeleteConfirmationDialog {...defaultProps} item={null} />)

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(mockDeleteMutation).not.toHaveBeenCalled()
      })
    })

    it('does not call onClose on error', async () => {
      mockDeleteMutation.mockRejectedValue({
        data: { error: 'Some error' },
      })
      render(<DeleteConfirmationDialog {...defaultProps} />)

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled()
      })
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  describe('loading state', () => {
    it('disables Cancel button when isDeleting is true', () => {
      render(<DeleteConfirmationDialog {...defaultProps} isDeleting={true} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      expect(cancelButton).toBeDisabled()
    })

    it('disables Delete button when isDeleting is true', () => {
      render(<DeleteConfirmationDialog {...defaultProps} isDeleting={true} />)

      const deleteButton = screen.getByRole('button', { name: /deleting/i })
      expect(deleteButton).toBeDisabled()
    })

    it('shows "Deleting..." text when isDeleting is true', () => {
      render(<DeleteConfirmationDialog {...defaultProps} isDeleting={true} />)

      expect(screen.getByText('Deleting...')).toBeInTheDocument()
      expect(screen.queryByText('Delete')).not.toBeInTheDocument()
    })

    it('shows "Delete" text when isDeleting is false', () => {
      render(<DeleteConfirmationDialog {...defaultProps} isDeleting={false} />)

      expect(screen.getByText('Delete')).toBeInTheDocument()
      expect(screen.queryByText('Deleting...')).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has proper dialog role', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('has accessible dialog title', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />)

      expect(
        screen.getByRole('heading', { name: /confirm deletion/i })
      ).toBeInTheDocument()
    })
  })
})
