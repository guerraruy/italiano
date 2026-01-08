import React from 'react'

import { render, screen } from '@testing-library/react'

import { ResetStatisticsDialog } from './internals/components/AdjectiveItem/internals'
import { AdjectivesList } from './internals/components/AdjectivesList'
import { useAdjectivesPractice } from './internals/hooks/useAdjectivesPractice'
import AdjectivesTranslationsPage from './page'

// Mock the hook
jest.mock('./internals/hooks/useAdjectivesPractice')

// Mock child components
jest.mock('./internals/components/AdjectivesList', () => ({
  AdjectivesList: jest.fn(() => (
    <div data-testid='adjectives-list'>AdjectivesList</div>
  )),
}))

jest.mock('../components/PageHeader', () => ({
  PageHeader: jest.fn(() => <div data-testid='page-header'>PageHeader</div>),
}))

jest.mock('./internals/components/AdjectiveItem/internals', () => ({
  ResetStatisticsDialog: jest.fn(() => (
    <div data-testid='reset-dialog'>ResetDialog</div>
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
    resetDialog: { open: false, adjectiveTranslation: null },
    isResetting: false,
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

    render(<AdjectivesTranslationsPage />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
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

    // Check that AdjectivesList received correct props
    expect(AdjectivesList).toHaveBeenCalledWith(
      expect.objectContaining({
        adjectives: defaultMockValues.adjectives,
        filteredAndSortedAdjectives:
          defaultMockValues.filteredAndSortedAdjectives,
        inputValues: defaultMockValues.inputValues,
        validationState: defaultMockValues.validationState,
        sortOption: defaultMockValues.sortOption,
        displayCount: defaultMockValues.displayCount,
        shouldShowRefreshButton: defaultMockValues.shouldShowRefreshButton,
      }),
      undefined
    )
  })

  it('passes handlers to AdjectivesList', () => {
    render(<AdjectivesTranslationsPage />)

    expect(AdjectivesList).toHaveBeenCalledWith(
      expect.objectContaining({
        onInputChange: defaultMockValues.handleInputChange,
        onValidation: defaultMockValues.handleValidation,
        onClearInput: defaultMockValues.handleClearInput,
        onShowAnswer: defaultMockValues.handleShowAnswer,
        onResetStatistics: defaultMockValues.handleOpenResetDialog,
        onKeyDown: defaultMockValues.handleKeyDown,
        onSortChange: defaultMockValues.handleSortChange,
        onDisplayCountChange: defaultMockValues.setDisplayCount,
        onRefresh: defaultMockValues.handleRefresh,
      }),
      undefined
    )
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
