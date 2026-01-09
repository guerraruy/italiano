import React from 'react'

import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import '@testing-library/jest-dom'
import { useUpdateVerbMutation } from '@/app/store/api'

import EditVerbDialog from './EditVerbDialog'

// Mock the API hook
jest.mock('@/app/store/api', () => ({
  useUpdateVerbMutation: jest.fn(),
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

describe('EditVerbDialog', () => {
  const mockOnClose = jest.fn()
  const mockOnSuccess = jest.fn()
  const mockOnError = jest.fn()
  const mockUpdateVerb = jest.fn()
  const mockUnwrap = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUpdateVerb.mockReturnValue({ unwrap: mockUnwrap })
    ;(useUpdateVerbMutation as jest.Mock).mockReturnValue([
      mockUpdateVerb,
      { isLoading: false },
    ])
  })

  describe('Rendering', () => {
    it('should not render when verb is null', () => {
      const { container } = render(
        <EditVerbDialog
          open={true}
          verb={null}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      expect(container.firstChild).toBeNull()
    })

    it('should render dialog when open with verb data', () => {
      render(
        <EditVerbDialog
          open={true}
          verb={mockVerb}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      expect(screen.getByText('Edit Verb')).toBeInTheDocument()
      expect(screen.getByLabelText('Italian (infinitive form)')).toHaveValue(
        'parlare'
      )
    })

    it('should not render dialog when closed', () => {
      render(
        <EditVerbDialog
          open={false}
          verb={mockVerb}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      expect(screen.queryByText('Edit Verb')).not.toBeInTheDocument()
    })

    it('should display all form fields with correct initial values', () => {
      render(
        <EditVerbDialog
          open={true}
          verb={mockVerb}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      expect(screen.getByLabelText('Italian (infinitive form)')).toHaveValue(
        'parlare'
      )
      expect(screen.getByLabelText('Portuguese (BR) Translation')).toHaveValue(
        'falar'
      )
      expect(
        screen.getByLabelText('English Translation (optional)')
      ).toHaveValue('to speak')
      expect(screen.getByLabelText('Regular verb')).toBeChecked()
      expect(screen.getByLabelText('Reflexive verb')).not.toBeChecked()
    })

    it('should display irregular reflexive verb correctly', () => {
      render(
        <EditVerbDialog
          open={true}
          verb={mockIrregularReflexiveVerb}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      expect(screen.getByLabelText('Italian (infinitive form)')).toHaveValue(
        'svegliarsi'
      )
      expect(screen.getByLabelText('Portuguese (BR) Translation')).toHaveValue(
        'acordar-se'
      )
      expect(
        screen.getByLabelText('English Translation (optional)')
      ).toHaveValue('to wake up')
      expect(screen.getByLabelText('Regular verb')).not.toBeChecked()
      expect(screen.getByLabelText('Reflexive verb')).toBeChecked()
    })

    it('should display empty string for null English translation', () => {
      render(
        <EditVerbDialog
          open={true}
          verb={mockVerbWithoutEnglish}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      expect(
        screen.getByLabelText('English Translation (optional)')
      ).toHaveValue('')
    })
  })

  describe('Form Interactions', () => {
    it('should update Italian field', () => {
      render(
        <EditVerbDialog
          open={true}
          verb={mockVerb}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      const italianInput = screen.getByLabelText('Italian (infinitive form)')
      fireEvent.change(italianInput, { target: { value: 'mangiare' } })

      expect(italianInput).toHaveValue('mangiare')
    })

    it('should update Portuguese field', () => {
      render(
        <EditVerbDialog
          open={true}
          verb={mockVerb}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      const portugueseInput = screen.getByLabelText(
        'Portuguese (BR) Translation'
      )
      fireEvent.change(portugueseInput, { target: { value: 'comer' } })

      expect(portugueseInput).toHaveValue('comer')
    })

    it('should update English field', () => {
      render(
        <EditVerbDialog
          open={true}
          verb={mockVerb}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      const englishInput = screen.getByLabelText(
        'English Translation (optional)'
      )
      fireEvent.change(englishInput, { target: { value: 'to eat' } })

      expect(englishInput).toHaveValue('to eat')
    })

    it('should toggle regular checkbox', () => {
      render(
        <EditVerbDialog
          open={true}
          verb={mockVerb}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      const regularCheckbox = screen.getByLabelText('Regular verb')
      expect(regularCheckbox).toBeChecked()

      fireEvent.click(regularCheckbox)
      expect(regularCheckbox).not.toBeChecked()

      fireEvent.click(regularCheckbox)
      expect(regularCheckbox).toBeChecked()
    })

    it('should toggle reflexive checkbox', () => {
      render(
        <EditVerbDialog
          open={true}
          verb={mockVerb}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      const reflexiveCheckbox = screen.getByLabelText('Reflexive verb')
      expect(reflexiveCheckbox).not.toBeChecked()

      fireEvent.click(reflexiveCheckbox)
      expect(reflexiveCheckbox).toBeChecked()

      fireEvent.click(reflexiveCheckbox)
      expect(reflexiveCheckbox).not.toBeChecked()
    })

    it('should handle multiple field changes', () => {
      render(
        <EditVerbDialog
          open={true}
          verb={mockVerb}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      const italianInput = screen.getByLabelText('Italian (infinitive form)')
      const portugueseInput = screen.getByLabelText(
        'Portuguese (BR) Translation'
      )
      const englishInput = screen.getByLabelText(
        'English Translation (optional)'
      )
      const regularCheckbox = screen.getByLabelText('Regular verb')
      const reflexiveCheckbox = screen.getByLabelText('Reflexive verb')

      fireEvent.change(italianInput, { target: { value: 'correre' } })
      fireEvent.change(portugueseInput, { target: { value: 'correr' } })
      fireEvent.change(englishInput, { target: { value: 'to run' } })
      fireEvent.click(regularCheckbox)
      fireEvent.click(reflexiveCheckbox)

      expect(italianInput).toHaveValue('correre')
      expect(portugueseInput).toHaveValue('correr')
      expect(englishInput).toHaveValue('to run')
      expect(regularCheckbox).not.toBeChecked()
      expect(reflexiveCheckbox).toBeChecked()
    })
  })

  describe('Update Functionality', () => {
    it('should call updateVerb mutation with correct data', async () => {
      mockUnwrap.mockResolvedValue({ message: 'Verb updated successfully' })

      render(
        <EditVerbDialog
          open={true}
          verb={mockVerb}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      // Change the Italian field
      const italianInput = screen.getByLabelText('Italian (infinitive form)')
      fireEvent.change(italianInput, { target: { value: 'mangiare' } })

      // Click update button
      const updateButton = screen.getByRole('button', { name: /update/i })
      fireEvent.click(updateButton)

      await waitFor(() => {
        expect(mockUpdateVerb).toHaveBeenCalledWith({
          verbId: '1',
          italian: 'mangiare',
          regular: true,
          reflexive: false,
          tr_ptBR: 'falar',
          tr_en: 'to speak',
        })
      })
    })

    it('should handle successful update', async () => {
      mockUnwrap.mockResolvedValue({ message: 'Verb updated successfully' })

      render(
        <EditVerbDialog
          open={true}
          verb={mockVerb}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      const updateButton = screen.getByRole('button', { name: /update/i })
      fireEvent.click(updateButton)

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith('Verb updated successfully')
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('should handle error during update', async () => {
      mockUnwrap.mockRejectedValue({
        data: { error: 'Failed to update verb' },
      })

      render(
        <EditVerbDialog
          open={true}
          verb={mockVerb}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      const updateButton = screen.getByRole('button', { name: /update/i })
      fireEvent.click(updateButton)

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Failed to update verb')
        expect(mockOnClose).not.toHaveBeenCalled()
      })
    })

    it('should handle error without data property', async () => {
      mockUnwrap.mockRejectedValue({})

      render(
        <EditVerbDialog
          open={true}
          verb={mockVerb}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      const updateButton = screen.getByRole('button', { name: /update/i })
      fireEvent.click(updateButton)

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Error updating verb')
      })
    })

    it('should disable buttons during update', async () => {
      ;(useUpdateVerbMutation as jest.Mock).mockReturnValue([
        mockUpdateVerb,
        { isLoading: true },
      ])

      render(
        <EditVerbDialog
          open={true}
          verb={mockVerb}
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
      mockUnwrap.mockResolvedValue({ message: 'Verb updated successfully' })

      render(
        <EditVerbDialog
          open={true}
          verb={mockVerb}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      // Change all fields
      const italianInput = screen.getByLabelText('Italian (infinitive form)')
      const portugueseInput = screen.getByLabelText(
        'Portuguese (BR) Translation'
      )
      const englishInput = screen.getByLabelText(
        'English Translation (optional)'
      )
      const regularCheckbox = screen.getByLabelText('Regular verb')
      const reflexiveCheckbox = screen.getByLabelText('Reflexive verb')

      fireEvent.change(italianInput, { target: { value: 'correre' } })
      fireEvent.change(portugueseInput, { target: { value: 'correr' } })
      fireEvent.change(englishInput, { target: { value: 'to run' } })
      fireEvent.click(regularCheckbox) // uncheck
      fireEvent.click(reflexiveCheckbox) // check

      const updateButton = screen.getByRole('button', { name: /update/i })
      fireEvent.click(updateButton)

      await waitFor(() => {
        expect(mockUpdateVerb).toHaveBeenCalledWith({
          verbId: '1',
          italian: 'correre',
          regular: false,
          reflexive: true,
          tr_ptBR: 'correr',
          tr_en: 'to run',
        })
      })
    })

    it('should handle empty English translation', async () => {
      mockUnwrap.mockResolvedValue({ message: 'Verb updated successfully' })

      render(
        <EditVerbDialog
          open={true}
          verb={mockVerb}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      const englishInput = screen.getByLabelText(
        'English Translation (optional)'
      )
      fireEvent.change(englishInput, { target: { value: '' } })

      const updateButton = screen.getByRole('button', { name: /update/i })
      fireEvent.click(updateButton)

      await waitFor(() => {
        expect(mockUpdateVerb).toHaveBeenCalledWith({
          verbId: '1',
          italian: 'parlare',
          regular: true,
          reflexive: false,
          tr_ptBR: 'falar',
          tr_en: '',
        })
      })
    })
  })

  describe('Dialog Controls', () => {
    it('should close dialog on cancel', () => {
      render(
        <EditVerbDialog
          open={true}
          verb={mockVerb}
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
      mockUnwrap.mockResolvedValue({ message: 'Verb updated successfully' })

      render(
        <EditVerbDialog
          open={true}
          verb={mockVerb}
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

    it('should reset form when reopened with different verb', () => {
      const { rerender } = render(
        <EditVerbDialog
          open={true}
          verb={mockVerb}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      // Modify a field
      const italianInput = screen.getByLabelText('Italian (infinitive form)')
      fireEvent.change(italianInput, { target: { value: 'correre' } })
      expect(italianInput).toHaveValue('correre')

      // Close and reopen with different verb
      const newVerb = {
        ...mockVerb,
        id: '2',
        italian: 'dormire',
        tr_ptBR: 'dormir',
        tr_en: 'to sleep',
      }

      rerender(
        <EditVerbDialog
          open={true}
          verb={newVerb}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      // Should show new verb data
      const newItalianInput = screen.getByLabelText('Italian (infinitive form)')
      expect(newItalianInput).toHaveValue('dormire')
    })

    it('should not call onClose when update button is disabled', () => {
      ;(useUpdateVerbMutation as jest.Mock).mockReturnValue([
        mockUpdateVerb,
        { isLoading: true },
      ])

      render(
        <EditVerbDialog
          open={true}
          verb={mockVerb}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      // Button is disabled, so clicking shouldn't call onClose
      expect(cancelButton).toBeDisabled()
    })
  })

  describe('Form State Management', () => {
    it('should maintain form state across renders', () => {
      const { rerender } = render(
        <EditVerbDialog
          open={true}
          verb={mockVerb}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      const italianInput = screen.getByLabelText('Italian (infinitive form)')
      fireEvent.change(italianInput, { target: { value: 'mangiare' } })
      expect(italianInput).toHaveValue('mangiare')

      // Rerender with same verb (simulating parent component re-render)
      rerender(
        <EditVerbDialog
          open={true}
          verb={mockVerb}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      // Form state should be preserved
      expect(screen.getByLabelText('Italian (infinitive form)')).toHaveValue(
        'mangiare'
      )
    })

    it('should use key prop to reset form when verb id changes', () => {
      const { rerender } = render(
        <EditVerbDialog
          open={true}
          verb={mockVerb}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      const italianInput = screen.getByLabelText('Italian (infinitive form)')
      fireEvent.change(italianInput, { target: { value: 'correre' } })
      expect(italianInput).toHaveValue('correre')

      // Rerender with different verb id
      const differentVerb = {
        ...mockVerb,
        id: '999',
        italian: 'cantare',
      }

      rerender(
        <EditVerbDialog
          open={true}
          verb={differentVerb}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      )

      // Form should reset to new verb data due to key prop
      expect(screen.getByLabelText('Italian (infinitive form)')).toHaveValue(
        'cantare'
      )
    })
  })
})
