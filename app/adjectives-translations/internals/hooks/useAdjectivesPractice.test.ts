import { renderHook, act, waitFor } from '@testing-library/react'

import {
  useGetAdjectivesForPracticeQuery,
  useGetAdjectiveStatisticsQuery,
  useUpdateAdjectiveStatisticMutation,
  useResetAdjectiveStatisticMutation,
} from '@/app/store/api'

import { useAdjectivesPractice } from './useAdjectivesPractice'

// Mock the API hooks
jest.mock('@/app/store/api', () => ({
  useGetAdjectivesForPracticeQuery: jest.fn(),
  useGetAdjectiveStatisticsQuery: jest.fn(),
  useUpdateAdjectiveStatisticMutation: jest.fn(),
  useResetAdjectiveStatisticMutation: jest.fn(),
}))

describe('useAdjectivesPractice', () => {
  const mockAdjectives = [
    {
      id: '1',
      translation: 'Good',
      masculineSingular: 'buono',
      masculinePlural: 'buoni',
      feminineSingular: 'buona',
      femininePlural: 'buone',
    },
    {
      id: '2',
      translation: 'Bad',
      masculineSingular: 'cattivo',
      masculinePlural: 'cattivi',
      feminineSingular: 'cattiva',
      femininePlural: 'cattive',
    },
  ]

  const mockStatistics = {
    statistics: {
      '1': { correctAttempts: 5, wrongAttempts: 1 },
      '2': { correctAttempts: 2, wrongAttempts: 3 },
    },
  }

  const mockUpdateAdjectiveStatistic = jest.fn()
  const mockResetAdjectiveStatistic = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    // Default mock implementations
    ;(useGetAdjectivesForPracticeQuery as jest.Mock).mockReturnValue({
      data: { adjectives: mockAdjectives },
      isLoading: false,
      error: null,
    })
    ;(useGetAdjectiveStatisticsQuery as jest.Mock).mockReturnValue({
      data: mockStatistics,
      refetch: jest.fn(),
    })
    ;(useUpdateAdjectiveStatisticMutation as jest.Mock).mockReturnValue([
      mockUpdateAdjectiveStatistic,
    ])
    ;(useResetAdjectiveStatisticMutation as jest.Mock).mockReturnValue([
      mockResetAdjectiveStatistic,
      { isLoading: false },
    ])

    // Mock Date.now for predictable timing
    jest.spyOn(Date, 'now').mockReturnValue(1000)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAdjectivesPractice())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.adjectives).toEqual(mockAdjectives)
    expect(result.current.inputValues).toEqual({})
    expect(result.current.validationState).toEqual({})
    expect(result.current.sortOption).toBe('none')
    expect(result.current.displayCount).toBe(10)
  })

  it('should handle input changes', () => {
    const { result } = renderHook(() => useAdjectivesPractice())

    act(() => {
      result.current.handleInputChange('1', 'masculineSingular', 'buono')
    })

    expect(result.current.inputValues['1']?.masculineSingular).toBe('buono')
  })

  it('should handle validation correctly', async () => {
    const { result } = renderHook(() => useAdjectivesPractice())

    // Simulate input
    act(() => {
      result.current.handleInputChange('1', 'masculineSingular', 'buono')
    })

    // Validate
    act(() => {
      result.current.handleValidation('1', 'masculineSingular', 'buono')
    })

    await waitFor(() => {
      expect(result.current.validationState['1']?.masculineSingular).toBe(
        'correct'
      )
    })

    // Incorrect answer
    act(() => {
      result.current.handleInputChange('1', 'masculinePlural', 'wrong')
    })

    // Advance time to bypass debounce/throttle if any
    jest.spyOn(Date, 'now').mockReturnValue(2000)

    act(() => {
      result.current.handleValidation('1', 'masculinePlural', 'buoni') // User entered 'wrong', checking against 'buoni'
    })

    // Wait for the async update (though validateAnswer is sync, the state update is in startTransition)
    await waitFor(() => {
      // Logic check: handleValidation takes (id, field, correctAnswer).
      // It reads userInput from state.
      // So if input is 'wrong', and correct answer is 'buoni', it should be incorrect.
      expect(result.current.validationState['1']?.masculinePlural).toBe(
        'incorrect'
      )
    })
  })

  it('should update statistics when all fields are validated and filled', async () => {
    mockUpdateAdjectiveStatistic.mockResolvedValue({})
    const { result } = renderHook(() => useAdjectivesPractice())

    // Fill all fields correctly
    act(() => {
      result.current.handleInputChange('1', 'masculineSingular', 'buono')
      result.current.handleInputChange('1', 'masculinePlural', 'buoni')
      result.current.handleInputChange('1', 'feminineSingular', 'buona')
      result.current.handleInputChange('1', 'femininePlural', 'buone')
    })

    // Validate first 3 fields (simulating user flow)
    jest.spyOn(Date, 'now').mockReturnValue(1100)
    act(() =>
      result.current.handleValidation('1', 'masculineSingular', 'buono')
    )

    jest.spyOn(Date, 'now').mockReturnValue(1200)
    act(() => result.current.handleValidation('1', 'masculinePlural', 'buoni'))

    jest.spyOn(Date, 'now').mockReturnValue(1300)
    act(() => result.current.handleValidation('1', 'feminineSingular', 'buona'))

    // Validate last field
    jest.spyOn(Date, 'now').mockReturnValue(1400)
    await act(async () => {
      result.current.handleValidation('1', 'femininePlural', 'buone')
    })

    expect(mockUpdateAdjectiveStatistic).toHaveBeenCalledWith({
      adjectiveId: '1',
      correct: true,
    })
  })

  it('should handle clearing input', () => {
    const { result } = renderHook(() => useAdjectivesPractice())

    act(() => {
      result.current.handleInputChange('1', 'masculineSingular', 'buono')
    })
    expect(result.current.inputValues['1']?.masculineSingular).toBe('buono')

    // Clear specific field
    act(() => {
      result.current.handleClearInput('1', 'masculineSingular')
    })
    expect(result.current.inputValues['1']?.masculineSingular).toBe('')

    // Set input again
    act(() => {
      result.current.handleInputChange('1', 'masculineSingular', 'buono')
    })

    // Clear all fields for adjective
    act(() => {
      result.current.handleClearInput('1')
    })
    expect(result.current.inputValues['1']?.masculineSingular).toBe('')
  })

  it('should handle showing answer', () => {
    const { result } = renderHook(() => useAdjectivesPractice())

    act(() => {
      result.current.handleShowAnswer('1')
    })

    expect(result.current.inputValues['1']).toEqual({
      masculineSingular: 'buono',
      masculinePlural: 'buoni',
      feminineSingular: 'buona',
      femininePlural: 'buone',
    })

    expect(result.current.validationState['1']).toEqual({
      masculineSingular: 'correct',
      masculinePlural: 'correct',
      feminineSingular: 'correct',
      femininePlural: 'correct',
    })
  })

  it('should handle sorting options', () => {
    const { result } = renderHook(() => useAdjectivesPractice())

    // Alphabetical
    act(() => {
      result.current.handleSortChange('alphabetical')
    })

    // "Bad" (Cattivo) comes before "Good" (Buono) alphabetically by translation?
    // Wait, the hook sorts by translation: 'Good' vs 'Bad'. 'Bad' comes first.
    // mockAdjectives: 1: Good, 2: Bad.

    expect(result.current.filteredAndSortedAdjectives[0].translation).toBe(
      'Bad'
    )
    expect(result.current.filteredAndSortedAdjectives[1].translation).toBe(
      'Good'
    )

    // Most Errors (Wrong attempts)
    // 1: 1 wrong, 2: 3 wrong.
    // 2 should be first.
    act(() => {
      result.current.handleSortChange('most-errors')
    })
    expect(result.current.filteredAndSortedAdjectives[0].id).toBe('2')

    // Worst Performance (Wrong - Correct)
    // 1: 1 - 5 = -4
    // 2: 3 - 2 = 1
    // 1 is higher (more positive/less negative) -> worst performance first?
    // Code says: return performanceB - performanceA
    // perfA = -4, perfB = 1. 1 - (-4) = 5 > 0. So B comes first.
    // So 2 (Bad) should be first.
    act(() => {
      result.current.handleSortChange('worst-performance')
    })
    expect(result.current.filteredAndSortedAdjectives[0].id).toBe('2')
  })

  it('should handle reset dialog interactions', async () => {
    mockResetAdjectiveStatistic.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({}),
    })
    const { result } = renderHook(() => useAdjectivesPractice())

    // Open dialog
    act(() => {
      result.current.handleOpenResetDialog('1')
    })

    expect(result.current.resetDialog).toEqual({
      open: true,
      adjectiveId: '1',
      adjectiveTranslation: 'Good',
    })

    // Confirm reset
    await act(async () => {
      await result.current.handleConfirmReset()
    })

    expect(mockResetAdjectiveStatistic).toHaveBeenCalledWith('1')
    expect(result.current.resetDialog.open).toBe(false)
  })

  it('should handle refresh', () => {
    const refetchMock = jest.fn()
    ;(useGetAdjectiveStatisticsQuery as jest.Mock).mockReturnValue({
      data: mockStatistics,
      refetch: refetchMock,
    })

    const { result } = renderHook(() => useAdjectivesPractice())

    // Refresh with random sort should update seed
    act(() => {
      result.current.handleSortChange('random')
    })
    // Should not call refetch
    expect(refetchMock).not.toHaveBeenCalled()

    const initialSeed = result.current.filteredAndSortedAdjectives

    act(() => {
      result.current.handleRefresh()
    })

    // Refresh with statistics based sort should call refetch
    act(() => {
      result.current.handleSortChange('most-errors')
    })

    act(() => {
      result.current.handleRefresh()
    })
    expect(refetchMock).toHaveBeenCalled()
  })
})
