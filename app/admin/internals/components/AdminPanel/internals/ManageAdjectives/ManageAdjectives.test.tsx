import React from 'react'

import { render, screen, fireEvent } from '@testing-library/react'

import '@testing-library/jest-dom'
import ManageAdjectives from './ManageAdjectives'

// Mock child components
jest.mock('./internals', () => ({
  AdjectivesList: ({
    onError,
    onSuccess,
  }: {
    onError: (msg: string) => void
    onSuccess: (msg: string) => void
  }) => (
    <div data-testid='adjectives-list'>
      Adjectives List
      <button onClick={() => onError('List Error')}>Trigger List Error</button>
      <button onClick={() => onSuccess('List Success')}>
        Trigger List Success
      </button>
    </div>
  ),
}))

describe('ManageAdjectives', () => {
  const mockOnError = jest.fn()
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders AdjectivesList component', () => {
    render(<ManageAdjectives onError={mockOnError} onSuccess={mockOnSuccess} />)

    expect(screen.getByTestId('adjectives-list')).toBeInTheDocument()
  })

  it('passes onError and onSuccess to AdjectivesList', () => {
    render(<ManageAdjectives onError={mockOnError} onSuccess={mockOnSuccess} />)

    const listErrorBtn = screen.getByText('Trigger List Error')
    fireEvent.click(listErrorBtn)
    expect(mockOnError).toHaveBeenCalledWith('List Error')

    const listSuccessBtn = screen.getByText('Trigger List Success')
    fireEvent.click(listSuccessBtn)
    expect(mockOnSuccess).toHaveBeenCalledWith('List Success')
  })
})
