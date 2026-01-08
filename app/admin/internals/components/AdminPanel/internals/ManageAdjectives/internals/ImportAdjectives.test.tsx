import React from 'react'

import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
  within,
} from '@testing-library/react'

import '@testing-library/jest-dom'
import { useImportAdjectivesMutation } from '@/app/store/api'

import ImportAdjectives from './ImportAdjectives'

// Mock the API hook
jest.mock('@/app/store/api', () => ({
  useImportAdjectivesMutation: jest.fn(),
}))

describe('ImportAdjectives', () => {
  const mockOnError = jest.fn()
  const mockOnSuccess = jest.fn()
  const mockImportAdjectives = jest.fn()
  const mockUnwrap = jest.fn()

  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
    mockImportAdjectives.mockReturnValue({ unwrap: mockUnwrap })
    ;(useImportAdjectivesMutation as jest.Mock).mockReturnValue([
      mockImportAdjectives,
      { isLoading: false },
    ])
  })

  it('renders correctly', async () => {
    render(<ImportAdjectives onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Initially shows only the upload icon button
    const uploadButton = screen.getByRole('button', {
      name: /Import Adjectives from JSON/i,
    })
    expect(uploadButton).toBeInTheDocument()

    // Click to open the dialog
    fireEvent.click(uploadButton)

    // Now the dialog content should be visible
    await waitFor(() => {
      expect(
        screen.getByText('Import Adjectives from JSON')
      ).toBeInTheDocument()
      expect(screen.getByText('Choose JSON File')).toBeInTheDocument()
      expect(screen.getByTestId('InfoOutlinedIcon')).toBeInTheDocument()
    })
  })

  it('opens format info dialog', async () => {
    render(<ImportAdjectives onError={mockOnError} onSuccess={mockOnSuccess} />)

    // First open the import dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Adjectives from JSON/i,
    })
    fireEvent.click(uploadButton)

    // Wait for dialog to open and find the info button
    await waitFor(() => {
      expect(screen.getByTestId('InfoOutlinedIcon')).toBeInTheDocument()
    })

    // Click the info button
    fireEvent.click(screen.getByTestId('InfoOutlinedIcon'))

    await waitFor(() => {
      expect(screen.getByText('JSON Format Information')).toBeInTheDocument()
      expect(
        screen.getByText(/Upload a JSON file with Italian adjectives/i)
      ).toBeInTheDocument()
    })

    // Close the format info dialog
    const closeButtons = screen.getAllByText('Close')
    const firstCloseButton = closeButtons[0]
    if (!firstCloseButton) throw new Error('Close button not found')
    fireEvent.click(firstCloseButton)

    await waitFor(() => {
      expect(
        screen.queryByText('JSON Format Information')
      ).not.toBeInTheDocument()
    })
  })

  it('handles invalid JSON file upload', async () => {
    render(<ImportAdjectives onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Open the import dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Adjectives from JSON/i,
    })
    fireEvent.click(uploadButton)

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText('Choose JSON File')).toBeInTheDocument()
    })

    const file = new File(['invalid json'], 'test.json', {
      type: 'application/json',
    })

    // Find the hidden file input
    const fileInput = screen
      .getByRole('button', { name: /Choose JSON File/i })
      .querySelector('input[type="file"]') as HTMLInputElement

    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        'Invalid JSON file. Please check the format.'
      )
    })
  })

  it('handles valid JSON file upload and import', async () => {
    mockUnwrap.mockResolvedValue({ message: 'Import successful' })

    render(<ImportAdjectives onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Open the import dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Adjectives from JSON/i,
    })
    fireEvent.click(uploadButton)

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText('Choose JSON File')).toBeInTheDocument()
    })

    const validJson = JSON.stringify({
      bello: {
        maschile: {
          singolare: { it: 'bello', pt: 'bonito', en: 'beautiful' },
          plurale: { it: 'belli', pt: 'bonitos', en: 'beautiful' },
        },
        femminile: {
          singolare: { it: 'bella', pt: 'bonita', en: 'beautiful' },
          plurale: { it: 'belle', pt: 'bonitas', en: 'beautiful' },
        },
      },
    })
    const file = new File([validJson], 'adjectives.json', {
      type: 'application/json',
    })

    // Find the hidden file input
    const fileInput = screen
      .getByRole('button', { name: /Choose JSON File/i })
      .querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(
        'JSON file loaded successfully. Click "Import Adjectives" to proceed.'
      )
    })

    expect(
      screen.getByText(/1 adjectives ready to import/i)
    ).toBeInTheDocument()

    const importButton = screen.getByRole('button', {
      name: /import adjectives/i,
    })
    fireEvent.click(importButton)

    await waitFor(() => {
      expect(mockImportAdjectives).toHaveBeenCalledWith({
        adjectives: JSON.parse(validJson),
        resolveConflicts: undefined,
      })
      expect(mockOnSuccess).toHaveBeenCalledWith('Import successful')
    })
  })

  it('handles conflicts correctly', async () => {
    const conflicts = [
      {
        italian: 'bello',
        existing: {
          maschile: {
            singolare: { it: 'bello', pt: 'existing', en: 'existing' },
            plurale: { it: 'belli', pt: 'existing', en: 'existing' },
          },
          femminile: {
            singolare: { it: 'bella', pt: 'existing', en: 'existing' },
            plurale: { it: 'belle', pt: 'existing', en: 'existing' },
          },
        },
        new: {
          maschile: {
            singolare: { it: 'bello', pt: 'new', en: 'new' },
            plurale: { it: 'belli', pt: 'new', en: 'new' },
          },
          femminile: {
            singolare: { it: 'bella', pt: 'new', en: 'new' },
            plurale: { it: 'belle', pt: 'new', en: 'new' },
          },
        },
      },
    ]

    // First call fails with conflict
    mockUnwrap.mockRejectedValueOnce({
      status: 409,
      data: { conflicts },
    })
    // Second call succeeds
    mockUnwrap.mockResolvedValueOnce({
      message: 'Import successful after resolution',
    })

    render(<ImportAdjectives onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Open the import dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Adjectives from JSON/i,
    })
    fireEvent.click(uploadButton)

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText('Choose JSON File')).toBeInTheDocument()
    })

    // Load file
    const firstConflict = conflicts[0]
    if (!firstConflict) throw new Error('No conflicts in test data')
    const validJson = JSON.stringify({ bello: firstConflict.new })
    const file = new File([validJson], 'adjectives.json', {
      type: 'application/json',
    })

    // Find the hidden file input
    const fileInput = screen
      .getByRole('button', { name: /Choose JSON File/i })
      .querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })

    // Wait for file to be loaded
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(
        'JSON file loaded successfully. Click "Import Adjectives" to proceed.'
      )
    })

    // Click import
    const importButton = screen.getByRole('button', {
      name: /import adjectives/i,
    })
    fireEvent.click(importButton)

    // Expect conflict dialog to open
    await waitFor(() => {
      expect(screen.getByText(/Resolve Conflicts/i)).toBeInTheDocument()
    })

    // Check conflict details
    const dialogs = screen.getAllByRole('dialog')
    const conflictDialog = dialogs.find((dialog) =>
      within(dialog).queryByText(/Resolve Conflicts/i)
    )

    expect(conflictDialog).toBeTruthy()

    const existingDataText = within(conflictDialog!).getByText('Existing Data')
    expect(existingDataText).toBeInTheDocument()

    const newDataText = within(conflictDialog!).getByText('New Data')
    expect(newDataText).toBeInTheDocument()

    // Resolve conflict
    const replaceButton = screen.getByRole('button', {
      name: /Replace with New/i,
    })
    fireEvent.click(replaceButton)

    // Check if Continue button is enabled
    const continueButton = screen.getByRole('button', {
      name: /Continue Import/i,
    })
    expect(continueButton).not.toBeDisabled()

    fireEvent.click(continueButton)

    await waitFor(() => {
      expect(mockImportAdjectives).toHaveBeenCalledWith({
        adjectives: expect.any(Object),
        resolveConflicts: {
          bello: 'replace',
        },
      })
    })
  })
})
