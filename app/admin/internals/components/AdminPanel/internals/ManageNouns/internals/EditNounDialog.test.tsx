import React from 'react'

import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import '@testing-library/jest-dom'
import { useUpdateNounMutation } from '@/app/store/api'

import EditNounDialog from './EditNounDialog'

// Mock the API hook
jest.mock('@/app/store/api', () => ({
  useUpdateNounMutation: jest.fn(),
}))

const mockNoun = {
  id: '1',
  italian: 'gatto',
  singolare: {
    it: 'gatto',
    pt: 'gato',
    en: 'cat',
  },
  plurale: {
    it: 'gatti',
    pt: 'gatos',
    en: 'cats',
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

describe('EditNounDialog', () => {
  const mockOnClose = jest.fn()
  const mockOnSuccess = jest.fn()
  const mockOnError = jest.fn()
  const mockUpdateNoun = jest.fn()
  const mockUnwrap = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUpdateNoun.mockReturnValue({ unwrap: mockUnwrap })
    ;(useUpdateNounMutation as jest.Mock).mockReturnValue([
      mockUpdateNoun,
      { isLoading: false },
    ])
  })

  describe('Rendering', () => {
    it('should not render when noun is null', () => {
      const { container } = render(
        <EditNounDialog
          open={true}
          noun={null}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      expect(container.firstChild).toBeNull()
    })

    it('should render dialog when open with noun data', () => {
      render(
        <EditNounDialog
          open={true}
          noun={mockNoun}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      expect(screen.getByText('Edit Noun')).toBeInTheDocument()
      expect(screen.getByLabelText('Italian (base form)')).toHaveValue('gatto')
    })

    it('should not render dialog when closed', () => {
      render(
        <EditNounDialog
          open={false}
          noun={mockNoun}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      expect(screen.queryByText('Edit Noun')).not.toBeInTheDocument()
    })

    it('should display all form fields with correct initial values', () => {
      render(
        <EditNounDialog
          open={true}
          noun={mockNoun}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      // Base form
      expect(screen.getByLabelText('Italian (base form)')).toHaveValue('gatto')

      // Singular forms
      const italianInputs = screen.getAllByLabelText('Italian')
      expect(italianInputs[0]!).toHaveValue('gatto')

      const portugueseInputs = screen.getAllByLabelText('Portuguese')
      expect(portugueseInputs[0]!).toHaveValue('gato')

      const englishInputs = screen.getAllByLabelText('English')
      expect(englishInputs[0]!).toHaveValue('cat')

      // Plural forms
      expect(italianInputs[1]!).toHaveValue('gatti')
      expect(portugueseInputs[1]!).toHaveValue('gatos')
      expect(englishInputs[1]!).toHaveValue('cats')

      // Section headers
      expect(screen.getByText('Singular Forms')).toBeInTheDocument()
      expect(screen.getByText('Plural Forms')).toBeInTheDocument()
    })
  })

  describe('Form Interactions', () => {
    it('should update italian base form field', () => {
      render(
        <EditNounDialog
          open={true}
          noun={mockNoun}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      const italianInput = screen.getByLabelText('Italian (base form)')
      fireEvent.change(italianInput, { target: { value: 'cane' } })

      expect(italianInput).toHaveValue('cane')
    })

    it('should update singular Italian field', () => {
      render(
        <EditNounDialog
          open={true}
          noun={mockNoun}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      const italianInputs = screen.getAllByLabelText('Italian')
      fireEvent.change(italianInputs[0]!, { target: { value: 'cane' } })

      expect(italianInputs[0]!).toHaveValue('cane')
    })

    it('should update singular Portuguese field', () => {
      render(
        <EditNounDialog
          open={true}
          noun={mockNoun}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      const portugueseInputs = screen.getAllByLabelText('Portuguese')
      fireEvent.change(portugueseInputs[0]!, { target: { value: 'cachorro' } })

      expect(portugueseInputs[0]!).toHaveValue('cachorro')
    })

    it('should update singular English field', () => {
      render(
        <EditNounDialog
          open={true}
          noun={mockNoun}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      const englishInputs = screen.getAllByLabelText('English')
      fireEvent.change(englishInputs[0]!, { target: { value: 'dog' } })

      expect(englishInputs[0]!).toHaveValue('dog')
    })

    it('should update plural Italian field', () => {
      render(
        <EditNounDialog
          open={true}
          noun={mockNoun}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      const italianInputs = screen.getAllByLabelText('Italian')
      fireEvent.change(italianInputs[1]!, { target: { value: 'cani' } })

      expect(italianInputs[1]!).toHaveValue('cani')
    })

    it('should update plural Portuguese field', () => {
      render(
        <EditNounDialog
          open={true}
          noun={mockNoun}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      const portugueseInputs = screen.getAllByLabelText('Portuguese')
      fireEvent.change(portugueseInputs[1]!, { target: { value: 'cachorros' } })

      expect(portugueseInputs[1]!).toHaveValue('cachorros')
    })

    it('should update plural English field', () => {
      render(
        <EditNounDialog
          open={true}
          noun={mockNoun}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      const englishInputs = screen.getAllByLabelText('English')
      fireEvent.change(englishInputs[1]!, { target: { value: 'dogs' } })

      expect(englishInputs[1]!).toHaveValue('dogs')
    })

    it('should handle multiple field changes', () => {
      render(
        <EditNounDialog
          open={true}
          noun={mockNoun}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      const italianBase = screen.getByLabelText('Italian (base form)')
      const italianInputs = screen.getAllByLabelText('Italian')
      const portugueseInputs = screen.getAllByLabelText('Portuguese')

      fireEvent.change(italianBase, { target: { value: 'cane' } })
      fireEvent.change(italianInputs[0]!, { target: { value: 'cane' } })
      fireEvent.change(italianInputs[1]!, { target: { value: 'cani' } })
      fireEvent.change(portugueseInputs[0]!, { target: { value: 'cachorro' } })

      expect(italianBase).toHaveValue('cane')
      expect(italianInputs[0]!).toHaveValue('cane')
      expect(italianInputs[1]!).toHaveValue('cani')
      expect(portugueseInputs[0]!).toHaveValue('cachorro')
    })
  })

  describe('Update Functionality', () => {
    it('should call updateNoun mutation with correct data', async () => {
      mockUnwrap.mockResolvedValue({ message: 'Noun updated successfully' })

      render(
        <EditNounDialog
          open={true}
          noun={mockNoun}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      // Change the italian base form
      const italianInput = screen.getByLabelText('Italian (base form)')
      fireEvent.change(italianInput, { target: { value: 'cane' } })

      // Click update button
      const updateButton = screen.getByRole('button', { name: /update/i })
      fireEvent.click(updateButton)

      await waitFor(() => {
        expect(mockUpdateNoun).toHaveBeenCalledWith({
          nounId: '1',
          italian: 'cane',
          singolare: {
            it: 'gatto',
            pt: 'gato',
            en: 'cat',
          },
          plurale: {
            it: 'gatti',
            pt: 'gatos',
            en: 'cats',
          },
        })
      })
    })

    it('should handle successful update', async () => {
      mockUnwrap.mockResolvedValue({ message: 'Noun updated successfully' })

      render(
        <EditNounDialog
          open={true}
          noun={mockNoun}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      const updateButton = screen.getByRole('button', { name: /update/i })
      fireEvent.click(updateButton)

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith('Noun updated successfully')
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('should handle error during update', async () => {
      mockUnwrap.mockRejectedValue({
        data: { error: 'Failed to update noun' },
      })

      render(
        <EditNounDialog
          open={true}
          noun={mockNoun}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      const updateButton = screen.getByRole('button', { name: /update/i })
      fireEvent.click(updateButton)

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Failed to update noun')
        expect(mockOnClose).not.toHaveBeenCalled()
      })
    })

    it('should handle error without data property', async () => {
      mockUnwrap.mockRejectedValue({})

      render(
        <EditNounDialog
          open={true}
          noun={mockNoun}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      const updateButton = screen.getByRole('button', { name: /update/i })
      fireEvent.click(updateButton)

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Error updating noun')
      })
    })

    it('should disable buttons during update', async () => {
      ;(useUpdateNounMutation as jest.Mock).mockReturnValue([
        mockUpdateNoun,
        { isLoading: true },
      ])

      render(
        <EditNounDialog
          open={true}
          noun={mockNoun}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      const updateButton = screen.getByRole('button', { name: /updating/i })
      const cancelButton = screen.getByRole('button', { name: /cancel/i })

      expect(updateButton).toBeDisabled()
      expect(cancelButton).toBeDisabled()
      expect(updateButton).toHaveTextContent('Updating...')
    })

    it('should update with all changed fields', async () => {
      mockUnwrap.mockResolvedValue({ message: 'Noun updated successfully' })

      render(
        <EditNounDialog
          open={true}
          noun={mockNoun}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      // Change all fields
      const italianBase = screen.getByLabelText('Italian (base form)')
      const italianInputs = screen.getAllByLabelText('Italian')
      const portugueseInputs = screen.getAllByLabelText('Portuguese')
      const englishInputs = screen.getAllByLabelText('English')

      fireEvent.change(italianBase, { target: { value: 'cane' } })
      fireEvent.change(italianInputs[0]!, { target: { value: 'cane' } })
      fireEvent.change(italianInputs[1]!, { target: { value: 'cani' } })
      fireEvent.change(portugueseInputs[0]!, { target: { value: 'cachorro' } })
      fireEvent.change(portugueseInputs[1]!, { target: { value: 'cachorros' } })
      fireEvent.change(englishInputs[0]!, { target: { value: 'dog' } })
      fireEvent.change(englishInputs[1]!, { target: { value: 'dogs' } })

      const updateButton = screen.getByRole('button', { name: /update/i })
      fireEvent.click(updateButton)

      await waitFor(() => {
        expect(mockUpdateNoun).toHaveBeenCalledWith({
          nounId: '1',
          italian: 'cane',
          singolare: {
            it: 'cane',
            pt: 'cachorro',
            en: 'dog',
          },
          plurale: {
            it: 'cani',
            pt: 'cachorros',
            en: 'dogs',
          },
        })
      })
    })
  })

  describe('Dialog Controls', () => {
    it('should close dialog on cancel', () => {
      render(
        <EditNounDialog
          open={true}
          noun={mockNoun}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should close dialog after successful update', async () => {
      mockUnwrap.mockResolvedValue({ message: 'Noun updated successfully' })

      render(
        <EditNounDialog
          open={true}
          noun={mockNoun}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      const updateButton = screen.getByRole('button', { name: /update/i })
      fireEvent.click(updateButton)

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('should reset form when reopened with different noun', () => {
      const { rerender } = render(
        <EditNounDialog
          open={true}
          noun={mockNoun}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      // Modify a field
      const italianInput = screen.getByLabelText('Italian (base form)')
      fireEvent.change(italianInput, { target: { value: 'cane' } })
      expect(italianInput).toHaveValue('cane')

      // Close and reopen with different noun
      const newNoun = {
        ...mockNoun,
        id: '2',
        italian: 'tavolo',
        singolare: {
          it: 'tavolo',
          pt: 'mesa',
          en: 'table',
        },
        plurale: {
          it: 'tavoli',
          pt: 'mesas',
          en: 'tables',
        },
      }

      rerender(
        <EditNounDialog
          open={true}
          noun={newNoun}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      // Should show new noun data
      const newItalianInput = screen.getByLabelText('Italian (base form)')
      expect(newItalianInput).toHaveValue('tavolo')
    })
  })
})
