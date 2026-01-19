import React from 'react'

import { render, screen } from '@testing-library/react'

import '@testing-library/jest-dom'
import { SortOption, DisplayCount } from './NounItem/internals'
import { NounsList } from './NounsList'
import { ValidationState, InputValues } from '../types'

// Mock child components
jest.mock('./NounItem', () => ({
  NounItem: ({
    noun,
    index,
    inputValues,
    validationState,
  }: {
    noun: { id: string; translation: string }
    index: number
    inputValues: Record<string, unknown>
    validationState: Record<string, unknown>
  }) => (
    <div data-testid={`noun-item-${noun.id}`}>
      NounItem: {noun.translation} (Index: {index})
      <div data-testid={`input-${noun.id}`}>{JSON.stringify(inputValues)}</div>
      <div data-testid={`validation-${noun.id}`}>
        {JSON.stringify(validationState)}
      </div>
    </div>
  ),
}))

jest.mock('./NounItem/internals', () => ({
  FilterControls: ({
    displayedCount,
    totalCount,
  }: {
    displayedCount: number
    totalCount: number
  }) => (
    <div data-testid="filter-controls">
      FilterControls: {displayedCount}/{totalCount}
    </div>
  ),
  SortOption: {
    NONE: 'none',
  },
  DisplayCount: {
    ALL: 'all',
  },
}))

describe('NounsList', () => {
  const mockNoun = {
    id: 'noun1',
    translation: 'house',
    translationPlural: 'houses',
    italian: 'casa',
    italianPlural: 'case',
  }

  const defaultProps = {
    nouns: [mockNoun],
    filteredAndSortedNouns: [mockNoun],
    inputValues: {
      noun1: {
        singular: 'casa',
        plural: '',
      },
    } as InputValues,
    validationState: {
      noun1: {
        singular: 'correct',
        plural: null,
      },
    } as ValidationState,
    sortOption: 'none' as SortOption,
    displayCount: 'all' as DisplayCount,
    excludeMastered: true,
    masteryThreshold: 10,
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
    onExcludeMasteredChange: jest.fn(),
    onRefresh: jest.fn(),
    inputRefSingular: jest.fn().mockReturnValue(jest.fn()),
    inputRefPlural: jest.fn().mockReturnValue(jest.fn()),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders "No nouns available" alert when nouns array is empty', () => {
    render(
      <NounsList {...defaultProps} nouns={[]} filteredAndSortedNouns={[]} />
    )

    expect(
      screen.getByText(
        /No nouns available. Please ask your administrator to import nouns./i
      )
    ).toBeInTheDocument()
    expect(screen.queryByTestId('filter-controls')).not.toBeInTheDocument()
  })

  it('renders FilterControls and NounItem components when nouns are present', () => {
    render(<NounsList {...defaultProps} />)

    expect(screen.getByTestId('filter-controls')).toBeInTheDocument()
    expect(screen.getByTestId('noun-item-noun1')).toBeInTheDocument()
    expect(screen.getByText('NounItem: house (Index: 0)')).toBeInTheDocument()
  })

  it('passes correct props to FilterControls', () => {
    const props = {
      ...defaultProps,
      nouns: [mockNoun, { ...mockNoun, id: 'noun2', translation: 'car' }],
      filteredAndSortedNouns: [mockNoun],
    }

    render(<NounsList {...props} />)

    expect(screen.getByText('FilterControls: 1/2')).toBeInTheDocument()
  })

  it('provides default inputValues when missing', () => {
    render(<NounsList {...defaultProps} inputValues={{}} />)

    const inputDiv = screen.getByTestId('input-noun1')

    const expectedDefaultInput = {
      singular: '',
      plural: '',
    }

    expect(inputDiv).toHaveTextContent(JSON.stringify(expectedDefaultInput))
  })

  it('provides default validationState when missing', () => {
    render(<NounsList {...defaultProps} validationState={{}} />)

    const validationDiv = screen.getByTestId('validation-noun1')

    const expectedDefaultValidation = {
      singular: null,
      plural: null,
    }

    expect(validationDiv).toHaveTextContent(
      JSON.stringify(expectedDefaultValidation)
    )
  })

  it('provides default inputValues and validationState when both are missing', () => {
    render(
      <NounsList {...defaultProps} inputValues={{}} validationState={{}} />
    )

    const inputDiv = screen.getByTestId('input-noun1')
    const validationDiv = screen.getByTestId('validation-noun1')

    const expectedDefaultInput = {
      singular: '',
      plural: '',
    }

    const expectedDefaultValidation = {
      singular: null,
      plural: null,
    }

    expect(inputDiv).toHaveTextContent(JSON.stringify(expectedDefaultInput))
    expect(validationDiv).toHaveTextContent(
      JSON.stringify(expectedDefaultValidation)
    )
  })

  it('renders multiple nouns correctly', () => {
    const nouns = [
      mockNoun,
      {
        id: 'noun2',
        translation: 'car',
        translationPlural: 'cars',
        italian: 'macchina',
        italianPlural: 'macchine',
      },
      {
        id: 'noun3',
        translation: 'book',
        translationPlural: 'books',
        italian: 'libro',
        italianPlural: 'libri',
      },
    ]

    render(
      <NounsList
        {...defaultProps}
        nouns={nouns}
        filteredAndSortedNouns={nouns}
      />
    )

    expect(screen.getByTestId('noun-item-noun1')).toBeInTheDocument()
    expect(screen.getByTestId('noun-item-noun2')).toBeInTheDocument()
    expect(screen.getByTestId('noun-item-noun3')).toBeInTheDocument()
    expect(screen.getByText('NounItem: house (Index: 0)')).toBeInTheDocument()
    expect(screen.getByText('NounItem: car (Index: 1)')).toBeInTheDocument()
    expect(screen.getByText('NounItem: book (Index: 2)')).toBeInTheDocument()
  })

  it('passes correct index to each NounItem', () => {
    const nouns = [
      mockNoun,
      {
        id: 'noun2',
        translation: 'car',
        translationPlural: 'cars',
        italian: 'macchina',
        italianPlural: 'macchine',
      },
    ]

    render(
      <NounsList
        {...defaultProps}
        nouns={nouns}
        filteredAndSortedNouns={nouns}
      />
    )

    expect(screen.getByText('NounItem: house (Index: 0)')).toBeInTheDocument()
    expect(screen.getByText('NounItem: car (Index: 1)')).toBeInTheDocument()
  })

  it('calls getStatistics for each noun', () => {
    const nouns = [
      mockNoun,
      {
        id: 'noun2',
        translation: 'car',
        translationPlural: 'cars',
        italian: 'macchina',
        italianPlural: 'macchine',
      },
    ]

    render(
      <NounsList
        {...defaultProps}
        nouns={nouns}
        filteredAndSortedNouns={nouns}
      />
    )

    expect(defaultProps.getStatistics).toHaveBeenCalledWith('noun1')
    expect(defaultProps.getStatistics).toHaveBeenCalledWith('noun2')
    expect(defaultProps.getStatistics).toHaveBeenCalledTimes(2)
  })

  it('calls inputRefSingular and inputRefPlural for each noun', () => {
    const nouns = [
      mockNoun,
      {
        id: 'noun2',
        translation: 'car',
        translationPlural: 'cars',
        italian: 'macchina',
        italianPlural: 'macchine',
      },
    ]

    render(
      <NounsList
        {...defaultProps}
        nouns={nouns}
        filteredAndSortedNouns={nouns}
      />
    )

    expect(defaultProps.inputRefSingular).toHaveBeenCalledWith('noun1')
    expect(defaultProps.inputRefSingular).toHaveBeenCalledWith('noun2')
    expect(defaultProps.inputRefPlural).toHaveBeenCalledWith('noun1')
    expect(defaultProps.inputRefPlural).toHaveBeenCalledWith('noun2')
  })
})
