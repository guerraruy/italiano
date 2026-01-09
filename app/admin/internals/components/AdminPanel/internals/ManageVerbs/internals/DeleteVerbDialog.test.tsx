import React from 'react'

import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import '@testing-library/jest-dom'
import { useDeleteVerbMutation } from '@/app/store/api'

import DeleteVerbDialog from './DeleteVerbDialog'

// Mock the API hook
jest.mock('@/app/store/api', () => ({
  useDeleteVerbMutation: jest.fn(),
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

const mockVerb = {
  id: '1',
  italian: 'parlare',
  regular: true,
  reflexive: false,
  tr_ptBR: 'falar',
  tr_en: 'to speak',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

const mockIrregularReflexiveVerb = {
  id: '2',
  italian: 'svegliarsi',
  regular: false,
  reflexive: true,
  tr_ptBR: 'acordar-se',
  tr_en: 'to wake up',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

const mockVerbWithoutEnglish = {
  id: '3',
  italian: 'mangiare',
  regular: true,
  reflexive: false,
  tr_ptBR: 'comer',
  tr_en: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

describe('DeleteVerbDialog', () => {
  const mockOnError = jest.fn()
  const mockOnSuccess = jest.fn()
  const mockOnClose = jest.fn()
  const mockDeleteVerb = jest.fn()
  const mockUnwrap = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockDeleteVerb.mockReturnValue({ unwrap: mockUnwrap })
    ;(useDeleteVerbMutation as jest.Mock).mockReturnValue([
      mockDeleteVerb,
      { isLoading: false },
    ])
  })

  it('does not render when open is false', () => {
    render(
      <DeleteVerbDialog
        open={false}
        verb={mockVerb}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    expect(
      screen.queryByTestId('delete-confirmation-dialog')
    ).not.toBeInTheDocument()
  })

  it('does not render when verb is null', () => {
    render(
      <DeleteVerbDialog
        open={true}
        verb={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    expect(
      screen.queryByTestId('delete-confirmation-dialog')
    ).not.toBeInTheDocument()
  })

  it('renders correctly when open with verb', () => {
    render(
      <DeleteVerbDialog
        open={true}
        verb={mockVerb}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    expect(screen.getByTestId('delete-confirmation-dialog')).toBeInTheDocument()
    expect(screen.getByText('Delete verb')).toBeInTheDocument()
    expect(
      screen.getByText(
        /This action cannot be undone. All associated conjugations and statistics will also be deleted./i
      )
    ).toBeInTheDocument()
  })

  it('displays regular verb details correctly', () => {
    render(
      <DeleteVerbDialog
        open={true}
        verb={mockVerb}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const itemDetails = screen.getByTestId('item-details')
    expect(itemDetails).toHaveTextContent('parlare')
    expect(itemDetails).toHaveTextContent('Portuguese:')
    expect(itemDetails).toHaveTextContent('falar')
    expect(itemDetails).toHaveTextContent('English:')
    expect(itemDetails).toHaveTextContent('to speak')
    expect(itemDetails).toHaveTextContent('Regular')
    expect(itemDetails).not.toHaveTextContent('Reflexive')
  })

  it('displays irregular reflexive verb details correctly', () => {
    render(
      <DeleteVerbDialog
        open={true}
        verb={mockIrregularReflexiveVerb}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const itemDetails = screen.getByTestId('item-details')
    expect(itemDetails).toHaveTextContent('svegliarsi')
    expect(itemDetails).toHaveTextContent('Portuguese:')
    expect(itemDetails).toHaveTextContent('acordar-se')
    expect(itemDetails).toHaveTextContent('English:')
    expect(itemDetails).toHaveTextContent('to wake up')
    expect(itemDetails).toHaveTextContent('Irregular')
    expect(itemDetails).toHaveTextContent('Reflexive')
  })

  it('displays N/A for missing English translation', () => {
    render(
      <DeleteVerbDialog
        open={true}
        verb={mockVerbWithoutEnglish}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const itemDetails = screen.getByTestId('item-details')
    expect(itemDetails).toHaveTextContent('mangiare')
    expect(itemDetails).toHaveTextContent('English:')
    expect(itemDetails).toHaveTextContent('N/A')
  })

  it('calls onClose when cancel button is clicked', () => {
    render(
      <DeleteVerbDialog
        open={true}
        verb={mockVerb}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('successfully deletes verb', async () => {
    mockUnwrap.mockResolvedValue({ message: 'Verb deleted successfully' })

    render(
      <DeleteVerbDialog
        open={true}
        verb={mockVerb}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockDeleteVerb).toHaveBeenCalledWith('1')
      expect(mockOnSuccess).toHaveBeenCalledWith('Verb deleted successfully')
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('handles deletion error', async () => {
    const errorMessage = 'Failed to delete verb'
    mockUnwrap.mockRejectedValue({
      data: { error: errorMessage },
    })

    render(
      <DeleteVerbDialog
        open={true}
        verb={mockVerb}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockDeleteVerb).toHaveBeenCalledWith('1')
      expect(mockOnError).toHaveBeenCalledWith(errorMessage)
    })
  })

  it('handles deletion error without error message', async () => {
    mockUnwrap.mockRejectedValue({})

    render(
      <DeleteVerbDialog
        open={true}
        verb={mockVerb}
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
    ;(useDeleteVerbMutation as jest.Mock).mockReturnValue([
      mockDeleteVerb,
      { isLoading: true },
    ])

    render(
      <DeleteVerbDialog
        open={true}
        verb={mockVerb}
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
    ;(useDeleteVerbMutation as jest.Mock).mockReturnValue([
      mockDeleteVerb,
      { isLoading: true },
    ])

    render(
      <DeleteVerbDialog
        open={true}
        verb={mockVerb}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    expect(screen.getByText('Deleting...')).toBeInTheDocument()
  })

  it('displays only Regular chip for regular non-reflexive verb', () => {
    render(
      <DeleteVerbDialog
        open={true}
        verb={mockVerb}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const itemDetails = screen.getByTestId('item-details')
    expect(itemDetails).toHaveTextContent('Regular')
    expect(itemDetails).not.toHaveTextContent('Irregular')
    expect(itemDetails).not.toHaveTextContent('Reflexive')
  })

  it('passes correct warning message to dialog', () => {
    render(
      <DeleteVerbDialog
        open={true}
        verb={mockVerb}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    expect(
      screen.getByText(
        'This action cannot be undone. All associated conjugations and statistics will also be deleted.'
      )
    ).toBeInTheDocument()
  })
})
