import React from 'react'

import { render, screen } from '@testing-library/react'

import { ResetStatisticsDialog } from './internals/components/NounItem/internals'
import { NounsList } from './internals/components/NounsList'
import { useNounsPractice } from './internals/hooks/useNounsPractice'
import NounsTranslationsPage from './page'

// Mock the hook
jest.mock('./internals/hooks/useNounsPractice')

// Mock child components
jest.mock('./internals/components/NounsList', () => ({
  NounsList: jest.fn(() => <div data-testid="nouns-list">NounsList</div>),
}))

jest.mock('../components/PageHeader', () => ({
  PageHeader: jest.fn(() => <div data-testid="page-header">PageHeader</div>),
}))

jest.mock('./internals/components/NounItem/internals', () => ({
  ResetStatisticsDialog: jest.fn(() => (
    <div data-testid="reset-dialog">ResetDialog</div>
  )),
  FilterControls: jest.fn(() => (
    <div data-testid="filter-controls">FilterControls</div>
  )),
  SortOption: {},
  DisplayCount: {},
}))

describe('NounsTranslationsPage', () => {
  const mockUseNounsPractice = useNounsPractice as jest.Mock

  const defaultMockValues = {
    isLoading: false,
    error: null,
    nouns: [],
    filteredAndSortedNouns: [],
    inputValues: {},
    validationState: {},
    sortOption: 'none',
    displayCount: 10,
    resetDialog: {
      open: false,
      nounId: null,
      nounTranslation: null,
      error: null,
    },
    isResetting: false,
    statisticsError: null,
    inputRefsSingular: { current: {} },
    inputRefsPlural: { current: {} },
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
    mockUseNounsPractice.mockReturnValue(defaultMockValues)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state', () => {
    mockUseNounsPractice.mockReturnValue({
      ...defaultMockValues,
      isLoading: true,
    })

    const { container } = render(<NounsTranslationsPage />)

    // Should render skeleton components during loading
    const skeletons = container.querySelectorAll('.MuiSkeleton-root')
    expect(skeletons.length).toBeGreaterThan(0)
    expect(screen.queryByTestId('nouns-list')).not.toBeInTheDocument()
  })

  it('renders error state', () => {
    mockUseNounsPractice.mockReturnValue({
      ...defaultMockValues,
      error: new Error('Test error'),
    })

    render(<NounsTranslationsPage />)
    expect(screen.getByText(/Error loading nouns/i)).toBeInTheDocument()
    expect(screen.queryByTestId('nouns-list')).not.toBeInTheDocument()
  })

  it('renders content when loaded', () => {
    render(<NounsTranslationsPage />)

    expect(screen.getByTestId('page-header')).toBeInTheDocument()
    expect(screen.getByText(/Translate each noun/i)).toBeInTheDocument()
    expect(screen.getByTestId('nouns-list')).toBeInTheDocument()

    // Check that NounsList received correct props
    // Note: sortOption, displayCount, handlers, etc. are now passed via context providers
    expect(NounsList).toHaveBeenCalledWith(
      expect.objectContaining({
        nouns: defaultMockValues.nouns,
        filteredAndSortedNouns: defaultMockValues.filteredAndSortedNouns,
        inputValues: defaultMockValues.inputValues,
        validationState: defaultMockValues.validationState,
      }),
      undefined
    )
  })

  it('wraps NounsList with context providers', () => {
    render(<NounsTranslationsPage />)

    // NounsList should be rendered
    expect(screen.getByTestId('nouns-list')).toBeInTheDocument()
    // Note: handlers and refs are now passed via PracticeActionsProvider and PracticeFiltersProvider
  })

  it('renders reset dialog with correct props', () => {
    const resetDialogState = {
      open: true,
      nounId: '1',
      nounTranslation: 'test noun',
      error: null,
    }

    mockUseNounsPractice.mockReturnValue({
      ...defaultMockValues,
      resetDialog: resetDialogState,
    })

    render(<NounsTranslationsPage />)

    expect(ResetStatisticsDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        nounTranslation: resetDialogState.nounTranslation,
        isResetting: defaultMockValues.isResetting,
        error: resetDialogState.error,
        onClose: defaultMockValues.handleCloseResetDialog,
        onConfirm: defaultMockValues.handleConfirmReset,
      }),
      undefined
    )
  })

  it('renders reset dialog when closed', () => {
    render(<NounsTranslationsPage />)

    expect(ResetStatisticsDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        open: false,
        nounTranslation: null,
        isResetting: false,
      }),
      undefined
    )
  })

  it('displays statistics error warning when present', () => {
    mockUseNounsPractice.mockReturnValue({
      ...defaultMockValues,
      statisticsError: {
        message: 'Failed to save statistics',
        timestamp: Date.now(),
      },
    })

    render(<NounsTranslationsPage />)

    expect(screen.getByText('Failed to save statistics')).toBeInTheDocument()
  })

  it('does not display statistics error warning when absent', () => {
    render(<NounsTranslationsPage />)

    expect(
      screen.queryByText('Failed to save statistics')
    ).not.toBeInTheDocument()
  })

  it('renders with nouns data', () => {
    const mockNouns = [
      {
        id: '1',
        translation: 'house',
        translationPlural: 'houses',
        italian: 'casa',
        italianPlural: 'case',
      },
      {
        id: '2',
        translation: 'dog',
        translationPlural: 'dogs',
        italian: 'cane',
        italianPlural: 'cani',
      },
    ]

    mockUseNounsPractice.mockReturnValue({
      ...defaultMockValues,
      nouns: mockNouns,
      filteredAndSortedNouns: mockNouns,
    })

    render(<NounsTranslationsPage />)

    expect(NounsList).toHaveBeenCalledWith(
      expect.objectContaining({
        nouns: mockNouns,
        filteredAndSortedNouns: mockNouns,
      }),
      undefined
    )
  })

  it('renders successfully with custom hook values', () => {
    const mockGetStatistics = jest
      .fn()
      .mockReturnValue({ correct: 5, wrong: 2 })
    mockUseNounsPractice.mockReturnValue({
      ...defaultMockValues,
      getStatistics: mockGetStatistics,
    })

    render(<NounsTranslationsPage />)

    // Should render without errors
    expect(screen.getByTestId('nouns-list')).toBeInTheDocument()
    // Note: getStatistics is now passed via PracticeActionsProvider
  })

  it('renders page header in loading state', () => {
    mockUseNounsPractice.mockReturnValue({
      ...defaultMockValues,
      isLoading: true,
    })

    render(<NounsTranslationsPage />)

    expect(screen.getByTestId('page-header')).toBeInTheDocument()
  })

  it('renders page header in error state', () => {
    mockUseNounsPractice.mockReturnValue({
      ...defaultMockValues,
      error: new Error('Test error'),
    })

    render(<NounsTranslationsPage />)

    expect(screen.getByTestId('page-header')).toBeInTheDocument()
  })

  it('renders instruction text when loaded', () => {
    render(<NounsTranslationsPage />)

    expect(
      screen.getByText(
        'Translate each noun from your native language to Italian'
      )
    ).toBeInTheDocument()
  })

  it('renders instruction text in loading state', () => {
    mockUseNounsPractice.mockReturnValue({
      ...defaultMockValues,
      isLoading: true,
    })

    render(<NounsTranslationsPage />)

    expect(
      screen.getByText(
        'Translate each noun from your native language to Italian'
      )
    ).toBeInTheDocument()
  })
})
