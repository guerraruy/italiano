import React from 'react'

import { ThemeProvider, createTheme } from '@mui/material/styles'
import { render, screen, fireEvent } from '@testing-library/react'

import '@testing-library/jest-dom'

import ResetStatisticsDialog from './ResetStatisticsDialog'

const theme = createTheme()

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

describe('ResetStatisticsDialog', () => {
  const mockOnClose = jest.fn()
  const mockOnConfirm = jest.fn()

  const defaultProps = {
    open: true,
    verbTranslation: 'to speak',
    isResetting: false,
    error: null,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the dialog when open is true', () => {
      renderWithTheme(<ResetStatisticsDialog {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('does not render the dialog when open is false', () => {
      renderWithTheme(<ResetStatisticsDialog {...defaultProps} open={false} />)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders the dialog title', () => {
      renderWithTheme(<ResetStatisticsDialog {...defaultProps} />)

      expect(screen.getByText('Reset Statistics')).toBeInTheDocument()
    })

    it('renders the verb translation in the confirmation message', () => {
      renderWithTheme(<ResetStatisticsDialog {...defaultProps} />)

      expect(
        screen.getByText(
          /Are you sure you want to reset all statistics for the verb/
        )
      ).toBeInTheDocument()
      expect(screen.getByText(/"to speak"/)).toBeInTheDocument()
    })

    it('renders Cancel button', () => {
      renderWithTheme(<ResetStatisticsDialog {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    it('renders Reset button', () => {
      renderWithTheme(<ResetStatisticsDialog {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
    })
  })

  describe('Verb Translation Display', () => {
    it('displays the correct verb translation in the message', () => {
      renderWithTheme(
        <ResetStatisticsDialog {...defaultProps} verbTranslation="to eat" />
      )

      expect(screen.getByText(/"to eat"/)).toBeInTheDocument()
    })

    it('handles null verbTranslation gracefully', () => {
      renderWithTheme(
        <ResetStatisticsDialog {...defaultProps} verbTranslation={null} />
      )

      expect(
        screen.getByText(
          /Are you sure you want to reset all statistics for the verb/
        )
      ).toBeInTheDocument()
    })

    it('handles empty string verbTranslation', () => {
      renderWithTheme(
        <ResetStatisticsDialog {...defaultProps} verbTranslation="" />
      )

      expect(
        screen.getByText(
          /Are you sure you want to reset all statistics for the verb/
        )
      ).toBeInTheDocument()
    })

    it('handles verbTranslation with special characters', () => {
      renderWithTheme(
        <ResetStatisticsDialog
          {...defaultProps}
          verbTranslation="to speak (formal)"
        />
      )

      expect(screen.getByText(/"to speak \(formal\)"/)).toBeInTheDocument()
    })
  })

  describe('Error Display', () => {
    it('renders error alert when error is provided', () => {
      renderWithTheme(
        <ResetStatisticsDialog
          {...defaultProps}
          error="Failed to reset statistics"
        />
      )

      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Failed to reset statistics')).toBeInTheDocument()
    })

    it('does not render error alert when error is null', () => {
      renderWithTheme(<ResetStatisticsDialog {...defaultProps} error={null} />)

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('does not render error alert when error is undefined', () => {
      renderWithTheme(
        <ResetStatisticsDialog {...defaultProps} error={undefined} />
      )

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('displays different error messages correctly', () => {
      renderWithTheme(
        <ResetStatisticsDialog
          {...defaultProps}
          error="Network error. Please try again."
        />
      )

      expect(
        screen.getByText('Network error. Please try again.')
      ).toBeInTheDocument()
    })
  })

  describe('Loading State (isResetting)', () => {
    it('shows "Resetting..." text on Reset button when isResetting is true', () => {
      renderWithTheme(
        <ResetStatisticsDialog {...defaultProps} isResetting={true} />
      )

      expect(
        screen.getByRole('button', { name: 'Resetting...' })
      ).toBeInTheDocument()
    })

    it('shows "Reset" text on Reset button when isResetting is false', () => {
      renderWithTheme(
        <ResetStatisticsDialog {...defaultProps} isResetting={false} />
      )

      expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
    })

    it('disables Cancel button when isResetting is true', () => {
      renderWithTheme(
        <ResetStatisticsDialog {...defaultProps} isResetting={true} />
      )

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    })

    it('disables Reset button when isResetting is true', () => {
      renderWithTheme(
        <ResetStatisticsDialog {...defaultProps} isResetting={true} />
      )

      expect(
        screen.getByRole('button', { name: 'Resetting...' })
      ).toBeDisabled()
    })

    it('enables Cancel button when isResetting is false', () => {
      renderWithTheme(
        <ResetStatisticsDialog {...defaultProps} isResetting={false} />
      )

      expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeDisabled()
    })

    it('enables Reset button when isResetting is false', () => {
      renderWithTheme(
        <ResetStatisticsDialog {...defaultProps} isResetting={false} />
      )

      expect(screen.getByRole('button', { name: 'Reset' })).not.toBeDisabled()
    })
  })

  describe('Event Handlers', () => {
    it('calls onClose when Cancel button is clicked', () => {
      renderWithTheme(<ResetStatisticsDialog {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls onConfirm when Reset button is clicked', () => {
      renderWithTheme(<ResetStatisticsDialog {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: 'Reset' }))

      expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    })

    it('does not call onConfirm when Cancel is clicked', () => {
      renderWithTheme(<ResetStatisticsDialog {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(mockOnConfirm).not.toHaveBeenCalled()
    })

    it('does not call onClose when Reset is clicked', () => {
      renderWithTheme(<ResetStatisticsDialog {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: 'Reset' }))

      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('calls onClose when dialog backdrop is clicked', () => {
      renderWithTheme(<ResetStatisticsDialog {...defaultProps} />)

      const backdrop = document.querySelector('.MuiBackdrop-root')
      if (backdrop) {
        fireEvent.click(backdrop)
      }

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('does not call handlers when buttons are disabled', () => {
      renderWithTheme(
        <ResetStatisticsDialog {...defaultProps} isResetting={true} />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
      fireEvent.click(screen.getByRole('button', { name: 'Resetting...' }))

      expect(mockOnClose).not.toHaveBeenCalled()
      expect(mockOnConfirm).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has correct aria-labelledby attribute on dialog', () => {
      renderWithTheme(<ResetStatisticsDialog {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-labelledby', 'reset-dialog-title')
    })

    it('has correct aria-describedby attribute on dialog', () => {
      renderWithTheme(<ResetStatisticsDialog {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute(
        'aria-describedby',
        'reset-dialog-description'
      )
    })

    it('has correct id on dialog title', () => {
      renderWithTheme(<ResetStatisticsDialog {...defaultProps} />)

      const title = screen.getByText('Reset Statistics')
      expect(title).toHaveAttribute('id', 'reset-dialog-title')
    })

    it('has correct id on dialog content text', () => {
      renderWithTheme(<ResetStatisticsDialog {...defaultProps} />)

      const description = screen.getByText(
        /Are you sure you want to reset all statistics/
      )
      expect(description).toHaveAttribute('id', 'reset-dialog-description')
    })

    it('Reset button has autoFocus', () => {
      renderWithTheme(<ResetStatisticsDialog {...defaultProps} />)

      const resetButton = screen.getByRole('button', { name: 'Reset' })
      // In MUI Dialog, autoFocus button will be focused when dialog opens
      expect(resetButton).toHaveAttribute('tabindex', '0')
    })
  })

  describe('Button Styling', () => {
    it('Reset button has error color', () => {
      renderWithTheme(<ResetStatisticsDialog {...defaultProps} />)

      const resetButton = screen.getByRole('button', { name: 'Reset' })
      expect(resetButton).toHaveClass('MuiButton-containedError')
    })

    it('Reset button has contained variant', () => {
      renderWithTheme(<ResetStatisticsDialog {...defaultProps} />)

      const resetButton = screen.getByRole('button', { name: 'Reset' })
      expect(resetButton).toHaveClass('MuiButton-contained')
    })

    it('Cancel button has default styling (text variant)', () => {
      renderWithTheme(<ResetStatisticsDialog {...defaultProps} />)

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      expect(cancelButton).toHaveClass('MuiButton-text')
    })
  })

  describe('Content Structure', () => {
    it('contains warning text about action being irreversible', () => {
      renderWithTheme(<ResetStatisticsDialog {...defaultProps} />)

      expect(
        screen.getByText(/This action cannot be undone/)
      ).toBeInTheDocument()
    })

    it('error alert appears before the confirmation message', () => {
      renderWithTheme(
        <ResetStatisticsDialog {...defaultProps} error="Some error" />
      )

      const alert = screen.getByRole('alert')
      const description = screen.getByText(
        /Are you sure you want to reset all statistics/
      )

      // Check that alert comes before description in DOM
      const alertPosition =
        alert.compareDocumentPosition(description) &
        Node.DOCUMENT_POSITION_FOLLOWING
      expect(alertPosition).toBeTruthy()
    })
  })

  describe('Different Verb Translations', () => {
    const verbs = [
      'to run',
      'to walk',
      'andare (to go)',
      'essere',
      'very long verb translation that might wrap',
    ]

    // Escape special regex characters in a string
    const escapeRegExp = (string: string) =>
      string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    verbs.forEach((verb) => {
      it(`renders correctly with verb: "${verb}"`, () => {
        renderWithTheme(
          <ResetStatisticsDialog {...defaultProps} verbTranslation={verb} />
        )

        expect(
          screen.getByText(new RegExp(escapeRegExp(verb)))
        ).toBeInTheDocument()
      })
    })
  })

  describe('Combined States', () => {
    it('handles isResetting with error correctly', () => {
      renderWithTheme(
        <ResetStatisticsDialog
          {...defaultProps}
          isResetting={true}
          error="Previous attempt failed"
        />
      )

      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Resetting...' })
      ).toBeDisabled()
    })

    it('handles all props being provided', () => {
      renderWithTheme(
        <ResetStatisticsDialog
          open={true}
          verbTranslation="to learn"
          isResetting={false}
          error="Some error message"
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(/"to learn"/)).toBeInTheDocument()
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Reset' })).not.toBeDisabled()
    })
  })
})
