import React from 'react'

import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import '@testing-library/jest-dom'
import { ImportedAdjective, useUpdateAdjectiveMutation } from '@/app/store/api'

import EditAdjectiveDialog from './EditAdjectiveDialog'

// Mock the API hook
jest.mock('@/app/store/api', () => ({
  useUpdateAdjectiveMutation: jest.fn(),
}))

const mockAdjective: ImportedAdjective = {
  id: 'adj-123',
  italian: 'bello',
  maschile: {
    singolare: { it: 'bello', pt: 'bonito', en: 'beautiful' },
    plurale: { it: 'belli', pt: 'bonitos', en: 'beautiful' },
  },
  femminile: {
    singolare: { it: 'bella', pt: 'bonita', en: 'beautiful' },
    plurale: { it: 'belle', pt: 'bonitas', en: 'beautiful' },
  },
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
}

describe('EditAdjectiveDialog', () => {
  const mockOnClose = jest.fn()
  const mockOnSuccess = jest.fn()
  const mockOnError = jest.fn()
  const mockUpdateAdjective = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useUpdateAdjectiveMutation as jest.Mock).mockReturnValue([
      mockUpdateAdjective,
      { isLoading: false },
    ])
  })

  it('renders nothing if adjective is null', () => {
    const { container } = render(
      <EditAdjectiveDialog
        open={true}
        adjective={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the dialog when open is true and adjective is provided', () => {
    render(
      <EditAdjectiveDialog
        open={true}
        adjective={mockAdjective}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )
    expect(screen.getByText('Edit Adjective')).toBeInTheDocument()
    // Multiple fields might have 'bello', so we use getAllByDisplayValue
    expect(screen.getAllByDisplayValue('bello')[0]).toBeInTheDocument()
  })

  it('calls onClose when Cancel button is clicked', () => {
    render(
      <EditAdjectiveDialog
        open={true}
        adjective={mockAdjective}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )
    fireEvent.click(screen.getByText('Cancel'))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('updates form fields correctly', () => {
    render(
      <EditAdjectiveDialog
        open={true}
        adjective={mockAdjective}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    // Change Italian base form
    const italianInput = screen.getByLabelText('Italian (base form)')
    fireEvent.change(italianInput, { target: { value: 'nuovo' } })
    expect(italianInput).toHaveValue('nuovo')

    // Check specific inputs by using getAllByLabelText if needed, or by structure
    // Since there are multiple 'Italian' inputs (Masc Sing, Masc Plur, Fem Sing, Fem Plur),
    // plus 'Italian (base form)'. getAllByLabelText('Italian') will return the 4 specific forms.
    const italianInputs = screen.getAllByLabelText('Italian')
    expect(italianInputs).toHaveLength(4)

    // Change Masculine Singular Italian (index 0)
    fireEvent.change(italianInputs[0], { target: { value: 'nuovo_masc_sing' } })
    expect(italianInputs[0]).toHaveValue('nuovo_masc_sing')
  })

  it('calls updateAdjective and onSuccess on successful submission', async () => {
    mockUpdateAdjective.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({ message: 'Success' }),
    })

    render(
      <EditAdjectiveDialog
        open={true}
        adjective={mockAdjective}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    // Modify a value
    const italianInput = screen.getByLabelText('Italian (base form)')
    fireEvent.change(italianInput, { target: { value: 'nuovo_base' } })

    fireEvent.click(screen.getByText('Update'))

    await waitFor(() => {
      expect(mockUpdateAdjective).toHaveBeenCalledWith({
        adjectiveId: 'adj-123',
        italian: 'nuovo_base',
        maschile: mockAdjective.maschile,
        femminile: mockAdjective.femminile,
      })
      expect(mockOnSuccess).toHaveBeenCalledWith('Success')
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('calls onError on failed submission', async () => {
    mockUpdateAdjective.mockReturnValue({
      unwrap: jest.fn().mockRejectedValue({ data: { error: 'Failed' } }),
    })

    render(
      <EditAdjectiveDialog
        open={true}
        adjective={mockAdjective}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    fireEvent.click(screen.getByText('Update'))

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Failed')
    })
  })

  it('shows loading state during update', () => {
    ;(useUpdateAdjectiveMutation as jest.Mock).mockReturnValue([
      mockUpdateAdjective,
      { isLoading: true },
    ])

    render(
      <EditAdjectiveDialog
        open={true}
        adjective={mockAdjective}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    expect(screen.getByText('Updating...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Updating...' })).toBeDisabled()
  })
})
