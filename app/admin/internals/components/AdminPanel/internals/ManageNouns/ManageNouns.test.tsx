import React from 'react'

import { render, screen, fireEvent } from '@testing-library/react'

import '@testing-library/jest-dom'
import ManageNouns from './ManageNouns'

// Mock child components
jest.mock('./internals', () => ({
  NounsList: ({
    onError,
    onSuccess,
  }: {
    onError: (msg: string) => void
    onSuccess: (msg: string) => void
  }) => (
    <div data-testid="nouns-list">
      Nouns List
      <button onClick={() => onError('List Error')}>Trigger List Error</button>
      <button onClick={() => onSuccess('List Success')}>
        Trigger List Success
      </button>
    </div>
  ),
}))

describe('ManageNouns', () => {
  const mockOnError = jest.fn()
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders NounsList component', () => {
    render(<ManageNouns onError={mockOnError} onSuccess={mockOnSuccess} />)

    expect(screen.getByTestId('nouns-list')).toBeInTheDocument()
  })

  it('passes onError and onSuccess to NounsList', () => {
    render(<ManageNouns onError={mockOnError} onSuccess={mockOnSuccess} />)

    const listErrorBtn = screen.getByText('Trigger List Error')
    fireEvent.click(listErrorBtn)
    expect(mockOnError).toHaveBeenCalledWith('List Error')

    const listSuccessBtn = screen.getByText('Trigger List Success')
    fireEvent.click(listSuccessBtn)
    expect(mockOnSuccess).toHaveBeenCalledWith('List Success')
  })
})
