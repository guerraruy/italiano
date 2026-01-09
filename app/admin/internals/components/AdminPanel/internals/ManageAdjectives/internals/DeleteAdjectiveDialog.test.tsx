import React from 'react'

import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import '@testing-library/jest-dom'
import { useDeleteAdjectiveMutation } from '@/app/store/api'

import DeleteAdjectiveDialog from './DeleteAdjectiveDialog'

// Mock the API hook
jest.mock('@/app/store/api', () => ({
  useDeleteAdjectiveMutation: jest.fn(),
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
    item: { id: string; italian: string } | null
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

const mockAdjective = {
  id: '1',
  italian: 'bello',
  maschile: {
    singolare: {
      it: 'bello',
      pt: 'bonito',
      en: 'beautiful',
    },
    plurale: {
      it: 'belli',
      pt: 'bonitos',
      en: 'beautiful',
    },
  },
  femminile: {
    singolare: {
      it: 'bella',
      pt: 'bonita',
      en: 'beautiful',
    },
    plurale: {
      it: 'belle',
      pt: 'bonitas',
      en: 'beautiful',
    },
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

describe('DeleteAdjectiveDialog', () => {
  const mockOnError = jest.fn()
  const mockOnSuccess = jest.fn()
  const mockOnClose = jest.fn()
  const mockDeleteAdjective = jest.fn()
  const mockUnwrap = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockDeleteAdjective.mockReturnValue({ unwrap: mockUnwrap })
    ;(useDeleteAdjectiveMutation as jest.Mock).mockReturnValue([
      mockDeleteAdjective,
      { isLoading: false },
    ])
  })

  it('does not render when open is false', () => {
    render(
      <DeleteAdjectiveDialog
        open={false}
        adjective={mockAdjective}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    expect(
      screen.queryByTestId('delete-confirmation-dialog')
    ).not.toBeInTheDocument()
  })

  it('does not render when adjective is null', () => {
    render(
      <DeleteAdjectiveDialog
        open={true}
        adjective={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    expect(
      screen.queryByTestId('delete-confirmation-dialog')
    ).not.toBeInTheDocument()
  })

  it('renders correctly when open with adjective', () => {
    render(
      <DeleteAdjectiveDialog
        open={true}
        adjective={mockAdjective}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    expect(screen.getByTestId('delete-confirmation-dialog')).toBeInTheDocument()
    expect(screen.getByText('Delete adjective')).toBeInTheDocument()
    expect(
      screen.getByText(
        /This action cannot be undone. All associated statistics will also be deleted./i
      )
    ).toBeInTheDocument()
  })

  it('displays adjective details correctly', () => {
    render(
      <DeleteAdjectiveDialog
        open={true}
        adjective={mockAdjective}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const itemDetails = screen.getByTestId('item-details')
    // Italian word
    expect(itemDetails).toHaveTextContent('bello')
    // Masculine singular
    expect(itemDetails).toHaveTextContent('Masculine Singular:')
    expect(itemDetails).toHaveTextContent('bonito')
    expect(itemDetails).toHaveTextContent('beautiful')
    // Masculine plural
    expect(itemDetails).toHaveTextContent('Masculine Plural:')
    expect(itemDetails).toHaveTextContent('belli')
    expect(itemDetails).toHaveTextContent('bonitos')
    // Feminine singular
    expect(itemDetails).toHaveTextContent('Feminine Singular:')
    expect(itemDetails).toHaveTextContent('bella')
    expect(itemDetails).toHaveTextContent('bonita')
    // Feminine plural
    expect(itemDetails).toHaveTextContent('Feminine Plural:')
    expect(itemDetails).toHaveTextContent('belle')
    expect(itemDetails).toHaveTextContent('bonitas')
  })

  it('calls onClose when cancel button is clicked', () => {
    render(
      <DeleteAdjectiveDialog
        open={true}
        adjective={mockAdjective}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('successfully deletes adjective', async () => {
    mockUnwrap.mockResolvedValue({ message: 'Adjective deleted successfully' })

    render(
      <DeleteAdjectiveDialog
        open={true}
        adjective={mockAdjective}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockDeleteAdjective).toHaveBeenCalledWith('1')
      expect(mockOnSuccess).toHaveBeenCalledWith(
        'Adjective deleted successfully'
      )
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('handles deletion error', async () => {
    const errorMessage = 'Failed to delete adjective'
    mockUnwrap.mockRejectedValue({
      data: { error: errorMessage },
    })

    render(
      <DeleteAdjectiveDialog
        open={true}
        adjective={mockAdjective}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockDeleteAdjective).toHaveBeenCalledWith('1')
      expect(mockOnError).toHaveBeenCalledWith(errorMessage)
    })
  })

  it('handles deletion error without error message', async () => {
    mockUnwrap.mockRejectedValue({})

    render(
      <DeleteAdjectiveDialog
        open={true}
        adjective={mockAdjective}
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
    ;(useDeleteAdjectiveMutation as jest.Mock).mockReturnValue([
      mockDeleteAdjective,
      { isLoading: true },
    ])

    render(
      <DeleteAdjectiveDialog
        open={true}
        adjective={mockAdjective}
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
    ;(useDeleteAdjectiveMutation as jest.Mock).mockReturnValue([
      mockDeleteAdjective,
      { isLoading: true },
    ])

    render(
      <DeleteAdjectiveDialog
        open={true}
        adjective={mockAdjective}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    expect(screen.getByText('Deleting...')).toBeInTheDocument()
  })
})
