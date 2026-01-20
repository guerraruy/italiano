import React from 'react'

import { act, renderHook, waitFor } from '@testing-library/react'

import * as api from '@/app/store/api'

import { useVerbsPractice } from './useVerbsPractice'

// Mock the RTK Query hooks
jest.mock('@/app/store/api', () => ({
  useGetVerbsForPracticeQuery: jest.fn(),
  useGetVerbStatisticsQuery: jest.fn(),
  useUpdateVerbStatisticMutation: jest.fn(),
  useResetVerbStatisticMutation: jest.fn(),
  useGetProfileQuery: jest.fn(),
}))

// Mock the utils module
jest.mock('../utils', () => ({
  validateAnswer: jest.fn((verbId, userInput, correctAnswer) => {
    const normalize = (str: string) =>
      str
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
    return normalize(userInput) === normalize(correctAnswer)
  }),
}))

describe('useVerbsPractice', () => {
  const mockVerbs = [
    {
      id: '1',
      italian: 'mangiare',
      translation: 'to eat',
      regular: true,
      reflexive: false,
    },
    {
      id: '2',
      italian: 'andare',
      translation: 'to go',
      regular: false,
      reflexive: false,
    },
    {
      id: '3',
      italian: 'alzarsi',
      translation: 'to get up',
      regular: true,
      reflexive: true,
    },
    {
      id: '4',
      italian: 'essere',
      translation: 'to be',
      regular: false,
      reflexive: false,
    },
    {
      id: '5',
      italian: 'avere',
      translation: 'to have',
      regular: false,
      reflexive: false,
    },
  ]

  const mockStatistics = {
    '1': { correctAttempts: 5, wrongAttempts: 2, lastPracticed: new Date() },
    '2': { correctAttempts: 3, wrongAttempts: 4, lastPracticed: new Date() },
    '3': { correctAttempts: 0, wrongAttempts: 5, lastPracticed: new Date() },
  }

  const mockUpdateVerbStatistic = jest.fn()
  const mockResetVerbStatistic = jest.fn()
  const mockRefetchStatistics = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    // Default mock implementations
    ;(api.useGetVerbsForPracticeQuery as jest.Mock).mockReturnValue({
      data: { verbs: mockVerbs },
      isLoading: false,
      error: null,
    })
    ;(api.useGetVerbStatisticsQuery as jest.Mock).mockReturnValue({
      data: { statistics: mockStatistics },
      refetch: mockRefetchStatistics,
    })
    ;(api.useUpdateVerbStatisticMutation as jest.Mock).mockReturnValue([
      mockUpdateVerbStatistic,
    ])
    ;(api.useResetVerbStatisticMutation as jest.Mock).mockReturnValue([
      mockResetVerbStatistic,
      { isLoading: false },
    ])
    ;(api.useGetProfileQuery as jest.Mock).mockReturnValue({
      data: { profile: { masteryThreshold: 10 } },
    })
  })

  describe('Initial State', () => {
    it('should return initial state values', () => {
      const { result } = renderHook(() => useVerbsPractice())

      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.verbs).toEqual(mockVerbs)
      expect(result.current.inputValues).toEqual({})
      expect(result.current.validationState).toEqual({})
      expect(result.current.verbTypeFilter).toBe('all')
      expect(result.current.sortOption).toBe('none')
      expect(result.current.displayCount).toBe(10)
      expect(result.current.resetDialog).toEqual({
        open: false,
        verbId: null,
        verbTranslation: null,
        error: null,
      })
      expect(result.current.isResetting).toBe(false)
      expect(result.current.statisticsError).toBeNull()
      expect(result.current.shouldShowRefreshButton).toBe(false)
    })

    it('should return loading state when data is loading', () => {
      ;(api.useGetVerbsForPracticeQuery as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      })

      const { result } = renderHook(() => useVerbsPractice())

      expect(result.current.isLoading).toBe(true)
      expect(result.current.verbs).toEqual([])
    })

    it('should return error state when there is an error', () => {
      const mockError = new Error('Failed to fetch')
      ;(api.useGetVerbsForPracticeQuery as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: mockError,
      })

      const { result } = renderHook(() => useVerbsPractice())

      expect(result.current.error).toBe(mockError)
    })
  })

  describe('handleInputChange', () => {
    it('should update input value for a verb', () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.handleInputChange('1', 'mangi')
      })

      expect(result.current.inputValues['1']).toBe('mangi')
    })

    it('should clear validation state when input changes', () => {
      const { result } = renderHook(() => useVerbsPractice())
      mockUpdateVerbStatistic.mockResolvedValue({})

      // First, set the input value
      act(() => {
        result.current.handleInputChange('1', 'mangiare')
      })

      // Then validate (in a separate act to ensure state is updated)
      act(() => {
        result.current.handleValidation('1', 'mangiare')
      })

      expect(result.current.validationState['1']).toBe('correct')

      // Then change the input
      act(() => {
        result.current.handleInputChange('1', 'mang')
      })

      expect(result.current.validationState['1']).toBeNull()
    })
  })

  describe('handleValidation', () => {
    beforeEach(() => {
      mockUpdateVerbStatistic.mockResolvedValue({})
    })

    it('should set validation state to correct for correct answer', async () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.handleInputChange('1', 'mangiare')
      })

      await act(async () => {
        result.current.handleValidation('1', 'mangiare')
      })

      expect(result.current.validationState['1']).toBe('correct')
    })

    it('should set validation state to incorrect for wrong answer', async () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.handleInputChange('1', 'wrong')
      })

      await act(async () => {
        result.current.handleValidation('1', 'mangiare')
      })

      expect(result.current.validationState['1']).toBe('incorrect')
    })

    it('should not validate empty input', () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.handleValidation('1', 'mangiare')
      })

      expect(result.current.validationState['1']).toBeUndefined()
      expect(mockUpdateVerbStatistic).not.toHaveBeenCalled()
    })

    it('should not validate whitespace-only input', () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.handleInputChange('1', '   ')
      })

      act(() => {
        result.current.handleValidation('1', 'mangiare')
      })

      expect(result.current.validationState['1']).toBeUndefined()
    })

    it('should call updateVerbStatistic with correct data', async () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.handleInputChange('1', 'mangiare')
      })

      await act(async () => {
        result.current.handleValidation('1', 'mangiare')
      })

      expect(mockUpdateVerbStatistic).toHaveBeenCalledWith({
        verbId: '1',
        correct: true,
      })
    })

    it('should handle validation error gracefully', async () => {
      jest.useFakeTimers()
      mockUpdateVerbStatistic.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.handleInputChange('1', 'mangiare')
      })

      await act(async () => {
        result.current.handleValidation('1', 'mangiare')
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

    it('should prevent duplicate validation within 100ms', async () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.handleInputChange('1', 'mangiare')
      })

      await act(async () => {
        result.current.handleValidation('1', 'mangiare')
      })

      await act(async () => {
        result.current.handleValidation('1', 'mangiare')
      })

      // Should only be called once due to debouncing
      expect(mockUpdateVerbStatistic).toHaveBeenCalledTimes(1)
    })
  })

  describe('handleClearInput', () => {
    it('should clear input value for a verb', () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.handleInputChange('1', 'mangiare')
      })

      act(() => {
        result.current.handleClearInput('1')
      })

      expect(result.current.inputValues['1']).toBe('')
    })

    it('should clear validation state when input is cleared', () => {
      const { result } = renderHook(() => useVerbsPractice())
      mockUpdateVerbStatistic.mockResolvedValue({})

      act(() => {
        result.current.handleInputChange('1', 'mangiare')
      })

      act(() => {
        result.current.handleValidation('1', 'mangiare')
      })

      act(() => {
        result.current.handleClearInput('1')
      })

      expect(result.current.validationState['1']).toBeNull()
    })
  })

  describe('handleShowAnswer', () => {
    it('should set input value to correct answer', () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.handleShowAnswer('1', 'mangiare')
      })

      expect(result.current.inputValues['1']).toBe('mangiare')
    })

    it('should set validation state to correct', () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.handleShowAnswer('1', 'mangiare')
      })

      expect(result.current.validationState['1']).toBe('correct')
    })
  })

  describe('Reset Dialog', () => {
    it('should open reset dialog with correct verb info', () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.handleOpenResetDialog('1')
      })

      expect(result.current.resetDialog).toEqual({
        open: true,
        verbId: '1',
        verbTranslation: 'to eat',
        error: null,
      })
    })

    it('should close reset dialog', () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.handleOpenResetDialog('1')
      })

      act(() => {
        result.current.handleCloseResetDialog()
      })

      expect(result.current.resetDialog).toEqual({
        open: false,
        verbId: null,
        verbTranslation: null,
        error: null,
      })
    })

    it('should call resetVerbStatistic on confirm', async () => {
      mockResetVerbStatistic.mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({}),
      })

      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.handleOpenResetDialog('1')
      })

      await act(async () => {
        await result.current.handleConfirmReset()
      })

      expect(mockResetVerbStatistic).toHaveBeenCalledWith('1')
    })

    it('should close dialog after successful reset', async () => {
      mockResetVerbStatistic.mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({}),
      })

      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.handleOpenResetDialog('1')
      })

      await act(async () => {
        await result.current.handleConfirmReset()
      })

      expect(result.current.resetDialog.open).toBe(false)
    })

    it('should set error on reset failure', async () => {
      mockResetVerbStatistic.mockReturnValue({
        unwrap: jest.fn().mockRejectedValue(new Error('Reset failed')),
      })

      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.handleOpenResetDialog('1')
      })

      await act(async () => {
        await result.current.handleConfirmReset()
      })

      expect(result.current.resetDialog.error).toBe(
        'Failed to reset statistics. Please try again.'
      )
    })

    it('should not reset if verbId is null', async () => {
      const { result } = renderHook(() => useVerbsPractice())

      await act(async () => {
        await result.current.handleConfirmReset()
      })

      expect(mockResetVerbStatistic).not.toHaveBeenCalled()
    })
  })

  describe('getStatistics', () => {
    it('should return statistics for a verb', () => {
      const { result } = renderHook(() => useVerbsPractice())

      const stats = result.current.getStatistics('1')

      expect(stats).toEqual({
        correct: 5,
        wrong: 2,
      })
    })

    it('should return zeros for verb without statistics', () => {
      const { result } = renderHook(() => useVerbsPractice())

      const stats = result.current.getStatistics('999')

      expect(stats).toEqual({
        correct: 0,
        wrong: 0,
      })
    })

    it('should handle undefined statistics data', () => {
      ;(api.useGetVerbStatisticsQuery as jest.Mock).mockReturnValue({
        data: undefined,
        refetch: mockRefetchStatistics,
      })

      const { result } = renderHook(() => useVerbsPractice())

      const stats = result.current.getStatistics('1')

      expect(stats).toEqual({
        correct: 0,
        wrong: 0,
      })
    })
  })

  describe('Verb Type Filtering', () => {
    it('should filter regular verbs', () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.setExcludeMastered(false)
      })

      act(() => {
        result.current.setVerbTypeFilter('regular')
      })

      act(() => {
        result.current.handleRefresh()
      })

      expect(result.current.verbTypeFilter).toBe('regular')
      expect(result.current.filteredAndSortedVerbs).toEqual([
        expect.objectContaining({ id: '1', regular: true, reflexive: false }),
      ])
    })

    it('should filter irregular verbs', () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.setExcludeMastered(false)
      })

      act(() => {
        result.current.setVerbTypeFilter('irregular')
      })

      act(() => {
        result.current.handleRefresh()
      })

      expect(
        result.current.filteredAndSortedVerbs.every((v) => !v.regular)
      ).toBe(true)
      expect(
        result.current.filteredAndSortedVerbs.every((v) => !v.reflexive)
      ).toBe(true)
    })

    it('should filter reflexive verbs', () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.setExcludeMastered(false)
      })

      act(() => {
        result.current.setVerbTypeFilter('reflexive')
      })

      act(() => {
        result.current.handleRefresh()
      })

      expect(result.current.filteredAndSortedVerbs).toEqual([
        expect.objectContaining({ id: '3', reflexive: true }),
      ])
    })

    it('should show all verbs when filter is all', () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.setVerbTypeFilter('all')
      })

      expect(result.current.filteredAndSortedVerbs.length).toBe(5)
    })
  })

  describe('Sorting', () => {
    it('should sort alphabetically by translation', () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.setDisplayCount('all')
        result.current.handleSortChange('alphabetical')
      })

      const translations = result.current.filteredAndSortedVerbs.map(
        (v) => v.translation
      )
      const sortedTranslations = [...translations].sort((a, b) =>
        a.localeCompare(b)
      )

      expect(translations).toEqual(sortedTranslations)
    })

    it('should sort randomly with seed', () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.setDisplayCount('all')
        result.current.handleSortChange('random')
      })

      // Random sort should still produce a valid array with all verbs
      expect(result.current.filteredAndSortedVerbs.length).toBe(5)
      expect(result.current.sortOption).toBe('random')
    })

    it('should sort by most errors', () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.setExcludeMastered(false)
        result.current.setDisplayCount('all')
        result.current.handleSortChange('most-errors')
      })

      // Verb '3' has 5 errors, should be first
      expect(result.current.filteredAndSortedVerbs[0]?.id).toBe('3')
      // Verb '2' has 4 errors, should be second
      expect(result.current.filteredAndSortedVerbs[1]?.id).toBe('2')
    })

    it('should sort by worst performance', () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.setExcludeMastered(false)
        result.current.setDisplayCount('all')
        result.current.handleSortChange('worst-performance')
      })

      // Verb '3' has worst performance (0-5 = -5)
      expect(result.current.filteredAndSortedVerbs[0]?.id).toBe('3')
    })

    it('should set random seed when sorting randomly', () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.handleSortChange('random')
      })

      expect(result.current.sortOption).toBe('random')
    })
  })

  describe('Display Count', () => {
    it('should limit displayed verbs to 10 by default', () => {
      const { result } = renderHook(() => useVerbsPractice())

      expect(result.current.displayCount).toBe(10)
      expect(result.current.filteredAndSortedVerbs.length).toBeLessThanOrEqual(
        10
      )
    })

    it('should update display count', () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.setDisplayCount(20)
      })

      expect(result.current.displayCount).toBe(20)
    })

    it('should show all verbs when display count is all', () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.setDisplayCount('all')
      })

      expect(result.current.filteredAndSortedVerbs.length).toBe(
        mockVerbs.length
      )
    })
  })

  describe('handleKeyDown', () => {
    it('should validate and move to next verb on Enter', async () => {
      mockUpdateVerbStatistic.mockResolvedValue({})
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.handleInputChange('1', 'mangiare')
      })

      const mockEvent = {
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent

      await act(async () => {
        result.current.handleKeyDown(mockEvent, '1', 'mangiare', 0)
      })

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(result.current.validationState['1']).toBe('correct')
    })

    it('should not do anything for non-Enter keys', () => {
      const { result } = renderHook(() => useVerbsPractice())

      const mockEvent = {
        key: 'Tab',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent

      act(() => {
        result.current.handleKeyDown(mockEvent, '1', 'mangiare', 0)
      })

      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })
  })

  describe('handleRefresh', () => {
    it('should update random seed when sort is random', () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.handleSortChange('random')
      })

      act(() => {
        result.current.handleRefresh()
      })

      // The order might change (or stay the same due to random chance)
      // but the refresh should have been triggered
      expect(result.current.sortOption).toBe('random')
    })

    it('should refetch statistics when sort is most-errors', () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.handleSortChange('most-errors')
      })

      act(() => {
        result.current.handleRefresh()
      })

      expect(mockRefetchStatistics).toHaveBeenCalled()
    })

    it('should refetch statistics when sort is worst-performance', () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.handleSortChange('worst-performance')
      })

      act(() => {
        result.current.handleRefresh()
      })

      expect(mockRefetchStatistics).toHaveBeenCalled()
    })

    it('should clear state and refetch statistics even when sort is none', () => {
      const { result } = renderHook(() => useVerbsPractice())

      // Set some input values first
      act(() => {
        result.current.handleInputChange('1', 'test')
      })

      expect(result.current.inputValues['1']).toBe('test')

      act(() => {
        result.current.handleRefresh()
      })

      // Refresh always refetches statistics to update filters (e.g., remove newly mastered items)
      expect(mockRefetchStatistics).toHaveBeenCalled()
      expect(result.current.inputValues).toEqual({})
    })
  })

  describe('shouldShowRefreshButton', () => {
    it('should be true when sort is random', () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.handleSortChange('random')
      })

      expect(result.current.shouldShowRefreshButton).toBe(true)
    })

    it('should be true when sort is most-errors', () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.handleSortChange('most-errors')
      })

      expect(result.current.shouldShowRefreshButton).toBe(true)
    })

    it('should be true when sort is worst-performance', () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.handleSortChange('worst-performance')
      })

      expect(result.current.shouldShowRefreshButton).toBe(true)
    })

    it('should be false when sort is none', () => {
      const { result } = renderHook(() => useVerbsPractice())

      expect(result.current.shouldShowRefreshButton).toBe(false)
    })

    it('should be false when sort is alphabetical', () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.handleSortChange('alphabetical')
      })

      expect(result.current.shouldShowRefreshButton).toBe(false)
    })
  })

  describe('inputRefs', () => {
    it('should have inputRefs object', () => {
      const { result } = renderHook(() => useVerbsPractice())

      expect(result.current.inputRefs).toBeDefined()
      expect(result.current.inputRefs.current).toEqual({})
    })
  })

  describe('Filtering and Sorting Combined', () => {
    it('should apply filtering before sorting', () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.setExcludeMastered(false)
      })

      act(() => {
        result.current.setVerbTypeFilter('irregular')
      })

      act(() => {
        result.current.handleSortChange('alphabetical')
        result.current.setDisplayCount('all')
      })

      // Should only have irregular, non-reflexive verbs, sorted alphabetically
      const verbs = result.current.filteredAndSortedVerbs
      expect(verbs.every((v) => !v.regular && !v.reflexive)).toBe(true)
    })

    it('should apply display count after filtering and sorting', () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.setExcludeMastered(false)
        result.current.setVerbTypeFilter('all')
        result.current.handleSortChange('alphabetical')
        result.current.setDisplayCount(10)
      })

      expect(result.current.filteredAndSortedVerbs.length).toBeLessThanOrEqual(
        10
      )
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty verbs array', () => {
      ;(api.useGetVerbsForPracticeQuery as jest.Mock).mockReturnValue({
        data: { verbs: [] },
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useVerbsPractice())

      expect(result.current.verbs).toEqual([])
      expect(result.current.filteredAndSortedVerbs).toEqual([])
    })

    it('should handle undefined data', () => {
      ;(api.useGetVerbsForPracticeQuery as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useVerbsPractice())

      expect(result.current.verbs).toEqual([])
      expect(result.current.filteredAndSortedVerbs).toEqual([])
    })

    it('should not open reset dialog for non-existent verb', () => {
      const { result } = renderHook(() => useVerbsPractice())

      act(() => {
        result.current.handleOpenResetDialog('non-existent')
      })

      expect(result.current.resetDialog.open).toBe(false)
    })
  })
})
