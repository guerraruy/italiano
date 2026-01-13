import { renderHook, act, waitFor } from '@testing-library/react'

import { useResetDialog } from './useResetDialog'

interface TestItem {
  id: string
  name: string
}

describe('useResetDialog', () => {
  const mockGetItemLabel = (item: TestItem) => item.name
  const mockResetStatistic = jest.fn()
  const mockOnResetSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with dialog closed and no item selected', () => {
      const { result } = renderHook(() =>
        useResetDialog({
          getItemLabel: mockGetItemLabel,
          resetStatistic: mockResetStatistic,
        })
      )

      expect(result.current.resetDialog).toEqual({
        open: false,
        itemId: null,
        itemLabel: null,
        error: null,
      })
      expect(result.current.isResetting).toBe(false)
    })
  })

  describe('handleOpenResetDialog', () => {
    it('should open dialog with item details', () => {
      const { result } = renderHook(() =>
        useResetDialog({
          getItemLabel: mockGetItemLabel,
          resetStatistic: mockResetStatistic,
        })
      )

      const testItem: TestItem = { id: 'item-1', name: 'Test Item' }

      act(() => {
        result.current.handleOpenResetDialog(testItem)
      })

      expect(result.current.resetDialog).toEqual({
        open: true,
        itemId: 'item-1',
        itemLabel: 'Test Item',
        error: null,
      })
    })

    it('should use getItemLabel to extract the label', () => {
      const customGetLabel = (item: TestItem) =>
        `Label: ${item.name.toUpperCase()}`

      const { result } = renderHook(() =>
        useResetDialog({
          getItemLabel: customGetLabel,
          resetStatistic: mockResetStatistic,
        })
      )

      const testItem: TestItem = { id: 'item-2', name: 'Casa' }

      act(() => {
        result.current.handleOpenResetDialog(testItem)
      })

      expect(result.current.resetDialog.itemLabel).toBe('Label: CASA')
    })

    it('should clear any previous error when opening dialog', () => {
      mockResetStatistic.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() =>
        useResetDialog({
          getItemLabel: mockGetItemLabel,
          resetStatistic: mockResetStatistic,
        })
      )

      const testItem: TestItem = { id: 'item-1', name: 'Test Item' }

      // Open and try to reset to create an error
      act(() => {
        result.current.handleOpenResetDialog(testItem)
      })

      // Trigger error
      act(() => {
        result.current.handleConfirmReset()
      })

      // Wait for error to be set
      return waitFor(() => {
        expect(result.current.resetDialog.error).toBe(
          'Failed to reset statistics. Please try again.'
        )
      }).then(() => {
        // Open dialog again
        act(() => {
          result.current.handleOpenResetDialog(testItem)
        })

        expect(result.current.resetDialog.error).toBeNull()
      })
    })
  })

  describe('handleCloseResetDialog', () => {
    it('should close dialog and clear all state', () => {
      const { result } = renderHook(() =>
        useResetDialog({
          getItemLabel: mockGetItemLabel,
          resetStatistic: mockResetStatistic,
        })
      )

      const testItem: TestItem = { id: 'item-1', name: 'Test Item' }

      // Open dialog first
      act(() => {
        result.current.handleOpenResetDialog(testItem)
      })

      expect(result.current.resetDialog.open).toBe(true)

      // Close dialog
      act(() => {
        result.current.handleCloseResetDialog()
      })

      expect(result.current.resetDialog).toEqual({
        open: false,
        itemId: null,
        itemLabel: null,
        error: null,
      })
    })
  })

  describe('handleConfirmReset', () => {
    it('should call resetStatistic with the item id', async () => {
      mockResetStatistic.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() =>
        useResetDialog({
          getItemLabel: mockGetItemLabel,
          resetStatistic: mockResetStatistic,
        })
      )

      const testItem: TestItem = { id: 'item-123', name: 'Test Item' }

      act(() => {
        result.current.handleOpenResetDialog(testItem)
      })

      await act(async () => {
        await result.current.handleConfirmReset()
      })

      expect(mockResetStatistic).toHaveBeenCalledWith('item-123')
      expect(mockResetStatistic).toHaveBeenCalledTimes(1)
    })

    it('should close dialog after successful reset', async () => {
      mockResetStatistic.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() =>
        useResetDialog({
          getItemLabel: mockGetItemLabel,
          resetStatistic: mockResetStatistic,
        })
      )

      const testItem: TestItem = { id: 'item-1', name: 'Test Item' }

      act(() => {
        result.current.handleOpenResetDialog(testItem)
      })

      await act(async () => {
        await result.current.handleConfirmReset()
      })

      expect(result.current.resetDialog.open).toBe(false)
      expect(result.current.resetDialog.itemId).toBeNull()
    })

    it('should call onResetSuccess callback after successful reset', async () => {
      mockResetStatistic.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() =>
        useResetDialog({
          getItemLabel: mockGetItemLabel,
          resetStatistic: mockResetStatistic,
          onResetSuccess: mockOnResetSuccess,
        })
      )

      const testItem: TestItem = { id: 'item-1', name: 'Test Item' }

      act(() => {
        result.current.handleOpenResetDialog(testItem)
      })

      await act(async () => {
        await result.current.handleConfirmReset()
      })

      expect(mockOnResetSuccess).toHaveBeenCalledTimes(1)
    })

    it('should not call onResetSuccess if reset fails', async () => {
      mockResetStatistic.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() =>
        useResetDialog({
          getItemLabel: mockGetItemLabel,
          resetStatistic: mockResetStatistic,
          onResetSuccess: mockOnResetSuccess,
        })
      )

      const testItem: TestItem = { id: 'item-1', name: 'Test Item' }

      act(() => {
        result.current.handleOpenResetDialog(testItem)
      })

      await act(async () => {
        await result.current.handleConfirmReset()
      })

      expect(mockOnResetSuccess).not.toHaveBeenCalled()
    })

    it('should set error message when reset fails', async () => {
      mockResetStatistic.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() =>
        useResetDialog({
          getItemLabel: mockGetItemLabel,
          resetStatistic: mockResetStatistic,
        })
      )

      const testItem: TestItem = { id: 'item-1', name: 'Test Item' }

      act(() => {
        result.current.handleOpenResetDialog(testItem)
      })

      await act(async () => {
        await result.current.handleConfirmReset()
      })

      expect(result.current.resetDialog.error).toBe(
        'Failed to reset statistics. Please try again.'
      )
      expect(result.current.resetDialog.open).toBe(true)
    })

    it('should log error to console when reset fails', async () => {
      const error = new Error('Network error')
      mockResetStatistic.mockRejectedValueOnce(error)

      const { result } = renderHook(() =>
        useResetDialog({
          getItemLabel: mockGetItemLabel,
          resetStatistic: mockResetStatistic,
        })
      )

      const testItem: TestItem = { id: 'item-1', name: 'Test Item' }

      act(() => {
        result.current.handleOpenResetDialog(testItem)
      })

      await act(async () => {
        await result.current.handleConfirmReset()
      })

      expect(console.error).toHaveBeenCalledWith(
        'Failed to reset statistics:',
        error
      )
    })

    it('should not call resetStatistic if no item is selected', async () => {
      const { result } = renderHook(() =>
        useResetDialog({
          getItemLabel: mockGetItemLabel,
          resetStatistic: mockResetStatistic,
        })
      )

      await act(async () => {
        await result.current.handleConfirmReset()
      })

      expect(mockResetStatistic).not.toHaveBeenCalled()
    })

    it('should work without onResetSuccess callback', async () => {
      mockResetStatistic.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() =>
        useResetDialog({
          getItemLabel: mockGetItemLabel,
          resetStatistic: mockResetStatistic,
        })
      )

      const testItem: TestItem = { id: 'item-1', name: 'Test Item' }

      act(() => {
        result.current.handleOpenResetDialog(testItem)
      })

      await act(async () => {
        await result.current.handleConfirmReset()
      })

      expect(result.current.resetDialog.open).toBe(false)
    })
  })

  describe('isResetting state', () => {
    it('should set isResetting to true while reset is in progress', async () => {
      let resolveReset: () => void
      const slowResetStatistic = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            resolveReset = resolve
          })
      )

      const { result } = renderHook(() =>
        useResetDialog({
          getItemLabel: mockGetItemLabel,
          resetStatistic: slowResetStatistic,
        })
      )

      const testItem: TestItem = { id: 'item-1', name: 'Test Item' }

      act(() => {
        result.current.handleOpenResetDialog(testItem)
      })

      expect(result.current.isResetting).toBe(false)

      // Start reset but don't await
      let resetPromise: Promise<void>
      act(() => {
        resetPromise = result.current.handleConfirmReset()
      })

      expect(result.current.isResetting).toBe(true)

      // Resolve the reset
      await act(async () => {
        resolveReset!()
        await resetPromise
      })

      expect(result.current.isResetting).toBe(false)
    })

    it('should set isResetting to false after reset fails', async () => {
      mockResetStatistic.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() =>
        useResetDialog({
          getItemLabel: mockGetItemLabel,
          resetStatistic: mockResetStatistic,
        })
      )

      const testItem: TestItem = { id: 'item-1', name: 'Test Item' }

      act(() => {
        result.current.handleOpenResetDialog(testItem)
      })

      await act(async () => {
        await result.current.handleConfirmReset()
      })

      expect(result.current.isResetting).toBe(false)
    })
  })

  describe('callback memoization', () => {
    it('should return stable callback references', () => {
      const { result, rerender } = renderHook(() =>
        useResetDialog({
          getItemLabel: mockGetItemLabel,
          resetStatistic: mockResetStatistic,
        })
      )

      const firstRender = {
        handleOpenResetDialog: result.current.handleOpenResetDialog,
        handleCloseResetDialog: result.current.handleCloseResetDialog,
        handleConfirmReset: result.current.handleConfirmReset,
      }

      rerender()

      expect(result.current.handleCloseResetDialog).toBe(
        firstRender.handleCloseResetDialog
      )
    })

    it('should update handleOpenResetDialog when getItemLabel changes', () => {
      const getLabel1 = (item: TestItem) => item.name
      const getLabel2 = (item: TestItem) => item.name.toUpperCase()

      const { result, rerender } = renderHook(
        ({ getItemLabel }) =>
          useResetDialog({
            getItemLabel,
            resetStatistic: mockResetStatistic,
          }),
        { initialProps: { getItemLabel: getLabel1 } }
      )

      const firstCallback = result.current.handleOpenResetDialog

      rerender({ getItemLabel: getLabel2 })

      expect(result.current.handleOpenResetDialog).not.toBe(firstCallback)
    })
  })

  describe('edge cases', () => {
    it('should handle item with empty string id', async () => {
      mockResetStatistic.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() =>
        useResetDialog({
          getItemLabel: mockGetItemLabel,
          resetStatistic: mockResetStatistic,
        })
      )

      const testItem: TestItem = { id: '', name: 'Empty ID Item' }

      act(() => {
        result.current.handleOpenResetDialog(testItem)
      })

      // Empty string is falsy but should still work as an id
      expect(result.current.resetDialog.itemId).toBe('')

      await act(async () => {
        await result.current.handleConfirmReset()
      })

      // Empty string is falsy, so handleConfirmReset should return early
      expect(mockResetStatistic).not.toHaveBeenCalled()
    })

    it('should handle item with special characters in label', () => {
      const { result } = renderHook(() =>
        useResetDialog({
          getItemLabel: mockGetItemLabel,
          resetStatistic: mockResetStatistic,
        })
      )

      const testItem: TestItem = {
        id: 'item-1',
        name: '<script>alert("xss")</script>',
      }

      act(() => {
        result.current.handleOpenResetDialog(testItem)
      })

      expect(result.current.resetDialog.itemLabel).toBe(
        '<script>alert("xss")</script>'
      )
    })

    it('should handle rapid open/close cycles', () => {
      const { result } = renderHook(() =>
        useResetDialog({
          getItemLabel: mockGetItemLabel,
          resetStatistic: mockResetStatistic,
        })
      )

      const item1: TestItem = { id: 'item-1', name: 'Item 1' }
      const item2: TestItem = { id: 'item-2', name: 'Item 2' }

      act(() => {
        result.current.handleOpenResetDialog(item1)
        result.current.handleCloseResetDialog()
        result.current.handleOpenResetDialog(item2)
      })

      expect(result.current.resetDialog.itemId).toBe('item-2')
      expect(result.current.resetDialog.itemLabel).toBe('Item 2')
      expect(result.current.resetDialog.open).toBe(true)
    })

    it('should handle multiple consecutive reset calls', async () => {
      mockResetStatistic.mockResolvedValue(undefined)

      const { result } = renderHook(() =>
        useResetDialog({
          getItemLabel: mockGetItemLabel,
          resetStatistic: mockResetStatistic,
        })
      )

      const testItem: TestItem = { id: 'item-1', name: 'Test Item' }

      act(() => {
        result.current.handleOpenResetDialog(testItem)
      })

      await act(async () => {
        await result.current.handleConfirmReset()
      })

      // After first reset, dialog is closed, itemId is null
      // Second call should do nothing
      await act(async () => {
        await result.current.handleConfirmReset()
      })

      expect(mockResetStatistic).toHaveBeenCalledTimes(1)
    })
  })
})
