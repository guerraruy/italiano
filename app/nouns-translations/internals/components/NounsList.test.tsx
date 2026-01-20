import React, { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'

import '@testing-library/jest-dom'
import {
  PracticeActionsProvider,
  PracticeFiltersProvider,
  PracticeActionsContextType,
  PracticeFiltersContextType,
} from '@/app/contexts'

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
  FilterControls: () => <div data-testid="filter-controls">FilterControls</div>,
}))

// Test wrapper with context providers
const mockActionsContext: PracticeActionsContextType = {
  onInputChange: jest.fn(),
  onValidation: jest.fn(),
  onClearInput: jest.fn(),
  onShowAnswer: jest.fn(),
  onResetStatistics: jest.fn(),
  onKeyDown: jest.fn(),
  getStatistics: jest.fn().mockReturnValue({ correct: 0, wrong: 0 }),
  getInputRef: jest.fn().mockReturnValue(jest.fn()),
}

const mockFiltersContext: PracticeFiltersContextType = {
  sortOption: 'none',
  displayCount: 'all',
  excludeMastered: false,
  masteryThreshold: 10,
  masteredCount: 0,
  shouldShowRefreshButton: false,
  displayedCount: 1,
  totalCount: 1,
  onSortChange: jest.fn(),
  onDisplayCountChange: jest.fn(),
  onExcludeMasteredChange: jest.fn(),
  onRefresh: jest.fn(),
}

const TestWrapper = ({ children }: { children: ReactNode }) => (
  <PracticeFiltersProvider value={mockFiltersContext}>
    <PracticeActionsProvider value={mockActionsContext}>
      {children}
    </PracticeActionsProvider>
  </PracticeFiltersProvider>
)

const renderWithProviders = (ui: React.ReactElement) =>
  render(ui, { wrapper: TestWrapper })

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
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders "No nouns available" alert when nouns array is empty', () => {
    renderWithProviders(
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
    renderWithProviders(<NounsList {...defaultProps} />)

    expect(screen.getByTestId('filter-controls')).toBeInTheDocument()
    expect(screen.getByTestId('noun-item-noun1')).toBeInTheDocument()
    expect(screen.getByText('NounItem: house (Index: 0)')).toBeInTheDocument()
  })

  it('renders FilterControls component', () => {
    renderWithProviders(<NounsList {...defaultProps} />)

    expect(screen.getByTestId('filter-controls')).toBeInTheDocument()
  })

  it('provides default inputValues when missing', () => {
    renderWithProviders(<NounsList {...defaultProps} inputValues={{}} />)

    const inputDiv = screen.getByTestId('input-noun1')

    const expectedDefaultInput = {
      singular: '',
      plural: '',
    }

    expect(inputDiv).toHaveTextContent(JSON.stringify(expectedDefaultInput))
  })

  it('provides default validationState when missing', () => {
    renderWithProviders(<NounsList {...defaultProps} validationState={{}} />)

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
    renderWithProviders(
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

    renderWithProviders(
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

    renderWithProviders(
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

    renderWithProviders(
      <NounsList
        {...defaultProps}
        nouns={nouns}
        filteredAndSortedNouns={nouns}
      />
    )

    expect(mockActionsContext.getStatistics).toHaveBeenCalledWith('noun1')
    expect(mockActionsContext.getStatistics).toHaveBeenCalledWith('noun2')
    expect(mockActionsContext.getStatistics).toHaveBeenCalledTimes(2)
  })

  it('calls getInputRef for each noun', () => {
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

    renderWithProviders(
      <NounsList
        {...defaultProps}
        nouns={nouns}
        filteredAndSortedNouns={nouns}
      />
    )

    expect(mockActionsContext.getInputRef).toHaveBeenCalledWith(
      'noun1',
      'singular'
    )
    expect(mockActionsContext.getInputRef).toHaveBeenCalledWith(
      'noun1',
      'plural'
    )
    expect(mockActionsContext.getInputRef).toHaveBeenCalledWith(
      'noun2',
      'singular'
    )
    expect(mockActionsContext.getInputRef).toHaveBeenCalledWith(
      'noun2',
      'plural'
    )
  })
})
