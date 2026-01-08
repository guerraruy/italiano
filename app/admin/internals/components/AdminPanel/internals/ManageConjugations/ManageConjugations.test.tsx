import React from 'react'

import { render, screen, fireEvent } from '@testing-library/react'

import '@testing-library/jest-dom'
import ManageConjugations from './ManageConjugations'

// Mock child components
jest.mock('./internals', () => ({
  ConjugationsList: ({
    onError,
    onSuccess,
  }: {
    onError: (msg: string) => void
    onSuccess: (msg: string) => void
  }) => (
    <div data-testid="conjugations-list">
      Conjugations List
      <button onClick={() => onError('List Error')}>Trigger List Error</button>
      <button onClick={() => onSuccess('List Success')}>
        Trigger List Success
      </button>
    </div>
  ),
}))

describe('ManageConjugations', () => {
  const mockOnError = jest.fn()
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders ConjugationsList component', () => {
    render(
      <ManageConjugations onError={mockOnError} onSuccess={mockOnSuccess} />
    )

    expect(screen.getByTestId('conjugations-list')).toBeInTheDocument()
  })

  it('passes onError and onSuccess to ConjugationsList', () => {
    render(
      <ManageConjugations onError={mockOnError} onSuccess={mockOnSuccess} />
    )

    const listErrorBtn = screen.getByText('Trigger List Error')
    fireEvent.click(listErrorBtn)
    expect(mockOnError).toHaveBeenCalledWith('List Error')

    const listSuccessBtn = screen.getByText('Trigger List Success')
    fireEvent.click(listSuccessBtn)
    expect(mockOnSuccess).toHaveBeenCalledWith('List Success')
  })
})
