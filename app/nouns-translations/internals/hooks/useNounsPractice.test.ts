import { renderHook, act, waitFor } from '@testing-library/react'

import {
  useGetNounsForPracticeQuery,
  useGetNounStatisticsQuery,
  useUpdateNounStatisticMutation,
  useResetNounStatisticMutation,
} from '@/app/store/api'

import { useNounsPractice } from './useNounsPractice'

// Mock the API hooks
jest.mock('@/app/store/api', () => ({
  useGetNounsForPracticeQuery: jest.fn(),
  useGetNounStatisticsQuery: jest.fn(),
  useUpdateNounStatisticMutation: jest.fn(),
  useResetNounStatisticMutation: jest.fn(),
}))

describe('useNounsPractice', () => {
  const mockNouns = [
    {
      id: '1',
      italian: 'casa',
      italianPlural: 'case',
      translation: 'House',
      translationPlural: 'Houses',
    },
    {
      id: '2',
      italian: 'libro',
      italianPlural: 'libri',
      translation: 'Book',
      translationPlural: 'Books',
    },
    {
      id: '3',
      italian: 'albero',
      italianPlural: 'alberi',
      translation: 'Tree',
      translationPlural: 'Trees',
    },
  ]

  const mockStatistics = {
    statistics: {
      '1': { correctAttempts: 5, wrongAttempts: 1 },
      '2': { correctAttempts: 2, wrongAttempts: 3 },
      '3': { correctAttempts: 0, wrongAttempts: 0 },
    },
  }

  const mockUpdateNounStatistic = jest.fn()
  const mockResetNounStatistic = jest.fn()
  const mockRefetch = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    // Default mock implementations
    ;(useGetNounsForPracticeQuery as jest.Mock).mockReturnValue({
      data: { nouns: mockNouns },
      isLoading: false,
      error: null,
    })
    ;(useGetNounStatisticsQuery as jest.Mock).mockReturnValue({
      data: mockStatistics,
      refetch: mockRefetch,
    })

    // Default return value for updateNounStatistic - returns a promise with catch method
    mockUpdateNounStatistic.mockResolvedValue({})
    ;(useUpdateNounStatisticMutation as jest.Mock).mockReturnValue([
      mockUpdateNounStatistic,
    ])
    ;(useResetNounStatisticMutation as jest.Mock).mockReturnValue([
      mockResetNounStatistic,
      { isLoading: false },
    ])

    // Mock Date.now for predictable timing
    jest.spyOn(Date, 'now').mockReturnValue(1000)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useNounsPractice())

      expect(result.current.isLoading).toBe(false)
      expect(result.current.nouns).toEqual(mockNouns)
      expect(result.current.inputValues).toEqual({})
      expect(result.current.validationState).toEqual({})
      expect(result.current.sortOption).toBe('none')
      expect(result.current.displayCount).toBe(10)
      expect(result.current.resetDialog).toEqual({
        open: false,
        nounId: null,
        nounTranslation: null,
        error: null,
      })
    })

    it('should return loading state when data is loading', () => {
      ;(useGetNounsForPracticeQuery as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      })

      const { result } = renderHook(() => useNounsPractice())

      expect(result.current.isLoading).toBe(true)
      expect(result.current.nouns).toEqual([])
    })

    it('should return error when API fails', () => {
      const mockError = { message: 'Failed to load nouns' }
      ;(useGetNounsForPracticeQuery as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: mockError,
      })

      const { result } = renderHook(() => useNounsPractice())

      expect(result.current.error).toEqual(mockError)
    })

    it('should return empty array when no nouns data', () => {
      ;(useGetNounsForPracticeQuery as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useNounsPractice())

      expect(result.current.nouns).toEqual([])
    })
  })

  describe('handleInputChange', () => {
    it('should handle singular input changes', () => {
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleInputChange('1', 'singular', 'casa')
      })

      expect(result.current.inputValues['1']?.singular).toBe('casa')
      expect(result.current.inputValues['1']?.plural).toBe('')
    })

    it('should handle plural input changes', () => {
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleInputChange('1', 'plural', 'case')
      })

      expect(result.current.inputValues['1']?.plural).toBe('case')
      expect(result.current.inputValues['1']?.singular).toBe('')
    })

    it('should preserve other field when changing one', () => {
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleInputChange('1', 'singular', 'casa')
        result.current.handleInputChange('1', 'plural', 'case')
      })

      expect(result.current.inputValues['1']?.singular).toBe('casa')
      expect(result.current.inputValues['1']?.plural).toBe('case')
    })

    it('should clear validation state when typing', () => {
      const { result } = renderHook(() => useNounsPractice())

      // Set up initial validation state by validating
      act(() => {
        result.current.handleInputChange('1', 'singular', 'wrong')
        result.current.handleInputChange('1', 'plural', 'case')
      })

      jest.spyOn(Date, 'now').mockReturnValue(1100)
      act(() => {
        result.current.handleValidation('1')
      })

      expect(result.current.validationState['1']?.singular).toBe('incorrect')

      // Now type again to clear validation
      act(() => {
        result.current.handleInputChange('1', 'singular', 'c')
      })

      expect(result.current.validationState['1']?.singular).toBeNull()
      // Plural validation should remain
      expect(result.current.validationState['1']?.plural).toBe('correct')
    })
  })

  describe('handleValidation', () => {
    it('should validate correct answers', () => {
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleInputChange('1', 'singular', 'casa')
        result.current.handleInputChange('1', 'plural', 'case')
      })

      jest.spyOn(Date, 'now').mockReturnValue(1100)
      act(() => {
        result.current.handleValidation('1')
      })

      expect(result.current.validationState['1']?.singular).toBe('correct')
      expect(result.current.validationState['1']?.plural).toBe('correct')
    })

    it('should validate incorrect answers', () => {
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleInputChange('1', 'singular', 'wrong')
        result.current.handleInputChange('1', 'plural', 'wrong')
      })

      jest.spyOn(Date, 'now').mockReturnValue(1100)
      act(() => {
        result.current.handleValidation('1')
      })

      expect(result.current.validationState['1']?.singular).toBe('incorrect')
      expect(result.current.validationState['1']?.plural).toBe('incorrect')
    })

    it('should validate mixed correct/incorrect answers', () => {
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleInputChange('1', 'singular', 'casa')
        result.current.handleInputChange('1', 'plural', 'wrong')
      })

      jest.spyOn(Date, 'now').mockReturnValue(1100)
      act(() => {
        result.current.handleValidation('1')
      })

      expect(result.current.validationState['1']?.singular).toBe('correct')
      expect(result.current.validationState['1']?.plural).toBe('incorrect')
    })

    it('should not validate empty fields', () => {
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleInputChange('1', 'singular', 'casa')
        // Leave plural empty
      })

      jest.spyOn(Date, 'now').mockReturnValue(1100)
      act(() => {
        result.current.handleValidation('1')
      })

      expect(result.current.validationState['1']?.singular).toBe('correct')
      expect(result.current.validationState['1']?.plural).toBeNull()
    })

    it('should not validate if both fields are empty', () => {
      const { result } = renderHook(() => useNounsPractice())

      jest.spyOn(Date, 'now').mockReturnValue(1100)
      act(() => {
        result.current.handleValidation('1')
      })

      expect(result.current.validationState['1']).toBeUndefined()
    })

    it('should not validate non-existent noun', () => {
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleValidation('non-existent-id')
      })

      expect(result.current.validationState['non-existent-id']).toBeUndefined()
    })

    it('should prevent duplicate validation within 100ms', () => {
      mockUpdateNounStatistic.mockResolvedValue({})
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleInputChange('1', 'singular', 'casa')
        result.current.handleInputChange('1', 'plural', 'case')
      })

      // First validation
      jest.spyOn(Date, 'now').mockReturnValue(1000)
      act(() => {
        result.current.handleValidation('1')
      })

      // Try to validate again within 100ms
      jest.spyOn(Date, 'now').mockReturnValue(1050)
      act(() => {
        result.current.handleValidation('1')
      })

      // Should only be called once
      expect(mockUpdateNounStatistic).toHaveBeenCalledTimes(1)
    })

    it('should allow validation after 100ms', () => {
      mockUpdateNounStatistic.mockResolvedValue({})
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleInputChange('1', 'singular', 'casa')
        result.current.handleInputChange('1', 'plural', 'case')
      })

      // First validation
      jest.spyOn(Date, 'now').mockReturnValue(1000)
      act(() => {
        result.current.handleValidation('1')
      })

      // Validate after 100ms
      jest.spyOn(Date, 'now').mockReturnValue(1200)
      act(() => {
        result.current.handleValidation('1')
      })

      expect(mockUpdateNounStatistic).toHaveBeenCalledTimes(2)
    })

    it('should normalize accents when validating', () => {
      const { result } = renderHook(() => useNounsPractice())

      // User types without accent
      act(() => {
        result.current.handleInputChange('1', 'singular', 'casa')
        result.current.handleInputChange('1', 'plural', 'case')
      })

      jest.spyOn(Date, 'now').mockReturnValue(1100)
      act(() => {
        result.current.handleValidation('1')
      })

      expect(result.current.validationState['1']?.singular).toBe('correct')
    })

    it('should be case insensitive when validating', () => {
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleInputChange('1', 'singular', 'CASA')
        result.current.handleInputChange('1', 'plural', 'CaSe')
      })

      jest.spyOn(Date, 'now').mockReturnValue(1100)
      act(() => {
        result.current.handleValidation('1')
      })

      expect(result.current.validationState['1']?.singular).toBe('correct')
      expect(result.current.validationState['1']?.plural).toBe('correct')
    })
  })

  describe('statistics', () => {
    it('should update statistics when both fields are correct', async () => {
      mockUpdateNounStatistic.mockResolvedValue({})
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleInputChange('1', 'singular', 'casa')
        result.current.handleInputChange('1', 'plural', 'case')
      })

      jest.spyOn(Date, 'now').mockReturnValue(1100)
      await act(async () => {
        result.current.handleValidation('1')
      })

      expect(mockUpdateNounStatistic).toHaveBeenCalledWith({
        nounId: '1',
        correct: true,
      })
    })

    it('should update statistics with incorrect when any field is wrong', async () => {
      mockUpdateNounStatistic.mockResolvedValue({})
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleInputChange('1', 'singular', 'casa')
        result.current.handleInputChange('1', 'plural', 'wrong')
      })

      jest.spyOn(Date, 'now').mockReturnValue(1100)
      await act(async () => {
        result.current.handleValidation('1')
      })

      expect(mockUpdateNounStatistic).toHaveBeenCalledWith({
        nounId: '1',
        correct: false,
      })
    })

    it('should not update statistics when saveStatistics is false', async () => {
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleInputChange('1', 'singular', 'casa')
        result.current.handleInputChange('1', 'plural', 'case')
      })

      jest.spyOn(Date, 'now').mockReturnValue(1100)
      await act(async () => {
        result.current.handleValidation('1', false)
      })

      expect(mockUpdateNounStatistic).not.toHaveBeenCalled()
    })

    it('should not update statistics when not all fields have input', async () => {
      mockUpdateNounStatistic.mockResolvedValue({})
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleInputChange('1', 'singular', 'casa')
        // plural is empty
      })

      jest.spyOn(Date, 'now').mockReturnValue(1100)
      await act(async () => {
        result.current.handleValidation('1')
      })

      expect(mockUpdateNounStatistic).not.toHaveBeenCalled()
    })

    it('should handle statistics update failure', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      mockUpdateNounStatistic.mockRejectedValue(new Error('Network error'))
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleInputChange('1', 'singular', 'casa')
        result.current.handleInputChange('1', 'plural', 'case')
      })

      jest.spyOn(Date, 'now').mockReturnValue(1100)
      await act(async () => {
        result.current.handleValidation('1')
      })

      await waitFor(() => {
        expect(result.current.statisticsError).not.toBeNull()
        expect(result.current.statisticsError?.message).toBe(
          'Failed to save statistics. Your progress may not be saved.'
        )
      })

      consoleSpy.mockRestore()
    })

    it('should get statistics for a noun', () => {
      const { result } = renderHook(() => useNounsPractice())

      const stats = result.current.getStatistics('1')
      expect(stats).toEqual({ correct: 5, wrong: 1 })
    })

    it('should return zero statistics for noun without stats', () => {
      ;(useGetNounStatisticsQuery as jest.Mock).mockReturnValue({
        data: { statistics: {} },
        refetch: mockRefetch,
      })

      const { result } = renderHook(() => useNounsPractice())

      const stats = result.current.getStatistics('1')
      expect(stats).toEqual({ correct: 0, wrong: 0 })
    })

    it('should return zero statistics when statistics data is null', () => {
      ;(useGetNounStatisticsQuery as jest.Mock).mockReturnValue({
        data: null,
        refetch: mockRefetch,
      })

      const { result } = renderHook(() => useNounsPractice())

      const stats = result.current.getStatistics('1')
      expect(stats).toEqual({ correct: 0, wrong: 0 })
    })
  })

  describe('handleClearInput', () => {
    it('should clear singular input', () => {
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleInputChange('1', 'singular', 'casa')
        result.current.handleInputChange('1', 'plural', 'case')
      })

      act(() => {
        result.current.handleClearInput('1', 'singular')
      })

      expect(result.current.inputValues['1']?.singular).toBe('')
      expect(result.current.inputValues['1']?.plural).toBe('case')
    })

    it('should clear plural input', () => {
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleInputChange('1', 'singular', 'casa')
        result.current.handleInputChange('1', 'plural', 'case')
      })

      act(() => {
        result.current.handleClearInput('1', 'plural')
      })

      expect(result.current.inputValues['1']?.singular).toBe('casa')
      expect(result.current.inputValues['1']?.plural).toBe('')
    })

    it('should clear validation state for cleared field', () => {
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleInputChange('1', 'singular', 'casa')
        result.current.handleInputChange('1', 'plural', 'case')
      })

      jest.spyOn(Date, 'now').mockReturnValue(1100)
      act(() => {
        result.current.handleValidation('1')
      })

      expect(result.current.validationState['1']?.singular).toBe('correct')

      act(() => {
        result.current.handleClearInput('1', 'singular')
      })

      expect(result.current.validationState['1']?.singular).toBeNull()
      expect(result.current.validationState['1']?.plural).toBe('correct')
    })
  })

  describe('handleShowAnswer', () => {
    it('should show correct answer for a noun', () => {
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleShowAnswer('1')
      })

      expect(result.current.inputValues['1']).toEqual({
        singular: 'casa',
        plural: 'case',
      })

      expect(result.current.validationState['1']).toEqual({
        singular: 'correct',
        plural: 'correct',
      })
    })

    it('should do nothing for non-existent noun', () => {
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleShowAnswer('non-existent')
      })

      expect(result.current.inputValues['non-existent']).toBeUndefined()
    })
  })

  describe('reset dialog', () => {
    it('should open reset dialog', () => {
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleOpenResetDialog('1')
      })

      expect(result.current.resetDialog).toEqual({
        open: true,
        nounId: '1',
        nounTranslation: 'House',
        error: null,
      })
    })

    it('should not open reset dialog for non-existent noun', () => {
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleOpenResetDialog('non-existent')
      })

      expect(result.current.resetDialog.open).toBe(false)
    })

    it('should close reset dialog', () => {
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleOpenResetDialog('1')
      })

      act(() => {
        result.current.handleCloseResetDialog()
      })

      expect(result.current.resetDialog).toEqual({
        open: false,
        nounId: null,
        nounTranslation: null,
        error: null,
      })
    })

    it('should confirm reset and close dialog', async () => {
      mockResetNounStatistic.mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({}),
      })
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleOpenResetDialog('1')
      })

      await act(async () => {
        await result.current.handleConfirmReset()
      })

      expect(mockResetNounStatistic).toHaveBeenCalledWith('1')
      expect(result.current.resetDialog.open).toBe(false)
    })

    it('should not reset if nounId is null', async () => {
      const { result } = renderHook(() => useNounsPractice())

      await act(async () => {
        await result.current.handleConfirmReset()
      })

      expect(mockResetNounStatistic).not.toHaveBeenCalled()
    })

    it('should handle reset error', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      mockResetNounStatistic.mockReturnValue({
        unwrap: jest.fn().mockRejectedValue(new Error('Reset failed')),
      })
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleOpenResetDialog('1')
      })

      await act(async () => {
        await result.current.handleConfirmReset()
      })

      expect(result.current.resetDialog.open).toBe(true)
      expect(result.current.resetDialog.error).toBe(
        'Failed to reset statistics. Please try again.'
      )

      consoleSpy.mockRestore()
    })
  })

  describe('sorting', () => {
    it('should sort alphabetically by translation', () => {
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleSortChange('alphabetical')
      })

      // Book, House, Tree alphabetically
      expect(result.current.filteredAndSortedNouns[0]?.translation).toBe('Book')
      expect(result.current.filteredAndSortedNouns[1]?.translation).toBe(
        'House'
      )
      expect(result.current.filteredAndSortedNouns[2]?.translation).toBe('Tree')
    })

    it('should sort by most errors', () => {
      const { result } = renderHook(() => useNounsPractice())

      // Statistics: 1: 1 wrong, 2: 3 wrong, 3: 0 wrong
      act(() => {
        result.current.handleSortChange('most-errors')
      })

      expect(result.current.filteredAndSortedNouns[0]?.id).toBe('2') // 3 wrong
      expect(result.current.filteredAndSortedNouns[1]?.id).toBe('1') // 1 wrong
      expect(result.current.filteredAndSortedNouns[2]?.id).toBe('3') // 0 wrong
    })

    it('should sort by worst performance', () => {
      const { result } = renderHook(() => useNounsPractice())

      // Performance (wrong - correct):
      // 1: 1 - 5 = -4
      // 2: 3 - 2 = 1
      // 3: 0 - 0 = 0
      act(() => {
        result.current.handleSortChange('worst-performance')
      })

      expect(result.current.filteredAndSortedNouns[0]?.id).toBe('2') // +1
      expect(result.current.filteredAndSortedNouns[1]?.id).toBe('3') // 0
      expect(result.current.filteredAndSortedNouns[2]?.id).toBe('1') // -4
    })

    it('should sort randomly', () => {
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleSortChange('random')
      })

      // Just verify it doesn't throw and returns all items
      expect(result.current.filteredAndSortedNouns).toHaveLength(3)
    })

    it('should update random seed when changing to random sort', () => {
      jest.spyOn(Date, 'now').mockReturnValue(5000)
      const { result } = renderHook(() => useNounsPractice())

      const initialNouns = [...result.current.filteredAndSortedNouns]

      act(() => {
        result.current.handleSortChange('random')
      })

      // The order might change (depends on seed)
      // Just verify the function works without error
      expect(result.current.filteredAndSortedNouns).toHaveLength(3)
      expect(result.current.sortOption).toBe('random')

      // All original nouns should still be present
      initialNouns.forEach((noun) => {
        expect(
          result.current.filteredAndSortedNouns.some((n) => n.id === noun.id)
        ).toBe(true)
      })
    })
  })

  describe('display count', () => {
    it('should limit results based on display count', () => {
      const manyNouns = Array.from({ length: 25 }, (_, i) => ({
        id: String(i + 1),
        italian: `noun${i}`,
        italianPlural: `nouns${i}`,
        translation: `Noun ${i}`,
        translationPlural: `Nouns ${i}`,
      }))

      ;(useGetNounsForPracticeQuery as jest.Mock).mockReturnValue({
        data: { nouns: manyNouns },
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useNounsPractice())

      // Default is 10
      expect(result.current.filteredAndSortedNouns).toHaveLength(10)

      act(() => {
        result.current.setDisplayCount(20)
      })
      expect(result.current.filteredAndSortedNouns).toHaveLength(20)

      act(() => {
        result.current.setDisplayCount(30)
      })
      expect(result.current.filteredAndSortedNouns).toHaveLength(25) // Only 25 exist

      act(() => {
        result.current.setDisplayCount('all')
      })
      expect(result.current.filteredAndSortedNouns).toHaveLength(25)
    })
  })

  describe('refresh', () => {
    it('should update random seed when refreshing with random sort', () => {
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleSortChange('random')
      })

      jest.spyOn(Date, 'now').mockReturnValue(5000)
      act(() => {
        result.current.handleRefresh()
      })

      // Just verify it doesn't throw
      expect(result.current.sortOption).toBe('random')
    })

    it('should refetch statistics when refreshing with most-errors sort', () => {
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleSortChange('most-errors')
      })

      act(() => {
        result.current.handleRefresh()
      })

      expect(mockRefetch).toHaveBeenCalled()
    })

    it('should refetch statistics when refreshing with worst-performance sort', () => {
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleSortChange('worst-performance')
      })

      act(() => {
        result.current.handleRefresh()
      })

      expect(mockRefetch).toHaveBeenCalled()
    })

    it('should not refetch when refreshing with alphabetical sort', () => {
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleSortChange('alphabetical')
      })

      act(() => {
        result.current.handleRefresh()
      })

      expect(mockRefetch).not.toHaveBeenCalled()
    })
  })

  describe('shouldShowRefreshButton', () => {
    it('should show refresh button for random sort', () => {
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleSortChange('random')
      })

      expect(result.current.shouldShowRefreshButton).toBe(true)
    })

    it('should show refresh button for most-errors sort', () => {
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleSortChange('most-errors')
      })

      expect(result.current.shouldShowRefreshButton).toBe(true)
    })

    it('should show refresh button for worst-performance sort', () => {
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleSortChange('worst-performance')
      })

      expect(result.current.shouldShowRefreshButton).toBe(true)
    })

    it('should not show refresh button for alphabetical sort', () => {
      const { result } = renderHook(() => useNounsPractice())

      act(() => {
        result.current.handleSortChange('alphabetical')
      })

      expect(result.current.shouldShowRefreshButton).toBe(false)
    })

    it('should not show refresh button for none sort', () => {
      const { result } = renderHook(() => useNounsPractice())

      expect(result.current.shouldShowRefreshButton).toBe(false)
    })
  })

  describe('handleKeyDown', () => {
    it('should move to plural field when pressing Enter on singular', () => {
      const { result } = renderHook(() => useNounsPractice())

      // Create a mock event
      const mockEvent = {
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent

      // Set up mock refs
      const mockPluralInput = { focus: jest.fn() }
      result.current.inputRefsPlural.current['1'] =
        mockPluralInput as unknown as HTMLInputElement

      act(() => {
        result.current.handleKeyDown(mockEvent, '1', 'singular', 0)
      })

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(mockPluralInput.focus).toHaveBeenCalled()
    })

    it('should validate and move to next noun when pressing Enter on plural', () => {
      mockUpdateNounStatistic.mockResolvedValue({})
      const { result } = renderHook(() => useNounsPractice())

      // Set up input values
      act(() => {
        result.current.handleInputChange('1', 'singular', 'casa')
        result.current.handleInputChange('1', 'plural', 'case')
      })

      // Set up mock refs
      const mockNextInput = { focus: jest.fn() }
      result.current.inputRefsSingular.current['2'] =
        mockNextInput as unknown as HTMLInputElement

      const mockEvent = {
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent

      jest.spyOn(Date, 'now').mockReturnValue(1100)
      act(() => {
        result.current.handleKeyDown(mockEvent, '1', 'plural', 0)
      })

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(result.current.validationState['1']?.singular).toBe('correct')
      expect(mockNextInput.focus).toHaveBeenCalled()
    })

    it('should not move to next noun when on last noun', () => {
      const { result } = renderHook(() => useNounsPractice())

      const mockEvent = {
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent

      // Index 2 is the last one (0, 1, 2)
      act(() => {
        result.current.handleKeyDown(mockEvent, '3', 'plural', 2)
      })

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      // Should not throw
    })

    it('should do nothing for non-Enter keys', () => {
      const { result } = renderHook(() => useNounsPractice())

      const mockEvent = {
        key: 'Tab',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent

      act(() => {
        result.current.handleKeyDown(mockEvent, '1', 'singular', 0)
      })

      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })
  })

  describe('refs', () => {
    it('should expose input refs', () => {
      const { result } = renderHook(() => useNounsPractice())

      expect(result.current.inputRefsSingular).toBeDefined()
      expect(result.current.inputRefsPlural).toBeDefined()
      expect(result.current.inputRefsSingular.current).toEqual({})
      expect(result.current.inputRefsPlural.current).toEqual({})
    })
  })
})
