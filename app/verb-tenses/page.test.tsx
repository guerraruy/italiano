import React from 'react'

import { render, screen } from '@testing-library/react'

import {
  VerbFilters,
  ConjugationForm,
  ResetStatisticsDialog,
} from './internals/components'
import { useVerbConjugationPractice } from './internals/hooks/useVerbConjugationPractice'
import VerbTensesPage from './page'

// Mock the hook
jest.mock('./internals/hooks/useVerbConjugationPractice')

// Mock child components
jest.mock('./internals/components', () => ({
  VerbFilters: jest.fn(() => <div data-testid="verb-filters">VerbFilters</div>),
  ConjugationForm: jest.fn(() => (
    <div data-testid="conjugation-form">ConjugationForm</div>
  )),
  ResetStatisticsDialog: jest.fn(() => (
    <div data-testid="reset-dialog">ResetDialog</div>
  )),
}))

jest.mock('../components/PageHeader', () => ({
  PageHeader: jest.fn(() => <div data-testid="page-header">PageHeader</div>),
}))

jest.mock('../components/Skeleton', () => ({
  SkeletonConjugationForm: jest.fn(() => (
    <div data-testid="skeleton-conjugation-form">SkeletonConjugationForm</div>
  )),
}))

describe('VerbTensesPage', () => {
  const mockUseVerbConjugationPractice = useVerbConjugationPractice as jest.Mock

  const mockVerb = {
    id: '1',
    italian: 'mangiare',
    translation: 'to eat',
    regular: true,
    reflexive: false,
    conjugation: {
      Indicativo: {
        Presente: {
          io: 'mangio',
          tu: 'mangi',
          'lui/lei': 'mangia',
          noi: 'mangiamo',
          voi: 'mangiate',
          loro: 'mangiano',
        },
      },
    },
  }

  const defaultMockValues = {
    isLoading: false,
    error: null,
    verbs: [],
    filteredVerbs: [],
    selectedVerb: undefined,
    enabledVerbTenses: ['Indicativo.Presente'],
    verbTypeFilter: 'all',
    selectedVerbId: '',
    inputValues: {},
    validationState: {},
    resetDialog: {
      open: false,
      verbId: null,
      verbName: null,
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
    handleVerbTypeFilterChange: jest.fn(),
    handleVerbSelection: jest.fn(),
    getStatistics: jest.fn().mockReturnValue({ correct: 0, wrong: 0 }),
  }

  beforeEach(() => {
    mockUseVerbConjugationPractice.mockReturnValue(defaultMockValues)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Loading State', () => {
    it('renders loading state with skeleton', () => {
      mockUseVerbConjugationPractice.mockReturnValue({
        ...defaultMockValues,
        isLoading: true,
      })

      render(<VerbTensesPage />)

      expect(
        screen.getByTestId('skeleton-conjugation-form')
      ).toBeInTheDocument()
      expect(screen.queryByTestId('verb-filters')).not.toBeInTheDocument()
      expect(screen.queryByTestId('conjugation-form')).not.toBeInTheDocument()
    })

    it('renders page header in loading state', () => {
      mockUseVerbConjugationPractice.mockReturnValue({
        ...defaultMockValues,
        isLoading: true,
      })

      render(<VerbTensesPage />)

      expect(screen.getByTestId('page-header')).toBeInTheDocument()
    })

    it('renders instruction text in loading state', () => {
      mockUseVerbConjugationPractice.mockReturnValue({
        ...defaultMockValues,
        isLoading: true,
      })

      render(<VerbTensesPage />)

      expect(
        screen.getByText('Practice verb conjugations for all selected tenses')
      ).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('renders error state', () => {
      mockUseVerbConjugationPractice.mockReturnValue({
        ...defaultMockValues,
        error: new Error('Test error'),
      })

      render(<VerbTensesPage />)

      expect(screen.getByText(/Error loading verbs/i)).toBeInTheDocument()
      expect(screen.queryByTestId('verb-filters')).not.toBeInTheDocument()
      expect(screen.queryByTestId('conjugation-form')).not.toBeInTheDocument()
    })

    it('renders page header in error state', () => {
      mockUseVerbConjugationPractice.mockReturnValue({
        ...defaultMockValues,
        error: new Error('Test error'),
      })

      render(<VerbTensesPage />)

      expect(screen.getByTestId('page-header')).toBeInTheDocument()
    })
  })

  describe('Content Rendering', () => {
    it('renders content when loaded', () => {
      render(<VerbTensesPage />)

      expect(screen.getByTestId('page-header')).toBeInTheDocument()
      expect(
        screen.getByText('Practice verb conjugations for all selected tenses')
      ).toBeInTheDocument()
      expect(screen.getByTestId('verb-filters')).toBeInTheDocument()
      expect(screen.getByTestId('conjugation-form')).toBeInTheDocument()
    })

    it('renders reset dialog', () => {
      render(<VerbTensesPage />)

      expect(screen.getByTestId('reset-dialog')).toBeInTheDocument()
    })
  })

  describe('VerbFilters Props', () => {
    it('passes correct props to VerbFilters', () => {
      render(<VerbTensesPage />)

      expect(VerbFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          verbTypeFilter: defaultMockValues.verbTypeFilter,
          selectedVerbId: defaultMockValues.selectedVerbId,
          filteredVerbs: defaultMockValues.filteredVerbs,
          hasSelectedVerb: false,
          onVerbTypeFilterChange: defaultMockValues.handleVerbTypeFilterChange,
          onVerbSelection: defaultMockValues.handleVerbSelection,
          onResetStatistics: defaultMockValues.handleOpenResetDialog,
        }),
        undefined
      )
    })

    it('passes hasSelectedVerb=true when verb is selected', () => {
      mockUseVerbConjugationPractice.mockReturnValue({
        ...defaultMockValues,
        selectedVerb: mockVerb,
      })

      render(<VerbTensesPage />)

      expect(VerbFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          hasSelectedVerb: true,
        }),
        undefined
      )
    })

    it('passes verb type filter correctly', () => {
      mockUseVerbConjugationPractice.mockReturnValue({
        ...defaultMockValues,
        verbTypeFilter: 'regular',
      })

      render(<VerbTensesPage />)

      expect(VerbFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          verbTypeFilter: 'regular',
        }),
        undefined
      )
    })

    it('passes filtered verbs correctly', () => {
      const filteredVerbs = [mockVerb]
      mockUseVerbConjugationPractice.mockReturnValue({
        ...defaultMockValues,
        filteredVerbs,
      })

      render(<VerbTensesPage />)

      expect(VerbFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          filteredVerbs,
        }),
        undefined
      )
    })
  })

  describe('ConjugationForm Props', () => {
    it('passes correct props to ConjugationForm', () => {
      render(<VerbTensesPage />)

      expect(ConjugationForm).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedVerb: defaultMockValues.selectedVerb,
          enabledVerbTenses: defaultMockValues.enabledVerbTenses,
          inputValues: defaultMockValues.inputValues,
          validationState: defaultMockValues.validationState,
          inputRefs: defaultMockValues.inputRefs,
          verbsCount: defaultMockValues.verbs.length,
          getStatistics: defaultMockValues.getStatistics,
          onInputChange: defaultMockValues.handleInputChange,
          onValidation: defaultMockValues.handleValidation,
          onClearInput: defaultMockValues.handleClearInput,
          onShowAnswer: defaultMockValues.handleShowAnswer,
          onKeyDown: defaultMockValues.handleKeyDown,
        }),
        undefined
      )
    })

    it('passes selected verb to ConjugationForm', () => {
      mockUseVerbConjugationPractice.mockReturnValue({
        ...defaultMockValues,
        selectedVerb: mockVerb,
      })

      render(<VerbTensesPage />)

      expect(ConjugationForm).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedVerb: mockVerb,
        }),
        undefined
      )
    })

    it('passes verbsCount to ConjugationForm', () => {
      const verbs = [mockVerb, { ...mockVerb, id: '2', italian: 'andare' }]
      mockUseVerbConjugationPractice.mockReturnValue({
        ...defaultMockValues,
        verbs,
      })

      render(<VerbTensesPage />)

      expect(ConjugationForm).toHaveBeenCalledWith(
        expect.objectContaining({
          verbsCount: 2,
        }),
        undefined
      )
    })

    it('passes enabled verb tenses to ConjugationForm', () => {
      const enabledVerbTenses = [
        'Indicativo.Presente',
        'Indicativo.PassatoProssimo',
      ]
      mockUseVerbConjugationPractice.mockReturnValue({
        ...defaultMockValues,
        enabledVerbTenses,
      })

      render(<VerbTensesPage />)

      expect(ConjugationForm).toHaveBeenCalledWith(
        expect.objectContaining({
          enabledVerbTenses,
        }),
        undefined
      )
    })

    it('passes input values to ConjugationForm', () => {
      const inputValues = {
        'Indicativo.Presente.io': 'mangio',
        'Indicativo.Presente.tu': 'mangi',
      }
      mockUseVerbConjugationPractice.mockReturnValue({
        ...defaultMockValues,
        inputValues,
      })

      render(<VerbTensesPage />)

      expect(ConjugationForm).toHaveBeenCalledWith(
        expect.objectContaining({
          inputValues,
        }),
        undefined
      )
    })

    it('passes validation state to ConjugationForm', () => {
      const validationState = {
        'Indicativo.Presente.io': 'correct' as const,
        'Indicativo.Presente.tu': 'incorrect' as const,
      }
      mockUseVerbConjugationPractice.mockReturnValue({
        ...defaultMockValues,
        validationState,
      })

      render(<VerbTensesPage />)

      expect(ConjugationForm).toHaveBeenCalledWith(
        expect.objectContaining({
          validationState,
        }),
        undefined
      )
    })

    it('passes getStatistics function to ConjugationForm', () => {
      const mockGetStatistics = jest
        .fn()
        .mockReturnValue({ correct: 5, wrong: 2 })
      mockUseVerbConjugationPractice.mockReturnValue({
        ...defaultMockValues,
        getStatistics: mockGetStatistics,
      })

      render(<VerbTensesPage />)

      expect(ConjugationForm).toHaveBeenCalledWith(
        expect.objectContaining({
          getStatistics: mockGetStatistics,
        }),
        undefined
      )
    })
  })

  describe('ResetStatisticsDialog Props', () => {
    it('renders reset dialog with correct props when closed', () => {
      render(<VerbTensesPage />)

      expect(ResetStatisticsDialog).toHaveBeenCalledWith(
        expect.objectContaining({
          open: false,
          verbName: null,
          isResetting: false,
          error: null,
          onClose: defaultMockValues.handleCloseResetDialog,
          onConfirm: defaultMockValues.handleConfirmReset,
        }),
        undefined
      )
    })

    it('renders reset dialog with correct props when open', () => {
      const resetDialogState = {
        open: true,
        verbId: '1',
        verbName: 'mangiare',
        error: null,
      }

      mockUseVerbConjugationPractice.mockReturnValue({
        ...defaultMockValues,
        resetDialog: resetDialogState,
      })

      render(<VerbTensesPage />)

      expect(ResetStatisticsDialog).toHaveBeenCalledWith(
        expect.objectContaining({
          open: true,
          verbName: resetDialogState.verbName,
          isResetting: defaultMockValues.isResetting,
          error: resetDialogState.error,
        }),
        undefined
      )
    })

    it('renders reset dialog with error message', () => {
      const resetDialogState = {
        open: true,
        verbId: '1',
        verbName: 'mangiare',
        error: 'Failed to reset statistics. Please try again.',
      }

      mockUseVerbConjugationPractice.mockReturnValue({
        ...defaultMockValues,
        resetDialog: resetDialogState,
      })

      render(<VerbTensesPage />)

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
        verbName: 'mangiare',
        error: null,
      }

      mockUseVerbConjugationPractice.mockReturnValue({
        ...defaultMockValues,
        resetDialog: resetDialogState,
        isResetting: true,
      })

      render(<VerbTensesPage />)

      expect(ResetStatisticsDialog).toHaveBeenCalledWith(
        expect.objectContaining({
          open: true,
          isResetting: true,
        }),
        undefined
      )
    })
  })

  describe('Statistics Error Warning', () => {
    it('displays statistics error warning when present', () => {
      mockUseVerbConjugationPractice.mockReturnValue({
        ...defaultMockValues,
        statisticsError: {
          message: 'Failed to save statistics',
          timestamp: Date.now(),
        },
      })

      render(<VerbTensesPage />)

      expect(screen.getByText('Failed to save statistics')).toBeInTheDocument()
    })

    it('does not display statistics error warning when absent', () => {
      render(<VerbTensesPage />)

      expect(
        screen.queryByText('Failed to save statistics')
      ).not.toBeInTheDocument()
    })
  })

  describe('Verb Type Filters', () => {
    it('renders with regular verb filter', () => {
      const regularVerbs = [mockVerb]

      mockUseVerbConjugationPractice.mockReturnValue({
        ...defaultMockValues,
        verbTypeFilter: 'regular',
        verbs: regularVerbs,
        filteredVerbs: regularVerbs,
      })

      render(<VerbTensesPage />)

      expect(VerbFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          verbTypeFilter: 'regular',
          filteredVerbs: regularVerbs,
        }),
        undefined
      )
    })

    it('renders with irregular verb filter', () => {
      const irregularVerbs = [
        {
          ...mockVerb,
          id: '2',
          italian: 'essere',
          regular: false,
        },
      ]

      mockUseVerbConjugationPractice.mockReturnValue({
        ...defaultMockValues,
        verbTypeFilter: 'irregular',
        verbs: irregularVerbs,
        filteredVerbs: irregularVerbs,
      })

      render(<VerbTensesPage />)

      expect(VerbFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          verbTypeFilter: 'irregular',
          filteredVerbs: irregularVerbs,
        }),
        undefined
      )
    })

    it('renders with reflexive verb filter', () => {
      const reflexiveVerbs = [
        {
          ...mockVerb,
          id: '3',
          italian: 'alzarsi',
          reflexive: true,
        },
      ]

      mockUseVerbConjugationPractice.mockReturnValue({
        ...defaultMockValues,
        verbTypeFilter: 'reflexive',
        verbs: reflexiveVerbs,
        filteredVerbs: reflexiveVerbs,
      })

      render(<VerbTensesPage />)

      expect(VerbFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          verbTypeFilter: 'reflexive',
          filteredVerbs: reflexiveVerbs,
        }),
        undefined
      )
    })
  })

  describe('Verb Selection', () => {
    it('passes selected verb id to VerbFilters', () => {
      mockUseVerbConjugationPractice.mockReturnValue({
        ...defaultMockValues,
        selectedVerbId: '1',
        selectedVerb: mockVerb,
      })

      render(<VerbTensesPage />)

      expect(VerbFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedVerbId: '1',
        }),
        undefined
      )
    })
  })

  describe('Handlers', () => {
    it('passes all handlers to child components', () => {
      render(<VerbTensesPage />)

      // VerbFilters handlers
      expect(VerbFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          onVerbTypeFilterChange: defaultMockValues.handleVerbTypeFilterChange,
          onVerbSelection: defaultMockValues.handleVerbSelection,
          onResetStatistics: defaultMockValues.handleOpenResetDialog,
        }),
        undefined
      )

      // ConjugationForm handlers
      expect(ConjugationForm).toHaveBeenCalledWith(
        expect.objectContaining({
          onInputChange: defaultMockValues.handleInputChange,
          onValidation: defaultMockValues.handleValidation,
          onClearInput: defaultMockValues.handleClearInput,
          onShowAnswer: defaultMockValues.handleShowAnswer,
          onKeyDown: defaultMockValues.handleKeyDown,
        }),
        undefined
      )

      // ResetStatisticsDialog handlers
      expect(ResetStatisticsDialog).toHaveBeenCalledWith(
        expect.objectContaining({
          onClose: defaultMockValues.handleCloseResetDialog,
          onConfirm: defaultMockValues.handleConfirmReset,
        }),
        undefined
      )
    })
  })

  describe('Data with Verbs', () => {
    it('renders with verbs data', () => {
      const mockVerbs = [
        mockVerb,
        {
          id: '2',
          italian: 'andare',
          translation: 'to go',
          regular: false,
          reflexive: false,
          conjugation: {
            Indicativo: {
              Presente: {
                io: 'vado',
                tu: 'vai',
                'lui/lei': 'va',
                noi: 'andiamo',
                voi: 'andate',
                loro: 'vanno',
              },
            },
          },
        },
      ]

      mockUseVerbConjugationPractice.mockReturnValue({
        ...defaultMockValues,
        verbs: mockVerbs,
        filteredVerbs: mockVerbs,
      })

      render(<VerbTensesPage />)

      expect(VerbFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          filteredVerbs: mockVerbs,
        }),
        undefined
      )

      expect(ConjugationForm).toHaveBeenCalledWith(
        expect.objectContaining({
          verbsCount: 2,
        }),
        undefined
      )
    })
  })
})
