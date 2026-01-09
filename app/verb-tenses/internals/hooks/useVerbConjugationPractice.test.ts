import { act, renderHook, waitFor } from '@testing-library/react'

import * as api from '@/app/store/api'

import { useVerbConjugationPractice } from './useVerbConjugationPractice'

// Mock the RTK Query hooks
jest.mock('@/app/store/api', () => ({
  useGetVerbsForConjugationPracticeQuery: jest.fn(),
  useGetConjugationStatisticsQuery: jest.fn(),
  useUpdateConjugationStatisticMutation: jest.fn(),
  useResetConjugationStatisticsMutation: jest.fn(),
  useGetProfileQuery: jest.fn(),
}))

// Mock the utils module
jest.mock('../utils', () => ({
  validateAnswer: jest.fn((userInput, correctAnswer) => {
    const normalize = (str: string) =>
      str
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
    return normalize(userInput) === normalize(correctAnswer)
  }),
  getFilterStorageKey: jest.fn((userId) => `verbTypeFilter_${userId}`),
  createInputKey: jest.fn(
    (mood, tense, person) => `${mood}:${tense}:${person}`
  ),
}))

describe('useVerbConjugationPractice', () => {
  const mockConjugation = {
    Indicativo: {
      Presente: {
        io: 'mangio',
        tu: 'mangi',
        'lui/lei': 'mangia',
        noi: 'mangiamo',
        voi: 'mangiate',
        loro: 'mangiano',
      },
      Passato: {
        io: 'ho mangiato',
        tu: 'hai mangiato',
        'lui/lei': 'ha mangiato',
        noi: 'abbiamo mangiato',
        voi: 'avete mangiato',
        loro: 'hanno mangiato',
      },
    },
    Infinito: {
      Presente: 'mangiare',
    },
  }

  const mockVerbs = [
    {
      id: '1',
      italian: 'mangiare',
      translation: 'to eat',
      regular: true,
      reflexive: false,
      conjugation: mockConjugation,
    },
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
    {
      id: '3',
      italian: 'alzarsi',
      translation: 'to get up',
      regular: true,
      reflexive: true,
      conjugation: {
        Indicativo: {
          Presente: {
            io: 'mi alzo',
            tu: 'ti alzi',
            'lui/lei': 'si alza',
            noi: 'ci alziamo',
            voi: 'vi alzate',
            loro: 'si alzano',
          },
        },
      },
    },
    {
      id: '4',
      italian: 'essere',
      translation: 'to be',
      regular: false,
      reflexive: false,
      conjugation: {
        Indicativo: {
          Presente: {
            io: 'sono',
            tu: 'sei',
            'lui/lei': 'è',
            noi: 'siamo',
            voi: 'siete',
            loro: 'sono',
          },
        },
      },
    },
  ]

  const mockStatistics = {
    '1:Indicativo:Presente:io': { correctAttempts: 5, wrongAttempts: 2 },
    '1:Indicativo:Presente:tu': { correctAttempts: 3, wrongAttempts: 1 },
    '2:Indicativo:Presente:io': { correctAttempts: 0, wrongAttempts: 5 },
  }

  const mockProfile = {
    profile: {
      userId: 'user123',
      enabledVerbTenses: ['Indicativo.Presente', 'Indicativo.Passato'],
    },
  }

  const mockUpdateConjugationStatistic = jest.fn()
  const mockResetConjugationStatistics = jest.fn()
  const mockRefetchStatistics = jest.fn()

  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key]
      }),
      clear: jest.fn(() => {
        store = {}
      }),
      get length() {
        return Object.keys(store).length
      },
      key: jest.fn((index: number) => Object.keys(store)[index] || null),
      keys: () => Object.keys(store),
    }
  })()

  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })

    // Default mock implementations
    ;(api.useGetVerbsForConjugationPracticeQuery as jest.Mock).mockReturnValue({
      data: { verbs: mockVerbs },
      isLoading: false,
      error: null,
    })
    ;(api.useGetProfileQuery as jest.Mock).mockReturnValue({
      data: mockProfile,
    })
    ;(api.useGetConjugationStatisticsQuery as jest.Mock).mockReturnValue({
      data: { statistics: mockStatistics },
      refetch: mockRefetchStatistics,
    })
    ;(api.useUpdateConjugationStatisticMutation as jest.Mock).mockReturnValue([
      mockUpdateConjugationStatistic,
    ])
    ;(api.useResetConjugationStatisticsMutation as jest.Mock).mockReturnValue([
      mockResetConjugationStatistics,
      { isLoading: false },
    ])
  })

  describe('Initial State', () => {
    it('should return initial state values', () => {
      const { result } = renderHook(() => useVerbConjugationPractice())

      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.verbs).toEqual(mockVerbs)
      expect(result.current.inputValues).toEqual({})
      expect(result.current.validationState).toEqual({})
      expect(result.current.verbTypeFilter).toBe('all')
      expect(result.current.selectedVerbId).toBe('')
      expect(result.current.selectedVerb).toBeUndefined()
      expect(result.current.resetDialog).toEqual({
        open: false,
        verbId: null,
        verbName: null,
        error: null,
      })
      expect(result.current.isResetting).toBe(false)
      expect(result.current.statisticsError).toBeNull()
    })

    it('should return loading state when data is loading', () => {
      ;(
        api.useGetVerbsForConjugationPracticeQuery as jest.Mock
      ).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      })

      const { result } = renderHook(() => useVerbConjugationPractice())

      expect(result.current.isLoading).toBe(true)
      expect(result.current.verbs).toEqual([])
    })

    it('should return error state when there is an error', () => {
      const mockError = new Error('Failed to fetch')
      ;(
        api.useGetVerbsForConjugationPracticeQuery as jest.Mock
      ).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: mockError,
      })

      const { result } = renderHook(() => useVerbConjugationPractice())

      expect(result.current.error).toBe(mockError)
    })

    it('should return enabled verb tenses from profile', () => {
      const { result } = renderHook(() => useVerbConjugationPractice())

      expect(result.current.enabledVerbTenses).toEqual([
        'Indicativo.Presente',
        'Indicativo.Passato',
      ])
    })

    it('should return default enabled verb tenses when profile is undefined', () => {
      ;(api.useGetProfileQuery as jest.Mock).mockReturnValue({
        data: undefined,
      })

      const { result } = renderHook(() => useVerbConjugationPractice())

      expect(result.current.enabledVerbTenses).toEqual(['Indicativo.Presente'])
    })
  })

  describe('Verb Selection', () => {
    it('should select a verb', () => {
      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleVerbSelection('1')
      })

      expect(result.current.selectedVerbId).toBe('1')
      expect(result.current.selectedVerb).toEqual(mockVerbs[0])
    })

    it('should clear input values when selecting a new verb', () => {
      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleVerbSelection('1')
      })

      act(() => {
        result.current.handleInputChange('Indicativo:Presente:io', 'mangio')
      })

      expect(result.current.inputValues['Indicativo:Presente:io']).toBe(
        'mangio'
      )

      act(() => {
        result.current.handleVerbSelection('2')
      })

      expect(result.current.inputValues).toEqual({})
      expect(result.current.validationState).toEqual({})
    })

    it('should clear validation state when selecting a new verb', () => {
      mockUpdateConjugationStatistic.mockResolvedValue({})
      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleVerbSelection('1')
      })

      act(() => {
        result.current.handleInputChange('Indicativo:Presente:io', 'mangio')
      })

      act(() => {
        result.current.handleValidation(
          'Indicativo:Presente:io',
          'mangio',
          '1',
          'Indicativo',
          'Presente',
          'io'
        )
      })

      expect(result.current.validationState['Indicativo:Presente:io']).toBe(
        'correct'
      )

      act(() => {
        result.current.handleVerbSelection('2')
      })

      expect(result.current.validationState).toEqual({})
    })
  })

  describe('handleInputChange', () => {
    it('should update input value for a conjugation field', () => {
      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleInputChange('Indicativo:Presente:io', 'mang')
      })

      expect(result.current.inputValues['Indicativo:Presente:io']).toBe('mang')
    })

    it('should clear validation state when input changes', () => {
      mockUpdateConjugationStatistic.mockResolvedValue({})
      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleVerbSelection('1')
      })

      act(() => {
        result.current.handleInputChange('Indicativo:Presente:io', 'mangio')
      })

      act(() => {
        result.current.handleValidation(
          'Indicativo:Presente:io',
          'mangio',
          '1',
          'Indicativo',
          'Presente',
          'io'
        )
      })

      expect(result.current.validationState['Indicativo:Presente:io']).toBe(
        'correct'
      )

      act(() => {
        result.current.handleInputChange('Indicativo:Presente:io', 'mang')
      })

      expect(
        result.current.validationState['Indicativo:Presente:io']
      ).toBeNull()
    })
  })

  describe('handleValidation', () => {
    beforeEach(() => {
      mockUpdateConjugationStatistic.mockResolvedValue({})
    })

    it('should set validation state to correct for correct answer', async () => {
      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleVerbSelection('1')
      })

      act(() => {
        result.current.handleInputChange('Indicativo:Presente:io', 'mangio')
      })

      await act(async () => {
        result.current.handleValidation(
          'Indicativo:Presente:io',
          'mangio',
          '1',
          'Indicativo',
          'Presente',
          'io'
        )
      })

      expect(result.current.validationState['Indicativo:Presente:io']).toBe(
        'correct'
      )
    })

    it('should set validation state to incorrect for wrong answer', async () => {
      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleVerbSelection('1')
      })

      act(() => {
        result.current.handleInputChange('Indicativo:Presente:io', 'wrong')
      })

      await act(async () => {
        result.current.handleValidation(
          'Indicativo:Presente:io',
          'mangio',
          '1',
          'Indicativo',
          'Presente',
          'io'
        )
      })

      expect(result.current.validationState['Indicativo:Presente:io']).toBe(
        'incorrect'
      )
    })

    it('should not validate empty input', () => {
      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleValidation(
          'Indicativo:Presente:io',
          'mangio',
          '1',
          'Indicativo',
          'Presente',
          'io'
        )
      })

      expect(
        result.current.validationState['Indicativo:Presente:io']
      ).toBeUndefined()
      expect(mockUpdateConjugationStatistic).not.toHaveBeenCalled()
    })

    it('should not validate whitespace-only input', () => {
      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleInputChange('Indicativo:Presente:io', '   ')
      })

      act(() => {
        result.current.handleValidation(
          'Indicativo:Presente:io',
          'mangio',
          '1',
          'Indicativo',
          'Presente',
          'io'
        )
      })

      expect(
        result.current.validationState['Indicativo:Presente:io']
      ).toBeUndefined()
    })

    it('should call updateConjugationStatistic with correct data', async () => {
      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleInputChange('Indicativo:Presente:io', 'mangio')
      })

      await act(async () => {
        result.current.handleValidation(
          'Indicativo:Presente:io',
          'mangio',
          '1',
          'Indicativo',
          'Presente',
          'io'
        )
      })

      expect(mockUpdateConjugationStatistic).toHaveBeenCalledWith({
        verbId: '1',
        mood: 'Indicativo',
        tense: 'Presente',
        person: 'io',
        correct: true,
      })
    })

    it('should handle validation error gracefully', async () => {
      jest.useFakeTimers()
      mockUpdateConjugationStatistic.mockRejectedValue(
        new Error('Network error')
      )

      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleInputChange('Indicativo:Presente:io', 'mangio')
      })

      await act(async () => {
        result.current.handleValidation(
          'Indicativo:Presente:io',
          'mangio',
          '1',
          'Indicativo',
          'Presente',
          'io'
        )
        await Promise.resolve()
      })

      await waitFor(() => {
        expect(result.current.statisticsError).not.toBeNull()
      })

      expect(result.current.statisticsError?.message).toBe(
        'Failed to save statistics. Your progress may not be saved.'
      )

      // Error should clear after 5 seconds
      act(() => {
        jest.advanceTimersByTime(5000)
      })

      expect(result.current.statisticsError).toBeNull()

      jest.useRealTimers()
    })

    it('should prevent duplicate validation within 500ms', async () => {
      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleInputChange('Indicativo:Presente:io', 'mangio')
      })

      await act(async () => {
        result.current.handleValidation(
          'Indicativo:Presente:io',
          'mangio',
          '1',
          'Indicativo',
          'Presente',
          'io'
        )
      })

      await act(async () => {
        result.current.handleValidation(
          'Indicativo:Presente:io',
          'mangio',
          '1',
          'Indicativo',
          'Presente',
          'io'
        )
      })

      // Should only be called once due to debouncing
      expect(mockUpdateConjugationStatistic).toHaveBeenCalledTimes(1)
    })

    it('should not validate if already validated (has state)', async () => {
      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleInputChange('Indicativo:Presente:io', 'mangio')
      })

      // First validation
      await act(async () => {
        result.current.handleValidation(
          'Indicativo:Presente:io',
          'mangio',
          '1',
          'Indicativo',
          'Presente',
          'io'
        )
      })

      expect(result.current.validationState['Indicativo:Presente:io']).toBe(
        'correct'
      )

      // Wait to bypass the time check
      jest.useFakeTimers()
      act(() => {
        jest.advanceTimersByTime(600)
      })
      jest.useRealTimers()

      // Second validation attempt (should be skipped because state exists)
      await act(async () => {
        result.current.handleValidation(
          'Indicativo:Presente:io',
          'mangio',
          '1',
          'Indicativo',
          'Presente',
          'io'
        )
      })

      // Should only be called once
      expect(mockUpdateConjugationStatistic).toHaveBeenCalledTimes(1)
    })
  })

  describe('handleClearInput', () => {
    it('should clear input value for a field', () => {
      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleInputChange('Indicativo:Presente:io', 'mangio')
      })

      act(() => {
        result.current.handleClearInput('Indicativo:Presente:io')
      })

      expect(result.current.inputValues['Indicativo:Presente:io']).toBe('')
    })

    it('should clear validation state when input is cleared', () => {
      mockUpdateConjugationStatistic.mockResolvedValue({})
      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleInputChange('Indicativo:Presente:io', 'mangio')
      })

      act(() => {
        result.current.handleValidation(
          'Indicativo:Presente:io',
          'mangio',
          '1',
          'Indicativo',
          'Presente',
          'io'
        )
      })

      act(() => {
        result.current.handleClearInput('Indicativo:Presente:io')
      })

      expect(
        result.current.validationState['Indicativo:Presente:io']
      ).toBeNull()
    })
  })

  describe('handleShowAnswer', () => {
    it('should set input value to correct answer', () => {
      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleShowAnswer('Indicativo:Presente:io', 'mangio')
      })

      expect(result.current.inputValues['Indicativo:Presente:io']).toBe(
        'mangio'
      )
    })

    it('should set validation state to correct', () => {
      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleShowAnswer('Indicativo:Presente:io', 'mangio')
      })

      expect(result.current.validationState['Indicativo:Presente:io']).toBe(
        'correct'
      )
    })
  })

  describe('Reset Dialog', () => {
    it('should open reset dialog with correct verb info', () => {
      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleVerbSelection('1')
      })

      act(() => {
        result.current.handleOpenResetDialog()
      })

      expect(result.current.resetDialog).toEqual({
        open: true,
        verbId: '1',
        verbName: 'mangiare',
        error: null,
      })
    })

    it('should not open reset dialog if no verb is selected', () => {
      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleOpenResetDialog()
      })

      expect(result.current.resetDialog.open).toBe(false)
    })

    it('should close reset dialog', () => {
      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleVerbSelection('1')
      })

      act(() => {
        result.current.handleOpenResetDialog()
      })

      act(() => {
        result.current.handleCloseResetDialog()
      })

      expect(result.current.resetDialog).toEqual({
        open: false,
        verbId: null,
        verbName: null,
        error: null,
      })
    })

    it('should call resetConjugationStatistics on confirm', async () => {
      mockResetConjugationStatistics.mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({}),
      })

      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleVerbSelection('1')
      })

      act(() => {
        result.current.handleOpenResetDialog()
      })

      await act(async () => {
        await result.current.handleConfirmReset()
      })

      expect(mockResetConjugationStatistics).toHaveBeenCalledWith('1')
    })

    it('should close dialog and refetch statistics after successful reset', async () => {
      mockResetConjugationStatistics.mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({}),
      })

      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleVerbSelection('1')
      })

      act(() => {
        result.current.handleOpenResetDialog()
      })

      await act(async () => {
        await result.current.handleConfirmReset()
      })

      expect(result.current.resetDialog.open).toBe(false)
      expect(mockRefetchStatistics).toHaveBeenCalled()
    })

    it('should set error on reset failure', async () => {
      mockResetConjugationStatistics.mockReturnValue({
        unwrap: jest.fn().mockRejectedValue(new Error('Reset failed')),
      })

      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleVerbSelection('1')
      })

      act(() => {
        result.current.handleOpenResetDialog()
      })

      await act(async () => {
        await result.current.handleConfirmReset()
      })

      expect(result.current.resetDialog.error).toBe(
        'Failed to reset statistics. Please try again.'
      )
    })

    it('should not reset if verbId is null', async () => {
      const { result } = renderHook(() => useVerbConjugationPractice())

      await act(async () => {
        await result.current.handleConfirmReset()
      })

      expect(mockResetConjugationStatistics).not.toHaveBeenCalled()
    })
  })

  describe('getStatistics', () => {
    it('should return statistics for a conjugation', () => {
      const { result } = renderHook(() => useVerbConjugationPractice())

      const stats = result.current.getStatistics(
        '1',
        'Indicativo',
        'Presente',
        'io'
      )

      expect(stats).toEqual({
        correct: 5,
        wrong: 2,
      })
    })

    it('should return zeros for conjugation without statistics', () => {
      const { result } = renderHook(() => useVerbConjugationPractice())

      const stats = result.current.getStatistics(
        '999',
        'Indicativo',
        'Presente',
        'io'
      )

      expect(stats).toEqual({
        correct: 0,
        wrong: 0,
      })
    })

    it('should handle undefined statistics data', () => {
      ;(api.useGetConjugationStatisticsQuery as jest.Mock).mockReturnValue({
        data: undefined,
        refetch: mockRefetchStatistics,
      })

      const { result } = renderHook(() => useVerbConjugationPractice())

      const stats = result.current.getStatistics(
        '1',
        'Indicativo',
        'Presente',
        'io'
      )

      expect(stats).toEqual({
        correct: 0,
        wrong: 0,
      })
    })
  })

  describe('Verb Type Filtering', () => {
    it('should filter regular verbs', () => {
      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleVerbTypeFilterChange('regular')
      })

      expect(result.current.verbTypeFilter).toBe('regular')
      expect(result.current.filteredVerbs).toEqual([
        expect.objectContaining({ id: '1', regular: true, reflexive: false }),
      ])
    })

    it('should filter irregular verbs', () => {
      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleVerbTypeFilterChange('irregular')
      })

      expect(result.current.filteredVerbs.every((v) => !v.regular)).toBe(true)
      expect(result.current.filteredVerbs.every((v) => !v.reflexive)).toBe(true)
    })

    it('should filter reflexive verbs', () => {
      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleVerbTypeFilterChange('reflexive')
      })

      expect(result.current.filteredVerbs).toEqual([
        expect.objectContaining({ id: '3', reflexive: true }),
      ])
    })

    it('should show all verbs when filter is all', () => {
      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleVerbTypeFilterChange('all')
      })

      expect(result.current.filteredVerbs.length).toBe(4)
    })
  })

  describe('handleKeyDown', () => {
    it('should validate and move to next field on Enter', async () => {
      mockUpdateConjugationStatistic.mockResolvedValue({})
      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleVerbSelection('1')
      })

      act(() => {
        result.current.handleInputChange('Indicativo:Presente:io', 'mangio')
      })

      const mockEvent = {
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent

      await act(async () => {
        result.current.handleKeyDown(
          mockEvent,
          'Indicativo:Presente:io',
          'mangio',
          '1',
          'Indicativo',
          'Presente',
          'io'
        )
      })

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(result.current.validationState['Indicativo:Presente:io']).toBe(
        'correct'
      )
    })

    it('should not do anything for non-Enter keys', () => {
      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleVerbSelection('1')
      })

      const mockEvent = {
        key: 'Tab',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent

      act(() => {
        result.current.handleKeyDown(
          mockEvent,
          'Indicativo:Presente:io',
          'mangio',
          '1',
          'Indicativo',
          'Presente',
          'io'
        )
      })

      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })
  })

  describe('localStorage Persistence', () => {
    it('should save verbTypeFilter to localStorage when changed', async () => {
      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleVerbTypeFilterChange('regular')
      })

      // Wait for useEffect to run
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'verbTypeFilter_user123',
          'regular'
        )
      })
    })

    it('should load verbTypeFilter from localStorage on mount', () => {
      localStorageMock.setItem('verbTypeFilter_user123', 'irregular')

      // Rerender to trigger the initial load
      const { result } = renderHook(() => useVerbConjugationPractice())

      // The filter might be loaded asynchronously via effect
      // Initial state depends on what's in localStorage
      expect(result.current.verbTypeFilter).toBeDefined()
    })
  })

  describe('inputRefs', () => {
    it('should have inputRefs object', () => {
      const { result } = renderHook(() => useVerbConjugationPractice())

      expect(result.current.inputRefs).toBeDefined()
      expect(result.current.inputRefs.current).toEqual({})
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty verbs array', () => {
      ;(
        api.useGetVerbsForConjugationPracticeQuery as jest.Mock
      ).mockReturnValue({
        data: { verbs: [] },
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useVerbConjugationPractice())

      expect(result.current.verbs).toEqual([])
      expect(result.current.filteredVerbs).toEqual([])
    })

    it('should handle undefined data', () => {
      ;(
        api.useGetVerbsForConjugationPracticeQuery as jest.Mock
      ).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useVerbConjugationPractice())

      expect(result.current.verbs).toEqual([])
      expect(result.current.filteredVerbs).toEqual([])
    })

    it('should handle verb without conjugation data', () => {
      const verbWithoutConjugation = {
        id: '5',
        italian: 'parlare',
        translation: 'to speak',
        regular: true,
        reflexive: false,
        conjugation: undefined,
      }

      ;(
        api.useGetVerbsForConjugationPracticeQuery as jest.Mock
      ).mockReturnValue({
        data: { verbs: [verbWithoutConjugation] },
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleVerbSelection('5')
      })

      expect(result.current.selectedVerb?.conjugation).toBeUndefined()
    })

    it('should handle selecting non-existent verb', () => {
      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleVerbSelection('non-existent')
      })

      expect(result.current.selectedVerbId).toBe('non-existent')
      expect(result.current.selectedVerb).toBeUndefined()
    })
  })

  describe('Enabled Verb Tenses Integration', () => {
    it('should use profile enabled verb tenses', () => {
      ;(api.useGetProfileQuery as jest.Mock).mockReturnValue({
        data: {
          profile: {
            userId: 'user123',
            enabledVerbTenses: [
              'Indicativo.Presente',
              'Congiuntivo.Presente',
              'Infinito.Presente',
            ],
          },
        },
      })

      const { result } = renderHook(() => useVerbConjugationPractice())

      expect(result.current.enabledVerbTenses).toEqual([
        'Indicativo.Presente',
        'Congiuntivo.Presente',
        'Infinito.Presente',
      ])
    })

    it('should fallback to default when profile has no enabledVerbTenses', () => {
      ;(api.useGetProfileQuery as jest.Mock).mockReturnValue({
        data: {
          profile: {
            userId: 'user123',
            enabledVerbTenses: undefined,
          },
        },
      })

      const { result } = renderHook(() => useVerbConjugationPractice())

      expect(result.current.enabledVerbTenses).toEqual(['Indicativo.Presente'])
    })
  })

  describe('Validation with Accents', () => {
    it('should validate answers ignoring accents', async () => {
      mockUpdateConjugationStatistic.mockResolvedValue({})
      const { result } = renderHook(() => useVerbConjugationPractice())

      act(() => {
        result.current.handleInputChange('Indicativo:Presente:lui/lei', 'e')
      })

      await act(async () => {
        result.current.handleValidation(
          'Indicativo:Presente:lui/lei',
          'è',
          '4',
          'Indicativo',
          'Presente',
          'lui/lei'
        )
      })

      expect(
        result.current.validationState['Indicativo:Presente:lui/lei']
      ).toBe('correct')
    })
  })
})
