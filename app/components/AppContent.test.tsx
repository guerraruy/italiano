import React from 'react'

import { render, screen } from '@testing-library/react'

import '@testing-library/jest-dom'
import AppContent from './AppContent'

// Mock the child components to isolate AppContent testing
jest.mock('./LoginModal', () => {
  return function MockLoginModal() {
    return <div data-testid="login-modal">LoginModal</div>
  }
})

jest.mock('./Navbar', () => {
  return function MockNavbar() {
    return <nav data-testid="navbar">Navbar</nav>
  }
})

// Mock the AuthProvider to avoid RTK Query dependencies
jest.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}))

describe('AppContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders children correctly', () => {
    render(
      <AppContent>
        <div data-testid="child-content">Test Child Content</div>
      </AppContent>
    )

    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.getByText('Test Child Content')).toBeInTheDocument()
  })

  it('renders LoginModal component', () => {
    render(
      <AppContent>
        <div>Content</div>
      </AppContent>
    )

    expect(screen.getByTestId('login-modal')).toBeInTheDocument()
  })

  it('renders Navbar component', () => {
    render(
      <AppContent>
        <div>Content</div>
      </AppContent>
    )

    expect(screen.getByTestId('navbar')).toBeInTheDocument()
  })

  it('wraps content with AuthProvider', () => {
    render(
      <AppContent>
        <div data-testid="child-content">Content</div>
      </AppContent>
    )

    const authProvider = screen.getByTestId('auth-provider')
    expect(authProvider).toBeInTheDocument()

    // Verify children are inside AuthProvider
    expect(authProvider).toContainElement(screen.getByTestId('login-modal'))
    expect(authProvider).toContainElement(screen.getByTestId('navbar'))
    expect(authProvider).toContainElement(screen.getByTestId('child-content'))
  })

  it('renders components in the correct order (LoginModal, Navbar, then children)', () => {
    render(
      <AppContent>
        <main data-testid="main-content">Main Content</main>
      </AppContent>
    )

    const authProvider = screen.getByTestId('auth-provider')
    const children = Array.from(authProvider.children)

    // LoginModal should come first
    expect(children[0]).toHaveAttribute('data-testid', 'login-modal')
    // Navbar should come second
    expect(children[1]).toHaveAttribute('data-testid', 'navbar')
    // Main content should come last
    expect(children[2]).toHaveAttribute('data-testid', 'main-content')
  })

  it('renders multiple children correctly', () => {
    render(
      <AppContent>
        <header data-testid="header">Header</header>
        <main data-testid="main">Main</main>
        <footer data-testid="footer">Footer</footer>
      </AppContent>
    )

    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('main')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('renders with complex nested children', () => {
    render(
      <AppContent>
        <div data-testid="wrapper">
          <section data-testid="section">
            <p data-testid="paragraph">Nested content</p>
          </section>
        </div>
      </AppContent>
    )

    expect(screen.getByTestId('wrapper')).toBeInTheDocument()
    expect(screen.getByTestId('section')).toBeInTheDocument()
    expect(screen.getByTestId('paragraph')).toBeInTheDocument()
    expect(screen.getByText('Nested content')).toBeInTheDocument()
  })

  it('renders without crashing when children is null', () => {
    // This tests edge case handling
    const { container } = render(<AppContent>{null}</AppContent>)

    expect(container).toBeInTheDocument()
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
    expect(screen.getByTestId('login-modal')).toBeInTheDocument()
    expect(screen.getByTestId('navbar')).toBeInTheDocument()
  })

  it('renders without crashing when children is undefined', () => {
    const { container } = render(<AppContent>{undefined}</AppContent>)

    expect(container).toBeInTheDocument()
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
  })
})
