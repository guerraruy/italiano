import { fireEvent, render, screen } from '@testing-library/react'

import Navbar from './Navbar'

// Mock next/navigation
const mockPush = jest.fn()
const mockPathname = jest.fn().mockReturnValue('/')

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname(),
}))

// Mock useAuth
const mockUseAuth = jest.fn()

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock MUI hooks
const mockUseMediaQuery = jest.fn()

jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material')
  return {
    ...actual,
    useMediaQuery: () => mockUseMediaQuery(),
  }
})

// Mock child components
jest.mock('./SettingsModal', () => {
  return function MockSettingsModal({
    open,
    onClose,
  }: {
    open: boolean
    onClose: () => void
  }) {
    return open ? (
      <div data-testid="settings-modal">
        <button data-testid="close-settings" onClick={onClose}>
          Close Settings
        </button>
      </div>
    ) : null
  }
})

jest.mock('./UserMenu', () => {
  return function MockUserMenu({
    onSettingsClick,
  }: {
    onSettingsClick: () => void
  }) {
    return (
      <div data-testid="user-menu">
        <button data-testid="open-settings" onClick={onSettingsClick}>
          Settings
        </button>
      </div>
    )
  }
})

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPathname.mockReturnValue('/')
    mockUseAuth.mockReturnValue({ user: null })
    mockUseMediaQuery.mockReturnValue(false) // Desktop by default
  })

  describe('Rendering', () => {
    it('should render the app title', () => {
      render(<Navbar />)

      expect(screen.getByText('ITALIANO')).toBeInTheDocument()
    })

    it('should render UserMenu component', () => {
      render(<Navbar />)

      expect(screen.getByTestId('user-menu')).toBeInTheDocument()
    })

    it('should render as AppBar', () => {
      render(<Navbar />)

      expect(screen.getByRole('banner')).toBeInTheDocument()
    })
  })

  describe('Desktop Menu', () => {
    beforeEach(() => {
      mockUseMediaQuery.mockReturnValue(false) // Desktop
    })

    it('should render all menu items on desktop', () => {
      render(<Navbar />)

      expect(screen.getByRole('button', { name: /home/i })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /nouns translations/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /adjectives translations/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /verbs translations/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /verb tenses/i })
      ).toBeInTheDocument()
    })

    it('should not render hamburger menu on desktop', () => {
      render(<Navbar />)

      expect(
        screen.queryByRole('button', { name: /open drawer/i })
      ).not.toBeInTheDocument()
    })

    it('should navigate when clicking menu item', () => {
      render(<Navbar />)

      fireEvent.click(
        screen.getByRole('button', { name: /nouns translations/i })
      )

      expect(mockPush).toHaveBeenCalledWith('/nouns-translations')
    })

    it('should navigate to home when clicking Home', () => {
      render(<Navbar />)

      fireEvent.click(screen.getByRole('button', { name: /home/i }))

      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('should navigate to verb tenses when clicking Verb Tenses', () => {
      render(<Navbar />)

      fireEvent.click(screen.getByRole('button', { name: /verb tenses/i }))

      expect(mockPush).toHaveBeenCalledWith('/verb-tenses')
    })
  })

  describe('Mobile Menu', () => {
    beforeEach(() => {
      mockUseMediaQuery.mockReturnValue(true) // Mobile
    })

    it('should render hamburger menu on mobile', () => {
      render(<Navbar />)

      expect(
        screen.getByRole('button', { name: /open drawer/i })
      ).toBeInTheDocument()
    })

    it('should not render desktop menu buttons on mobile', () => {
      render(<Navbar />)

      // Desktop buttons should not be visible
      expect(
        screen.queryByRole('button', { name: /nouns translations/i })
      ).not.toBeInTheDocument()
    })

    it('should open drawer when clicking hamburger menu', () => {
      render(<Navbar />)

      fireEvent.click(screen.getByRole('button', { name: /open drawer/i }))

      // Drawer should be open with menu items visible
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Home')).toBeInTheDocument()
    })

    it('should show all menu items in drawer', () => {
      render(<Navbar />)

      fireEvent.click(screen.getByRole('button', { name: /open drawer/i }))

      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Nouns Translations')).toBeInTheDocument()
      expect(screen.getByText('Adjectives Translations')).toBeInTheDocument()
      expect(screen.getByText('Verbs Translations')).toBeInTheDocument()
      expect(screen.getByText('Verb Tenses')).toBeInTheDocument()
    })

    it('should navigate and close drawer when clicking menu item', () => {
      render(<Navbar />)

      // Open drawer
      fireEvent.click(screen.getByRole('button', { name: /open drawer/i }))

      // Click menu item
      fireEvent.click(screen.getByText('Nouns Translations'))

      expect(mockPush).toHaveBeenCalledWith('/nouns-translations')
    })

    it('should close drawer when clicking outside', () => {
      render(<Navbar />)

      // Open drawer
      fireEvent.click(screen.getByRole('button', { name: /open drawer/i }))

      // Drawer should be open
      expect(screen.getByRole('dialog')).toBeInTheDocument()

      // Click backdrop to close
      const backdrop = document.querySelector('.MuiBackdrop-root')
      if (backdrop) {
        fireEvent.click(backdrop)
      }

      // Drawer should be closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('Admin Menu Item', () => {
    it('should not show Admin Panel for non-admin users', () => {
      mockUseAuth.mockReturnValue({ user: { id: '1', username: 'user' } })
      mockUseMediaQuery.mockReturnValue(false) // Desktop

      render(<Navbar />)

      expect(
        screen.queryByRole('button', { name: /admin panel/i })
      ).not.toBeInTheDocument()
    })

    it('should show Admin Panel for admin users on desktop', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '1', username: 'admin', admin: true },
      })
      mockUseMediaQuery.mockReturnValue(false) // Desktop

      render(<Navbar />)

      expect(
        screen.getByRole('button', { name: /admin panel/i })
      ).toBeInTheDocument()
    })

    it('should navigate to admin when clicking Admin Panel', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '1', username: 'admin', admin: true },
      })
      mockUseMediaQuery.mockReturnValue(false) // Desktop

      render(<Navbar />)

      fireEvent.click(screen.getByRole('button', { name: /admin panel/i }))

      expect(mockPush).toHaveBeenCalledWith('/admin')
    })

    it('should show Admin Panel in drawer for admin users on mobile', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '1', username: 'admin', admin: true },
      })
      mockUseMediaQuery.mockReturnValue(true) // Mobile

      render(<Navbar />)

      fireEvent.click(screen.getByRole('button', { name: /open drawer/i }))

      expect(screen.getByText('Admin Panel')).toBeInTheDocument()
    })

    it('should not show Admin Panel in drawer for non-admin users', () => {
      mockUseAuth.mockReturnValue({ user: { id: '1', username: 'user' } })
      mockUseMediaQuery.mockReturnValue(true) // Mobile

      render(<Navbar />)

      fireEvent.click(screen.getByRole('button', { name: /open drawer/i }))

      expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument()
    })

    it('should not show Admin Panel when user is null', () => {
      mockUseAuth.mockReturnValue({ user: null })
      mockUseMediaQuery.mockReturnValue(false) // Desktop

      render(<Navbar />)

      expect(
        screen.queryByRole('button', { name: /admin panel/i })
      ).not.toBeInTheDocument()
    })
  })

  describe('Settings Modal', () => {
    it('should not show settings modal initially', () => {
      render(<Navbar />)

      expect(screen.queryByTestId('settings-modal')).not.toBeInTheDocument()
    })

    it('should open settings modal when settings is clicked', () => {
      render(<Navbar />)

      fireEvent.click(screen.getByTestId('open-settings'))

      expect(screen.getByTestId('settings-modal')).toBeInTheDocument()
    })

    it('should close settings modal when close is clicked', () => {
      render(<Navbar />)

      // Open modal
      fireEvent.click(screen.getByTestId('open-settings'))
      expect(screen.getByTestId('settings-modal')).toBeInTheDocument()

      // Close modal
      fireEvent.click(screen.getByTestId('close-settings'))
      expect(screen.queryByTestId('settings-modal')).not.toBeInTheDocument()
    })
  })

  describe('Active Path Highlighting', () => {
    beforeEach(() => {
      mockUseMediaQuery.mockReturnValue(false) // Desktop
    })

    it('should highlight Home when on home path', () => {
      mockPathname.mockReturnValue('/')

      render(<Navbar />)

      const homeButton = screen.getByRole('button', { name: /home/i })
      expect(homeButton).toHaveStyle({
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
      })
    })

    it('should highlight Nouns Translations when on that path', () => {
      mockPathname.mockReturnValue('/nouns-translations')

      render(<Navbar />)

      const nounsButton = screen.getByRole('button', {
        name: /nouns translations/i,
      })
      expect(nounsButton).toHaveStyle({
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
      })
    })

    it('should not highlight Home when on different path', () => {
      mockPathname.mockReturnValue('/nouns-translations')

      render(<Navbar />)

      const homeButton = screen.getByRole('button', { name: /home/i })
      expect(homeButton).not.toHaveStyle({
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
      })
    })
  })

  describe('Drawer Active Path', () => {
    beforeEach(() => {
      mockUseMediaQuery.mockReturnValue(true) // Mobile
    })

    it('should mark Home as selected in drawer when on home path', () => {
      mockPathname.mockReturnValue('/')

      render(<Navbar />)

      fireEvent.click(screen.getByRole('button', { name: /open drawer/i }))

      const homeItem = screen.getByText('Home').closest('div[role="button"]')
      expect(homeItem).toHaveClass('Mui-selected')
    })

    it('should mark Verb Tenses as selected when on that path', () => {
      mockPathname.mockReturnValue('/verb-tenses')

      render(<Navbar />)

      fireEvent.click(screen.getByRole('button', { name: /open drawer/i }))

      const verbTensesItem = screen
        .getByText('Verb Tenses')
        .closest('div[role="button"]')
      expect(verbTensesItem).toHaveClass('Mui-selected')
    })
  })

  describe('Navigation Paths', () => {
    beforeEach(() => {
      mockUseMediaQuery.mockReturnValue(false) // Desktop
    })

    it('should navigate to correct path for each menu item', () => {
      render(<Navbar />)

      const menuPaths = [
        { name: /home/i, path: '/' },
        { name: /nouns translations/i, path: '/nouns-translations' },
        { name: /adjectives translations/i, path: '/adjectives-translations' },
        { name: /verbs translations/i, path: '/verbs-translations' },
        { name: /verb tenses/i, path: '/verb-tenses' },
      ]

      menuPaths.forEach(({ name, path }) => {
        mockPush.mockClear()
        fireEvent.click(screen.getByRole('button', { name }))
        expect(mockPush).toHaveBeenCalledWith(path)
      })
    })
  })

  describe('Accessibility', () => {
    it('should have accessible hamburger menu button', () => {
      mockUseMediaQuery.mockReturnValue(true) // Mobile

      render(<Navbar />)

      const menuButton = screen.getByRole('button', { name: /open drawer/i })
      expect(menuButton).toHaveAttribute('aria-label', 'open drawer')
    })

    it('should have presentation role on drawer content', () => {
      mockUseMediaQuery.mockReturnValue(true) // Mobile

      render(<Navbar />)

      fireEvent.click(screen.getByRole('button', { name: /open drawer/i }))

      expect(screen.getAllByRole('presentation').length).toBeGreaterThan(0)
    })
  })
})
