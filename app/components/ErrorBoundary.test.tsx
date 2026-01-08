import React from 'react'

import { render, screen, fireEvent } from '@testing-library/react'

import '@testing-library/jest-dom'
import ErrorBoundary from './ErrorBoundary'

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  // Suppress console errors in tests
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })

  afterAll(() => {
    console.error = originalError
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders error UI when an error is thrown', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
    expect(
      screen.getByText(
        'We encountered an unexpected error. Please try refreshing the page.'
      )
    ).toBeInTheDocument()
  })

  it('displays Try Again and Go to Home buttons', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(
      screen.getByRole('button', { name: /try again/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /go to home/i })
    ).toBeInTheDocument()
  })

  it('resets error state when Try Again is clicked', () => {
    const TestComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
      if (shouldThrow) {
        throw new Error('Test error')
      }
      return <div>No error</div>
    }

    const Wrapper = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true)

      return (
        <ErrorBoundary
          fallback={(error, resetError) => (
            <div>
              <p>Error occurred</p>
              <button
                onClick={() => {
                  setShouldThrow(false)
                  resetError()
                }}
              >
                Reset
              </button>
            </div>
          )}
        >
          <TestComponent shouldThrow={shouldThrow} />
        </ErrorBoundary>
      )
    }

    render(<Wrapper />)

    // Error UI should be visible
    expect(screen.getByText('Error occurred')).toBeInTheDocument()

    // Click Reset button
    const resetButton = screen.getByRole('button', { name: /reset/i })
    fireEvent.click(resetButton)

    // Should show normal content
    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('uses custom fallback when provided', () => {
    const customFallback = (error: Error, resetError: () => void) => (
      <div>
        <p>Custom error message: {error.message}</p>
        <button onClick={resetError}>Custom reset</button>
      </div>
    )

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(
      screen.getByText('Custom error message: Test error')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /custom reset/i })
    ).toBeInTheDocument()
  })

  it('shows error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
      configurable: true,
    })

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(
      screen.getByText(/Error Details \(Development Only\):/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/Test error/i)).toBeInTheDocument()

    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
      configurable: true,
    })
  })

  it('hides error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'production',
      writable: true,
      configurable: true,
    })

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(
      screen.queryByText(/Error Details \(Development Only\):/i)
    ).not.toBeInTheDocument()

    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
      configurable: true,
    })
  })

  it('renders error icon', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const errorIcon = screen.getByTestId('ErrorOutlineIcon')
    expect(errorIcon).toBeInTheDocument()
  })

  it('renders refresh icon on Try Again button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const refreshIcon = screen.getByTestId('RefreshIcon')
    expect(refreshIcon).toBeInTheDocument()
  })
})
