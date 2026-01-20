import React, { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'

import '@testing-library/jest-dom'
import {
  PracticeActionsProvider,
  PracticeFiltersProvider,
  PracticeActionsContextType,
  PracticeFiltersContextType,
} from '@/app/contexts'

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
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders "No adjectives available" alert when adjectives array is empty', () => {
    renderWithProviders(
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
    renderWithProviders(<AdjectivesList {...defaultProps} />)

    expect(screen.getByTestId('filter-controls')).toBeInTheDocument()
    expect(screen.getByTestId('adjective-item-adj1')).toBeInTheDocument()
    expect(
      screen.getByText('AdjectiveItem: good (Index: 0)')
    ).toBeInTheDocument()
  })

  it('renders FilterControls component', () => {
    renderWithProviders(<AdjectivesList {...defaultProps} />)

    expect(screen.getByTestId('filter-controls')).toBeInTheDocument()
  })

  it('provides default inputValues and validationState when missing', () => {
    renderWithProviders(
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

  it('renders multiple adjectives correctly', () => {
    const adjectives = [
      mockAdjective,
      {
        id: 'adj2',
        translation: 'bad',
        italian: 'cattivo',
        masculineSingular: 'cattivo',
        masculinePlural: 'cattivi',
        feminineSingular: 'cattiva',
        femininePlural: 'cattive',
      },
      {
        id: 'adj3',
        translation: 'big',
        italian: 'grande',
        masculineSingular: 'grande',
        masculinePlural: 'grandi',
        feminineSingular: 'grande',
        femininePlural: 'grandi',
      },
    ]

    renderWithProviders(
      <AdjectivesList
        {...defaultProps}
        adjectives={adjectives}
        filteredAndSortedAdjectives={adjectives}
      />
    )

    expect(screen.getByTestId('adjective-item-adj1')).toBeInTheDocument()
    expect(screen.getByTestId('adjective-item-adj2')).toBeInTheDocument()
    expect(screen.getByTestId('adjective-item-adj3')).toBeInTheDocument()
    expect(
      screen.getByText('AdjectiveItem: good (Index: 0)')
    ).toBeInTheDocument()
    expect(
      screen.getByText('AdjectiveItem: bad (Index: 1)')
    ).toBeInTheDocument()
    expect(
      screen.getByText('AdjectiveItem: big (Index: 2)')
    ).toBeInTheDocument()
  })

  it('passes correct index to each AdjectiveItem', () => {
    const adjectives = [
      mockAdjective,
      {
        id: 'adj2',
        translation: 'bad',
        italian: 'cattivo',
        masculineSingular: 'cattivo',
        masculinePlural: 'cattivi',
        feminineSingular: 'cattiva',
        femininePlural: 'cattive',
      },
    ]

    renderWithProviders(
      <AdjectivesList
        {...defaultProps}
        adjectives={adjectives}
        filteredAndSortedAdjectives={adjectives}
      />
    )

    expect(
      screen.getByText('AdjectiveItem: good (Index: 0)')
    ).toBeInTheDocument()
    expect(
      screen.getByText('AdjectiveItem: bad (Index: 1)')
    ).toBeInTheDocument()
  })

  it('calls getStatistics for each adjective', () => {
    const adjectives = [
      mockAdjective,
      {
        id: 'adj2',
        translation: 'bad',
        italian: 'cattivo',
        masculineSingular: 'cattivo',
        masculinePlural: 'cattivi',
        feminineSingular: 'cattiva',
        femininePlural: 'cattive',
      },
    ]

    renderWithProviders(
      <AdjectivesList
        {...defaultProps}
        adjectives={adjectives}
        filteredAndSortedAdjectives={adjectives}
      />
    )

    expect(mockActionsContext.getStatistics).toHaveBeenCalledWith('adj1')
    expect(mockActionsContext.getStatistics).toHaveBeenCalledWith('adj2')
    expect(mockActionsContext.getStatistics).toHaveBeenCalledTimes(2)
  })

  it('calls getInputRef for each adjective and form', () => {
    const adjectives = [
      mockAdjective,
      {
        id: 'adj2',
        translation: 'bad',
        italian: 'cattivo',
        masculineSingular: 'cattivo',
        masculinePlural: 'cattivi',
        feminineSingular: 'cattiva',
        femininePlural: 'cattive',
      },
    ]

    renderWithProviders(
      <AdjectivesList
        {...defaultProps}
        adjectives={adjectives}
        filteredAndSortedAdjectives={adjectives}
      />
    )

    // Each adjective has 4 forms: masculineSingular, masculinePlural, feminineSingular, femininePlural
    expect(mockActionsContext.getInputRef).toHaveBeenCalledWith(
      'adj1',
      'masculineSingular'
    )
    expect(mockActionsContext.getInputRef).toHaveBeenCalledWith(
      'adj1',
      'masculinePlural'
    )
    expect(mockActionsContext.getInputRef).toHaveBeenCalledWith(
      'adj1',
      'feminineSingular'
    )
    expect(mockActionsContext.getInputRef).toHaveBeenCalledWith(
      'adj1',
      'femininePlural'
    )
    expect(mockActionsContext.getInputRef).toHaveBeenCalledWith(
      'adj2',
      'masculineSingular'
    )
  })
})
