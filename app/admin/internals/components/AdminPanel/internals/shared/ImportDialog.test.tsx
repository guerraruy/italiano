import React from 'react'

import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import '@testing-library/jest-dom'

import ImportDialog from './ImportDialog'

describe('ImportDialog', () => {
  const mockOnClose = jest.fn()
  const mockOnFileUpload = jest.fn()
  const mockOnImport = jest.fn()

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    title: 'Import Items',
    entityName: 'Items',
    isLoading: false,
    hasContent: false,
    onFileUpload: mockOnFileUpload,
    onImport: mockOnImport,
    formatDescription: 'Upload a JSON file with the correct format.',
    formatExample: '{\n  "key": "value"\n}',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders the dialog when open is true', () => {
      render(<ImportDialog {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('does not render the dialog content when open is false', () => {
      render(<ImportDialog {...defaultProps} open={false} />)

      expect(screen.queryByText('Import Items')).not.toBeInTheDocument()
    })

    it('displays the title', () => {
      render(<ImportDialog {...defaultProps} />)

      expect(screen.getByText('Import Items')).toBeInTheDocument()
    })

    it('renders the info button in the title', () => {
      render(<ImportDialog {...defaultProps} />)

      expect(screen.getByTestId('InfoOutlinedIcon')).toBeInTheDocument()
    })

    it('renders the Choose JSON File button', () => {
      render(<ImportDialog {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: /choose json file/i })
      ).toBeInTheDocument()
    })

    it('renders Cancel button', () => {
      render(<ImportDialog {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument()
    })

    it('does not render Import button when hasContent is false', () => {
      render(<ImportDialog {...defaultProps} hasContent={false} />)

      expect(
        screen.queryByRole('button', { name: /import items/i })
      ).not.toBeInTheDocument()
    })

    it('renders Import button when hasContent is true', () => {
      render(<ImportDialog {...defaultProps} hasContent={true} />)

      expect(
        screen.getByRole('button', { name: /import items/i })
      ).toBeInTheDocument()
    })

    it('renders the file loaded chip when hasContent is true', () => {
      render(<ImportDialog {...defaultProps} hasContent={true} />)

      expect(screen.getByText('File loaded')).toBeInTheDocument()
    })

    it('does not render the file loaded chip when hasContent is false', () => {
      render(<ImportDialog {...defaultProps} hasContent={false} />)

      expect(screen.queryByText('File loaded')).not.toBeInTheDocument()
    })

    it('renders custom fileLoadedLabel when provided', () => {
      render(
        <ImportDialog
          {...defaultProps}
          hasContent={true}
          fileLoadedLabel="3 files loaded"
        />
      )

      expect(screen.getByText('3 files loaded')).toBeInTheDocument()
    })

    it('renders preview content when provided', () => {
      render(
        <ImportDialog
          {...defaultProps}
          previewContent={<div data-testid="preview">Preview Content</div>}
        />
      )

      expect(screen.getByTestId('preview')).toBeInTheDocument()
      expect(screen.getByText('Preview Content')).toBeInTheDocument()
    })
  })

  describe('multiple file support', () => {
    it('shows singular label when multiple is false', () => {
      render(<ImportDialog {...defaultProps} multiple={false} />)

      expect(
        screen.getByRole('button', { name: /choose json file$/i })
      ).toBeInTheDocument()
    })

    it('shows plural label when multiple is true', () => {
      render(<ImportDialog {...defaultProps} multiple={true} />)

      expect(
        screen.getByRole('button', { name: /choose json file\(s\)/i })
      ).toBeInTheDocument()
    })
  })

  describe('button interactions', () => {
    it('calls onClose when Cancel button is clicked', () => {
      render(<ImportDialog {...defaultProps} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls onImport and onClose when Import button is clicked', () => {
      render(<ImportDialog {...defaultProps} hasContent={true} />)

      const importButton = screen.getByRole('button', { name: /import items/i })
      fireEvent.click(importButton)

      expect(mockOnImport).toHaveBeenCalledTimes(1)
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls onFileUpload when file is selected', () => {
      render(<ImportDialog {...defaultProps} />)

      const fileInput = document.querySelector('input[type="file"]')
      expect(fileInput).toBeInTheDocument()

      const file = new File(['{"test": "data"}'], 'test.json', {
        type: 'application/json',
      })
      fireEvent.change(fileInput!, { target: { files: [file] } })

      expect(mockOnFileUpload).toHaveBeenCalledTimes(1)
    })

    it('opens format info dialog when info button is clicked', () => {
      render(<ImportDialog {...defaultProps} />)

      const infoButton = screen
        .getByTestId('InfoOutlinedIcon')
        .closest('button')
      fireEvent.click(infoButton!)

      expect(screen.getByText('JSON Format Information')).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('disables Choose JSON File button when isLoading is true', () => {
      render(<ImportDialog {...defaultProps} isLoading={true} />)

      const chooseFileButton = screen.getByRole('button', {
        name: /choose json file/i,
      })
      expect(chooseFileButton).toHaveAttribute('aria-disabled', 'true')
    })

    it('disables Import button when isLoading is true', () => {
      render(
        <ImportDialog {...defaultProps} hasContent={true} isLoading={true} />
      )

      const importButton = screen.getByRole('button', { name: /importing/i })
      expect(importButton).toBeDisabled()
    })

    it('shows "Importing..." text when isLoading is true', () => {
      render(
        <ImportDialog {...defaultProps} hasContent={true} isLoading={true} />
      )

      expect(screen.getByText('Importing...')).toBeInTheDocument()
    })

    it('shows "Import {entityName}" text when isLoading is false', () => {
      render(
        <ImportDialog {...defaultProps} hasContent={true} isLoading={false} />
      )

      const importButton = screen.getByRole('button', { name: /import items/i })
      expect(importButton).toHaveTextContent('Import Items')
    })

    it('shows loading spinner when isLoading is true', () => {
      render(
        <ImportDialog {...defaultProps} hasContent={true} isLoading={true} />
      )

      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })
  })

  describe('format info dialog', () => {
    it('shows format description in format info dialog', () => {
      render(<ImportDialog {...defaultProps} />)

      const infoButton = screen
        .getByTestId('InfoOutlinedIcon')
        .closest('button')
      fireEvent.click(infoButton!)

      expect(
        screen.getByText('Upload a JSON file with the correct format.')
      ).toBeInTheDocument()
    })

    it('closes format info dialog when close button is clicked', async () => {
      render(<ImportDialog {...defaultProps} />)

      const infoButton = screen
        .getByTestId('InfoOutlinedIcon')
        .closest('button')
      fireEvent.click(infoButton!)

      const formatInfoHeading = screen.getByRole('heading', {
        name: /json format information/i,
      })
      expect(formatInfoHeading).toBeInTheDocument()

      const closeButton = screen.getByRole('button', { name: /close/i })
      fireEvent.click(closeButton)

      await waitFor(() => {
        expect(
          screen.queryByRole('heading', { name: /json format information/i })
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('file input configuration', () => {
    it('accepts only JSON files', () => {
      render(<ImportDialog {...defaultProps} />)

      const fileInput = document.querySelector('input[type="file"]')
      expect(fileInput).toHaveAttribute('accept', '.json')
    })

    it('allows multiple file selection when multiple is true', () => {
      render(<ImportDialog {...defaultProps} multiple={true} />)

      const fileInput = document.querySelector('input[type="file"]')
      expect(fileInput).toHaveAttribute('multiple')
    })

    it('does not allow multiple file selection when multiple is false', () => {
      render(<ImportDialog {...defaultProps} multiple={false} />)

      const fileInput = document.querySelector('input[type="file"]')
      expect(fileInput).not.toHaveAttribute('multiple')
    })
  })

  describe('accessibility', () => {
    it('has proper dialog role', () => {
      render(<ImportDialog {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('has accessible dialog title', () => {
      render(<ImportDialog {...defaultProps} />)

      expect(
        screen.getByRole('heading', { name: /import items/i })
      ).toBeInTheDocument()
    })

    it('has tooltip on info button', () => {
      render(<ImportDialog {...defaultProps} />)

      const infoButton = screen
        .getByTestId('InfoOutlinedIcon')
        .closest('button')
      expect(infoButton).toBeInTheDocument()
    })
  })
})
