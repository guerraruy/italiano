import React from 'react'

import { render, screen } from '@testing-library/react'

import { ResetStatisticsDialog } from './internals/components/AdjectiveItem/internals'
import { AdjectivesList } from './internals/components/AdjectivesList'
import { useAdjectivesPractice } from './internals/hooks/useAdjectivesPractice'
import AdjectivesTranslationsPage from './page'

// Mock the hook
jest.mock('./internals/hooks/useAdjectivesPractice')

// Mock context providers
jest.mock('../contexts', () => ({
  PracticeActionsProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PracticeFiltersProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

// Mock child components
jest.mock('./internals/components/AdjectivesList', () => ({
  AdjectivesList: jest.fn(() => (
    <div data-testid="adjectives-list">AdjectivesList</div>
  )),
}))

jest.mock('../components/PageHeader', () => ({
  PageHeader: jest.fn(() => <div data-testid="page-header">PageHeader</div>),
}))

jest.mock('./internals/components/AdjectiveItem/internals', () => ({
  ResetStatisticsDialog: jest.fn(() => (
    <div data-testid="reset-dialog">ResetDialog</div>
  )),
}))

describe('AdjectivesTranslationsPage', () => {
  const mockUseAdjectivesPractice = useAdjectivesPractice as jest.Mock

  const defaultMockValues = {
    isLoading: false,
    error: null,
    adjectives: [],
    filteredAndSortedAdjectives: [],
    inputValues: {},
    validationState: {},
    sortOption: 'none',
    displayCount: 10,
    excludeMastered: false,
    masteryThreshold: 3,
    masteredCount: 0,
    resetDialog: { open: false, adjectiveTranslation: null },
    isResetting: false,
    statisticsError: null,
    inputRefs: { current: {} },
    handleInputChange: jest.fn(),
    handleValidation: jest.fn(),
    handleClearInput: jest.fn(),
    handleShowAnswer: jest.fn(),
    handleOpenResetDialog: jest.fn(),
    handleCloseResetDialog: jest.fn(),
    handleConfirmReset: jest.fn(),
    handleKeyDown: jest.fn(),
    handleRefresh: jest.fn(),
    handleSortChange: jest.fn(),
    setDisplayCount: jest.fn(),
    setExcludeMastered: jest.fn(),
    getStatistics: jest.fn(),
    shouldShowRefreshButton: false,
  }

  beforeEach(() => {
    mockUseAdjectivesPractice.mockReturnValue(defaultMockValues)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state', () => {
    mockUseAdjectivesPractice.mockReturnValue({
      ...defaultMockValues,
      isLoading: true,
    })

    const { container } = render(<AdjectivesTranslationsPage />)

    // Should render skeleton components during loading
    const skeletons = container.querySelectorAll('.MuiSkeleton-root')
    expect(skeletons.length).toBeGreaterThan(0)
    expect(screen.queryByTestId('adjectives-list')).not.toBeInTheDocument()
  })

  it('renders error state', () => {
    mockUseAdjectivesPractice.mockReturnValue({
      ...defaultMockValues,
      error: new Error('Test error'),
    })

    render(<AdjectivesTranslationsPage />)
    expect(screen.getByText(/Error loading adjectives/i)).toBeInTheDocument()
    expect(screen.queryByTestId('adjectives-list')).not.toBeInTheDocument()
  })

  it('renders content when loaded', () => {
    render(<AdjectivesTranslationsPage />)

    expect(screen.getByTestId('page-header')).toBeInTheDocument()
    expect(screen.getByText(/Translate each adjective/i)).toBeInTheDocument()
    expect(screen.getByTestId('adjectives-list')).toBeInTheDocument()

    // Check that AdjectivesList received correct props (handlers are now in context)
    expect(AdjectivesList).toHaveBeenCalledWith(
      expect.objectContaining({
        adjectives: defaultMockValues.adjectives,
        filteredAndSortedAdjectives:
          defaultMockValues.filteredAndSortedAdjectives,
        inputValues: defaultMockValues.inputValues,
        validationState: defaultMockValues.validationState,
      }),
      undefined
    )
  })

  it('only passes data props to AdjectivesList (handlers via context)', () => {
    render(<AdjectivesTranslationsPage />)

    // AdjectivesList should only receive data props, not handlers
    expect(AdjectivesList).toHaveBeenCalledWith(
      {
        adjectives: defaultMockValues.adjectives,
        filteredAndSortedAdjectives:
          defaultMockValues.filteredAndSortedAdjectives,
        inputValues: defaultMockValues.inputValues,
        validationState: defaultMockValues.validationState,
      },
      undefined
    )

    // Should not receive handler props (they're in context now)
    const callArgs = (AdjectivesList as jest.Mock).mock.calls[0][0]
    expect(callArgs).not.toHaveProperty('onInputChange')
    expect(callArgs).not.toHaveProperty('onValidation')
    expect(callArgs).not.toHaveProperty('onSortChange')
  })

  it('renders reset dialog when open', () => {
    const resetDialogState = {
      open: true,
      adjectiveTranslation: { id: '1', italian: 'test' },
    }

    mockUseAdjectivesPractice.mockReturnValue({
      ...defaultMockValues,
      resetDialog: resetDialogState,
    })

    render(<AdjectivesTranslationsPage />)

    expect(ResetStatisticsDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        adjectiveTranslation: resetDialogState.adjectiveTranslation,
        isResetting: defaultMockValues.isResetting,
        onClose: defaultMockValues.handleCloseResetDialog,
        onConfirm: defaultMockValues.handleConfirmReset,
      }),
      undefined
    )
  })
})
