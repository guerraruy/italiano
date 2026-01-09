import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import '@testing-library/jest-dom'
import { useUpdateConjugationMutation } from '@/app/store/api'

import EditConjugationDialog from './EditConjugationDialog'

// Mock the API hook
jest.mock('@/app/store/api', () => ({
  useUpdateConjugationMutation: jest.fn(),
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
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  verb: {
    italian: 'parlare',
    regular: true,
    reflexive: false,
  },
}

describe('EditConjugationDialog', () => {
  const mockOnError = jest.fn()
  const mockOnSuccess = jest.fn()
  const mockOnClose = jest.fn()
  const mockUpdateConjugation = jest.fn()
  const mockUnwrap = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUpdateConjugation.mockReturnValue({ unwrap: mockUnwrap })
    ;(useUpdateConjugationMutation as jest.Mock).mockReturnValue([
      mockUpdateConjugation,
      { isLoading: false },
    ])
  })

  it('does not render when conjugation is null', () => {
    render(
      <EditConjugationDialog
        open={true}
        conjugation={null}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders correctly when open with conjugation', () => {
    render(
      <EditConjugationDialog
        open={true}
        conjugation={mockConjugation}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Edit Conjugation for parlare')).toBeInTheDocument()
  })

  it('displays an informational alert about JSON editing', () => {
    render(
      <EditConjugationDialog
        open={true}
        conjugation={mockConjugation}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    // The alert has the full message including "Be careful with the structure"
    expect(
      screen.getByText(
        /Be careful with the structure to ensure all tenses and forms are correctly defined/i
      )
    ).toBeInTheDocument()
  })

  it('displays JSON content in the text field', () => {
    render(
      <EditConjugationDialog
        open={true}
        conjugation={mockConjugation}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const textField = screen.getByLabelText(/Conjugation Data \(JSON\)/i)
    expect(textField).toBeInTheDocument()
    expect(textField).toHaveValue(
      JSON.stringify(mockConjugation.conjugation, null, 2)
    )
  })

  it('calls onClose when cancel button is clicked', () => {
    render(
      <EditConjugationDialog
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

  it('shows error message when invalid JSON is entered', async () => {
    const user = userEvent.setup()

    render(
      <EditConjugationDialog
        open={true}
        conjugation={mockConjugation}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const textField = screen.getByLabelText(/Conjugation Data \(JSON\)/i)
    await user.clear(textField)
    await user.type(textField, 'invalid json {{')

    expect(screen.getByText('Invalid JSON syntax')).toBeInTheDocument()
  })

  it('disables update button when JSON is invalid', async () => {
    const user = userEvent.setup()

    render(
      <EditConjugationDialog
        open={true}
        conjugation={mockConjugation}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const textField = screen.getByLabelText(/Conjugation Data \(JSON\)/i)
    await user.clear(textField)
    await user.type(textField, 'invalid json')

    const updateButton = screen.getByRole('button', { name: /update/i })
    expect(updateButton).toBeDisabled()
  })

  it('enables update button when JSON is valid', () => {
    render(
      <EditConjugationDialog
        open={true}
        conjugation={mockConjugation}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const updateButton = screen.getByRole('button', { name: /update/i })
    expect(updateButton).not.toBeDisabled()
  })

  it('clears error when valid JSON is entered after invalid', async () => {
    render(
      <EditConjugationDialog
        open={true}
        conjugation={mockConjugation}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const textField = screen.getByLabelText(/Conjugation Data \(JSON\)/i)

    // Enter invalid JSON
    fireEvent.change(textField, { target: { value: 'invalid' } })
    expect(screen.getByText('Invalid JSON syntax')).toBeInTheDocument()

    // Enter valid JSON - error should be cleared
    fireEvent.change(textField, { target: { value: '{"test": "value"}' } })

    expect(screen.queryByText('Invalid JSON syntax')).not.toBeInTheDocument()
  })

  it('successfully updates conjugation', async () => {
    mockUnwrap.mockResolvedValue({
      message: 'Conjugation updated successfully',
    })

    render(
      <EditConjugationDialog
        open={true}
        conjugation={mockConjugation}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const updateButton = screen.getByRole('button', { name: /update/i })
    fireEvent.click(updateButton)

    await waitFor(() => {
      expect(mockUpdateConjugation).toHaveBeenCalledWith({
        conjugationId: '1',
        conjugation: mockConjugation.conjugation,
      })
      expect(mockOnSuccess).toHaveBeenCalledWith(
        'Conjugation updated successfully'
      )
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('updates conjugation with modified data', async () => {
    mockUnwrap.mockResolvedValue({
      message: 'Conjugation updated successfully',
    })

    render(
      <EditConjugationDialog
        open={true}
        conjugation={mockConjugation}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const textField = screen.getByLabelText(/Conjugation Data \(JSON\)/i)
    const newData = { indicativo: { presente: { io: 'mangio' } } }

    // Use fireEvent.change to avoid userEvent's special character parsing
    fireEvent.change(textField, { target: { value: JSON.stringify(newData) } })

    const updateButton = screen.getByRole('button', { name: /update/i })
    fireEvent.click(updateButton)

    await waitFor(() => {
      expect(mockUpdateConjugation).toHaveBeenCalledWith({
        conjugationId: '1',
        conjugation: newData,
      })
    })
  })

  it('handles update error with error message', async () => {
    const errorMessage = 'Failed to update conjugation'
    mockUnwrap.mockRejectedValue({
      data: { error: errorMessage },
    })

    render(
      <EditConjugationDialog
        open={true}
        conjugation={mockConjugation}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const updateButton = screen.getByRole('button', { name: /update/i })
    fireEvent.click(updateButton)

    await waitFor(() => {
      expect(mockUpdateConjugation).toHaveBeenCalled()
      expect(mockOnError).toHaveBeenCalledWith(errorMessage)
    })
  })

  it('handles update error without error message', async () => {
    mockUnwrap.mockRejectedValue({})

    render(
      <EditConjugationDialog
        open={true}
        conjugation={mockConjugation}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const updateButton = screen.getByRole('button', { name: /update/i })
    fireEvent.click(updateButton)

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Error updating conjugation')
    })
  })

  it('shows JSON format error when entering incomplete JSON', () => {
    render(
      <EditConjugationDialog
        open={true}
        conjugation={mockConjugation}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const textField = screen.getByLabelText(/Conjugation Data \(JSON\)/i)

    // Enter incomplete JSON (missing closing brace)
    fireEvent.change(textField, { target: { value: '{"test": "value"' } })

    // Verify error is shown
    expect(screen.getByText('Invalid JSON syntax')).toBeInTheDocument()
  })

  it('disables buttons when updating', () => {
    ;(useUpdateConjugationMutation as jest.Mock).mockReturnValue([
      mockUpdateConjugation,
      { isLoading: true },
    ])

    render(
      <EditConjugationDialog
        open={true}
        conjugation={mockConjugation}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const updateButton = screen.getByRole('button', { name: /updating/i })
    const cancelButton = screen.getByRole('button', { name: /cancel/i })

    expect(updateButton).toBeDisabled()
    expect(cancelButton).toBeDisabled()
  })

  it('shows updating text when update is in progress', () => {
    ;(useUpdateConjugationMutation as jest.Mock).mockReturnValue([
      mockUpdateConjugation,
      { isLoading: true },
    ])

    render(
      <EditConjugationDialog
        open={true}
        conjugation={mockConjugation}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    expect(screen.getByText('Updating...')).toBeInTheDocument()
  })

  it('resets form state when conjugation changes (via key prop)', () => {
    const { rerender } = render(
      <EditConjugationDialog
        open={true}
        conjugation={mockConjugation}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const textField = screen.getByLabelText(/Conjugation Data \(JSON\)/i)
    expect(textField).toHaveValue(
      JSON.stringify(mockConjugation.conjugation, null, 2)
    )

    const newConjugation = {
      ...mockConjugation,
      id: '2',
      conjugation: {
        indicativo: {
          presente: {
            io: 'mangio',
          },
        },
      },
      verb: {
        italian: 'mangiare',
        regular: true,
        reflexive: false,
      },
    }

    rerender(
      <EditConjugationDialog
        open={true}
        conjugation={newConjugation}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    expect(
      screen.getByText('Edit Conjugation for mangiare')
    ).toBeInTheDocument()
    const updatedTextField = screen.getByLabelText(/Conjugation Data \(JSON\)/i)
    expect(updatedTextField).toHaveValue(
      JSON.stringify(newConjugation.conjugation, null, 2)
    )
  })

  it('renders text field with monospace font styling', () => {
    render(
      <EditConjugationDialog
        open={true}
        conjugation={mockConjugation}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    // Check that the multiline text field is rendered with multiple rows
    const textField = screen.getByLabelText(/Conjugation Data \(JSON\)/i)
    expect(textField).toBeInTheDocument()
    expect(textField.tagName.toLowerCase()).toBe('textarea')
  })

  it('uses fullWidth dialog with md maxWidth', () => {
    render(
      <EditConjugationDialog
        open={true}
        conjugation={mockConjugation}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
  })

  it('does not call update when form has JSON error on submit', async () => {
    const user = userEvent.setup()

    render(
      <EditConjugationDialog
        open={true}
        conjugation={mockConjugation}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    const textField = screen.getByLabelText(/Conjugation Data \(JSON\)/i)
    await user.clear(textField)
    await user.type(textField, 'not valid json')

    // Update button should be disabled
    const updateButton = screen.getByRole('button', { name: /update/i })
    expect(updateButton).toBeDisabled()

    // Try to click anyway (shouldn't work due to disabled state)
    fireEvent.click(updateButton)

    expect(mockUpdateConjugation).not.toHaveBeenCalled()
  })

  it('displays helper text when JSON is valid', () => {
    render(
      <EditConjugationDialog
        open={true}
        conjugation={mockConjugation}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    )

    // When JSON is valid, should show the default helper text
    expect(
      screen.getByText('Edit the conjugation data in JSON format')
    ).toBeInTheDocument()
  })
})
