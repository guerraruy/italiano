import { renderHook, act } from '@testing-library/react'

import { PracticeItem, Statistics } from './types'
import { useSortingAndFiltering } from './useSortingAndFiltering'

interface TestItem extends PracticeItem {
  italian: string
}

describe('useSortingAndFiltering', () => {
  const mockItems: TestItem[] = [
    { id: '1', italian: 'casa', translation: 'House' },
    { id: '2', italian: 'libro', translation: 'Book' },
    { id: '3', italian: 'albero', translation: 'Tree' },
    { id: '4', italian: 'gatto', translation: 'Cat' },
    { id: '5', italian: 'cane', translation: 'Dog' },
  ]

  const mockStatisticsData: Record<string, Statistics> = {
    '1': { correct: 5, wrong: 1 },
    '2': { correct: 2, wrong: 3 },
    '3': { correct: 0, wrong: 0 },
    '4': { correct: 10, wrong: 2 },
    '5': { correct: 1, wrong: 5 },
  }

  const mockGetStatistics = (itemId: string): Statistics => {
    return mockStatisticsData[itemId] || { correct: 0, wrong: 0 }
  }

  const mockRefetchStatistics = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(Date, 'now').mockReturnValue(1000)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
        })
      )

      expect(result.current.sortOption).toBe('none')
      expect(result.current.displayCount).toBe(10)
      expect(result.current.shouldShowRefreshButton).toBe(false)
    })

    it('should return all items when no sorting or filtering applied', () => {
      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
        })
      )

      expect(result.current.filteredAndSortedItems).toHaveLength(5)
      expect(result.current.filteredAndSortedItems).toEqual(mockItems)
    })

    it('should build statistics map for all items', () => {
      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
        })
      )

      expect(result.current.statisticsMap.get('1')).toEqual({
        correct: 5,
        wrong: 1,
      })
      expect(result.current.statisticsMap.get('2')).toEqual({
        correct: 2,
        wrong: 3,
      })
      expect(result.current.statisticsMap.get('3')).toEqual({
        correct: 0,
        wrong: 0,
      })
      expect(result.current.statisticsMap.size).toBe(5)
    })

    it('should handle empty items array', () => {
      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: [],
          getStatistics: mockGetStatistics,
        })
      )

      expect(result.current.filteredAndSortedItems).toHaveLength(0)
      expect(result.current.statisticsMap.size).toBe(0)
    })
  })

  describe('sorting - none', () => {
    it('should maintain original order with no sorting', () => {
      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
        })
      )

      expect(result.current.filteredAndSortedItems[0]?.id).toBe('1')
      expect(result.current.filteredAndSortedItems[4]?.id).toBe('5')
    })
  })

  describe('sorting - alphabetical', () => {
    it('should sort items alphabetically by translation', () => {
      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
        })
      )

      act(() => {
        result.current.handleSortChange('alphabetical')
      })

      // Book, Cat, Dog, House, Tree
      expect(result.current.filteredAndSortedItems[0]?.translation).toBe('Book')
      expect(result.current.filteredAndSortedItems[1]?.translation).toBe('Cat')
      expect(result.current.filteredAndSortedItems[2]?.translation).toBe('Dog')
      expect(result.current.filteredAndSortedItems[3]?.translation).toBe(
        'House'
      )
      expect(result.current.filteredAndSortedItems[4]?.translation).toBe('Tree')
    })

    it('should handle items with same starting letter', () => {
      const itemsWithSameStart: TestItem[] = [
        { id: '1', italian: 'cane', translation: 'Dog' },
        { id: '2', italian: 'dado', translation: 'Dice' },
        { id: '3', italian: 'dente', translation: 'Dental' },
      ]

      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: itemsWithSameStart,
          getStatistics: mockGetStatistics,
        })
      )

      act(() => {
        result.current.handleSortChange('alphabetical')
      })

      expect(result.current.filteredAndSortedItems[0]?.translation).toBe(
        'Dental'
      )
      expect(result.current.filteredAndSortedItems[1]?.translation).toBe('Dice')
      expect(result.current.filteredAndSortedItems[2]?.translation).toBe('Dog')
    })
  })

  describe('sorting - random', () => {
    it('should shuffle items when random sort is selected', () => {
      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
        })
      )

      act(() => {
        result.current.handleSortChange('random')
      })

      // All items should still be present
      expect(result.current.filteredAndSortedItems).toHaveLength(5)
      mockItems.forEach((item) => {
        expect(
          result.current.filteredAndSortedItems.some((i) => i.id === item.id)
        ).toBe(true)
      })
    })

    it('should produce different order with different seeds', () => {
      jest.spyOn(Date, 'now').mockReturnValue(1000)
      const { result: result1 } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
        })
      )

      act(() => {
        result1.current.handleSortChange('random')
      })

      const order1 = result1.current.filteredAndSortedItems.map((i) => i.id)

      jest.spyOn(Date, 'now').mockReturnValue(9999999)
      const { result: result2 } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
        })
      )

      act(() => {
        result2.current.handleSortChange('random')
      })

      const order2 = result2.current.filteredAndSortedItems.map((i) => i.id)

      // Different seeds should (very likely) produce different orders
      // Note: there's a tiny chance they could be the same, but extremely unlikely
      expect(order1.join(',')).not.toBe(order2.join(','))
    })

    it('should produce consistent order with same seed', () => {
      jest.spyOn(Date, 'now').mockReturnValue(12345)

      const { result: result1 } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
        })
      )

      act(() => {
        result1.current.handleSortChange('random')
      })

      const order1 = result1.current.filteredAndSortedItems.map((i) => i.id)

      // Re-render with same seed
      const { result: result2 } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
        })
      )

      act(() => {
        result2.current.handleSortChange('random')
      })

      const order2 = result2.current.filteredAndSortedItems.map((i) => i.id)

      expect(order1).toEqual(order2)
    })

    it('should update seed when selecting random sort', () => {
      jest.spyOn(Date, 'now').mockReturnValue(5000)
      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
        })
      )

      act(() => {
        result.current.handleSortChange('random')
      })

      // The sort should work without errors
      expect(result.current.sortOption).toBe('random')
      expect(result.current.filteredAndSortedItems).toHaveLength(5)
    })
  })

  describe('sorting - most-errors', () => {
    it('should sort items by most errors first', () => {
      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
        })
      )

      act(() => {
        result.current.handleSortChange('most-errors')
      })

      // Wrong counts: 1:1, 2:3, 3:0, 4:2, 5:5
      // Order should be: 5(5), 2(3), 4(2), 1(1), 3(0)
      expect(result.current.filteredAndSortedItems[0]?.id).toBe('5') // 5 errors
      expect(result.current.filteredAndSortedItems[1]?.id).toBe('2') // 3 errors
      expect(result.current.filteredAndSortedItems[2]?.id).toBe('4') // 2 errors
      expect(result.current.filteredAndSortedItems[3]?.id).toBe('1') // 1 error
      expect(result.current.filteredAndSortedItems[4]?.id).toBe('3') // 0 errors
    })

    it('should handle items with no statistics', () => {
      const getStats = (itemId: string): Statistics => {
        if (itemId === '1') return { correct: 0, wrong: 5 }
        return { correct: 0, wrong: 0 }
      }

      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: getStats,
        })
      )

      act(() => {
        result.current.handleSortChange('most-errors')
      })

      expect(result.current.filteredAndSortedItems[0]?.id).toBe('1')
    })
  })

  describe('sorting - worst-performance', () => {
    it('should sort items by worst performance (errors - correct)', () => {
      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
        })
      )

      act(() => {
        result.current.handleSortChange('worst-performance')
      })

      // Performance (wrong - correct):
      // 1: 1 - 5 = -4
      // 2: 3 - 2 = 1
      // 3: 0 - 0 = 0
      // 4: 2 - 10 = -8
      // 5: 5 - 1 = 4
      // Order should be: 5(4), 2(1), 3(0), 1(-4), 4(-8)
      expect(result.current.filteredAndSortedItems[0]?.id).toBe('5') // +4
      expect(result.current.filteredAndSortedItems[1]?.id).toBe('2') // +1
      expect(result.current.filteredAndSortedItems[2]?.id).toBe('3') // 0
      expect(result.current.filteredAndSortedItems[3]?.id).toBe('1') // -4
      expect(result.current.filteredAndSortedItems[4]?.id).toBe('4') // -8
    })
  })

  describe('display count', () => {
    it('should limit results to display count', () => {
      const manyItems: TestItem[] = Array.from({ length: 25 }, (_, i) => ({
        id: String(i + 1),
        italian: `word${i}`,
        translation: `Word ${i}`,
      }))

      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: manyItems,
          getStatistics: mockGetStatistics,
        })
      )

      // Default is 10
      expect(result.current.filteredAndSortedItems).toHaveLength(10)
    })

    it('should update display count', () => {
      const manyItems: TestItem[] = Array.from({ length: 25 }, (_, i) => ({
        id: String(i + 1),
        italian: `word${i}`,
        translation: `Word ${i}`,
      }))

      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: manyItems,
          getStatistics: mockGetStatistics,
        })
      )

      act(() => {
        result.current.setDisplayCount(20)
      })
      expect(result.current.filteredAndSortedItems).toHaveLength(20)
      expect(result.current.displayCount).toBe(20)
    })

    it('should show all items when display count is "all"', () => {
      const manyItems: TestItem[] = Array.from({ length: 25 }, (_, i) => ({
        id: String(i + 1),
        italian: `word${i}`,
        translation: `Word ${i}`,
      }))

      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: manyItems,
          getStatistics: mockGetStatistics,
        })
      )

      act(() => {
        result.current.setDisplayCount('all')
      })
      expect(result.current.filteredAndSortedItems).toHaveLength(25)
    })

    it('should return all items if count exceeds total', () => {
      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
        })
      )

      act(() => {
        result.current.setDisplayCount(30)
      })
      // Only 5 items exist
      expect(result.current.filteredAndSortedItems).toHaveLength(5)
    })

    it('should apply display count after sorting', () => {
      const manyItems: TestItem[] = Array.from({ length: 25 }, (_, i) => ({
        id: String(i + 1),
        italian: `word${i}`,
        translation: `Word ${String.fromCharCode(90 - i)}`, // Z, Y, X, ...
      }))

      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: manyItems,
          getStatistics: mockGetStatistics,
        })
      )

      act(() => {
        result.current.handleSortChange('alphabetical')
      })

      // Should get first 10 alphabetically
      expect(result.current.filteredAndSortedItems).toHaveLength(10)
      expect(result.current.filteredAndSortedItems[0]?.translation).toBe(
        'Word B'
      )
    })
  })

  describe('filtering', () => {
    it('should apply custom filter function', () => {
      const filterFn = (item: TestItem) => item.translation.length <= 4

      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
          filterFn,
        })
      )

      // Cat (3), Dog (3), Book (4), Tree (4) pass; House (5) fails
      expect(result.current.filteredAndSortedItems).toHaveLength(4)
      expect(
        result.current.filteredAndSortedItems.find(
          (i) => i.translation === 'House'
        )
      ).toBeUndefined()
    })

    it('should apply filter before sorting', () => {
      const filterFn = (item: TestItem) => item.id !== '3'

      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
          filterFn,
        })
      )

      act(() => {
        result.current.handleSortChange('alphabetical')
      })

      expect(result.current.filteredAndSortedItems).toHaveLength(4)
      expect(
        result.current.filteredAndSortedItems.find((i) => i.id === '3')
      ).toBeUndefined()
      // First alphabetically among remaining: Book
      expect(result.current.filteredAndSortedItems[0]?.translation).toBe('Book')
    })

    it('should apply filter before display count', () => {
      const manyItems: TestItem[] = Array.from({ length: 25 }, (_, i) => ({
        id: String(i + 1),
        italian: `word${i}`,
        translation: `Word ${i}`,
      }))

      // Only keep items with id > 20
      const filterFn = (item: TestItem) => parseInt(item.id) > 20

      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: manyItems,
          getStatistics: mockGetStatistics,
          filterFn,
        })
      )

      // Only 5 items pass filter, display count is 10
      expect(result.current.filteredAndSortedItems).toHaveLength(5)
    })
  })

  describe('handleSortChange', () => {
    it('should update sort option', () => {
      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
        })
      )

      act(() => {
        result.current.handleSortChange('alphabetical')
      })
      expect(result.current.sortOption).toBe('alphabetical')

      act(() => {
        result.current.handleSortChange('most-errors')
      })
      expect(result.current.sortOption).toBe('most-errors')
    })

    it('should set random seed when changing to random', () => {
      jest.spyOn(Date, 'now').mockReturnValue(12345)

      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
        })
      )

      act(() => {
        result.current.handleSortChange('random')
      })

      expect(result.current.sortOption).toBe('random')
      // Verify shuffle happened (items should all be present)
      expect(result.current.filteredAndSortedItems).toHaveLength(5)
    })

    it('should not update seed when changing to non-random sort', () => {
      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
        })
      )

      act(() => {
        result.current.handleSortChange('alphabetical')
      })

      // Items should be in alphabetical order, not shuffled
      expect(result.current.filteredAndSortedItems[0]?.translation).toBe('Book')
    })
  })

  describe('handleRefresh', () => {
    it('should update random seed when refreshing with random sort', () => {
      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
        })
      )

      act(() => {
        result.current.handleSortChange('random')
      })

      const orderBefore = result.current.filteredAndSortedItems.map((i) => i.id)

      jest.spyOn(Date, 'now').mockReturnValue(99999)
      act(() => {
        result.current.handleRefresh()
      })

      const orderAfter = result.current.filteredAndSortedItems.map((i) => i.id)

      // Order should change (very likely with different seed)
      expect(orderBefore.join(',')).not.toBe(orderAfter.join(','))
    })

    it('should call refetchStatistics when refreshing with most-errors sort', () => {
      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
          refetchStatistics: mockRefetchStatistics,
        })
      )

      act(() => {
        result.current.handleSortChange('most-errors')
      })

      act(() => {
        result.current.handleRefresh()
      })

      expect(mockRefetchStatistics).toHaveBeenCalledTimes(1)
    })

    it('should call refetchStatistics when refreshing with worst-performance sort', () => {
      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
          refetchStatistics: mockRefetchStatistics,
        })
      )

      act(() => {
        result.current.handleSortChange('worst-performance')
      })

      act(() => {
        result.current.handleRefresh()
      })

      expect(mockRefetchStatistics).toHaveBeenCalledTimes(1)
    })

    it('should call refetchStatistics when refreshing with alphabetical sort to update filter', () => {
      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
          refetchStatistics: mockRefetchStatistics,
        })
      )

      act(() => {
        result.current.handleSortChange('alphabetical')
      })

      mockRefetchStatistics.mockClear()

      act(() => {
        result.current.handleRefresh()
      })

      // Refresh always calls refetchStatistics to update filter snapshot
      expect(mockRefetchStatistics).toHaveBeenCalledTimes(1)
    })

    it('should call refetchStatistics when refreshing with none sort to update filter', () => {
      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
          refetchStatistics: mockRefetchStatistics,
        })
      )

      mockRefetchStatistics.mockClear()

      act(() => {
        result.current.handleRefresh()
      })

      // Refresh always calls refetchStatistics to update filter snapshot
      expect(mockRefetchStatistics).toHaveBeenCalledTimes(1)
    })

    it('should not throw if refetchStatistics is not provided', () => {
      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
        })
      )

      act(() => {
        result.current.handleSortChange('most-errors')
      })

      expect(() => {
        act(() => {
          result.current.handleRefresh()
        })
      }).not.toThrow()
    })
  })

  describe('shouldShowRefreshButton', () => {
    it('should be false for none sort', () => {
      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
        })
      )

      expect(result.current.shouldShowRefreshButton).toBe(false)
    })

    it('should be false for alphabetical sort', () => {
      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
        })
      )

      act(() => {
        result.current.handleSortChange('alphabetical')
      })

      expect(result.current.shouldShowRefreshButton).toBe(false)
    })

    it('should be true for random sort', () => {
      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
        })
      )

      act(() => {
        result.current.handleSortChange('random')
      })

      expect(result.current.shouldShowRefreshButton).toBe(true)
    })

    it('should be true for most-errors sort', () => {
      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
        })
      )

      act(() => {
        result.current.handleSortChange('most-errors')
      })

      expect(result.current.shouldShowRefreshButton).toBe(true)
    })

    it('should be true for worst-performance sort', () => {
      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
        })
      )

      act(() => {
        result.current.handleSortChange('worst-performance')
      })

      expect(result.current.shouldShowRefreshButton).toBe(true)
    })
  })

  describe('memoization', () => {
    it('should recalculate statistics map when items change', () => {
      const { result, rerender } = renderHook(
        ({ items }) =>
          useSortingAndFiltering({
            items,
            getStatistics: mockGetStatistics,
          }),
        { initialProps: { items: mockItems } }
      )

      expect(result.current.statisticsMap.size).toBe(5)

      const newItems = mockItems.slice(0, 2)
      rerender({ items: newItems })

      expect(result.current.statisticsMap.size).toBe(2)
    })

    it('should recalculate statistics map when getStatistics changes', () => {
      const getStats1 = () => ({ correct: 1, wrong: 1 })
      const getStats2 = () => ({ correct: 2, wrong: 2 })

      const { result, rerender } = renderHook(
        ({ getStatistics }) =>
          useSortingAndFiltering({
            items: mockItems,
            getStatistics,
          }),
        { initialProps: { getStatistics: getStats1 } }
      )

      expect(result.current.statisticsMap.get('1')).toEqual({
        correct: 1,
        wrong: 1,
      })

      rerender({ getStatistics: getStats2 })

      expect(result.current.statisticsMap.get('1')).toEqual({
        correct: 2,
        wrong: 2,
      })
    })
  })

  describe('edge cases', () => {
    it('should handle single item', () => {
      const singleItem: TestItem[] = [
        { id: '1', italian: 'casa', translation: 'House' },
      ]

      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: singleItem,
          getStatistics: mockGetStatistics,
        })
      )

      expect(result.current.filteredAndSortedItems).toHaveLength(1)

      act(() => {
        result.current.handleSortChange('random')
      })
      expect(result.current.filteredAndSortedItems).toHaveLength(1)
      expect(result.current.filteredAndSortedItems[0]?.id).toBe('1')
    })

    it('should handle items with missing statistics gracefully', () => {
      const getStats = (): Statistics => {
        // Return default for all - simulating missing data
        return { correct: 0, wrong: 0 }
      }

      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: getStats,
        })
      )

      act(() => {
        result.current.handleSortChange('most-errors')
      })

      // Should not throw and should return all items
      expect(result.current.filteredAndSortedItems).toHaveLength(5)
    })

    it('should preserve item reference identity when not sorting', () => {
      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
        })
      )

      // When not sorting/filtering, items should be a new array but same object references
      expect(result.current.filteredAndSortedItems[0]).toBe(mockItems[0])
    })

    it('should handle filter that removes all items', () => {
      const filterFn = () => false

      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: mockItems,
          getStatistics: mockGetStatistics,
          filterFn,
        })
      )

      expect(result.current.filteredAndSortedItems).toHaveLength(0)
    })

    it('should combine filter, sort, and display count correctly', () => {
      const manyItems: TestItem[] = Array.from({ length: 30 }, (_, i) => ({
        id: String(i + 1),
        italian: `word${i}`,
        translation: `Word ${String.fromCharCode(65 + (i % 26))}${i}`, // A0, B1, C2, ...
      }))

      // Only keep even IDs
      const filterFn = (item: TestItem) => parseInt(item.id) % 2 === 0

      const { result } = renderHook(() =>
        useSortingAndFiltering({
          items: manyItems,
          getStatistics: mockGetStatistics,
          filterFn,
        })
      )

      // 15 even items, display count 10
      expect(result.current.filteredAndSortedItems).toHaveLength(10)

      act(() => {
        result.current.handleSortChange('alphabetical')
        result.current.setDisplayCount(5)
      })

      expect(result.current.filteredAndSortedItems).toHaveLength(5)
    })
  })
})
