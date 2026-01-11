import { fireEvent, render, screen } from '@testing-library/react'

import UserMenu from './UserMenu'

// Mock useAuth
const mockLogout = jest.fn()
const mockUseAuth = jest.fn()

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock ChangePasswordModal
jest.mock('./ChangePasswordModal', () => {
  return function MockChangePasswordModal({
    open,
    onClose,
  }: {
    open: boolean
    onClose: () => void
  }) {
    return open ? (
      <div data-testid="change-password-modal">
        <button data-testid="close-change-password" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null
  }
})

describe('UserMenu', () => {
  const mockOnSettingsClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: { id: '1', username: 'testuser' },
      logout: mockLogout,
    })
  })

  describe('Rendering', () => {
    it('should render the user menu button', () => {
      render(<UserMenu onSettingsClick={mockOnSettingsClick} />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should display user avatar with first letter of username', () => {
      render(<UserMenu onSettingsClick={mockOnSettingsClick} />)

      expect(screen.getByText('T')).toBeInTheDocument()
    })

    it('should display correct avatar letter for different username', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '2', username: 'alice' },
        logout: mockLogout,
      })

      render(<UserMenu onSettingsClick={mockOnSettingsClick} />)

      expect(screen.getByText('A')).toBeInTheDocument()
    })

    it('should display question mark when user is null', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        logout: mockLogout,
      })

      render(<UserMenu onSettingsClick={mockOnSettingsClick} />)

      expect(screen.getByText('?')).toBeInTheDocument()
    })

    it('should not show menu initially', () => {
      render(<UserMenu onSettingsClick={mockOnSettingsClick} />)

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('should not show change password modal initially', () => {
      render(<UserMenu onSettingsClick={mockOnSettingsClick} />)

      expect(
        screen.queryByTestId('change-password-modal')
      ).not.toBeInTheDocument()
    })
  })

  describe('Menu Opening and Closing', () => {
    it('should open menu when clicking avatar button', () => {
      render(<UserMenu onSettingsClick={mockOnSettingsClick} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    it('should show username in opened menu', () => {
      render(<UserMenu onSettingsClick={mockOnSettingsClick} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(screen.getByText('Logged in as')).toBeInTheDocument()
      expect(screen.getByText('testuser')).toBeInTheDocument()
    })

    it('should close menu when clicking outside', () => {
      render(<UserMenu onSettingsClick={mockOnSettingsClick} />)

      // Open menu
      const button = screen.getByRole('button')
      fireEvent.click(button)
      expect(screen.getByRole('menu')).toBeInTheDocument()

      // Click backdrop
      const backdrop = document.querySelector('.MuiBackdrop-root')
      if (backdrop) {
        fireEvent.click(backdrop)
      }

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
  })

  describe('Menu Items', () => {
    beforeEach(() => {
      render(<UserMenu onSettingsClick={mockOnSettingsClick} />)
      const button = screen.getByRole('button')
      fireEvent.click(button)
    })

    it('should display all menu items', () => {
      expect(screen.getByText('Profile Settings')).toBeInTheDocument()
      expect(screen.getByText('Change Password')).toBeInTheDocument()
      expect(screen.getByText('Logout')).toBeInTheDocument()
    })

    it('should have settings icon in Profile Settings menu item', () => {
      const settingsItem = screen.getByText('Profile Settings').closest('li')
      const icon = settingsItem?.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('should have lock icon in Change Password menu item', () => {
      const changePasswordItem = screen
        .getByText('Change Password')
        .closest('li')
      const icon = changePasswordItem?.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('should have logout icon in Logout menu item', () => {
      const logoutItem = screen.getByText('Logout').closest('li')
      const icon = logoutItem?.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Profile Settings', () => {
    it('should call onSettingsClick when Profile Settings is clicked', () => {
      render(<UserMenu onSettingsClick={mockOnSettingsClick} />)

      // Open menu
      const button = screen.getByRole('button')
      fireEvent.click(button)

      // Click Profile Settings
      fireEvent.click(screen.getByText('Profile Settings'))

      expect(mockOnSettingsClick).toHaveBeenCalledTimes(1)
    })

    it('should close menu after clicking Profile Settings', () => {
      render(<UserMenu onSettingsClick={mockOnSettingsClick} />)

      // Open menu
      const button = screen.getByRole('button')
      fireEvent.click(button)
      expect(screen.getByRole('menu')).toBeInTheDocument()

      // Click Profile Settings
      fireEvent.click(screen.getByText('Profile Settings'))

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
  })

  describe('Change Password', () => {
    it('should open change password modal when Change Password is clicked', () => {
      render(<UserMenu onSettingsClick={mockOnSettingsClick} />)

      // Open menu
      const button = screen.getByRole('button')
      fireEvent.click(button)

      // Click Change Password
      fireEvent.click(screen.getByText('Change Password'))

      expect(screen.getByTestId('change-password-modal')).toBeInTheDocument()
    })

    it('should close menu after clicking Change Password', () => {
      render(<UserMenu onSettingsClick={mockOnSettingsClick} />)

      // Open menu
      const button = screen.getByRole('button')
      fireEvent.click(button)
      expect(screen.getByRole('menu')).toBeInTheDocument()

      // Click Change Password
      fireEvent.click(screen.getByText('Change Password'))

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('should close change password modal when close is clicked', () => {
      render(<UserMenu onSettingsClick={mockOnSettingsClick} />)

      // Open menu and click Change Password
      const button = screen.getByRole('button')
      fireEvent.click(button)
      fireEvent.click(screen.getByText('Change Password'))

      expect(screen.getByTestId('change-password-modal')).toBeInTheDocument()

      // Close modal
      fireEvent.click(screen.getByTestId('close-change-password'))

      expect(
        screen.queryByTestId('change-password-modal')
      ).not.toBeInTheDocument()
    })
  })

  describe('Logout', () => {
    it('should call logout when Logout is clicked', () => {
      render(<UserMenu onSettingsClick={mockOnSettingsClick} />)

      // Open menu
      const button = screen.getByRole('button')
      fireEvent.click(button)

      // Click Logout
      fireEvent.click(screen.getByText('Logout'))

      expect(mockLogout).toHaveBeenCalledTimes(1)
    })

    it('should close menu after clicking Logout', () => {
      render(<UserMenu onSettingsClick={mockOnSettingsClick} />)

      // Open menu
      const button = screen.getByRole('button')
      fireEvent.click(button)
      expect(screen.getByRole('menu')).toBeInTheDocument()

      // Click Logout
      fireEvent.click(screen.getByText('Logout'))

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes when menu is closed', () => {
      render(<UserMenu onSettingsClick={mockOnSettingsClick} />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-haspopup', 'true')
      expect(button).not.toHaveAttribute('aria-controls')
    })

    it('should have proper ARIA attributes when menu is open', () => {
      render(<UserMenu onSettingsClick={mockOnSettingsClick} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(button).toHaveAttribute('aria-haspopup', 'true')
      expect(button).toHaveAttribute('aria-expanded', 'true')
      expect(button).toHaveAttribute('aria-controls', 'user-menu')
    })

    it('should render menu when opened', () => {
      render(<UserMenu onSettingsClick={mockOnSettingsClick} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(screen.getByRole('menu')).toBeInTheDocument()
    })
  })

  describe('Username Edge Cases', () => {
    it('should handle lowercase username', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '3', username: 'lowercase' },
        logout: mockLogout,
      })

      render(<UserMenu onSettingsClick={mockOnSettingsClick} />)

      expect(screen.getByText('L')).toBeInTheDocument()
    })

    it('should handle uppercase username', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '4', username: 'UPPERCASE' },
        logout: mockLogout,
      })

      render(<UserMenu onSettingsClick={mockOnSettingsClick} />)

      expect(screen.getByText('U')).toBeInTheDocument()
    })

    it('should handle single character username', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '5', username: 'a' },
        logout: mockLogout,
      })

      render(<UserMenu onSettingsClick={mockOnSettingsClick} />)

      expect(screen.getByText('A')).toBeInTheDocument()
    })

    it('should handle numeric first character', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '6', username: '123user' },
        logout: mockLogout,
      })

      render(<UserMenu onSettingsClick={mockOnSettingsClick} />)

      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  describe('Multiple Interactions', () => {
    it('should handle opening and closing menu multiple times', () => {
      render(<UserMenu onSettingsClick={mockOnSettingsClick} />)

      const button = screen.getByRole('button')

      // First open/close
      fireEvent.click(button)
      expect(screen.getByRole('menu')).toBeInTheDocument()

      const backdrop = document.querySelector('.MuiBackdrop-root')
      if (backdrop) {
        fireEvent.click(backdrop)
      }
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()

      // Second open/close
      fireEvent.click(button)
      expect(screen.getByRole('menu')).toBeInTheDocument()

      fireEvent.click(screen.getByText('Profile Settings'))
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('should not call onSettingsClick multiple times for single click', () => {
      render(<UserMenu onSettingsClick={mockOnSettingsClick} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      fireEvent.click(screen.getByText('Profile Settings'))

      expect(mockOnSettingsClick).toHaveBeenCalledTimes(1)
    })

    it('should handle opening change password modal multiple times', () => {
      render(<UserMenu onSettingsClick={mockOnSettingsClick} />)

      const button = screen.getByRole('button')

      // First time
      fireEvent.click(button)
      fireEvent.click(screen.getByText('Change Password'))
      expect(screen.getByTestId('change-password-modal')).toBeInTheDocument()

      fireEvent.click(screen.getByTestId('close-change-password'))
      expect(
        screen.queryByTestId('change-password-modal')
      ).not.toBeInTheDocument()

      // Second time
      fireEvent.click(button)
      fireEvent.click(screen.getByText('Change Password'))
      expect(screen.getByTestId('change-password-modal')).toBeInTheDocument()
    })
  })
})
