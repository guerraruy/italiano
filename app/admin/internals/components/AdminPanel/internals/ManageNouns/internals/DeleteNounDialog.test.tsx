import React from 'react'

import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import '@testing-library/jest-dom'
import { useDeleteNounMutation } from '@/app/store/api'

import DeleteNounDialog from './DeleteNounDialog'

// Mock the API hook
jest.mock('@/app/store/api', () => ({
  useDeleteNounMutation: jest.fn(),
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

const mockNoun = {
  id: '1',
  italian: 'orologio',
  singolare: {
    it: "l'orologio",
    pt: 'o relógio',
    en: 'the watch',
  },
  plurale: {
    it: 'gli orologi',
    pt: 'os relógios',
    en: 'the watches',
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

describe('DeleteNounDialog', () => {
  const mockOnError = jest.fn()
  const mockOnSuccess = jest.fn()
  const mockOnClose = jest.fn()
  const mockDeleteNoun = jest.fn()
  const mockUnwrap = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockDeleteNoun.mockReturnValue({ unwrap: mockUnwrap })
    ;(useDeleteNounMutation as jest.Mock).mockReturnValue([
      mockDeleteNoun,
      { isLoading: false },
    ])
  })

  it('does not render when open is false', () => {
    render(
      <DeleteNounDialog
        open={false}
        noun={mockNoun}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    expect(
      screen.queryByTestId('delete-confirmation-dialog')
    ).not.toBeInTheDocument()
  })

  it('does not render when noun is null', () => {
    render(
      <DeleteNounDialog
        open={true}
        noun={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    expect(
      screen.queryByTestId('delete-confirmation-dialog')
    ).not.toBeInTheDocument()
  })

  it('renders correctly when open with noun', () => {
    render(
      <DeleteNounDialog
        open={true}
        noun={mockNoun}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    expect(screen.getByTestId('delete-confirmation-dialog')).toBeInTheDocument()
    expect(screen.getByText('Delete noun')).toBeInTheDocument()
    expect(
      screen.getByText(
        /This action cannot be undone. All associated statistics will also be deleted./i
      )
    ).toBeInTheDocument()
  })

  it('displays noun details correctly', () => {
    render(
      <DeleteNounDialog
        open={true}
        noun={mockNoun}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const itemDetails = screen.getByTestId('item-details')
    expect(itemDetails).toHaveTextContent('orologio')
    expect(itemDetails).toHaveTextContent('Singular:')
    expect(itemDetails).toHaveTextContent("l'orologio")
    expect(itemDetails).toHaveTextContent('o relógio')
    expect(itemDetails).toHaveTextContent('the watch')
    expect(itemDetails).toHaveTextContent('Plural:')
    expect(itemDetails).toHaveTextContent('gli orologi')
    expect(itemDetails).toHaveTextContent('os relógios')
    expect(itemDetails).toHaveTextContent('the watches')
  })

  it('calls onClose when cancel button is clicked', () => {
    render(
      <DeleteNounDialog
        open={true}
        noun={mockNoun}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('successfully deletes noun', async () => {
    mockUnwrap.mockResolvedValue({ message: 'Noun deleted successfully' })

    render(
      <DeleteNounDialog
        open={true}
        noun={mockNoun}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockDeleteNoun).toHaveBeenCalledWith('1')
      expect(mockOnSuccess).toHaveBeenCalledWith('Noun deleted successfully')
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('handles deletion error', async () => {
    const errorMessage = 'Failed to delete noun'
    mockUnwrap.mockRejectedValue({
      data: { error: errorMessage },
    })

    render(
      <DeleteNounDialog
        open={true}
        noun={mockNoun}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockDeleteNoun).toHaveBeenCalledWith('1')
      expect(mockOnError).toHaveBeenCalledWith(errorMessage)
    })
  })

  it('handles deletion error without error message', async () => {
    mockUnwrap.mockRejectedValue({})

    render(
      <DeleteNounDialog
        open={true}
        noun={mockNoun}
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
    ;(useDeleteNounMutation as jest.Mock).mockReturnValue([
      mockDeleteNoun,
      { isLoading: true },
    ])

    render(
      <DeleteNounDialog
        open={true}
        noun={mockNoun}
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
    ;(useDeleteNounMutation as jest.Mock).mockReturnValue([
      mockDeleteNoun,
      { isLoading: true },
    ])

    render(
      <DeleteNounDialog
        open={true}
        noun={mockNoun}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    expect(screen.getByText('Deleting...')).toBeInTheDocument()
  })
})
