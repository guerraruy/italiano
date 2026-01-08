import React from 'react'

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/app/contexts/AuthContext'

import AdminPanel from './AdminPanel'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/app/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/app/components/PageHeader', () => ({
  PageHeader: ({ title }: { title: string }) => (
    <h1 data-testid='page-header'>{title}</h1>
  ),
}))

// Mock internal components
jest.mock('./internals', () => ({
  ManageUsers: ({
    onError,
    onSuccess,
  }: {
    onError: (msg: string) => void
    onSuccess: (msg: string) => void
  }) => (
    <div data-testid='manage-users'>
      Manage Users Component
      <button onClick={() => onError('Test Error')}>Trigger Error</button>
      <button onClick={() => onSuccess('Test Success')}>Trigger Success</button>
    </div>
  ),
  ManageVerbs: () => (
    <div data-testid='manage-verbs'>Manage Verbs Component</div>
  ),
  ManageConjugations: () => (
    <div data-testid='manage-conjugations'>Manage Conjugations Component</div>
  ),
  ManageNouns: () => (
    <div data-testid='manage-nouns'>Manage Nouns Component</div>
  ),
  ManageAdjectives: () => (
    <div data-testid='manage-adjectives'>Manage Adjectives Component</div>
  ),
}))

describe('AdminPanel', () => {
  const mockPush = jest.fn()
  const mockUseAuth = useAuth as jest.Mock
  const mockUseRouter = useRouter as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      push: mockPush,
    })
  })

  it('redirects to home if user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
    })

    render(<AdminPanel />)

    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('redirects to home if user is not admin', () => {
    mockUseAuth.mockReturnValue({
      user: { admin: false },
      isAuthenticated: true,
    })

    render(<AdminPanel />)

    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('renders correctly when user is admin', () => {
    mockUseAuth.mockReturnValue({
      user: { admin: true },
      isAuthenticated: true,
    })

    render(<AdminPanel />)

    expect(screen.getByTestId('page-header')).toHaveTextContent(
      'Administration Panel'
    )
    expect(screen.getByTestId('manage-users')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('switches tabs correctly', () => {
    mockUseAuth.mockReturnValue({
      user: { admin: true },
      isAuthenticated: true,
    })

    render(<AdminPanel />)

    // Initial state (Tab 0)
    expect(screen.getByTestId('manage-users')).toBeInTheDocument()
    expect(screen.queryByTestId('manage-verbs')).not.toBeInTheDocument()

    // Switch to Verbs (Tab 1)
    fireEvent.click(screen.getByText('Manage Verbs'))
    expect(screen.getByTestId('manage-verbs')).toBeInTheDocument()
    expect(screen.queryByTestId('manage-users')).not.toBeInTheDocument()

    // Switch to Conjugations (Tab 2)
    fireEvent.click(screen.getByText('Manage Conjugations'))
    expect(screen.getByTestId('manage-conjugations')).toBeInTheDocument()

    // Switch to Nouns (Tab 3)
    fireEvent.click(screen.getByText('Manage Nouns'))
    expect(screen.getByTestId('manage-nouns')).toBeInTheDocument()

    // Switch to Adjectives (Tab 4)
    fireEvent.click(screen.getByText('Manage Adjectives'))
    expect(screen.getByTestId('manage-adjectives')).toBeInTheDocument()
  })

  it('displays error message when triggered by child component', async () => {
    mockUseAuth.mockReturnValue({
      user: { admin: true },
      isAuthenticated: true,
    })

    jest.useFakeTimers()

    render(<AdminPanel />)

    fireEvent.click(screen.getByText('Trigger Error'))

    expect(screen.getByText('Test Error')).toBeInTheDocument()

    // Wait for timeout
    act(() => {
      jest.advanceTimersByTime(3000)
    })

    await waitFor(() => {
      expect(screen.queryByText('Test Error')).not.toBeInTheDocument()
    })

    jest.useRealTimers()
  })

  it('displays success message when triggered by child component', async () => {
    mockUseAuth.mockReturnValue({
      user: { admin: true },
      isAuthenticated: true,
    })

    jest.useFakeTimers()

    render(<AdminPanel />)

    fireEvent.click(screen.getByText('Trigger Success'))

    expect(screen.getByText('Test Success')).toBeInTheDocument()

    // Wait for timeout
    act(() => {
      jest.advanceTimersByTime(3000)
    })

    await waitFor(() => {
      expect(screen.queryByText('Test Success')).not.toBeInTheDocument()
    })

    jest.useRealTimers()
  })
})
