import { fireEvent, render, screen } from '@testing-library/react'

import ResetStatisticsDialog from './ResetStatisticsDialog'

describe('ResetStatisticsDialog', () => {
  const defaultProps = {
    open: true,
    adjectiveTranslation: 'bello',
    isResetting: false,
    error: null,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the dialog when open is true', () => {
      render(<ResetStatisticsDialog {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should not render the dialog when open is false', () => {
      render(<ResetStatisticsDialog {...defaultProps} open={false} />)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should render the dialog title', () => {
      render(<ResetStatisticsDialog {...defaultProps} />)

      expect(screen.getByText('Reset Statistics')).toBeInTheDocument()
    })

    it('should render the confirmation message with adjective translation', () => {
      render(<ResetStatisticsDialog {...defaultProps} />)

      expect(
        screen.getByText(/Are you sure you want to reset all statistics/i)
      ).toBeInTheDocument()
      expect(screen.getByText(/bello/)).toBeInTheDocument()
    })

    it('should render the confirmation message when adjectiveTranslation is null', () => {
      render(
        <ResetStatisticsDialog {...defaultProps} adjectiveTranslation={null} />
      )

      expect(
        screen.getByText(/Are you sure you want to reset all statistics/i)
      ).toBeInTheDocument()
    })

    it('should render Cancel and Reset buttons', () => {
      render(<ResetStatisticsDialog {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
    })

    it('should render the warning about action being irreversible', () => {
      render(<ResetStatisticsDialog {...defaultProps} />)

      expect(
        screen.getByText(/This action cannot be undone/i)
      ).toBeInTheDocument()
    })
  })

  describe('Error Display', () => {
    it('should display error alert when error is provided', () => {
      const errorMessage = 'Failed to reset statistics'
      render(<ResetStatisticsDialog {...defaultProps} error={errorMessage} />)

      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    it('should not display error alert when error is null', () => {
      render(<ResetStatisticsDialog {...defaultProps} error={null} />)

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('should not display error alert when error is undefined', () => {
      render(<ResetStatisticsDialog {...defaultProps} error={undefined} />)

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('should display error alert with correct severity', () => {
      render(
        <ResetStatisticsDialog
          {...defaultProps}
          error="Failed to reset statistics"
        />
      )

      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('MuiAlert-standardError')
    })
  })

  describe('Button Interactions', () => {
    it('should call onClose when Cancel button is clicked', () => {
      const onClose = jest.fn()
      render(<ResetStatisticsDialog {...defaultProps} onClose={onClose} />)

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should call onConfirm when Reset button is clicked', () => {
      const onConfirm = jest.fn()
      render(<ResetStatisticsDialog {...defaultProps} onConfirm={onConfirm} />)

      fireEvent.click(screen.getByRole('button', { name: /reset/i }))

      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when dialog backdrop is clicked', () => {
      const onClose = jest.fn()
      render(<ResetStatisticsDialog {...defaultProps} onClose={onClose} />)

      const backdrop = document.querySelector('.MuiBackdrop-root')
      if (backdrop) {
        fireEvent.click(backdrop)
      }

      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Button States', () => {
    it('should enable buttons when isResetting is false', () => {
      render(<ResetStatisticsDialog {...defaultProps} isResetting={false} />)

      expect(screen.getByRole('button', { name: /cancel/i })).not.toBeDisabled()
      expect(screen.getByRole('button', { name: /reset/i })).not.toBeDisabled()
    })

    it('should disable buttons when isResetting is true', () => {
      render(<ResetStatisticsDialog {...defaultProps} isResetting={true} />)

      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /resetting/i })).toBeDisabled()
    })

    it('should show "Reset" text when not resetting', () => {
      render(<ResetStatisticsDialog {...defaultProps} isResetting={false} />)

      expect(
        screen.getByRole('button', { name: /^reset$/i })
      ).toBeInTheDocument()
    })

    it('should show "Resetting..." text when resetting', () => {
      render(<ResetStatisticsDialog {...defaultProps} isResetting={true} />)

      expect(
        screen.getByRole('button', { name: /resetting.../i })
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /^reset$/i })
      ).not.toBeInTheDocument()
    })

    it('should not call onClose when Cancel button is clicked while resetting', () => {
      const onClose = jest.fn()
      render(
        <ResetStatisticsDialog
          {...defaultProps}
          isResetting={true}
          onClose={onClose}
        />
      )

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      // Button is disabled, so onClick shouldn't fire
      expect(onClose).not.toHaveBeenCalled()
    })

    it('should not call onConfirm when Reset button is clicked while resetting', () => {
      const onConfirm = jest.fn()
      render(
        <ResetStatisticsDialog
          {...defaultProps}
          isResetting={true}
          onConfirm={onConfirm}
        />
      )

      const resetButton = screen.getByRole('button', { name: /resetting/i })
      fireEvent.click(resetButton)

      // Button is disabled, so onClick shouldn't fire
      expect(onConfirm).not.toHaveBeenCalled()
    })
  })

  describe('Button Styling', () => {
    it('should render Reset button with error color', () => {
      render(<ResetStatisticsDialog {...defaultProps} />)

      const resetButton = screen.getByRole('button', { name: /reset/i })
      expect(resetButton).toHaveClass('MuiButton-colorError')
    })

    it('should render Reset button as contained variant', () => {
      render(<ResetStatisticsDialog {...defaultProps} />)

      const resetButton = screen.getByRole('button', { name: /reset/i })
      expect(resetButton).toHaveClass('MuiButton-contained')
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-labelledby attribute', () => {
      render(<ResetStatisticsDialog {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-labelledby', 'reset-dialog-title')
    })

    it('should have proper aria-describedby attribute', () => {
      render(<ResetStatisticsDialog {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute(
        'aria-describedby',
        'reset-dialog-description'
      )
    })

    it('should have matching id for dialog title', () => {
      render(<ResetStatisticsDialog {...defaultProps} />)

      const title = screen.getByText('Reset Statistics')
      expect(title).toHaveAttribute('id', 'reset-dialog-title')
    })

    it('should have matching id for dialog description', () => {
      render(<ResetStatisticsDialog {...defaultProps} />)

      const description = screen.getByText(
        /Are you sure you want to reset all statistics/i
      )
      expect(description).toHaveAttribute('id', 'reset-dialog-description')
    })

    it('should have autoFocus on Reset button', () => {
      render(<ResetStatisticsDialog {...defaultProps} />)

      const resetButton = screen.getByRole('button', { name: /reset/i })
      expect(resetButton).toHaveFocus()
    })
  })

  describe('Different Adjective Translations', () => {
    it('should render with different adjective translation', () => {
      render(
        <ResetStatisticsDialog
          {...defaultProps}
          adjectiveTranslation="grande"
        />
      )

      expect(screen.getByText(/grande/)).toBeInTheDocument()
    })

    it('should render with empty string adjective translation', () => {
      render(
        <ResetStatisticsDialog {...defaultProps} adjectiveTranslation="" />
      )

      expect(
        screen.getByText(/Are you sure you want to reset all statistics/i)
      ).toBeInTheDocument()
    })
  })
})
