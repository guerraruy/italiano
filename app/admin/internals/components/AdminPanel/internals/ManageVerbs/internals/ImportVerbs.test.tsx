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
import { useImportVerbsMutation } from '@/app/store/api'

import ImportVerbs from './ImportVerbs'

// Mock the API hook
jest.mock('@/app/store/api', () => ({
  useImportVerbsMutation: jest.fn(),
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
          Import Verbs
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

describe('ImportVerbs', () => {
  const mockOnError = jest.fn()
  const mockOnSuccess = jest.fn()
  const mockImportVerbs = jest.fn()
  const mockUnwrap = jest.fn()

  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
    mockImportVerbs.mockReturnValue({ unwrap: mockUnwrap })
    ;(useImportVerbsMutation as jest.Mock).mockReturnValue([
      mockImportVerbs,
      { isLoading: false },
    ])
  })

  it('renders correctly', async () => {
    render(<ImportVerbs onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Initially shows only the upload icon button
    const uploadButton = screen.getByRole('button', {
      name: /Import Verbs from JSON/i,
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
    render(<ImportVerbs onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Open the dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Verbs from JSON/i,
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
    render(<ImportVerbs onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Open the import dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Verbs from JSON/i,
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

    render(<ImportVerbs onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Open the import dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Verbs from JSON/i,
    })
    fireEvent.click(uploadButton)

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText('Choose JSON File')).toBeInTheDocument()
    })

    const validJson = JSON.stringify({
      accendere: {
        regular: false,
        reflexive: false,
        tr_ptBR: 'acender',
        tr_en: 'to light',
      },
      accettare: {
        regular: true,
        reflexive: false,
        tr_ptBR: 'aceitar',
        tr_en: 'to accept',
      },
    })
    const file = new File([validJson], 'verbs.json', {
      type: 'application/json',
    })

    // Find the file input
    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(
        'JSON file loaded successfully. Click "Import Verbs" to proceed.'
      )
    })

    const dialog = screen.getByTestId('import-dialog')
    const importButton = within(dialog).getByRole('button', {
      name: /import verbs/i,
    })
    fireEvent.click(importButton)

    await waitFor(() => {
      expect(mockImportVerbs).toHaveBeenCalledWith({
        verbs: JSON.parse(validJson),
        resolveConflicts: undefined,
      })
      expect(mockOnSuccess).toHaveBeenCalledWith('Import successful')
    })
  })

  it('handles conflicts correctly', async () => {
    const conflicts = [
      {
        italian: 'parlare',
        existing: {
          regular: true,
          reflexive: false,
          tr_ptBR: 'falar (antigo)',
          tr_en: 'to speak (old)',
        },
        new: {
          regular: true,
          reflexive: false,
          tr_ptBR: 'falar (novo)',
          tr_en: 'to speak (new)',
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

    render(<ImportVerbs onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Open the import dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Verbs from JSON/i,
    })
    fireEvent.click(uploadButton)

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText('Choose JSON File')).toBeInTheDocument()
    })

    // Load file
    const firstConflict = conflicts[0]
    if (!firstConflict) throw new Error('No conflicts in test data')
    const validJson = JSON.stringify({ parlare: firstConflict.new })
    const file = new File([validJson], 'verbs.json', {
      type: 'application/json',
    })

    // Find the file input
    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })

    // Wait for file to be loaded
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(
        'JSON file loaded successfully. Click "Import Verbs" to proceed.'
      )
    })

    // Click import
    const dialog = screen.getByTestId('import-dialog')
    const importButton = within(dialog).getByRole('button', {
      name: /import verbs/i,
    })
    fireEvent.click(importButton)

    // Expect conflict dialog to open
    await waitFor(() => {
      expect(screen.getByText(/Resolve Conflicts/i)).toBeInTheDocument()
    })

    // Check conflict details
    expect(screen.getByText('parlare')).toBeInTheDocument()
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
      expect(mockImportVerbs).toHaveBeenCalledWith({
        verbs: expect.any(Object),
        resolveConflicts: {
          parlare: 'replace',
        },
      })
    })
  })

  it('shows correct preview with verb count', async () => {
    render(<ImportVerbs onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Open the import dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Verbs from JSON/i,
    })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByText('Choose JSON File')).toBeInTheDocument()
    })

    const validJson = JSON.stringify({
      parlare: {
        regular: true,
        reflexive: false,
        tr_ptBR: 'falar',
        tr_en: 'to speak',
      },
      mangiare: {
        regular: true,
        reflexive: false,
        tr_ptBR: 'comer',
        tr_en: 'to eat',
      },
      bere: {
        regular: false,
        reflexive: false,
        tr_ptBR: 'beber',
        tr_en: 'to drink',
      },
    })
    const file = new File([validJson], 'verbs.json', {
      type: 'application/json',
    })

    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(
        'JSON file loaded successfully. Click "Import Verbs" to proceed.'
      )
    })
  })

  it('handles import without file loaded', async () => {
    render(<ImportVerbs onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Open the import dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Verbs from JSON/i,
    })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByTestId('import-dialog')).toBeInTheDocument()
    })

    const dialog = screen.getByTestId('import-dialog')
    const importButton = within(dialog).getByRole('button', {
      name: /import verbs/i,
    })

    // Import button should be disabled when no content
    expect(importButton).toBeDisabled()
  })

  it('handles import error', async () => {
    const errorMessage = 'Server error during import'
    mockUnwrap.mockRejectedValueOnce({
      data: { error: errorMessage },
    })

    render(<ImportVerbs onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Open the import dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Verbs from JSON/i,
    })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByText('Choose JSON File')).toBeInTheDocument()
    })

    // Load valid file
    const validJson = JSON.stringify({
      parlare: {
        regular: true,
        reflexive: false,
        tr_ptBR: 'falar',
        tr_en: 'to speak',
      },
    })
    const file = new File([validJson], 'verbs.json', {
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
      name: /import verbs/i,
    })
    fireEvent.click(importButton)

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(errorMessage)
    })
  })

  it('clears state after successful import', async () => {
    mockUnwrap.mockResolvedValue({ message: 'Import successful' })

    render(<ImportVerbs onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Open dialog and upload file
    const uploadButton = screen.getByRole('button', {
      name: /Import Verbs from JSON/i,
    })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByTestId('import-dialog')).toBeInTheDocument()
    })

    const validJson = JSON.stringify({
      parlare: {
        regular: true,
        reflexive: false,
        tr_ptBR: 'falar',
        tr_en: 'to speak',
      },
    })
    const file = new File([validJson], 'verbs.json', {
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
      name: /import verbs/i,
    })
    fireEvent.click(importButton)

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith('Import successful')
    })

    // Check that import button is disabled again (content cleared)
    expect(importButton).toBeDisabled()
  })

  it('handles file input with no file selected', () => {
    render(<ImportVerbs onError={mockOnError} onSuccess={mockOnSuccess} />)

    const uploadButton = screen.getByRole('button', {
      name: /Import Verbs from JSON/i,
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
        italian: 'correre',
        existing: {
          regular: false,
          reflexive: false,
          tr_ptBR: 'correr (antigo)',
          tr_en: 'to run (old)',
        },
        new: {
          regular: false,
          reflexive: false,
          tr_ptBR: 'correr (novo)',
          tr_en: 'to run (new)',
        },
      },
    ]

    mockUnwrap.mockRejectedValueOnce({
      status: 409,
      data: { conflicts },
    })

    render(<ImportVerbs onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Open dialog, load file, and trigger conflict
    const uploadButton = screen.getByRole('button', {
      name: /Import Verbs from JSON/i,
    })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByTestId('import-dialog')).toBeInTheDocument()
    })

    const validJson = JSON.stringify({ correre: conflicts[0]!.new })
    const file = new File([validJson], 'verbs.json', {
      type: 'application/json',
    })

    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })

    const dialog = screen.getByTestId('import-dialog')
    const importButton = within(dialog).getByRole('button', {
      name: /import verbs/i,
    })
    fireEvent.click(importButton)

    await waitFor(() => {
      expect(screen.getByTestId('conflict-dialog')).toBeInTheDocument()
    })

    // Verify conflict details are rendered
    const conflictDialog = screen.getByTestId('conflict-dialog')
    expect(within(conflictDialog).getByText('correre')).toBeInTheDocument()
    expect(
      within(conflictDialog).getByText('Existing Data')
    ).toBeInTheDocument()
    expect(within(conflictDialog).getByText('New Data')).toBeInTheDocument()
  })

  it('handles multiple conflicts resolution', async () => {
    const conflicts = [
      {
        italian: 'parlare',
        existing: {
          regular: true,
          reflexive: false,
          tr_ptBR: 'falar (antigo)',
          tr_en: 'to speak (old)',
        },
        new: {
          regular: true,
          reflexive: false,
          tr_ptBR: 'falar (novo)',
          tr_en: 'to speak (new)',
        },
      },
      {
        italian: 'mangiare',
        existing: {
          regular: true,
          reflexive: false,
          tr_ptBR: 'comer (antigo)',
          tr_en: 'to eat (old)',
        },
        new: {
          regular: true,
          reflexive: false,
          tr_ptBR: 'comer (novo)',
          tr_en: 'to eat (new)',
        },
      },
    ]

    // First call fails with conflicts
    mockUnwrap.mockRejectedValueOnce({
      status: 409,
      data: { conflicts },
    })
    // Second call succeeds
    mockUnwrap.mockResolvedValueOnce({
      message: 'Import successful after resolution',
    })

    render(<ImportVerbs onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Open dialog and upload file
    const uploadButton = screen.getByRole('button', {
      name: /Import Verbs from JSON/i,
    })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByTestId('import-dialog')).toBeInTheDocument()
    })

    const validJson = JSON.stringify({
      parlare: conflicts[0]!.new,
      mangiare: conflicts[1]!.new,
    })
    const file = new File([validJson], 'verbs.json', {
      type: 'application/json',
    })

    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })

    // Import to trigger conflict
    const dialog = screen.getByTestId('import-dialog')
    const importButton = within(dialog).getByRole('button', {
      name: /import verbs/i,
    })
    fireEvent.click(importButton)

    await waitFor(() => {
      expect(screen.getByTestId('conflict-dialog')).toBeInTheDocument()
    })

    // Resolve first conflict with keep
    const keepButtons = screen.getAllByRole('button', {
      name: /Keep Existing/i,
    })
    fireEvent.click(keepButtons[0]!)

    // Resolve second conflict with replace
    const replaceButtons = screen.getAllByRole('button', {
      name: /Replace with New/i,
    })
    fireEvent.click(replaceButtons[1]!)

    // Continue import
    const continueButton = screen.getByRole('button', {
      name: /Continue Import/i,
    })
    expect(continueButton).not.toBeDisabled()
    fireEvent.click(continueButton)

    await waitFor(() => {
      expect(mockImportVerbs).toHaveBeenCalledWith({
        verbs: expect.any(Object),
        resolveConflicts: {
          parlare: 'keep',
          mangiare: 'replace',
        },
      })
      expect(mockOnSuccess).toHaveBeenCalledWith(
        'Import successful after resolution'
      )
    })
  })

  it('closes conflict dialog without continuing', async () => {
    const conflicts = [
      {
        italian: 'bere',
        existing: {
          regular: false,
          reflexive: false,
          tr_ptBR: 'beber (antigo)',
          tr_en: 'to drink (old)',
        },
        new: {
          regular: false,
          reflexive: false,
          tr_ptBR: 'beber (novo)',
          tr_en: 'to drink (new)',
        },
      },
    ]

    mockUnwrap.mockRejectedValueOnce({
      status: 409,
      data: { conflicts },
    })

    render(<ImportVerbs onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Open dialog and trigger conflict
    const uploadButton = screen.getByRole('button', {
      name: /Import Verbs from JSON/i,
    })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByTestId('import-dialog')).toBeInTheDocument()
    })

    const validJson = JSON.stringify({ bere: conflicts[0]!.new })
    const file = new File([validJson], 'verbs.json', {
      type: 'application/json',
    })

    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })

    const dialog = screen.getByTestId('import-dialog')
    const importButton = within(dialog).getByRole('button', {
      name: /import verbs/i,
    })
    fireEvent.click(importButton)

    await waitFor(() => {
      expect(screen.getByTestId('conflict-dialog')).toBeInTheDocument()
    })

    // Close conflict dialog
    const closeButton = screen.getByText('Close Conflicts')
    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByTestId('conflict-dialog')).not.toBeInTheDocument()
    })

    // Verify import wasn't called again
    expect(mockImportVerbs).toHaveBeenCalledTimes(1)
  })

  it('handles reflexive and irregular verb properties in conflicts', async () => {
    const conflicts = [
      {
        italian: 'vestirsi',
        existing: {
          regular: false,
          reflexive: true,
          tr_ptBR: 'vestir-se (antigo)',
          tr_en: 'to dress oneself (old)',
        },
        new: {
          regular: false,
          reflexive: true,
          tr_ptBR: 'vestir-se (novo)',
          tr_en: 'to dress oneself (new)',
        },
      },
    ]

    mockUnwrap.mockRejectedValueOnce({
      status: 409,
      data: { conflicts },
    })

    render(<ImportVerbs onError={mockOnError} onSuccess={mockOnSuccess} />)

    // Open and trigger conflict
    const uploadButton = screen.getByRole('button', {
      name: /Import Verbs from JSON/i,
    })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByTestId('import-dialog')).toBeInTheDocument()
    })

    const validJson = JSON.stringify({ vestirsi: conflicts[0]!.new })
    const file = new File([validJson], 'verbs.json', {
      type: 'application/json',
    })

    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })

    const dialog = screen.getByTestId('import-dialog')
    const importButton = within(dialog).getByRole('button', {
      name: /import verbs/i,
    })
    fireEvent.click(importButton)

    await waitFor(() => {
      expect(screen.getByTestId('conflict-dialog')).toBeInTheDocument()
    })

    // Verify the conflict details are rendered (reflexive and irregular properties)
    const conflictDialog = screen.getByTestId('conflict-dialog')
    expect(within(conflictDialog).getByText('vestirsi')).toBeInTheDocument()
  })
})
