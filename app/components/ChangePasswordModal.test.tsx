import React from 'react'

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import '@testing-library/jest-dom'
import ChangePasswordModal from './ChangePasswordModal'

// Mock the RTK Query hook
const mockChangePassword = jest.fn()
let mockIsLoading = false

jest.mock('../store/api', () => ({
  useChangePasswordMutation: () => [
    mockChangePassword,
    { isLoading: mockIsLoading },
  ],
}))

describe('ChangePasswordModal', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockIsLoading = false
    mockChangePassword.mockReturnValue({
      unwrap: () => Promise.resolve({ message: 'Password changed' }),
    })
  })

  describe('Rendering', () => {
    it('renders the modal when open is true', () => {
      render(<ChangePasswordModal {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      // Title is in DialogTitle, use the h2 element
      expect(
        screen.getByRole('heading', { name: /change password/i })
      ).toBeInTheDocument()
    })

    it('does not render the modal when open is false', () => {
      render(<ChangePasswordModal {...defaultProps} open={false} />)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders all form fields', () => {
      render(<ChangePasswordModal {...defaultProps} />)

      expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^New Password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument()
    })

    it('renders action buttons', () => {
      render(<ChangePasswordModal {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /change password/i })
      ).toBeInTheDocument()
    })

    it('renders close icon button', () => {
      render(<ChangePasswordModal {...defaultProps} />)

      expect(screen.getByLabelText('close')).toBeInTheDocument()
    })

    it('renders helper text for new password field', () => {
      render(<ChangePasswordModal {...defaultProps} />)

      expect(screen.getByText('Minimum 6 characters')).toBeInTheDocument()
    })

    it('renders description text', () => {
      render(<ChangePasswordModal {...defaultProps} />)

      expect(
        screen.getByText(
          'Please enter your current password and choose a new password.'
        )
      ).toBeInTheDocument()
    })
  })

  describe('Form Interactions', () => {
    it('updates current password field on input', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordModal {...defaultProps} />)

      const input = screen.getByLabelText(/Current Password/i)
      await user.type(input, 'mypassword')

      expect(input).toHaveValue('mypassword')
    })

    it('updates new password field on input', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordModal {...defaultProps} />)

      const input = screen.getByLabelText(/^New Password/i)
      await user.type(input, 'newpassword')

      expect(input).toHaveValue('newpassword')
    })

    it('updates confirm password field on input', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordModal {...defaultProps} />)

      const input = screen.getByLabelText(/Confirm New Password/i)
      await user.type(input, 'confirmpassword')

      expect(input).toHaveValue('confirmpassword')
    })

    it('clears error when typing in current password field', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordModal {...defaultProps} />)

      // Submit empty form to trigger error (bypass HTML5 validation)
      const form = screen.getByRole('dialog').querySelector('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(
          screen.getByText('Please enter your current password')
        ).toBeInTheDocument()
      })

      // Type in field to clear error
      const input = screen.getByLabelText(/Current Password/i)
      await user.type(input, 'a')

      await waitFor(() => {
        expect(
          screen.queryByText('Please enter your current password')
        ).not.toBeInTheDocument()
      })
    })

    it('clears error when typing in new password field', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordModal {...defaultProps} />)

      // Fill current password and submit to trigger new password error
      const currentInput = screen.getByLabelText(/Current Password/i)
      await user.type(currentInput, 'currentpass')

      // Use fireEvent.submit to bypass HTML5 validation
      const form = screen.getByRole('dialog').querySelector('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(
          screen.getByText('Please enter a new password')
        ).toBeInTheDocument()
      })

      // Type in new password field to clear error
      const newInput = screen.getByLabelText(/^New Password/i)
      await user.type(newInput, 'a')

      await waitFor(() => {
        expect(
          screen.queryByText('Please enter a new password')
        ).not.toBeInTheDocument()
      })
    })

    it('clears error when typing in confirm password field', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordModal {...defaultProps} />)

      // Fill fields to trigger mismatch error
      await user.type(screen.getByLabelText(/Current Password/i), 'currentpass')
      await user.type(screen.getByLabelText(/^New Password/i), 'newpassword')
      await user.type(
        screen.getByLabelText(/Confirm New Password/i),
        'different'
      )

      const submitButton = screen.getByRole('button', {
        name: /change password/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText('New passwords do not match')
        ).toBeInTheDocument()
      })

      // Type in confirm field to clear error
      const confirmInput = screen.getByLabelText(/Confirm New Password/i)
      await user.type(confirmInput, 'x')

      await waitFor(() => {
        expect(
          screen.queryByText('New passwords do not match')
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('Validation', () => {
    it('shows error when current password is empty', async () => {
      render(<ChangePasswordModal {...defaultProps} />)

      // Use fireEvent.submit to bypass HTML5 validation
      const form = screen.getByRole('dialog').querySelector('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(
          screen.getByText('Please enter your current password')
        ).toBeInTheDocument()
      })
      expect(mockChangePassword).not.toHaveBeenCalled()
    })

    it('shows error when current password is only whitespace', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordModal {...defaultProps} />)

      await user.type(screen.getByLabelText(/Current Password/i), '   ')

      // Use fireEvent.submit to bypass HTML5 validation
      const form = screen.getByRole('dialog').querySelector('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(
          screen.getByText('Please enter your current password')
        ).toBeInTheDocument()
      })
    })

    it('shows error when new password is empty', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordModal {...defaultProps} />)

      await user.type(
        screen.getByLabelText(/Current Password/i),
        'currentpassword'
      )

      // Use fireEvent.submit to bypass HTML5 validation
      const form = screen.getByRole('dialog').querySelector('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(
          screen.getByText('Please enter a new password')
        ).toBeInTheDocument()
      })
      expect(mockChangePassword).not.toHaveBeenCalled()
    })

    it('shows error when new password is only whitespace', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordModal {...defaultProps} />)

      await user.type(
        screen.getByLabelText(/Current Password/i),
        'currentpassword'
      )
      await user.type(screen.getByLabelText(/^New Password/i), '   ')

      // Use fireEvent.submit to bypass HTML5 validation
      const form = screen.getByRole('dialog').querySelector('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(
          screen.getByText('Please enter a new password')
        ).toBeInTheDocument()
      })
    })

    it('shows error when new password is less than 6 characters', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordModal {...defaultProps} />)

      await user.type(
        screen.getByLabelText(/Current Password/i),
        'currentpassword'
      )
      await user.type(screen.getByLabelText(/^New Password/i), '12345')

      // Use fireEvent.submit to bypass HTML5 validation
      const form = screen.getByRole('dialog').querySelector('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(
          screen.getByText('New password must be at least 6 characters')
        ).toBeInTheDocument()
      })
      expect(mockChangePassword).not.toHaveBeenCalled()
    })

    it('shows error when passwords do not match', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordModal {...defaultProps} />)

      await user.type(
        screen.getByLabelText(/Current Password/i),
        'currentpassword'
      )
      await user.type(screen.getByLabelText(/^New Password/i), 'newpassword123')
      await user.type(
        screen.getByLabelText(/Confirm New Password/i),
        'differentpassword'
      )

      const submitButton = screen.getByRole('button', {
        name: /change password/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText('New passwords do not match')
        ).toBeInTheDocument()
      })
      expect(mockChangePassword).not.toHaveBeenCalled()
    })

    it('shows error when new password is same as current password', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordModal {...defaultProps} />)

      await user.type(
        screen.getByLabelText(/Current Password/i),
        'samepassword'
      )
      await user.type(screen.getByLabelText(/^New Password/i), 'samepassword')
      await user.type(
        screen.getByLabelText(/Confirm New Password/i),
        'samepassword'
      )

      const submitButton = screen.getByRole('button', {
        name: /change password/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(
            'New password must be different from current password'
          )
        ).toBeInTheDocument()
      })
      expect(mockChangePassword).not.toHaveBeenCalled()
    })
  })

  describe('Successful Password Change', () => {
    it('calls changePassword mutation with correct data', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordModal {...defaultProps} />)

      await user.type(
        screen.getByLabelText(/Current Password/i),
        'currentpassword'
      )
      await user.type(screen.getByLabelText(/^New Password/i), 'newpassword123')
      await user.type(
        screen.getByLabelText(/Confirm New Password/i),
        'newpassword123'
      )

      const submitButton = screen.getByRole('button', {
        name: /change password/i,
      })
      await user.click(submitButton)

      expect(mockChangePassword).toHaveBeenCalledWith({
        currentPassword: 'currentpassword',
        newPassword: 'newpassword123',
      })
    })

    it('shows success message after password change', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordModal {...defaultProps} />)

      await user.type(
        screen.getByLabelText(/Current Password/i),
        'currentpassword'
      )
      await user.type(screen.getByLabelText(/^New Password/i), 'newpassword123')
      await user.type(
        screen.getByLabelText(/Confirm New Password/i),
        'newpassword123'
      )

      const submitButton = screen.getByRole('button', {
        name: /change password/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText('Password changed successfully!')
        ).toBeInTheDocument()
      })
    })

    it('clears form fields after successful password change', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordModal {...defaultProps} />)

      const currentInput = screen.getByLabelText(/Current Password/i)
      const newInput = screen.getByLabelText(/^New Password/i)
      const confirmInput = screen.getByLabelText(/Confirm New Password/i)

      await user.type(currentInput, 'currentpassword')
      await user.type(newInput, 'newpassword123')
      await user.type(confirmInput, 'newpassword123')

      const submitButton = screen.getByRole('button', {
        name: /change password/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(currentInput).toHaveValue('')
        expect(newInput).toHaveValue('')
        expect(confirmInput).toHaveValue('')
      })
    })

    it('calls onClose after 2 seconds on success', async () => {
      jest.useFakeTimers()
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      const onClose = jest.fn()
      render(<ChangePasswordModal open={true} onClose={onClose} />)

      await user.type(
        screen.getByLabelText(/Current Password/i),
        'currentpassword'
      )
      await user.type(screen.getByLabelText(/^New Password/i), 'newpassword123')
      await user.type(
        screen.getByLabelText(/Confirm New Password/i),
        'newpassword123'
      )

      const submitButton = screen.getByRole('button', {
        name: /change password/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText('Password changed successfully!')
        ).toBeInTheDocument()
      })

      expect(onClose).not.toHaveBeenCalled()

      // Advance timers by 2 seconds
      act(() => {
        jest.advanceTimersByTime(2000)
      })

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled()
      })

      jest.useRealTimers()
    })
  })

  describe('Error Handling', () => {
    it('shows API error message on failure', async () => {
      const user = userEvent.setup()
      mockChangePassword.mockReturnValue({
        unwrap: () =>
          Promise.reject({ data: { error: 'Current password is incorrect' } }),
      })

      render(<ChangePasswordModal {...defaultProps} />)

      await user.type(
        screen.getByLabelText(/Current Password/i),
        'wrongpassword'
      )
      await user.type(screen.getByLabelText(/^New Password/i), 'newpassword123')
      await user.type(
        screen.getByLabelText(/Confirm New Password/i),
        'newpassword123'
      )

      const submitButton = screen.getByRole('button', {
        name: /change password/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText('Current password is incorrect')
        ).toBeInTheDocument()
      })
    })

    it('shows generic error message when API error has no message', async () => {
      const user = userEvent.setup()
      mockChangePassword.mockReturnValue({
        unwrap: () => Promise.reject({}),
      })

      render(<ChangePasswordModal {...defaultProps} />)

      await user.type(
        screen.getByLabelText(/Current Password/i),
        'currentpassword'
      )
      await user.type(screen.getByLabelText(/^New Password/i), 'newpassword123')
      await user.type(
        screen.getByLabelText(/Confirm New Password/i),
        'newpassword123'
      )

      const submitButton = screen.getByRole('button', {
        name: /change password/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText('Failed to change password. Please try again.')
        ).toBeInTheDocument()
      })
    })

    it('can close error alert', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordModal {...defaultProps} />)

      // Use fireEvent.submit to bypass HTML5 validation
      const form = screen.getByRole('dialog').querySelector('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(
          screen.getByText('Please enter your current password')
        ).toBeInTheDocument()
      })

      // Close the alert - need to get the close button within the Alert, not the dialog close button
      const alertElement = screen.getByRole('alert')
      const closeButton = alertElement.querySelector('button[title="Close"]')
      expect(closeButton).toBeInTheDocument()
      await user.click(closeButton!)

      await waitFor(() => {
        expect(
          screen.queryByText('Please enter your current password')
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('Loading State', () => {
    beforeEach(() => {
      mockIsLoading = true
    })

    it('shows loading indicator when submitting', () => {
      render(<ChangePasswordModal {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: /changing/i })
      ).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('disables form fields when loading', () => {
      render(<ChangePasswordModal {...defaultProps} />)

      expect(screen.getByLabelText(/Current Password/i)).toBeDisabled()
      expect(screen.getByLabelText(/^New Password/i)).toBeDisabled()
      expect(screen.getByLabelText(/Confirm New Password/i)).toBeDisabled()
    })

    it('disables buttons when loading', () => {
      render(<ChangePasswordModal {...defaultProps} />)

      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /changing/i })).toBeDisabled()
    })

    it('disables close icon button when loading', () => {
      render(<ChangePasswordModal {...defaultProps} />)

      expect(screen.getByLabelText('close')).toBeDisabled()
    })
  })

  describe('Success State', () => {
    it('disables form fields after successful submit', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordModal {...defaultProps} />)

      await user.type(
        screen.getByLabelText(/Current Password/i),
        'currentpassword'
      )
      await user.type(screen.getByLabelText(/^New Password/i), 'newpassword123')
      await user.type(
        screen.getByLabelText(/Confirm New Password/i),
        'newpassword123'
      )

      const submitButton = screen.getByRole('button', {
        name: /change password/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText('Password changed successfully!')
        ).toBeInTheDocument()
      })

      expect(screen.getByLabelText(/Current Password/i)).toBeDisabled()
      expect(screen.getByLabelText(/^New Password/i)).toBeDisabled()
      expect(screen.getByLabelText(/Confirm New Password/i)).toBeDisabled()
    })

    it('disables submit button after successful submit', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordModal {...defaultProps} />)

      await user.type(
        screen.getByLabelText(/Current Password/i),
        'currentpassword'
      )
      await user.type(screen.getByLabelText(/^New Password/i), 'newpassword123')
      await user.type(
        screen.getByLabelText(/Confirm New Password/i),
        'newpassword123'
      )

      const submitButton = screen.getByRole('button', {
        name: /change password/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText('Password changed successfully!')
        ).toBeInTheDocument()
      })

      expect(
        screen.getByRole('button', { name: /change password/i })
      ).toBeDisabled()
    })
  })

  describe('Close Modal', () => {
    it('calls onClose when cancel button is clicked', async () => {
      const user = userEvent.setup()
      const onClose = jest.fn()
      render(<ChangePasswordModal open={true} onClose={onClose} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(onClose).toHaveBeenCalled()
    })

    it('calls onClose when close icon is clicked', async () => {
      const user = userEvent.setup()
      const onClose = jest.fn()
      render(<ChangePasswordModal open={true} onClose={onClose} />)

      const closeIcon = screen.getByLabelText('close')
      await user.click(closeIcon)

      expect(onClose).toHaveBeenCalled()
    })

    it('resets form state when modal is closed', async () => {
      const user = userEvent.setup()
      const onClose = jest.fn()
      const { rerender } = render(
        <ChangePasswordModal open={true} onClose={onClose} />
      )

      // Fill in form
      await user.type(
        screen.getByLabelText(/Current Password/i),
        'currentpassword'
      )
      await user.type(screen.getByLabelText(/^New Password/i), 'newpassword')
      await user.type(
        screen.getByLabelText(/Confirm New Password/i),
        'confirmpassword'
      )

      // Click cancel (which triggers handleClose)
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      // Modal is closed
      rerender(<ChangePasswordModal open={false} onClose={onClose} />)

      // Reopen modal
      rerender(<ChangePasswordModal open={true} onClose={onClose} />)

      // Fields should be empty (form was reset)
      expect(screen.getByLabelText(/Current Password/i)).toHaveValue('')
      expect(screen.getByLabelText(/^New Password/i)).toHaveValue('')
      expect(screen.getByLabelText(/Confirm New Password/i)).toHaveValue('')
    })

    it('does not close when loading', () => {
      mockIsLoading = true

      const onClose = jest.fn()
      render(<ChangePasswordModal open={true} onClose={onClose} />)

      const closeIcon = screen.getByLabelText('close')
      fireEvent.click(closeIcon)

      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has accessible form fields with labels', () => {
      render(<ChangePasswordModal {...defaultProps} />)

      expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^New Password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument()
    })

    it('has accessible buttons', () => {
      render(<ChangePasswordModal {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /change password/i })
      ).toBeInTheDocument()
      expect(screen.getByLabelText('close')).toBeInTheDocument()
    })

    it('renders modal as a dialog', () => {
      render(<ChangePasswordModal {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('autofocuses current password field', async () => {
      render(<ChangePasswordModal {...defaultProps} />)

      // The autoFocus prop causes the current password field to receive focus
      const currentPasswordInput = screen.getByLabelText(/Current Password/i)
      await waitFor(() => {
        expect(currentPasswordInput).toHaveFocus()
      })
    })
  })

  describe('Form Submission', () => {
    it('submits form on Enter key in last field', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordModal {...defaultProps} />)

      await user.type(
        screen.getByLabelText(/Current Password/i),
        'currentpassword'
      )
      await user.type(screen.getByLabelText(/^New Password/i), 'newpassword123')
      await user.type(
        screen.getByLabelText(/Confirm New Password/i),
        'newpassword123{enter}'
      )

      expect(mockChangePassword).toHaveBeenCalledWith({
        currentPassword: 'currentpassword',
        newPassword: 'newpassword123',
      })
    })
  })
})
