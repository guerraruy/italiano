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
import { useImportConjugationsMutation } from '@/app/store/api'

import ImportConjugations from './ImportConjugations'

// Mock the API hook
jest.mock('@/app/store/api', () => ({
  useImportConjugationsMutation: jest.fn(),
}))

// Mock the shared dialog components
jest.mock('../../shared', () => ({
  ImportDialog: ({
    open,
    onClose,
    onFileUpload,
    onImport,
    hasContent,
    previewContent,
  }: {
    open: boolean
    onClose: () => void
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
    onImport: () => void
    hasContent: boolean
    previewContent?: React.ReactNode
  }) => {
    if (!open) return null
    return (
      <div data-testid="import-dialog">
        <button onClick={onClose}>Close</button>
        <label>
          Choose JSON File
          <input
            type="file"
            onChange={onFileUpload}
            data-testid="file-input"
            multiple
          />
        </label>
        <button onClick={onImport} disabled={!hasContent}>
          Import Conjugations
        </button>
        {previewContent && (
          <div data-testid="preview-content">{previewContent}</div>
        )}
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
    conflicts: unknown[]
    resolutions: Record<string, string>
    onResolve: (key: string, action: 'keep' | 'replace') => void
    onContinue: () => void
    renderConflictTitle: (conflict: { verbName: string }) => string
    renderExistingData: (conflict: unknown) => React.ReactNode
    renderNewData: (conflict: unknown) => React.ReactNode
  }) => {
    if (!open) return null
    return (
      <div data-testid="conflict-dialog">
        <h2>Resolve Conflicts</h2>
        <button onClick={onClose}>Close Conflicts</button>
        {conflicts.map((c: unknown, index: number) => {
          const conflict = c as { verbName: string }
          return (
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
              <button onClick={() => onResolve(conflict.verbName, 'keep')}>
                Keep Existing
              </button>
              <button onClick={() => onResolve(conflict.verbName, 'replace')}>
                Replace with New
              </button>
            </div>
          )
        })}
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

const mockConjugationData = {
  Indicativo: {
    Presente: {
      io: 'parlo',
      tu: 'parli',
      'lui/lei': 'parla',
      noi: 'parliamo',
      voi: 'parlate',
      loro: 'parlano',
    },
    'Passato Prossimo': {
      io: 'ho parlato',
      tu: 'hai parlato',
      'lui/lei': 'ha parlato',
      noi: 'abbiamo parlato',
      voi: 'avete parlato',
      loro: 'hanno parlato',
    },
  },
  Congiuntivo: {
    Presente: {
      io: 'parli',
      tu: 'parli',
      'lui/lei': 'parli',
      noi: 'parliamo',
      voi: 'parliate',
      loro: 'parlino',
    },
  },
}

const mockSecondConjugation = {
  Indicativo: {
    Presente: {
      io: 'mangio',
      tu: 'mangi',
      'lui/lei': 'mangia',
      noi: 'mangiamo',
      voi: 'mangiate',
      loro: 'mangiano',
    },
  },
}

// Helper function to create a mock file with working text() method
function createMockFile(content: string, name: string): File {
  const file = new File([content], name, { type: 'application/json' })
  // Mock the text() method to return a Promise with the content
  file.text = jest.fn().mockResolvedValue(content)
  return file
}

// Helper to create FileList-like object
function createFileList(files: File[]): FileList {
  const fileList = {
    length: files.length,
    item: (index: number) => files[index] || null,
    [Symbol.iterator]: function* () {
      for (let i = 0; i < files.length; i++) {
        yield files[i]
      }
    },
  } as unknown as FileList

  // Add indexed access
  files.forEach((file, index) => {
    Object.defineProperty(fileList, index, {
      value: file,
      enumerable: true,
    })
  })

  return fileList
}

describe('ImportConjugations', () => {
  const mockOnError = jest.fn()
  const mockOnSuccess = jest.fn()
  const mockImportConjugations = jest.fn()
  const mockUnwrap = jest.fn()

  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
    mockImportConjugations.mockReturnValue({ unwrap: mockUnwrap })
    ;(useImportConjugationsMutation as jest.Mock).mockReturnValue([
      mockImportConjugations,
      { isLoading: false },
    ])
  })

  it('renders correctly', async () => {
    render(
      <ImportConjugations onError={mockOnError} onSuccess={mockOnSuccess} />
    )

    // Initially shows only the upload icon button
    const uploadButton = screen.getByRole('button', {
      name: /Import Conjugations from JSON/i,
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
    render(
      <ImportConjugations onError={mockOnError} onSuccess={mockOnSuccess} />
    )

    // Open the dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Conjugations from JSON/i,
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
    render(
      <ImportConjugations onError={mockOnError} onSuccess={mockOnSuccess} />
    )

    // Open the import dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Conjugations from JSON/i,
    })
    fireEvent.click(uploadButton)

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText('Choose JSON File')).toBeInTheDocument()
    })

    const file = createMockFile('invalid json', 'parlare.json')
    const fileList = createFileList([file])

    // Find the file input
    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: fileList } })

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        'Errors loading files:\nparlare.json: Invalid JSON format'
      )
    })
  })

  it('handles valid single JSON file upload', async () => {
    render(
      <ImportConjugations onError={mockOnError} onSuccess={mockOnSuccess} />
    )

    // Open the import dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Conjugations from JSON/i,
    })
    fireEvent.click(uploadButton)

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText('Choose JSON File')).toBeInTheDocument()
    })

    const file = createMockFile(
      JSON.stringify(mockConjugationData),
      'parlare.json'
    )
    const fileList = createFileList([file])

    // Find the file input
    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: fileList } })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(
        '1 file(s) loaded successfully. Click "Import Conjugations" to proceed.'
      )
    })
  })

  it('handles multiple valid JSON files upload', async () => {
    render(
      <ImportConjugations onError={mockOnError} onSuccess={mockOnSuccess} />
    )

    // Open the import dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Conjugations from JSON/i,
    })
    fireEvent.click(uploadButton)

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText('Choose JSON File')).toBeInTheDocument()
    })

    const file1 = createMockFile(
      JSON.stringify(mockConjugationData),
      'parlare.json'
    )
    const file2 = createMockFile(
      JSON.stringify(mockSecondConjugation),
      'mangiare.json'
    )
    const fileList = createFileList([file1, file2])

    // Find the file input
    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: fileList } })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(
        '2 file(s) loaded successfully. Click "Import Conjugations" to proceed.'
      )
    })
  })

  it('imports conjugations successfully', async () => {
    mockUnwrap.mockResolvedValue({
      message: 'Conjugations imported successfully',
    })

    render(
      <ImportConjugations onError={mockOnError} onSuccess={mockOnSuccess} />
    )

    // Open the import dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Conjugations from JSON/i,
    })
    fireEvent.click(uploadButton)

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText('Choose JSON File')).toBeInTheDocument()
    })

    const file = createMockFile(
      JSON.stringify(mockConjugationData),
      'parlare.json'
    )
    const fileList = createFileList([file])

    // Find the file input and upload file
    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: fileList } })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(
        '1 file(s) loaded successfully. Click "Import Conjugations" to proceed.'
      )
    })

    // Click import
    const dialog = screen.getByTestId('import-dialog')
    const importButton = within(dialog).getByRole('button', {
      name: /import conjugations/i,
    })
    fireEvent.click(importButton)

    await waitFor(() => {
      expect(mockImportConjugations).toHaveBeenCalledWith({
        conjugations: {
          parlare: mockConjugationData,
        },
        resolveConflicts: undefined,
      })
      expect(mockOnSuccess).toHaveBeenCalledWith(
        'Conjugations imported successfully'
      )
    })
  })

  it('handles import without file loaded', async () => {
    render(
      <ImportConjugations onError={mockOnError} onSuccess={mockOnSuccess} />
    )

    // Open the import dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Conjugations from JSON/i,
    })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByTestId('import-dialog')).toBeInTheDocument()
    })

    const dialog = screen.getByTestId('import-dialog')
    const importButton = within(dialog).getByRole('button', {
      name: /import conjugations/i,
    })

    // Import button should be disabled when no content
    expect(importButton).toBeDisabled()
  })

  it('handles import error', async () => {
    const errorMessage = 'Server error during import'
    mockUnwrap.mockRejectedValueOnce({
      data: { error: errorMessage },
    })

    render(
      <ImportConjugations onError={mockOnError} onSuccess={mockOnSuccess} />
    )

    // Open the import dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Conjugations from JSON/i,
    })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByText('Choose JSON File')).toBeInTheDocument()
    })

    // Load valid file
    const file = createMockFile(
      JSON.stringify(mockConjugationData),
      'parlare.json'
    )
    const fileList = createFileList([file])

    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: fileList } })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })

    // Try to import
    const dialog = screen.getByTestId('import-dialog')
    const importButton = within(dialog).getByRole('button', {
      name: /import conjugations/i,
    })
    fireEvent.click(importButton)

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(errorMessage)
    })
  })

  it('handles import error without error message', async () => {
    mockUnwrap.mockRejectedValueOnce({})

    render(
      <ImportConjugations onError={mockOnError} onSuccess={mockOnSuccess} />
    )

    // Open the import dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Conjugations from JSON/i,
    })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByText('Choose JSON File')).toBeInTheDocument()
    })

    // Load valid file
    const file = createMockFile(
      JSON.stringify(mockConjugationData),
      'parlare.json'
    )
    const fileList = createFileList([file])

    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: fileList } })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })

    // Try to import
    const dialog = screen.getByTestId('import-dialog')
    const importButton = within(dialog).getByRole('button', {
      name: /import conjugations/i,
    })
    fireEvent.click(importButton)

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Error importing conjugations')
    })
  })

  it('handles conflicts correctly', async () => {
    const conflicts = [
      {
        verbName: 'parlare',
        existing: mockConjugationData,
        new: {
          ...mockConjugationData,
          Indicativo: {
            ...mockConjugationData.Indicativo,
            Presente: {
              ...mockConjugationData.Indicativo.Presente,
              io: 'parlo (new)',
            },
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

    render(
      <ImportConjugations onError={mockOnError} onSuccess={mockOnSuccess} />
    )

    // Open the import dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Conjugations from JSON/i,
    })
    fireEvent.click(uploadButton)

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText('Choose JSON File')).toBeInTheDocument()
    })

    // Load file
    const file = createMockFile(
      JSON.stringify(conflicts[0]!.new),
      'parlare.json'
    )
    const fileList = createFileList([file])

    // Find the file input
    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: fileList } })

    // Wait for file to be loaded
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(
        '1 file(s) loaded successfully. Click "Import Conjugations" to proceed.'
      )
    })

    // Click import
    const dialog = screen.getByTestId('import-dialog')
    const importButton = within(dialog).getByRole('button', {
      name: /import conjugations/i,
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
      expect(mockImportConjugations).toHaveBeenCalledWith({
        conjugations: expect.any(Object),
        resolveConflicts: {
          parlare: 'replace',
        },
      })
    })
  })

  it('handles multiple conflicts resolution', async () => {
    const conflicts = [
      {
        verbName: 'parlare',
        existing: mockConjugationData,
        new: mockConjugationData,
      },
      {
        verbName: 'mangiare',
        existing: mockSecondConjugation,
        new: mockSecondConjugation,
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

    render(
      <ImportConjugations onError={mockOnError} onSuccess={mockOnSuccess} />
    )

    // Open dialog and upload files
    const uploadButton = screen.getByRole('button', {
      name: /Import Conjugations from JSON/i,
    })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByTestId('import-dialog')).toBeInTheDocument()
    })

    const file1 = createMockFile(
      JSON.stringify(mockConjugationData),
      'parlare.json'
    )
    const file2 = createMockFile(
      JSON.stringify(mockSecondConjugation),
      'mangiare.json'
    )
    const fileList = createFileList([file1, file2])

    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: fileList } })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })

    // Import to trigger conflict
    const dialog = screen.getByTestId('import-dialog')
    const importButton = within(dialog).getByRole('button', {
      name: /import conjugations/i,
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
      expect(mockImportConjugations).toHaveBeenCalledWith({
        conjugations: expect.any(Object),
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
        verbName: 'bere',
        existing: mockConjugationData,
        new: mockConjugationData,
      },
    ]

    mockUnwrap.mockRejectedValueOnce({
      status: 409,
      data: { conflicts },
    })

    render(
      <ImportConjugations onError={mockOnError} onSuccess={mockOnSuccess} />
    )

    // Open dialog and trigger conflict
    const uploadButton = screen.getByRole('button', {
      name: /Import Conjugations from JSON/i,
    })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByTestId('import-dialog')).toBeInTheDocument()
    })

    const file = createMockFile(
      JSON.stringify(mockConjugationData),
      'bere.json'
    )
    const fileList = createFileList([file])

    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: fileList } })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })

    const dialog = screen.getByTestId('import-dialog')
    const importButton = within(dialog).getByRole('button', {
      name: /import conjugations/i,
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
    expect(mockImportConjugations).toHaveBeenCalledTimes(1)
  })

  it('clears state after successful import', async () => {
    mockUnwrap.mockResolvedValue({ message: 'Import successful' })

    render(
      <ImportConjugations onError={mockOnError} onSuccess={mockOnSuccess} />
    )

    // Open dialog and upload file
    const uploadButton = screen.getByRole('button', {
      name: /Import Conjugations from JSON/i,
    })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByTestId('import-dialog')).toBeInTheDocument()
    })

    const file = createMockFile(
      JSON.stringify(mockConjugationData),
      'parlare.json'
    )
    const fileList = createFileList([file])

    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: fileList } })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })

    // Import
    const dialog = screen.getByTestId('import-dialog')
    const importButton = within(dialog).getByRole('button', {
      name: /import conjugations/i,
    })
    fireEvent.click(importButton)

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith('Import successful')
    })

    // Check that import button is disabled again (content cleared)
    expect(importButton).toBeDisabled()
  })

  it('handles file input with no file selected', () => {
    render(
      <ImportConjugations onError={mockOnError} onSuccess={mockOnSuccess} />
    )

    const uploadButton = screen.getByRole('button', {
      name: /Import Conjugations from JSON/i,
    })
    fireEvent.click(uploadButton)

    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [] } })

    // Should not call any callbacks
    expect(mockOnError).not.toHaveBeenCalled()
    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('handles file input with null files', () => {
    render(
      <ImportConjugations onError={mockOnError} onSuccess={mockOnSuccess} />
    )

    const uploadButton = screen.getByRole('button', {
      name: /Import Conjugations from JSON/i,
    })
    fireEvent.click(uploadButton)

    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: null } })

    // Should not call any callbacks
    expect(mockOnError).not.toHaveBeenCalled()
    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('extracts verb name from filename correctly', async () => {
    mockUnwrap.mockResolvedValue({ message: 'Import successful' })

    render(
      <ImportConjugations onError={mockOnError} onSuccess={mockOnSuccess} />
    )

    // Open the import dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Conjugations from JSON/i,
    })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByTestId('import-dialog')).toBeInTheDocument()
    })

    // File with specific name
    const file = createMockFile(
      JSON.stringify(mockConjugationData),
      'essere.json'
    )
    const fileList = createFileList([file])

    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: fileList } })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })

    // Click import
    const dialog = screen.getByTestId('import-dialog')
    const importButton = within(dialog).getByRole('button', {
      name: /import conjugations/i,
    })
    fireEvent.click(importButton)

    await waitFor(() => {
      expect(mockImportConjugations).toHaveBeenCalledWith({
        conjugations: {
          essere: mockConjugationData,
        },
        resolveConflicts: undefined,
      })
    })
  })

  it('shows preview content with file list', async () => {
    render(
      <ImportConjugations onError={mockOnError} onSuccess={mockOnSuccess} />
    )

    // Open the import dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Conjugations from JSON/i,
    })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByTestId('import-dialog')).toBeInTheDocument()
    })

    const file1 = createMockFile(
      JSON.stringify(mockConjugationData),
      'parlare.json'
    )
    const file2 = createMockFile(
      JSON.stringify(mockSecondConjugation),
      'mangiare.json'
    )
    const fileList = createFileList([file1, file2])

    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: fileList } })

    await waitFor(() => {
      expect(screen.getByTestId('preview-content')).toBeInTheDocument()
      expect(screen.getByText('parlare.json')).toBeInTheDocument()
      expect(screen.getByText('mangiare.json')).toBeInTheDocument()
      expect(screen.getByText('Verb: parlare')).toBeInTheDocument()
      expect(screen.getByText('Verb: mangiare')).toBeInTheDocument()
    })
  })

  it('allows removing files from preview', async () => {
    render(
      <ImportConjugations onError={mockOnError} onSuccess={mockOnSuccess} />
    )

    // Open the import dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Conjugations from JSON/i,
    })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByTestId('import-dialog')).toBeInTheDocument()
    })

    const file1 = createMockFile(
      JSON.stringify(mockConjugationData),
      'parlare.json'
    )
    const file2 = createMockFile(
      JSON.stringify(mockSecondConjugation),
      'mangiare.json'
    )
    const fileList = createFileList([file1, file2])

    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: fileList } })

    await waitFor(() => {
      expect(screen.getByText('parlare.json')).toBeInTheDocument()
      expect(screen.getByText('mangiare.json')).toBeInTheDocument()
    })

    // Find and click delete button for first file
    const deleteButtons = screen.getAllByLabelText('delete')
    fireEvent.click(deleteButtons[0]!)

    await waitFor(() => {
      expect(screen.queryByText('parlare.json')).not.toBeInTheDocument()
      expect(screen.getByText('mangiare.json')).toBeInTheDocument()
    })
  })

  it('imports only remaining files after removing some', async () => {
    mockUnwrap.mockResolvedValue({ message: 'Import successful' })

    render(
      <ImportConjugations onError={mockOnError} onSuccess={mockOnSuccess} />
    )

    // Open the import dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Conjugations from JSON/i,
    })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByTestId('import-dialog')).toBeInTheDocument()
    })

    const file1 = createMockFile(
      JSON.stringify(mockConjugationData),
      'parlare.json'
    )
    const file2 = createMockFile(
      JSON.stringify(mockSecondConjugation),
      'mangiare.json'
    )
    const fileList = createFileList([file1, file2])

    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: fileList } })

    await waitFor(() => {
      expect(screen.getByText('parlare.json')).toBeInTheDocument()
    })

    // Remove first file
    const deleteButtons = screen.getAllByLabelText('delete')
    fireEvent.click(deleteButtons[0]!)

    await waitFor(() => {
      expect(screen.queryByText('parlare.json')).not.toBeInTheDocument()
    })

    // Click import
    const dialog = screen.getByTestId('import-dialog')
    const importButton = within(dialog).getByRole('button', {
      name: /import conjugations/i,
    })
    fireEvent.click(importButton)

    await waitFor(() => {
      expect(mockImportConjugations).toHaveBeenCalledWith({
        conjugations: {
          mangiare: mockSecondConjugation,
        },
        resolveConflicts: undefined,
      })
    })
  })

  it('disables upload button when loading', async () => {
    ;(useImportConjugationsMutation as jest.Mock).mockReturnValue([
      mockImportConjugations,
      { isLoading: true },
    ])

    render(
      <ImportConjugations onError={mockOnError} onSuccess={mockOnSuccess} />
    )

    const uploadButton = screen.getByRole('button', {
      name: /Import Conjugations from JSON/i,
    })
    expect(uploadButton).toBeDisabled()
  })

  it('adds additional files to existing files', async () => {
    render(
      <ImportConjugations onError={mockOnError} onSuccess={mockOnSuccess} />
    )

    // Open the import dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Conjugations from JSON/i,
    })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByTestId('import-dialog')).toBeInTheDocument()
    })

    // Upload first file
    const file1 = createMockFile(
      JSON.stringify(mockConjugationData),
      'parlare.json'
    )
    const fileList1 = createFileList([file1])

    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: fileList1 } })

    await waitFor(() => {
      expect(screen.getByText('parlare.json')).toBeInTheDocument()
    })

    // Upload second file
    const file2 = createMockFile(
      JSON.stringify(mockSecondConjugation),
      'mangiare.json'
    )
    const fileList2 = createFileList([file2])

    fireEvent.change(fileInput, { target: { files: fileList2 } })

    await waitFor(() => {
      expect(screen.getByText('parlare.json')).toBeInTheDocument()
      expect(screen.getByText('mangiare.json')).toBeInTheDocument()
    })
  })

  it('handles mixed valid and invalid files in batch upload', async () => {
    render(
      <ImportConjugations onError={mockOnError} onSuccess={mockOnSuccess} />
    )

    // Open the import dialog
    const uploadButton = screen.getByRole('button', {
      name: /Import Conjugations from JSON/i,
    })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByTestId('import-dialog')).toBeInTheDocument()
    })

    const validFile = createMockFile(
      JSON.stringify(mockConjugationData),
      'parlare.json'
    )
    const invalidFile = createMockFile('not valid json', 'invalid.json')
    const fileList = createFileList([validFile, invalidFile])

    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: fileList } })

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        'Errors loading files:\ninvalid.json: Invalid JSON format'
      )
    })

    // Valid file should still be added to the list
    expect(screen.getByText('parlare.json')).toBeInTheDocument()
  })

  it('renders conflict data correctly with mood and tense structure', async () => {
    const conflicts = [
      {
        verbName: 'correre',
        existing: {
          Indicativo: {
            Presente: {
              io: 'corro (old)',
              tu: 'corri',
            },
          },
        },
        new: {
          Indicativo: {
            Presente: {
              io: 'corro (new)',
              tu: 'corri',
            },
          },
        },
      },
    ]

    mockUnwrap.mockRejectedValueOnce({
      status: 409,
      data: { conflicts },
    })

    render(
      <ImportConjugations onError={mockOnError} onSuccess={mockOnSuccess} />
    )

    // Open dialog, load file, and trigger conflict
    const uploadButton = screen.getByRole('button', {
      name: /Import Conjugations from JSON/i,
    })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByTestId('import-dialog')).toBeInTheDocument()
    })

    const file = createMockFile(
      JSON.stringify(conflicts[0]!.new),
      'correre.json'
    )
    const fileList = createFileList([file])

    const fileInput = screen.getByTestId('file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: fileList } })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })

    const dialog = screen.getByTestId('import-dialog')
    const importButton = within(dialog).getByRole('button', {
      name: /import conjugations/i,
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
})
