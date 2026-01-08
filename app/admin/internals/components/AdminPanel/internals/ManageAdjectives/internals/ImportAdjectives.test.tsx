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

  it('renders correctly', () => {
    render(<ImportAdjectives onError={mockOnError} onSuccess={mockOnSuccess} />)

    expect(screen.getByText('Import Adjectives from JSON')).toBeInTheDocument()
    expect(screen.getByText('Choose JSON File')).toBeInTheDocument()
    // Info button
    expect(screen.getByTestId('InfoOutlinedIcon')).toBeInTheDocument()
  })

  it('opens format info dialog', () => {
    render(<ImportAdjectives onError={mockOnError} onSuccess={mockOnSuccess} />)

    fireEvent.click(screen.getByTestId('InfoOutlinedIcon'))

    expect(screen.getByText('JSON Format Information')).toBeInTheDocument()
    expect(
      screen.getByText(/Upload a JSON file with Italian adjectives/i)
    ).toBeInTheDocument()

    fireEvent.click(screen.getByText('Close'))
    expect(screen.queryByText('JSON Format Information')).not.toBeVisible()
  })

  it('handles invalid JSON file upload', async () => {
    render(<ImportAdjectives onError={mockOnError} onSuccess={mockOnSuccess} />)

    const file = new File(['invalid json'], 'test.json', {
      type: 'application/json',
    })

    const fileInput = screen.getByLabelText(/choose json file/i)

    await waitFor(() => {
      fireEvent.change(fileInput, { target: { files: [file] } })
    })

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        'Invalid JSON file. Please check the format.'
      )
    })
  })

  it('handles valid JSON file upload and import', async () => {
    mockUnwrap.mockResolvedValue({ message: 'Import successful' })

    render(<ImportAdjectives onError={mockOnError} onSuccess={mockOnSuccess} />)

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

    const fileInput = screen.getByLabelText(/choose json file/i)
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

    // Load file
    const validJson = JSON.stringify({ bello: conflicts[0].new })
    const file = new File([validJson], 'adjectives.json', {
      type: 'application/json',
    })
    const fileInput = screen.getByLabelText(/choose json file/i)
    fireEvent.change(fileInput, { target: { files: [file] } })

    // Click import
    const importButton = await screen.findByRole('button', {
      name: /import adjectives/i,
    })
    fireEvent.click(importButton)

    // Expect dialog to open
    await waitFor(() => {
      expect(screen.getByText(/Resolve Conflicts/i)).toBeInTheDocument()
    })

    // Check conflict details
    const dialog = screen.getByRole('dialog')

    const existingDataHeaders = within(dialog).getAllByRole('heading', {
      name: /Existing Data/i,
    })
    expect(existingDataHeaders).toHaveLength(1)
    expect(existingDataHeaders[0]).toBeInTheDocument()

    // Also check for New Data header
    // In the component: <Typography variant='subtitle2' color='secondary' gutterBottom>New Data</Typography>
    // Note: variant subtitle2 usually renders as h6.
    // Let's verify if New Data is also a heading.
    // Based on previous logs, Existing Data was h6. New Data uses same variant.
    // So we can look for it by role or text.
    expect(within(dialog).getByText('New Data')).toBeInTheDocument()

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
