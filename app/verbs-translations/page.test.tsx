import React from 'react'

import { render, screen } from '@testing-library/react'

import { ResetStatisticsDialog } from './internals/components/VerbItem/internals'
import { VerbsList } from './internals/components/VerbsList'
import { useVerbsPractice } from './internals/hooks/useVerbsPractice'
import VerbsTranslationsPage from './page'

// Mock the hook
jest.mock('./internals/hooks/useVerbsPractice')

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

    // Check that VerbsList received correct props
    expect(VerbsList).toHaveBeenCalledWith(
      expect.objectContaining({
        verbs: defaultMockValues.verbs,
        filteredAndSortedVerbs: defaultMockValues.filteredAndSortedVerbs,
        inputValues: defaultMockValues.inputValues,
        validationState: defaultMockValues.validationState,
        verbTypeFilter: defaultMockValues.verbTypeFilter,
        sortOption: defaultMockValues.sortOption,
        displayCount: defaultMockValues.displayCount,
        shouldShowRefreshButton: defaultMockValues.shouldShowRefreshButton,
      }),
      undefined
    )
  })

  it('passes handlers to VerbsList', () => {
    render(<VerbsTranslationsPage />)

    expect(VerbsList).toHaveBeenCalledWith(
      expect.objectContaining({
        onInputChange: defaultMockValues.handleInputChange,
        onValidation: defaultMockValues.handleValidation,
        onClearInput: defaultMockValues.handleClearInput,
        onShowAnswer: defaultMockValues.handleShowAnswer,
        onResetStatistics: defaultMockValues.handleOpenResetDialog,
        onKeyDown: defaultMockValues.handleKeyDown,
        onVerbTypeChange: defaultMockValues.setVerbTypeFilter,
        onSortChange: defaultMockValues.handleSortChange,
        onDisplayCountChange: defaultMockValues.setDisplayCount,
        onRefresh: defaultMockValues.handleRefresh,
      }),
      undefined
    )
  })

  it('passes input ref function to VerbsList', () => {
    render(<VerbsTranslationsPage />)

    expect(VerbsList).toHaveBeenCalledWith(
      expect.objectContaining({
        inputRef: expect.any(Function),
      }),
      undefined
    )
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

  it('passes getStatistics function to VerbsList', () => {
    const mockGetStatistics = jest
      .fn()
      .mockReturnValue({ correct: 5, wrong: 2 })
    mockUseVerbsPractice.mockReturnValue({
      ...defaultMockValues,
      getStatistics: mockGetStatistics,
    })

    render(<VerbsTranslationsPage />)

    expect(VerbsList).toHaveBeenCalledWith(
      expect.objectContaining({
        getStatistics: mockGetStatistics,
      }),
      undefined
    )
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

  it('shows refresh button when sorting by random', () => {
    mockUseVerbsPractice.mockReturnValue({
      ...defaultMockValues,
      sortOption: 'random',
      shouldShowRefreshButton: true,
    })

    render(<VerbsTranslationsPage />)

    expect(VerbsList).toHaveBeenCalledWith(
      expect.objectContaining({
        sortOption: 'random',
        shouldShowRefreshButton: true,
      }),
      undefined
    )
  })

  it('shows refresh button when sorting by most errors', () => {
    mockUseVerbsPractice.mockReturnValue({
      ...defaultMockValues,
      sortOption: 'most-errors',
      shouldShowRefreshButton: true,
    })

    render(<VerbsTranslationsPage />)

    expect(VerbsList).toHaveBeenCalledWith(
      expect.objectContaining({
        sortOption: 'most-errors',
        shouldShowRefreshButton: true,
      }),
      undefined
    )
  })

  it('shows refresh button when sorting by worst performance', () => {
    mockUseVerbsPractice.mockReturnValue({
      ...defaultMockValues,
      sortOption: 'worst-performance',
      shouldShowRefreshButton: true,
    })

    render(<VerbsTranslationsPage />)

    expect(VerbsList).toHaveBeenCalledWith(
      expect.objectContaining({
        sortOption: 'worst-performance',
        shouldShowRefreshButton: true,
      }),
      undefined
    )
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

    expect(VerbsList).toHaveBeenCalledWith(
      expect.objectContaining({
        displayCount: 20,
      }),
      undefined
    )
  })

  it('renders with all display count option', () => {
    mockUseVerbsPractice.mockReturnValue({
      ...defaultMockValues,
      displayCount: 'all',
    })

    render(<VerbsTranslationsPage />)

    expect(VerbsList).toHaveBeenCalledWith(
      expect.objectContaining({
        displayCount: 'all',
      }),
      undefined
    )
  })

  it('renders with alphabetical sort option', () => {
    mockUseVerbsPractice.mockReturnValue({
      ...defaultMockValues,
      sortOption: 'alphabetical',
    })

    render(<VerbsTranslationsPage />)

    expect(VerbsList).toHaveBeenCalledWith(
      expect.objectContaining({
        sortOption: 'alphabetical',
      }),
      undefined
    )
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
