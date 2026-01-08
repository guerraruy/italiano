import React from 'react'

import { render, screen, fireEvent } from '@testing-library/react'

import '@testing-library/jest-dom'
import ManageAdjectives from './ManageAdjectives'

// Mock child components
jest.mock('./internals', () => ({
  ImportAdjectives: ({
    onError,
    onSuccess,
  }: {
    onError: (msg: string) => void
    onSuccess: (msg: string) => void
  }) => (
    <div data-testid='import-adjectives'>
      Import Adjectives
      <button onClick={() => onError('Import Error')}>
        Trigger Import Error
      </button>
      <button onClick={() => onSuccess('Import Success')}>
        Trigger Import Success
      </button>
    </div>
  ),
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

  it('renders child components', () => {
    render(<ManageAdjectives onError={mockOnError} onSuccess={mockOnSuccess} />)

    expect(screen.getByTestId('import-adjectives')).toBeInTheDocument()
    expect(screen.getByTestId('adjectives-list')).toBeInTheDocument()
  })

  it('passes onError and onSuccess to ImportAdjectives', () => {
    render(<ManageAdjectives onError={mockOnError} onSuccess={mockOnSuccess} />)

    const importErrorBtn = screen.getByText('Trigger Import Error')
    fireEvent.click(importErrorBtn)
    expect(mockOnError).toHaveBeenCalledWith('Import Error')

    const importSuccessBtn = screen.getByText('Trigger Import Success')
    fireEvent.click(importSuccessBtn)
    expect(mockOnSuccess).toHaveBeenCalledWith('Import Success')
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
