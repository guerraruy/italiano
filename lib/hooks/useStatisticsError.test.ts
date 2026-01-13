import { renderHook, act } from '@testing-library/react'

import { useStatisticsError } from './useStatisticsError'

describe('useStatisticsError', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.spyOn(Date, 'now').mockReturnValue(1000)
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('should initialize with null error state', () => {
    const { result } = renderHook(() => useStatisticsError())

    expect(result.current.statisticsError).toBeNull()
  })

  it('should show error with message and timestamp', () => {
    const { result } = renderHook(() => useStatisticsError())

    act(() => {
      result.current.showError('Test error message')
    })

    expect(result.current.statisticsError).toEqual({
      message: 'Test error message',
      timestamp: 1000,
    })
  })

  it('should auto-clear error after 5 seconds', () => {
    const { result } = renderHook(() => useStatisticsError())

    act(() => {
      result.current.showError('Test error message')
    })

    expect(result.current.statisticsError).not.toBeNull()

    // Advance time by 4999ms - error should still be visible
    act(() => {
      jest.advanceTimersByTime(4999)
    })
    expect(result.current.statisticsError).not.toBeNull()

    // Advance time by 1ms more (total 5000ms) - error should be cleared
    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(result.current.statisticsError).toBeNull()
  })

  it('should reset timeout when showing new error', () => {
    const { result } = renderHook(() => useStatisticsError())

    act(() => {
      result.current.showError('First error')
    })

    // Advance time by 3 seconds
    act(() => {
      jest.advanceTimersByTime(3000)
    })

    // Update timestamp for new error
    jest.spyOn(Date, 'now').mockReturnValue(4000)

    // Show another error - should reset the timeout
    act(() => {
      result.current.showError('Second error')
    })

    expect(result.current.statisticsError).toEqual({
      message: 'Second error',
      timestamp: 4000,
    })

    // Advance time by 3 seconds (total 6 from first error, 3 from second)
    act(() => {
      jest.advanceTimersByTime(3000)
    })
    // Error should still be visible because second error reset the timer
    expect(result.current.statisticsError).not.toBeNull()

    // Advance time by 2 more seconds (total 5 from second error)
    act(() => {
      jest.advanceTimersByTime(2000)
    })
    expect(result.current.statisticsError).toBeNull()
  })

  it('should clear error manually with clearError', () => {
    const { result } = renderHook(() => useStatisticsError())

    act(() => {
      result.current.showError('Test error')
    })

    expect(result.current.statisticsError).not.toBeNull()

    act(() => {
      result.current.clearError()
    })

    expect(result.current.statisticsError).toBeNull()
  })

  it('should clear pending timeout when clearError is called', () => {
    const { result } = renderHook(() => useStatisticsError())

    act(() => {
      result.current.showError('Test error')
    })

    act(() => {
      result.current.clearError()
    })

    // Advance time past auto-clear period - nothing should happen
    act(() => {
      jest.advanceTimersByTime(10000)
    })

    expect(result.current.statisticsError).toBeNull()
  })

  it('should handle clearError when no error exists', () => {
    const { result } = renderHook(() => useStatisticsError())

    // Should not throw
    act(() => {
      result.current.clearError()
    })

    expect(result.current.statisticsError).toBeNull()
  })

  describe('handleStatisticsOperation', () => {
    it('should return result on successful operation', async () => {
      const { result } = renderHook(() => useStatisticsError())
      const mockResult = { data: 'test' }
      const operation = jest.fn().mockResolvedValue(mockResult)

      let returnValue: { data: string } | undefined
      await act(async () => {
        returnValue = await result.current.handleStatisticsOperation(operation)
      })

      expect(operation).toHaveBeenCalled()
      expect(returnValue).toEqual(mockResult)
      expect(result.current.statisticsError).toBeNull()
    })

    it('should show error and return undefined on failed operation', async () => {
      const { result } = renderHook(() => useStatisticsError())
      const operation = jest.fn().mockRejectedValue(new Error('API error'))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      let returnValue: unknown
      await act(async () => {
        returnValue = await result.current.handleStatisticsOperation(operation)
      })

      expect(operation).toHaveBeenCalled()
      expect(returnValue).toBeUndefined()
      expect(result.current.statisticsError).toEqual({
        message: 'Failed to save statistics. Your progress may not be saved.',
        timestamp: 1000,
      })
      expect(consoleSpy).toHaveBeenCalledWith(
        'Statistics operation failed:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })

    it('should use custom error message when provided', async () => {
      const { result } = renderHook(() => useStatisticsError())
      const operation = jest.fn().mockRejectedValue(new Error('API error'))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      await act(async () => {
        await result.current.handleStatisticsOperation(
          operation,
          'Custom error message'
        )
      })

      expect(result.current.statisticsError?.message).toBe(
        'Custom error message'
      )

      consoleSpy.mockRestore()
    })
  })

  it('should clear timeout on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')
    const { result, unmount } = renderHook(() => useStatisticsError())

    act(() => {
      result.current.showError('Test error')
    })

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
  })
})
