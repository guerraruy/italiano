import React from 'react'

import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import '@testing-library/jest-dom'
import { useDeleteConjugationMutation } from '@/app/store/api'

import DeleteConjugationDialog from './DeleteConjugationDialog'

// Mock the API hook
jest.mock('@/app/store/api', () => ({
  useDeleteConjugationMutation: jest.fn(),
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
    item: { id: string } | null
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

const mockConjugation = {
  id: '1',
  verbId: 'verb-1',
  conjugation: {
    indicativo: {
      presente: {
        io: 'parlo',
        tu: 'parli',
        lui: 'parla',
        noi: 'parliamo',
        voi: 'parlate',
        loro: 'parlano',
      },
      passatoProssimo: {
        io: 'ho parlato',
        tu: 'hai parlato',
        lui: 'ha parlato',
        noi: 'abbiamo parlato',
        voi: 'avete parlato',
        loro: 'hanno parlato',
      },
    },
    congiuntivo: {
      presente: {
        io: 'parli',
        tu: 'parli',
        lui: 'parli',
        noi: 'parliamo',
        voi: 'parliate',
        loro: 'parlino',
      },
    },
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  verb: {
    italian: 'parlare',
    regular: true,
    reflexive: false,
  },
}

const mockIrregularReflexiveConjugation = {
  id: '2',
  verbId: 'verb-2',
  conjugation: {
    indicativo: {
      presente: {
        io: 'mi alzo',
        tu: 'ti alzi',
        lui: 'si alza',
        noi: 'ci alziamo',
        voi: 'vi alzate',
        loro: 'si alzano',
      },
    },
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  verb: {
    italian: 'alzarsi',
    regular: false,
    reflexive: true,
  },
}

describe('DeleteConjugationDialog', () => {
  const mockOnError = jest.fn()
  const mockOnSuccess = jest.fn()
  const mockOnClose = jest.fn()
  const mockDeleteConjugation = jest.fn()
  const mockUnwrap = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockDeleteConjugation.mockReturnValue({ unwrap: mockUnwrap })
    ;(useDeleteConjugationMutation as jest.Mock).mockReturnValue([
      mockDeleteConjugation,
      { isLoading: false },
    ])
  })

  it('does not render when open is false', () => {
    render(
      <DeleteConjugationDialog
        open={false}
        conjugation={mockConjugation}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    expect(
      screen.queryByTestId('delete-confirmation-dialog')
    ).not.toBeInTheDocument()
  })

  it('does not render when conjugation is null', () => {
    render(
      <DeleteConjugationDialog
        open={true}
        conjugation={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    expect(
      screen.queryByTestId('delete-confirmation-dialog')
    ).not.toBeInTheDocument()
  })

  it('renders correctly when open with conjugation', () => {
    render(
      <DeleteConjugationDialog
        open={true}
        conjugation={mockConjugation}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    expect(screen.getByTestId('delete-confirmation-dialog')).toBeInTheDocument()
    expect(screen.getByText('Delete conjugation')).toBeInTheDocument()
    expect(
      screen.getByText(
        /This action cannot be undone. The conjugation data will be permanently deleted from the database./i
      )
    ).toBeInTheDocument()
  })

  it('displays conjugation details correctly for regular verb', () => {
    render(
      <DeleteConjugationDialog
        open={true}
        conjugation={mockConjugation}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const itemDetails = screen.getByTestId('item-details')
    expect(itemDetails).toHaveTextContent('parlare')
    expect(itemDetails).toHaveTextContent('Moods:')
    expect(itemDetails).toHaveTextContent('indicativo')
    expect(itemDetails).toHaveTextContent('congiuntivo')
    expect(itemDetails).toHaveTextContent('Total Tenses:')
    expect(itemDetails).toHaveTextContent('3') // 2 indicativo + 1 congiuntivo
    expect(screen.getByText('Regular')).toBeInTheDocument()
  })

  it('displays conjugation details correctly for irregular reflexive verb', () => {
    render(
      <DeleteConjugationDialog
        open={true}
        conjugation={mockIrregularReflexiveConjugation}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const itemDetails = screen.getByTestId('item-details')
    expect(itemDetails).toHaveTextContent('alzarsi')
    expect(itemDetails).toHaveTextContent('Total Tenses:')
    expect(itemDetails).toHaveTextContent('1') // 1 indicativo tense
    expect(screen.getByText('Irregular')).toBeInTheDocument()
    expect(screen.getByText('Reflexive')).toBeInTheDocument()
  })

  it('calls onClose when cancel button is clicked', () => {
    render(
      <DeleteConjugationDialog
        open={true}
        conjugation={mockConjugation}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('successfully deletes conjugation', async () => {
    mockUnwrap.mockResolvedValue({
      message: 'Conjugation deleted successfully',
    })

    render(
      <DeleteConjugationDialog
        open={true}
        conjugation={mockConjugation}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockDeleteConjugation).toHaveBeenCalledWith('1')
      expect(mockOnSuccess).toHaveBeenCalledWith(
        'Conjugation deleted successfully'
      )
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('handles deletion error', async () => {
    const errorMessage = 'Failed to delete conjugation'
    mockUnwrap.mockRejectedValue({
      data: { error: errorMessage },
    })

    render(
      <DeleteConjugationDialog
        open={true}
        conjugation={mockConjugation}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockDeleteConjugation).toHaveBeenCalledWith('1')
      expect(mockOnError).toHaveBeenCalledWith(errorMessage)
    })
  })

  it('handles deletion error without error message', async () => {
    mockUnwrap.mockRejectedValue({})

    render(
      <DeleteConjugationDialog
        open={true}
        conjugation={mockConjugation}
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
    ;(useDeleteConjugationMutation as jest.Mock).mockReturnValue([
      mockDeleteConjugation,
      { isLoading: true },
    ])

    render(
      <DeleteConjugationDialog
        open={true}
        conjugation={mockConjugation}
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
    ;(useDeleteConjugationMutation as jest.Mock).mockReturnValue([
      mockDeleteConjugation,
      { isLoading: true },
    ])

    render(
      <DeleteConjugationDialog
        open={true}
        conjugation={mockConjugation}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    expect(screen.getByText('Deleting...')).toBeInTheDocument()
  })

  it('correctly calculates total tenses across multiple moods', () => {
    const complexConjugation = {
      ...mockConjugation,
      conjugation: {
        indicativo: {
          presente: { io: 'parlo' },
          passatoProssimo: { io: 'ho parlato' },
          imperfetto: { io: 'parlavo' },
          futuroSemplice: { io: 'parlerò' },
        },
        congiuntivo: {
          presente: { io: 'parli' },
          passato: { io: 'abbia parlato' },
        },
        condizionale: {
          presente: { io: 'parlerei' },
        },
      },
    }

    render(
      <DeleteConjugationDialog
        open={true}
        conjugation={complexConjugation}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const itemDetails = screen.getByTestId('item-details')
    expect(itemDetails).toHaveTextContent('Total Tenses:')
    expect(itemDetails).toHaveTextContent('7') // 4 + 2 + 1
  })

  it('displays all moods in the details', () => {
    const multiMoodConjugation = {
      ...mockConjugation,
      conjugation: {
        indicativo: { presente: { io: 'parlo' } },
        congiuntivo: { presente: { io: 'parli' } },
        condizionale: { presente: { io: 'parlerei' } },
        imperativo: { presente: { tu: 'parla' } },
      },
    }

    render(
      <DeleteConjugationDialog
        open={true}
        conjugation={multiMoodConjugation}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const itemDetails = screen.getByTestId('item-details')
    expect(itemDetails).toHaveTextContent('indicativo')
    expect(itemDetails).toHaveTextContent('congiuntivo')
    expect(itemDetails).toHaveTextContent('condizionale')
    expect(itemDetails).toHaveTextContent('imperativo')
  })
})
