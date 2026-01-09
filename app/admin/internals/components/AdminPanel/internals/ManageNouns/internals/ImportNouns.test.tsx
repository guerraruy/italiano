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
import { useImportNounsMutation } from '@/app/store/api'

import ImportNouns from './ImportNouns'

// Mock the API hook
jest.mock('@/app/store/api', () => ({
  useImportNounsMutation: jest.fn(),
}))

// Mock the shared dialog components
jest.mock('../../shared', () => ({
  ImportDialog: ({
    open,
    onClose,
    onFileUpload,
    onImport,
    hasContent,
  }: {
    open: boolean
    onClose: () => void
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
    onImport: () => void
    hasContent: boolean
  }) => {
    if (!open) return null
    return (
      <div data-testid="import-dialog">
        <button onClick={onClose}>Close</button>
        <label>
          Choose JSON File
          <input type="file" onChange={onFileUpload} data-testid="file-input" />
        </label>
        <button onClick={onImport} disabled={!hasContent}>
          Import Nouns
        </button>
      </div>
    )
  },
  ConflictResolutionDialog: ({
    open,
    onClose,
    conflicts,
    resolutions,
    onResolve,
    onContinue,
    renderConflictTitle,
    renderExistingData,
    renderNewData,
  }: {
    open: boolean
    onClose: () => void
    conflicts: { italian: string }[]
    resolutions: Record<string, string>
    onResolve: (key: string, action: 'keep' | 'replace') => void
    onContinue: () => void
    renderConflictTitle: (conflict: { italian: string }) => string
    renderExistingData: (conflict: unknown) => React.ReactNode
    renderNewData: (conflict: unknown) => React.ReactNode
  }) => {
    if (!open) return null
    return (
      <div data-testid="conflict-dialog">
        <h2>Resolve Conflicts</h2>
        <button onClick={onClose}>Close Conflicts</button>
        {conflicts.map((conflict: { italian: string }, index: number) => (
          <div key={index} data-testid={`conflict-${index}`}>
            <span>{renderConflictTitle(conflict)}</span>
            <div data-testid={`existing-${index}`}>
              <span>Existing Data</span>
              {renderExistingData(conflict)}
            </div>
            <div data-testid={`new-${index}`}>
              <span>New Data</span>
              {renderNewData(conflict)}
            </div>
            <button onClick={() => onResolve(conflict.italian, 'keep')}>
              Keep Existing
            </button>
            <button onClick={() => onResolve(conflict.italian, 'replace')}>
              Replace with New
            </button>
          </div>
        ))}
        <button
          onClick={onContinue}
          disabled={Object.keys(resolutions).length !== conflicts.length}
        >
          Continue Import
        </button>
      </div>
    )
  },
}))

describe('ImportNouns', () => {
  const mockOnError = jest.fn()
  const mockOnSuccess = jest.fn()
  const mockImportNouns = jest.fn()
  const mockUnwrap = jest.fn()

  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
    mockImportNouns.mockReturnValue({ unwrap: mockUnwrap })
    ;(useImportNounsMutation as jest.Mock).mockReturnValue([
      mockImportNouns,
      { isLoading: false },
    ])
  })

  it('renders correctly', async () => {
    render(<ImportNouns onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Initially shows only the upload icon button
    const uploadButton = screen.getByRole('button', {
      name: /Import Nouns from JSON/i,
    })
    expect(uploadButton).toBeInTheDocument()

    // Click to open the dialog
    fireEvent.click(uploadButton)

    // Now the dialog content should be visible
    await waitFor(() => {
      expect(screen.getByTestId('import-dialog')).toBeInTheDocument()
      expect(screen.getByText('Choose JSON File')).toBeInTheDocument()
    })
  })

  it('closes dialog when close button is clicked', async () => {
    render(<ImportNouns onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Open the dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Nouns from JSON/i,
    })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByTestId('import-dialog')).toBeInTheDocument()
    })

    // Close the dialog
    const closeButton = screen.getByText('Close')
    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByTestId('import-dialog')).not.toBeInTheDocument()
    })
  })

  it('handles invalid JSON file upload', async () => {
    render(<ImportNouns onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Open the import dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Nouns from JSON/i,
    })
    fireEvent.click(uploadButton)

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText('Choose JSON File')).toBeInTheDocument()
    })

    const file = new File(['invalid json'], 'test.json', {
      type: 'application/json',
    })

    // Find the file input
    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        'Invalid JSON file. Please check the format.'
      )
    })
  })

  it('handles valid JSON file upload and import', async () => {
    mockUnwrap.mockResolvedValue({ message: 'Import successful' })

    render(<ImportNouns onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Open the import dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Nouns from JSON/i,
    })
    fireEvent.click(uploadButton)

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText('Choose JSON File')).toBeInTheDocument()
    })

    const validJson = JSON.stringify({
      orologio: {
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
      },
    })
    const file = new File([validJson], 'nouns.json', {
      type: 'application/json',
    })

    // Find the file input
    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(
        'JSON file loaded successfully. Click "Import Nouns" to proceed.'
      )
    })

    const dialog = screen.getByTestId('import-dialog')
    const importButton = within(dialog).getByRole('button', {
      name: /import nouns/i,
    })
    fireEvent.click(importButton)

    await waitFor(() => {
      expect(mockImportNouns).toHaveBeenCalledWith({
        nouns: JSON.parse(validJson),
        resolveConflicts: undefined,
      })
      expect(mockOnSuccess).toHaveBeenCalledWith('Import successful')
    })
  })

  it('handles conflicts correctly', async () => {
    const conflicts = [
      {
        italian: 'orologio',
        existing: {
          singolare: {
            it: "l'orologio",
            pt: 'o relógio existente',
            en: 'the existing watch',
          },
          plurale: {
            it: 'gli orologi',
            pt: 'os relógios existentes',
            en: 'the existing watches',
          },
        },
        new: {
          singolare: {
            it: "l'orologio",
            pt: 'o relógio novo',
            en: 'the new watch',
          },
          plurale: {
            it: 'gli orologi',
            pt: 'os relógios novos',
            en: 'the new watches',
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

    render(<ImportNouns onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Open the import dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Nouns from JSON/i,
    })
    fireEvent.click(uploadButton)

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText('Choose JSON File')).toBeInTheDocument()
    })

    // Load file
    const firstConflict = conflicts[0]
    if (!firstConflict) throw new Error('No conflicts in test data')
    const validJson = JSON.stringify({ orologio: firstConflict.new })
    const file = new File([validJson], 'nouns.json', {
      type: 'application/json',
    })

    // Find the file input
    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })

    // Wait for file to be loaded
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(
        'JSON file loaded successfully. Click "Import Nouns" to proceed.'
      )
    })

    // Click import
    const dialog = screen.getByTestId('import-dialog')
    const importButton = within(dialog).getByRole('button', {
      name: /import nouns/i,
    })
    fireEvent.click(importButton)

    // Expect conflict dialog to open
    await waitFor(() => {
      expect(screen.getByText(/Resolve Conflicts/i)).toBeInTheDocument()
    })

    // Check conflict details
    expect(screen.getByText('orologio')).toBeInTheDocument()
    expect(screen.getByText('Existing Data')).toBeInTheDocument()
    expect(screen.getByText('New Data')).toBeInTheDocument()

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
      expect(mockImportNouns).toHaveBeenCalledWith({
        nouns: expect.any(Object),
        resolveConflicts: {
          orologio: 'replace',
        },
      })
    })
  })

  it('shows correct preview with noun count', async () => {
    render(<ImportNouns onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Open the import dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Nouns from JSON/i,
    })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByText('Choose JSON File')).toBeInTheDocument()
    })

    const validJson = JSON.stringify({
      orologio: {
        singolare: { it: "l'orologio", pt: 'o relógio', en: 'the watch' },
        plurale: { it: 'gli orologi', pt: 'os relógios', en: 'the watches' },
      },
      libro: {
        singolare: { it: 'il libro', pt: 'o livro', en: 'the book' },
        plurale: { it: 'i libri', pt: 'os livros', en: 'the books' },
      },
    })
    const file = new File([validJson], 'nouns.json', {
      type: 'application/json',
    })

    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(
        'JSON file loaded successfully. Click "Import Nouns" to proceed.'
      )
    })
  })

  it('handles import without file loaded', async () => {
    render(<ImportNouns onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Open the import dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Nouns from JSON/i,
    })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByTestId('import-dialog')).toBeInTheDocument()
    })

    const dialog = screen.getByTestId('import-dialog')
    const importButton = within(dialog).getByRole('button', {
      name: /import nouns/i,
    })

    // Import button should be disabled when no content
    expect(importButton).toBeDisabled()
  })

  it('handles import error', async () => {
    const errorMessage = 'Server error during import'
    mockUnwrap.mockRejectedValueOnce({
      data: { error: errorMessage },
    })

    render(<ImportNouns onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Open the import dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Nouns from JSON/i,
    })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByText('Choose JSON File')).toBeInTheDocument()
    })

    // Load valid file
    const validJson = JSON.stringify({
      orologio: {
        singolare: { it: "l'orologio", pt: 'o relógio', en: 'the watch' },
        plurale: { it: 'gli orologi', pt: 'os relógios', en: 'the watches' },
      },
    })
    const file = new File([validJson], 'nouns.json', {
      type: 'application/json',
    })

    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })

    // Try to import
    const dialog = screen.getByTestId('import-dialog')
    const importButton = within(dialog).getByRole('button', {
      name: /import nouns/i,
    })
    fireEvent.click(importButton)

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(errorMessage)
    })
  })

  it('clears state after successful import', async () => {
    mockUnwrap.mockResolvedValue({ message: 'Import successful' })

    render(<ImportNouns onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Open dialog and upload file
    const uploadButton = screen.getByRole('button', {
      name: /Import Nouns from JSON/i,
    })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByTestId('import-dialog')).toBeInTheDocument()
    })

    const validJson = JSON.stringify({
      orologio: {
        singolare: { it: "l'orologio", pt: 'o relógio', en: 'the watch' },
        plurale: { it: 'gli orologi', pt: 'os relógios', en: 'the watches' },
      },
    })
    const file = new File([validJson], 'nouns.json', {
      type: 'application/json',
    })

    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })

    // Import
    const dialog = screen.getByTestId('import-dialog')
    const importButton = within(dialog).getByRole('button', {
      name: /import nouns/i,
    })
    fireEvent.click(importButton)

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith('Import successful')
    })

    // Check that import button is disabled again (content cleared)
    expect(importButton).toBeDisabled()
  })

  it('handles file input with no file selected', () => {
    render(<ImportNouns onError={mockOnError} onSuccess={mockOnSuccess} />)

    const uploadButton = screen.getByRole('button', {
      name: /Import Nouns from JSON/i,
    })
    fireEvent.click(uploadButton)

    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [] } })

    // Should not call any callbacks
    expect(mockOnError).not.toHaveBeenCalled()
    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('renders conflict data correctly', async () => {
    const conflicts = [
      {
        italian: 'libro',
        existing: {
          singolare: {
            it: 'il libro',
            pt: 'o livro antigo',
            en: 'the old book',
          },
          plurale: {
            it: 'i libri',
            pt: 'os livros antigos',
            en: 'the old books',
          },
        },
        new: {
          singolare: {
            it: 'il libro',
            pt: 'o livro novo',
            en: 'the new book',
          },
          plurale: {
            it: 'i libri',
            pt: 'os livros novos',
            en: 'the new books',
          },
        },
      },
    ]

    mockUnwrap.mockRejectedValueOnce({
      status: 409,
      data: { conflicts },
    })

    render(<ImportNouns onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Open dialog, load file, and trigger conflict
    const uploadButton = screen.getByRole('button', {
      name: /Import Nouns from JSON/i,
    })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByTestId('import-dialog')).toBeInTheDocument()
    })

    const validJson = JSON.stringify({ libro: conflicts[0]!.new })
    const file = new File([validJson], 'nouns.json', {
      type: 'application/json',
    })

    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })

    const dialog = screen.getByTestId('import-dialog')
    const importButton = within(dialog).getByRole('button', {
      name: /import nouns/i,
    })
    fireEvent.click(importButton)

    await waitFor(() => {
      expect(screen.getByTestId('conflict-dialog')).toBeInTheDocument()
    })

    // Verify conflict details are rendered
    const conflictDialog = screen.getByTestId('conflict-dialog')
    expect(within(conflictDialog).getByText('libro')).toBeInTheDocument()
    expect(
      within(conflictDialog).getByText('Existing Data')
    ).toBeInTheDocument()
    expect(within(conflictDialog).getByText('New Data')).toBeInTheDocument()
  })
})
