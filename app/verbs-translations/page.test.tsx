import React from 'react'

import { render, screen } from '@testing-library/react'

import { ResetStatisticsDialog } from './internals/components/VerbItem/internals'
import { VerbsList } from './internals/components/VerbsList'
import { useVerbsPractice } from './internals/hooks/useVerbsPractice'
import VerbsTranslationsPage from './page'

// Mock the hook
jest.mock('./internals/hooks/useVerbsPractice')

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
jest.mock('./internals/components/VerbsList', () => ({
  VerbsList: jest.fn(() => <div data-testid="verbs-list">VerbsList</div>),
}))

jest.mock('../components/PageHeader', () => ({
  PageHeader: jest.fn(() => <div data-testid="page-header">PageHeader</div>),
}))

jest.mock('./internals/components/VerbItem/internals', () => ({
  ResetStatisticsDialog: jest.fn(() => (
    <div data-testid="reset-dialog">ResetDialog</div>
  )),
  FilterControls: jest.fn(() => (
    <div data-testid="filter-controls">FilterControls</div>
  )),
  SortOption: {},
  DisplayCount: {},
  VerbTypeFilter: {},
}))

describe('VerbsTranslationsPage', () => {
  const mockUseVerbsPractice = useVerbsPractice as jest.Mock

  const defaultMockValues = {
    isLoading: false,
    error: null,
    verbs: [],
    filteredAndSortedVerbs: [],
    inputValues: {},
    validationState: {},
    verbTypeFilter: 'all',
    sortOption: 'none',
    displayCount: 10,
    resetDialog: {
      open: false,
      verbId: null,
      verbTranslation: null,
      error: null,
    },
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
    setVerbTypeFilter: jest.fn(),
    setDisplayCount: jest.fn(),
    getStatistics: jest.fn(),
    shouldShowRefreshButton: false,
  }

  beforeEach(() => {
    mockUseVerbsPractice.mockReturnValue(defaultMockValues)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state', () => {
    mockUseVerbsPractice.mockReturnValue({
      ...defaultMockValues,
      isLoading: true,
    })

    const { container } = render(<VerbsTranslationsPage />)

    // Should render skeleton components during loading
    const skeletons = container.querySelectorAll('.MuiSkeleton-root')
    expect(skeletons.length).toBeGreaterThan(0)
    expect(screen.queryByTestId('verbs-list')).not.toBeInTheDocument()
  })

  it('renders error state', () => {
    mockUseVerbsPractice.mockReturnValue({
      ...defaultMockValues,
      error: new Error('Test error'),
    })

    render(<VerbsTranslationsPage />)
    expect(screen.getByText(/Error loading verbs/i)).toBeInTheDocument()
    expect(screen.queryByTestId('verbs-list')).not.toBeInTheDocument()
  })

  it('renders content when loaded', () => {
    render(<VerbsTranslationsPage />)

    expect(screen.getByTestId('page-header')).toBeInTheDocument()
    expect(screen.getByText(/Translate each verb/i)).toBeInTheDocument()
    expect(screen.getByTestId('verbs-list')).toBeInTheDocument()

    // Check that VerbsList received correct props (now passed directly, not via context)
    expect(VerbsList).toHaveBeenCalledWith(
      expect.objectContaining({
        verbs: defaultMockValues.verbs,
        filteredAndSortedVerbs: defaultMockValues.filteredAndSortedVerbs,
        inputValues: defaultMockValues.inputValues,
        validationState: defaultMockValues.validationState,
        verbTypeFilter: defaultMockValues.verbTypeFilter,
        onVerbTypeChange: defaultMockValues.setVerbTypeFilter,
      }),
      undefined
    )
  })

  it('passes onVerbTypeChange handler to VerbsList', () => {
    render(<VerbsTranslationsPage />)

    // onVerbTypeChange is passed directly, other handlers are passed via context
    expect(VerbsList).toHaveBeenCalledWith(
      expect.objectContaining({
        onVerbTypeChange: defaultMockValues.setVerbTypeFilter,
      }),
      undefined
    )
  })

  it('renders VerbsList with context providers', () => {
    render(<VerbsTranslationsPage />)

    // VerbsList is now wrapped with PracticeFiltersProvider and PracticeActionsProvider
    // Input ref and other handlers are passed through context, not as direct props
    expect(screen.getByTestId('verbs-list')).toBeInTheDocument()
  })

  it('renders reset dialog with correct props', () => {
    const resetDialogState = {
      open: true,
      verbId: '1',
      verbTranslation: 'test verb',
      error: null,
    }

    mockUseVerbsPractice.mockReturnValue({
      ...defaultMockValues,
      resetDialog: resetDialogState,
    })

    render(<VerbsTranslationsPage />)

    expect(ResetStatisticsDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        verbTranslation: resetDialogState.verbTranslation,
        isResetting: defaultMockValues.isResetting,
        error: resetDialogState.error,
        onClose: defaultMockValues.handleCloseResetDialog,
        onConfirm: defaultMockValues.handleConfirmReset,
      }),
      undefined
    )
  })

  it('renders reset dialog when closed', () => {
    render(<VerbsTranslationsPage />)

    expect(ResetStatisticsDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        open: false,
        verbTranslation: null,
        isResetting: false,
      }),
      undefined
    )
  })

  it('displays statistics error warning when present', () => {
    mockUseVerbsPractice.mockReturnValue({
      ...defaultMockValues,
      statisticsError: {
        message: 'Failed to save statistics',
        timestamp: Date.now(),
      },
    })

    render(<VerbsTranslationsPage />)

    expect(screen.getByText('Failed to save statistics')).toBeInTheDocument()
  })

  it('does not display statistics error warning when absent', () => {
    render(<VerbsTranslationsPage />)

    expect(
      screen.queryByText('Failed to save statistics')
    ).not.toBeInTheDocument()
  })

  it('renders with verbs data', () => {
    const mockVerbs = [
      {
        id: '1',
        translation: 'to eat',
        italian: 'mangiare',
        regular: true,
        reflexive: false,
      },
      {
        id: '2',
        translation: 'to go',
        italian: 'andare',
        regular: false,
        reflexive: false,
      },
    ]

    mockUseVerbsPractice.mockReturnValue({
      ...defaultMockValues,
      verbs: mockVerbs,
      filteredAndSortedVerbs: mockVerbs,
    })

    render(<VerbsTranslationsPage />)

    expect(VerbsList).toHaveBeenCalledWith(
      expect.objectContaining({
        verbs: mockVerbs,
        filteredAndSortedVerbs: mockVerbs,
      }),
      undefined
    )
  })

  it('renders with getStatistics in context', () => {
    const mockGetStatistics = jest
      .fn()
      .mockReturnValue({ correct: 5, wrong: 2 })
    mockUseVerbsPractice.mockReturnValue({
      ...defaultMockValues,
      getStatistics: mockGetStatistics,
    })

    render(<VerbsTranslationsPage />)

    // getStatistics is now passed via PracticeActionsProvider context
    expect(screen.getByTestId('verbs-list')).toBeInTheDocument()
  })

  it('renders page header in loading state', () => {
    mockUseVerbsPractice.mockReturnValue({
      ...defaultMockValues,
      isLoading: true,
    })

    render(<VerbsTranslationsPage />)

    expect(screen.getByTestId('page-header')).toBeInTheDocument()
  })

  it('renders page header in error state', () => {
    mockUseVerbsPractice.mockReturnValue({
      ...defaultMockValues,
      error: new Error('Test error'),
    })

    render(<VerbsTranslationsPage />)

    expect(screen.getByTestId('page-header')).toBeInTheDocument()
  })

  it('renders instruction text when loaded', () => {
    render(<VerbsTranslationsPage />)

    expect(
      screen.getByText(
        'Translate each verb from your native language to Italian'
      )
    ).toBeInTheDocument()
  })

  it('renders instruction text in loading state', () => {
    mockUseVerbsPractice.mockReturnValue({
      ...defaultMockValues,
      isLoading: true,
    })

    render(<VerbsTranslationsPage />)

    expect(
      screen.getByText(
        'Translate each verb from your native language to Italian'
      )
    ).toBeInTheDocument()
  })

  it('renders with verb type filter applied', () => {
    mockUseVerbsPractice.mockReturnValue({
      ...defaultMockValues,
      verbTypeFilter: 'regular',
    })

    render(<VerbsTranslationsPage />)

    expect(VerbsList).toHaveBeenCalledWith(
      expect.objectContaining({
        verbTypeFilter: 'regular',
      }),
      undefined
    )
  })

  it('renders with reflexive verb filter', () => {
    const reflexiveVerbs = [
      {
        id: '1',
        translation: 'to get up',
        italian: 'alzarsi',
        regular: true,
        reflexive: true,
      },
    ]

    mockUseVerbsPractice.mockReturnValue({
      ...defaultMockValues,
      verbTypeFilter: 'reflexive',
      verbs: reflexiveVerbs,
      filteredAndSortedVerbs: reflexiveVerbs,
    })

    render(<VerbsTranslationsPage />)

    expect(VerbsList).toHaveBeenCalledWith(
      expect.objectContaining({
        verbTypeFilter: 'reflexive',
        verbs: reflexiveVerbs,
        filteredAndSortedVerbs: reflexiveVerbs,
      }),
      undefined
    )
  })

  it('renders with irregular verb filter', () => {
    const irregularVerbs = [
      {
        id: '1',
        translation: 'to be',
        italian: 'essere',
        regular: false,
        reflexive: false,
      },
    ]

    mockUseVerbsPractice.mockReturnValue({
      ...defaultMockValues,
      verbTypeFilter: 'irregular',
      verbs: irregularVerbs,
      filteredAndSortedVerbs: irregularVerbs,
    })

    render(<VerbsTranslationsPage />)

    expect(VerbsList).toHaveBeenCalledWith(
      expect.objectContaining({
        verbTypeFilter: 'irregular',
        verbs: irregularVerbs,
        filteredAndSortedVerbs: irregularVerbs,
      }),
      undefined
    )
  })

  it('renders when sorting by random with refresh button', () => {
    mockUseVerbsPractice.mockReturnValue({
      ...defaultMockValues,
      sortOption: 'random',
      shouldShowRefreshButton: true,
    })

    render(<VerbsTranslationsPage />)

    // sortOption and shouldShowRefreshButton are now passed via PracticeFiltersProvider context
    expect(screen.getByTestId('verbs-list')).toBeInTheDocument()
  })

  it('renders when sorting by most errors with refresh button', () => {
    mockUseVerbsPractice.mockReturnValue({
      ...defaultMockValues,
      sortOption: 'most-errors',
      shouldShowRefreshButton: true,
    })

    render(<VerbsTranslationsPage />)

    // sortOption and shouldShowRefreshButton are now passed via PracticeFiltersProvider context
    expect(screen.getByTestId('verbs-list')).toBeInTheDocument()
  })

  it('renders when sorting by worst performance with refresh button', () => {
    mockUseVerbsPractice.mockReturnValue({
      ...defaultMockValues,
      sortOption: 'worst-performance',
      shouldShowRefreshButton: true,
    })

    render(<VerbsTranslationsPage />)

    // sortOption and shouldShowRefreshButton are now passed via PracticeFiltersProvider context
    expect(screen.getByTestId('verbs-list')).toBeInTheDocument()
  })

  it('renders reset dialog with error message', () => {
    const resetDialogState = {
      open: true,
      verbId: '1',
      verbTranslation: 'test verb',
      error: 'Failed to reset statistics. Please try again.',
    }

    mockUseVerbsPractice.mockReturnValue({
      ...defaultMockValues,
      resetDialog: resetDialogState,
    })

    render(<VerbsTranslationsPage />)

    expect(ResetStatisticsDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        error: resetDialogState.error,
      }),
      undefined
    )
  })

  it('renders reset dialog with isResetting state', () => {
    const resetDialogState = {
      open: true,
      verbId: '1',
      verbTranslation: 'test verb',
      error: null,
    }

    mockUseVerbsPractice.mockReturnValue({
      ...defaultMockValues,
      resetDialog: resetDialogState,
      isResetting: true,
    })

    render(<VerbsTranslationsPage />)

    expect(ResetStatisticsDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        isResetting: true,
      }),
      undefined
    )
  })

  it('renders with different display counts', () => {
    mockUseVerbsPractice.mockReturnValue({
      ...defaultMockValues,
      displayCount: 20,
    })

    render(<VerbsTranslationsPage />)

    // displayCount is now passed via PracticeFiltersProvider context
    expect(screen.getByTestId('verbs-list')).toBeInTheDocument()
  })

  it('renders with all display count option', () => {
    mockUseVerbsPractice.mockReturnValue({
      ...defaultMockValues,
      displayCount: 'all',
    })

    render(<VerbsTranslationsPage />)

    // displayCount is now passed via PracticeFiltersProvider context
    expect(screen.getByTestId('verbs-list')).toBeInTheDocument()
  })

  it('renders with alphabetical sort option', () => {
    mockUseVerbsPractice.mockReturnValue({
      ...defaultMockValues,
      sortOption: 'alphabetical',
    })

    render(<VerbsTranslationsPage />)

    // sortOption is now passed via PracticeFiltersProvider context
    expect(screen.getByTestId('verbs-list')).toBeInTheDocument()
  })

  it('renders with input values', () => {
    const inputValues = {
      '1': 'mangiare',
      '2': 'andare',
    }

    mockUseVerbsPractice.mockReturnValue({
      ...defaultMockValues,
      inputValues,
    })

    render(<VerbsTranslationsPage />)

    expect(VerbsList).toHaveBeenCalledWith(
      expect.objectContaining({
        inputValues,
      }),
      undefined
    )
  })

  it('renders with validation state', () => {
    const validationState = {
      '1': 'correct' as const,
      '2': 'incorrect' as const,
    }

    mockUseVerbsPractice.mockReturnValue({
      ...defaultMockValues,
      validationState,
    })

    render(<VerbsTranslationsPage />)

    expect(VerbsList).toHaveBeenCalledWith(
      expect.objectContaining({
        validationState,
      }),
      undefined
    )
  })
})
