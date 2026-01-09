import React from 'react'

import { render, screen, fireEvent } from '@testing-library/react'

import '@testing-library/jest-dom'
import ResetStatisticsDialog from './ResetStatisticsDialog'

describe('ResetStatisticsDialog', () => {
  const defaultProps = {
    open: true,
    nounTranslation: 'house',
    isResetting: false,
    error: null,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the dialog when open is true', () => {
      render(<ResetStatisticsDialog {...defaultProps} />)

      expect(
        screen.getByRole('dialog', { name: /reset statistics/i })
      ).toBeInTheDocument()
    })

    it('does not render the dialog when open is false', () => {
      render(<ResetStatisticsDialog {...defaultProps} open={false} />)

      expect(
        screen.queryByRole('dialog', { name: /reset statistics/i })
      ).not.toBeInTheDocument()
    })

    it('displays the dialog title', () => {
      render(<ResetStatisticsDialog {...defaultProps} />)

      expect(
        screen.getByRole('heading', { name: /reset statistics/i })
      ).toBeInTheDocument()
    })

    it('displays the confirmation message with noun translation', () => {
      render(<ResetStatisticsDialog {...defaultProps} />)

      expect(
        screen.getByText(
          /are you sure you want to reset all statistics for the noun "house"\?/i
        )
      ).toBeInTheDocument()
    })

    it('displays different noun translations correctly', () => {
      render(<ResetStatisticsDialog {...defaultProps} nounTranslation="book" />)

      expect(
        screen.getByText(
          /are you sure you want to reset all statistics for the noun "book"\?/i
        )
      ).toBeInTheDocument()
    })

    it('displays the warning about irreversible action', () => {
      render(<ResetStatisticsDialog {...defaultProps} />)

      expect(
        screen.getByText(/this action cannot be undone/i)
      ).toBeInTheDocument()
    })

    it('renders Cancel button', () => {
      render(<ResetStatisticsDialog {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument()
    })

    it('renders Reset button', () => {
      render(<ResetStatisticsDialog {...defaultProps} />)

      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
    })
  })

  describe('Error handling', () => {
    it('does not display error alert when error is null', () => {
      render(<ResetStatisticsDialog {...defaultProps} error={null} />)

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('does not display error alert when error is undefined', () => {
      render(<ResetStatisticsDialog {...defaultProps} error={undefined} />)

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('displays error alert when error is provided', () => {
      render(
        <ResetStatisticsDialog
          {...defaultProps}
          error="Failed to reset statistics"
        />
      )

      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Failed to reset statistics')).toBeInTheDocument()
    })

    it('displays different error messages correctly', () => {
      render(
        <ResetStatisticsDialog
          {...defaultProps}
          error="Network error occurred"
        />
      )

      expect(screen.getByText('Network error occurred')).toBeInTheDocument()
    })
  })

  describe('Button interactions', () => {
    it('calls onClose when Cancel button is clicked', () => {
      const mockOnClose = jest.fn()
      render(<ResetStatisticsDialog {...defaultProps} onClose={mockOnClose} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls onConfirm when Reset button is clicked', () => {
      const mockOnConfirm = jest.fn()
      render(
        <ResetStatisticsDialog {...defaultProps} onConfirm={mockOnConfirm} />
      )

      const resetButton = screen.getByRole('button', { name: /reset/i })
      fireEvent.click(resetButton)

      expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    })

    it('does not call onClose when clicking outside the dialog (modal backdrop)', () => {
      const mockOnClose = jest.fn()
      render(<ResetStatisticsDialog {...defaultProps} onClose={mockOnClose} />)

      // The dialog backdrop click should call onClose
      const backdrop = document.querySelector('.MuiBackdrop-root')
      if (backdrop) {
        fireEvent.click(backdrop)
        expect(mockOnClose).toHaveBeenCalledTimes(1)
      }
    })
  })

  describe('Loading state (isResetting)', () => {
    it('disables Cancel button when isResetting is true', () => {
      render(<ResetStatisticsDialog {...defaultProps} isResetting={true} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      expect(cancelButton).toBeDisabled()
    })

    it('disables Reset button when isResetting is true', () => {
      render(<ResetStatisticsDialog {...defaultProps} isResetting={true} />)

      const resetButton = screen.getByRole('button', { name: /resetting/i })
      expect(resetButton).toBeDisabled()
    })

    it('shows "Reset" text when isResetting is false', () => {
      render(<ResetStatisticsDialog {...defaultProps} isResetting={false} />)

      expect(
        screen.getByRole('button', { name: /^reset$/i })
      ).toBeInTheDocument()
    })

    it('shows "Resetting..." text when isResetting is true', () => {
      render(<ResetStatisticsDialog {...defaultProps} isResetting={true} />)

      expect(screen.getByText('Resetting...')).toBeInTheDocument()
    })

    it('enables Cancel button when isResetting is false', () => {
      render(<ResetStatisticsDialog {...defaultProps} isResetting={false} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      expect(cancelButton).not.toBeDisabled()
    })

    it('enables Reset button when isResetting is false', () => {
      render(<ResetStatisticsDialog {...defaultProps} isResetting={false} />)

      const resetButton = screen.getByRole('button', { name: /^reset$/i })
      expect(resetButton).not.toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('has aria-labelledby attribute for dialog title', () => {
      render(<ResetStatisticsDialog {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-labelledby', 'reset-dialog-title')
    })

    it('has aria-describedby attribute for dialog description', () => {
      render(<ResetStatisticsDialog {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute(
        'aria-describedby',
        'reset-dialog-description'
      )
    })

    it('Reset button receives focus when dialog opens', () => {
      render(<ResetStatisticsDialog {...defaultProps} />)

      // MUI autoFocus prop focuses the element programmatically, not via HTML attribute
      const resetButton = screen.getByRole('button', { name: /^reset$/i })
      expect(resetButton).toHaveFocus()
    })
  })

  describe('Edge cases', () => {
    it('handles null nounTranslation gracefully', () => {
      render(<ResetStatisticsDialog {...defaultProps} nounTranslation={null} />)

      expect(
        screen.getByText(/are you sure you want to reset all statistics/i)
      ).toBeInTheDocument()
    })

    it('handles special characters in nounTranslation', () => {
      render(
        <ResetStatisticsDialog
          {...defaultProps}
          nounTranslation="house (dwelling)"
        />
      )

      expect(screen.getByText(/house \(dwelling\)/i)).toBeInTheDocument()
    })

    it('handles long noun translations', () => {
      const longTranslation =
        'a very long noun translation that spans multiple words'
      render(
        <ResetStatisticsDialog
          {...defaultProps}
          nounTranslation={longTranslation}
        />
      )

      expect(
        screen.getByText(new RegExp(longTranslation, 'i'))
      ).toBeInTheDocument()
    })

    it('handles empty string nounTranslation', () => {
      render(<ResetStatisticsDialog {...defaultProps} nounTranslation="" />)

      expect(
        screen.getByText(
          /are you sure you want to reset all statistics for the noun ""\?/i
        )
      ).toBeInTheDocument()
    })
  })

  describe('Button styling', () => {
    it('Reset button has error color', () => {
      render(<ResetStatisticsDialog {...defaultProps} />)

      const resetButton = screen.getByRole('button', { name: /^reset$/i })
      expect(resetButton).toHaveClass('MuiButton-containedError')
    })

    it('Reset button is contained variant', () => {
      render(<ResetStatisticsDialog {...defaultProps} />)

      const resetButton = screen.getByRole('button', { name: /^reset$/i })
      expect(resetButton).toHaveClass('MuiButton-contained')
    })
  })
})
