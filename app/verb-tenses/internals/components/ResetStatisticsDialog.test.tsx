import React from 'react'

import { render, screen, fireEvent } from '@testing-library/react'

import '@testing-library/jest-dom'
import { ResetStatisticsDialog } from './ResetStatisticsDialog'

describe('ResetStatisticsDialog', () => {
  const defaultProps = {
    open: true,
    verbName: 'parlare',
    isResetting: false,
    error: null,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders the dialog when open is true', () => {
      render(<ResetStatisticsDialog {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Reset Statistics')).toBeInTheDocument()
    })

    it('does not render the dialog when open is false', () => {
      render(<ResetStatisticsDialog {...defaultProps} open={false} />)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('displays the verb name in the confirmation message', () => {
      render(<ResetStatisticsDialog {...defaultProps} verbName="mangiare" />)

      expect(
        screen.getByText(
          /are you sure you want to reset all conjugation statistics for the verb/i
        )
      ).toBeInTheDocument()
      expect(screen.getByText(/mangiare/)).toBeInTheDocument()
    })

    it('renders Cancel and Reset buttons', () => {
      render(<ResetStatisticsDialog {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
    })

    it('displays the warning about irreversible action', () => {
      render(<ResetStatisticsDialog {...defaultProps} />)

      expect(
        screen.getByText(/this action cannot be undone/i)
      ).toBeInTheDocument()
    })
  })

  describe('error handling', () => {
    it('shows error alert when error prop is provided', () => {
      render(
        <ResetStatisticsDialog
          {...defaultProps}
          error="Failed to reset statistics"
        />
      )

      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Failed to reset statistics')).toBeInTheDocument()
    })

    it('does not show error alert when error is null', () => {
      render(<ResetStatisticsDialog {...defaultProps} error={null} />)

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('does not show error alert when error is undefined', () => {
      render(<ResetStatisticsDialog {...defaultProps} error={undefined} />)

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('button interactions', () => {
    it('calls onClose when Cancel button is clicked', () => {
      const onClose = jest.fn()
      render(<ResetStatisticsDialog {...defaultProps} onClose={onClose} />)

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onConfirm when Reset button is clicked', () => {
      const onConfirm = jest.fn()
      render(<ResetStatisticsDialog {...defaultProps} onConfirm={onConfirm} />)

      fireEvent.click(screen.getByRole('button', { name: /reset/i }))

      expect(onConfirm).toHaveBeenCalledTimes(1)
    })
  })

  describe('loading state', () => {
    it('disables Cancel button when isResetting is true', () => {
      render(<ResetStatisticsDialog {...defaultProps} isResetting={true} />)

      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
    })

    it('disables Reset button when isResetting is true', () => {
      render(<ResetStatisticsDialog {...defaultProps} isResetting={true} />)

      expect(screen.getByRole('button', { name: /resetting/i })).toBeDisabled()
    })

    it('shows "Resetting..." text when isResetting is true', () => {
      render(<ResetStatisticsDialog {...defaultProps} isResetting={true} />)

      expect(
        screen.getByRole('button', { name: /resetting/i })
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /^reset$/i })
      ).not.toBeInTheDocument()
    })

    it('shows "Reset" text when isResetting is false', () => {
      render(<ResetStatisticsDialog {...defaultProps} isResetting={false} />)

      expect(
        screen.getByRole('button', { name: /^reset$/i })
      ).toBeInTheDocument()
    })

    it('enables buttons when isResetting is false', () => {
      render(<ResetStatisticsDialog {...defaultProps} isResetting={false} />)

      expect(screen.getByRole('button', { name: /cancel/i })).not.toBeDisabled()
      expect(screen.getByRole('button', { name: /reset/i })).not.toBeDisabled()
    })
  })

  describe('accessibility', () => {
    it('has proper aria-labelledby attribute', () => {
      render(<ResetStatisticsDialog {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-labelledby', 'reset-dialog-title')
    })

    it('has proper aria-describedby attribute', () => {
      render(<ResetStatisticsDialog {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute(
        'aria-describedby',
        'reset-dialog-description'
      )
    })

    it('Reset button has autoFocus', () => {
      render(<ResetStatisticsDialog {...defaultProps} />)

      // The Reset button should be focused by default due to autoFocus
      const resetButton = screen.getByRole('button', { name: /reset/i })
      expect(resetButton).toHaveFocus()
    })
  })

  describe('edge cases', () => {
    it('handles null verbName gracefully', () => {
      render(<ResetStatisticsDialog {...defaultProps} verbName={null} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(
        screen.getByText(
          /are you sure you want to reset all conjugation statistics for the verb/i
        )
      ).toBeInTheDocument()
    })

    it('renders error variant for Reset button', () => {
      render(<ResetStatisticsDialog {...defaultProps} />)

      const resetButton = screen.getByRole('button', { name: /reset/i })
      expect(resetButton).toHaveClass('MuiButton-containedError')
    })
  })
})
