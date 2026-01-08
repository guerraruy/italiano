import React from 'react'

import { render, screen } from '@testing-library/react'

import '@testing-library/jest-dom'
import { SortOption, DisplayCount } from './AdjectiveItem/internals'
import { AdjectivesList } from './AdjectivesList'
import { ValidationState } from '../types'

// Mock child components
jest.mock('./AdjectiveItem', () => ({
  AdjectiveItem: ({
    adjective,
    index,
    inputValues,
    validationState,
  }: {
    adjective: { id: string; translation: string }
    index: number
    inputValues: Record<string, unknown>
    validationState: Record<string, unknown>
  }) => (
    <div data-testid={`adjective-item-${adjective.id}`}>
      AdjectiveItem: {adjective.translation} (Index: {index})
      <div data-testid={`input-${adjective.id}`}>
        {JSON.stringify(inputValues)}
      </div>
      <div data-testid={`validation-${adjective.id}`}>
        {JSON.stringify(validationState)}
      </div>
    </div>
  ),
}))

jest.mock('./AdjectiveItem/internals', () => ({
  FilterControls: ({
    displayedCount,
    totalCount,
  }: {
    displayedCount: number
    totalCount: number
  }) => (
    <div data-testid='filter-controls'>
      FilterControls: {displayedCount}/{totalCount}
    </div>
  ),
  SortOption: {
    ALPHABETICAL_ASC: 'alphabetical_asc',
  },
  DisplayCount: {
    ALL: 'all',
  },
}))

describe('AdjectivesList', () => {
  const mockAdjective = {
    id: 'adj1',
    translation: 'good',
    italian: 'buono',
    masculineSingular: 'buono',
    masculinePlural: 'buoni',
    feminineSingular: 'buona',
    femininePlural: 'buone',
  }

  const defaultProps = {
    adjectives: [mockAdjective],
    filteredAndSortedAdjectives: [mockAdjective],
    inputValues: {
      adj1: {
        masculineSingular: 'buono',
        masculinePlural: '',
        feminineSingular: '',
        femininePlural: '',
      },
    },
    validationState: {
      adj1: {
        masculineSingular: 'correct',
        masculinePlural: null,
        feminineSingular: null,
        femininePlural: null,
      },
    } as ValidationState,
    sortOption: 'alphabetical_asc' as SortOption,
    displayCount: 'all' as DisplayCount,
    shouldShowRefreshButton: true,
    getStatistics: jest.fn().mockReturnValue({ correct: 0, wrong: 0 }),
    onInputChange: jest.fn(),
    onValidation: jest.fn(),
    onClearInput: jest.fn(),
    onShowAnswer: jest.fn(),
    onResetStatistics: jest.fn(),
    onKeyDown: jest.fn(),
    onSortChange: jest.fn(),
    onDisplayCountChange: jest.fn(),
    onRefresh: jest.fn(),
    setInputRef: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders "No adjectives available" alert when adjectives array is empty', () => {
    render(
      <AdjectivesList
        {...defaultProps}
        adjectives={[]}
        filteredAndSortedAdjectives={[]}
      />
    )

    expect(
      screen.getByText(
        /No adjectives available. Please ask your administrator to import adjectives./i
      )
    ).toBeInTheDocument()
    expect(screen.queryByTestId('filter-controls')).not.toBeInTheDocument()
  })

  it('renders FilterControls and AdjectiveItem components when adjectives are present', () => {
    render(<AdjectivesList {...defaultProps} />)

    expect(screen.getByTestId('filter-controls')).toBeInTheDocument()
    expect(screen.getByTestId('adjective-item-adj1')).toBeInTheDocument()
    expect(
      screen.getByText('AdjectiveItem: good (Index: 0)')
    ).toBeInTheDocument()
  })

  it('passes correct props to FilterControls', () => {
    const props = {
      ...defaultProps,
      adjectives: [mockAdjective, { ...mockAdjective, id: 'adj2' }],
      filteredAndSortedAdjectives: [mockAdjective],
    }

    render(<AdjectivesList {...props} />)

    expect(screen.getByText('FilterControls: 1/2')).toBeInTheDocument()
  })

  it('provides default inputValues and validationState when missing', () => {
    render(
      <AdjectivesList {...defaultProps} inputValues={{}} validationState={{}} />
    )

    const inputDiv = screen.getByTestId('input-adj1')
    const validationDiv = screen.getByTestId('validation-adj1')

    const expectedDefaultInput = {
      masculineSingular: '',
      masculinePlural: '',
      feminineSingular: '',
      femininePlural: '',
    }

    const expectedDefaultValidation = {
      masculineSingular: null,
      masculinePlural: null,
      feminineSingular: null,
      femininePlural: null,
    }

    expect(inputDiv).toHaveTextContent(JSON.stringify(expectedDefaultInput))
    expect(validationDiv).toHaveTextContent(
      JSON.stringify(expectedDefaultValidation)
    )
  })
})
