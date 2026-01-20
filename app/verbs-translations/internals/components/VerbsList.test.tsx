import React, { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'

import '@testing-library/jest-dom'
import {
  PracticeActionsProvider,
  PracticeFiltersProvider,
  PracticeActionsContextType,
  PracticeFiltersContextType,
} from '@/app/contexts'

import { InputValues, ValidationState } from '../types'
import { VerbTypeFilter } from './VerbItem/internals'
import { VerbsList } from './VerbsList'

// Mock child components
jest.mock('./VerbItem', () => ({
  VerbItem: ({
    verb,
    index,
    inputValue,
    validationState,
  }: {
    verb: { id: string; translation: string }
    index: number
    inputValue: string
    validationState: string | null
  }) => (
    <div data-testid={`verb-item-${verb.id}`}>
      VerbItem: {verb.translation} (Index: {index})
      <div data-testid={`input-${verb.id}`}>{inputValue}</div>
      <div data-testid={`validation-${verb.id}`}>
        {validationState || 'null'}
      </div>
    </div>
  ),
}))

jest.mock('./VerbItem/internals', () => ({
  FilterControls: () => <div data-testid="filter-controls">FilterControls</div>,
  VerbTypeFilter: {
    ALL: 'all',
  },
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

describe('VerbsList', () => {
  const mockVerb = {
    id: 'verb1',
    translation: 'to speak',
    italian: 'parlare',
    regular: true,
    reflexive: false,
  }

  const defaultProps = {
    verbs: [mockVerb],
    filteredAndSortedVerbs: [mockVerb],
    inputValues: {
      verb1: 'parlare',
    } as InputValues,
    validationState: {
      verb1: 'correct',
    } as ValidationState,
    verbTypeFilter: 'all' as VerbTypeFilter,
    onVerbTypeChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders "No verbs available" alert when verbs array is empty', () => {
    renderWithProviders(
      <VerbsList {...defaultProps} verbs={[]} filteredAndSortedVerbs={[]} />
    )

    expect(
      screen.getByText(
        /No verbs available. Please ask your administrator to import verbs./i
      )
    ).toBeInTheDocument()
    expect(screen.queryByTestId('filter-controls')).not.toBeInTheDocument()
  })

  it('renders FilterControls and VerbItem components when verbs are present', () => {
    renderWithProviders(<VerbsList {...defaultProps} />)

    expect(screen.getByTestId('filter-controls')).toBeInTheDocument()
    expect(screen.getByTestId('verb-item-verb1')).toBeInTheDocument()
    expect(
      screen.getByText('VerbItem: to speak (Index: 0)')
    ).toBeInTheDocument()
  })

  it('renders FilterControls component', () => {
    renderWithProviders(<VerbsList {...defaultProps} />)

    expect(screen.getByTestId('filter-controls')).toBeInTheDocument()
  })

  it('provides default inputValue when missing', () => {
    renderWithProviders(<VerbsList {...defaultProps} inputValues={{}} />)

    const inputDiv = screen.getByTestId('input-verb1')
    expect(inputDiv).toHaveTextContent('')
  })

  it('provides default validationState when missing', () => {
    renderWithProviders(<VerbsList {...defaultProps} validationState={{}} />)

    const validationDiv = screen.getByTestId('validation-verb1')
    expect(validationDiv).toHaveTextContent('null')
  })

  it('provides default inputValue and validationState when both are missing', () => {
    renderWithProviders(
      <VerbsList {...defaultProps} inputValues={{}} validationState={{}} />
    )

    const inputDiv = screen.getByTestId('input-verb1')
    const validationDiv = screen.getByTestId('validation-verb1')

    expect(inputDiv).toHaveTextContent('')
    expect(validationDiv).toHaveTextContent('null')
  })

  it('renders multiple verbs correctly', () => {
    const verbs = [
      mockVerb,
      {
        id: 'verb2',
        translation: 'to eat',
        italian: 'mangiare',
        regular: true,
        reflexive: false,
      },
      {
        id: 'verb3',
        translation: 'to go',
        italian: 'andare',
        regular: false,
        reflexive: false,
      },
    ]

    renderWithProviders(
      <VerbsList
        {...defaultProps}
        verbs={verbs}
        filteredAndSortedVerbs={verbs}
      />
    )

    expect(screen.getByTestId('verb-item-verb1')).toBeInTheDocument()
    expect(screen.getByTestId('verb-item-verb2')).toBeInTheDocument()
    expect(screen.getByTestId('verb-item-verb3')).toBeInTheDocument()
    expect(
      screen.getByText('VerbItem: to speak (Index: 0)')
    ).toBeInTheDocument()
    expect(screen.getByText('VerbItem: to eat (Index: 1)')).toBeInTheDocument()
    expect(screen.getByText('VerbItem: to go (Index: 2)')).toBeInTheDocument()
  })

  it('passes correct index to each VerbItem', () => {
    const verbs = [
      mockVerb,
      {
        id: 'verb2',
        translation: 'to eat',
        italian: 'mangiare',
        regular: true,
        reflexive: false,
      },
    ]

    renderWithProviders(
      <VerbsList
        {...defaultProps}
        verbs={verbs}
        filteredAndSortedVerbs={verbs}
      />
    )

    expect(
      screen.getByText('VerbItem: to speak (Index: 0)')
    ).toBeInTheDocument()
    expect(screen.getByText('VerbItem: to eat (Index: 1)')).toBeInTheDocument()
  })

  it('calls getStatistics for each verb', () => {
    const verbs = [
      mockVerb,
      {
        id: 'verb2',
        translation: 'to eat',
        italian: 'mangiare',
        regular: true,
        reflexive: false,
      },
    ]

    renderWithProviders(
      <VerbsList
        {...defaultProps}
        verbs={verbs}
        filteredAndSortedVerbs={verbs}
      />
    )

    expect(mockActionsContext.getStatistics).toHaveBeenCalledWith('verb1')
    expect(mockActionsContext.getStatistics).toHaveBeenCalledWith('verb2')
    expect(mockActionsContext.getStatistics).toHaveBeenCalledTimes(2)
  })

  it('calls getInputRef for each verb', () => {
    const verbs = [
      mockVerb,
      {
        id: 'verb2',
        translation: 'to eat',
        italian: 'mangiare',
        regular: true,
        reflexive: false,
      },
    ]

    renderWithProviders(
      <VerbsList
        {...defaultProps}
        verbs={verbs}
        filteredAndSortedVerbs={verbs}
      />
    )

    expect(mockActionsContext.getInputRef).toHaveBeenCalledWith('verb1')
    expect(mockActionsContext.getInputRef).toHaveBeenCalledWith('verb2')
  })

  it('renders verbs with different types correctly', () => {
    const verbs = [
      {
        id: 'verb1',
        translation: 'to speak',
        italian: 'parlare',
        regular: true,
        reflexive: false,
      },
      {
        id: 'verb2',
        translation: 'to go',
        italian: 'andare',
        regular: false,
        reflexive: false,
      },
      {
        id: 'verb3',
        translation: 'to wash oneself',
        italian: 'lavarsi',
        regular: true,
        reflexive: true,
      },
    ]

    renderWithProviders(
      <VerbsList
        {...defaultProps}
        verbs={verbs}
        filteredAndSortedVerbs={verbs}
      />
    )

    expect(screen.getByTestId('verb-item-verb1')).toBeInTheDocument()
    expect(screen.getByTestId('verb-item-verb2')).toBeInTheDocument()
    expect(screen.getByTestId('verb-item-verb3')).toBeInTheDocument()
  })

  it('displays correct inputValue for each verb', () => {
    const verbs = [
      mockVerb,
      {
        id: 'verb2',
        translation: 'to eat',
        italian: 'mangiare',
        regular: true,
        reflexive: false,
      },
    ]

    const inputValues = {
      verb1: 'parlare',
      verb2: 'mangiare',
    }

    renderWithProviders(
      <VerbsList
        {...defaultProps}
        verbs={verbs}
        filteredAndSortedVerbs={verbs}
        inputValues={inputValues}
      />
    )

    expect(screen.getByTestId('input-verb1')).toHaveTextContent('parlare')
    expect(screen.getByTestId('input-verb2')).toHaveTextContent('mangiare')
  })

  it('displays correct validationState for each verb', () => {
    const verbs = [
      mockVerb,
      {
        id: 'verb2',
        translation: 'to eat',
        italian: 'mangiare',
        regular: true,
        reflexive: false,
      },
    ]

    const validationState = {
      verb1: 'correct' as const,
      verb2: 'incorrect' as const,
    }

    renderWithProviders(
      <VerbsList
        {...defaultProps}
        verbs={verbs}
        filteredAndSortedVerbs={verbs}
        validationState={validationState}
      />
    )

    expect(screen.getByTestId('validation-verb1')).toHaveTextContent('correct')
    expect(screen.getByTestId('validation-verb2')).toHaveTextContent(
      'incorrect'
    )
  })

  it('renders only filtered verbs when filteredAndSortedVerbs differs from verbs', () => {
    const allVerbs = [
      mockVerb,
      {
        id: 'verb2',
        translation: 'to eat',
        italian: 'mangiare',
        regular: true,
        reflexive: false,
      },
      {
        id: 'verb3',
        translation: 'to go',
        italian: 'andare',
        regular: false,
        reflexive: false,
      },
    ]

    const filteredVerbs = [
      {
        id: 'verb2',
        translation: 'to eat',
        italian: 'mangiare',
        regular: true,
        reflexive: false,
      },
    ]

    renderWithProviders(
      <VerbsList
        {...defaultProps}
        verbs={allVerbs}
        filteredAndSortedVerbs={filteredVerbs}
      />
    )

    expect(screen.queryByTestId('verb-item-verb1')).not.toBeInTheDocument()
    expect(screen.getByTestId('verb-item-verb2')).toBeInTheDocument()
    expect(screen.queryByTestId('verb-item-verb3')).not.toBeInTheDocument()
  })
})
