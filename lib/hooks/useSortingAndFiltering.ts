import { useState, useMemo, useCallback } from 'react'

import { SortOption, DisplayCount, Statistics, PracticeItem } from './types'

interface UseSortingAndFilteringOptions<TItem extends PracticeItem> {
  /** The items to sort and filter */
  items: TItem[]
  /** Function to get statistics for an item */
  getStatistics: (itemId: string) => Statistics
  /** Optional custom filter function */
  filterFn?: (item: TItem) => boolean
  /** Optional function to refetch statistics (called on refresh for error-based sorts) */
  refetchStatistics?: () => void
}

/**
 * Seeded random number generator using linear congruential generator
 */
function seededRandom(seed: number): () => number {
  let currentSeed = seed
  return () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280
    return currentSeed / 233280
  }
}

/**
 * Fisher-Yates shuffle with seeded random
 */
function shuffleWithSeed<T>(array: T[], seed: number): T[] {
  const shuffled = [...array]
  const random = seededRandom(seed)

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const iItem = shuffled[i]
    const jItem = shuffled[j]
    if (iItem !== undefined && jItem !== undefined) {
      ;[shuffled[i], shuffled[j]] = [jItem, iItem]
    }
  }
  return shuffled
}

/**
 * Generic hook for sorting and filtering practice items
 */
export function useSortingAndFiltering<TItem extends PracticeItem>({
  items,
  getStatistics,
  filterFn,
  refetchStatistics,
}: UseSortingAndFilteringOptions<TItem>) {
  const [sortOption, setSortOption] = useState<SortOption>('none')
  const [displayCount, setDisplayCount] = useState<DisplayCount>(10)
  const [randomSeed, setRandomSeed] = useState(0)

  // Pre-calculate all statistics once to avoid repeated calls during sorting
  const statisticsMap = useMemo(() => {
    const map = new Map<string, Statistics>()
    items.forEach((item) => {
      map.set(item.id, getStatistics(item.id))
    })
    return map
  }, [items, getStatistics])

  // Snapshot of statistics used for sorting - only updates on sort change or refresh
  // This prevents reordering while the user is practicing
  const [sortingSnapshot, setSortingSnapshot] = useState<
    Map<string, Statistics>
  >(() => new Map())

  // Snapshot of item IDs that pass the filter - only updates on sort change or refresh
  // This prevents items from disappearing while the user is practicing (e.g., when mastered)
  // Initialize with a "needs initialization" marker (empty set with special handling)
  const [filterSnapshot, setFilterSnapshot] = useState<Set<string>>(
    () => new Set()
  )
  const [filterSnapshotInitialized, setFilterSnapshotInitialized] =
    useState(false)

  // Helper to capture current statistics and filter snapshots
  const captureSnapshot = useCallback(() => {
    const map = new Map<string, Statistics>()
    items.forEach((item) => {
      map.set(item.id, getStatistics(item.id))
    })
    setSortingSnapshot(map)

    // Capture filter snapshot - which items pass the filter right now
    if (filterFn) {
      const passingIds = new Set<string>()
      items.forEach((item) => {
        if (filterFn(item)) {
          passingIds.add(item.id)
        }
      })
      setFilterSnapshot(passingIds)
      setFilterSnapshotInitialized(true)
    }
  }, [items, getStatistics, filterFn])

  // Compute initial filter result (memoized, only recomputes when items change, not filterFn)
  // This provides a stable initial filter before user triggers refresh/sort change
  const initialFilteredIds = useMemo(() => {
    if (filterSnapshotInitialized) return null // Don't compute if we already have a snapshot
    if (!filterFn || items.length === 0) return null
    const passingIds = new Set<string>()
    items.forEach((item) => {
      if (filterFn(item)) {
        passingIds.add(item.id)
      }
    })
    return passingIds
    // Intentionally exclude filterFn from deps to keep initial filter stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, filterSnapshotInitialized])

  // Apply filters, sorting, and limit
  // Uses sortingSnapshot for statistics-based sorts to prevent reordering during practice
  // Uses filterSnapshot to prevent items from disappearing during practice
  const filteredAndSortedItems = useMemo(() => {
    // Apply filtering using snapshot if available
    let result: TItem[]
    if (filterSnapshotInitialized) {
      // Use snapshot from state (set via refresh/sort change)
      result = items.filter((item) => filterSnapshot.has(item.id))
    } else if (initialFilteredIds !== null) {
      // Use stable initial filter (doesn't change when filterFn changes)
      result = items.filter((item) => initialFilteredIds.has(item.id))
    } else if (filterFn) {
      // Fallback: use live filter (only happens briefly before initial filter computes)
      result = items.filter(filterFn)
    } else {
      result = [...items]
    }

    // Apply sorting
    if (sortOption === 'alphabetical') {
      result.sort((a, b) => a.translation.localeCompare(b.translation))
    } else if (sortOption === 'random') {
      result = shuffleWithSeed(result, randomSeed)
    } else if (
      sortOption === 'most-errors' ||
      sortOption === 'worst-performance'
    ) {
      // Use snapshot for stable sorting - prevents reordering while practicing
      result.sort((a, b) => {
        const statsA = sortingSnapshot.get(a.id) || { correct: 0, wrong: 0 }
        const statsB = sortingSnapshot.get(b.id) || { correct: 0, wrong: 0 }

        if (sortOption === 'most-errors') {
          return statsB.wrong - statsA.wrong
        } else {
          // worst-performance: highest (errors - correct) first
          const performanceA = statsA.wrong - statsA.correct
          const performanceB = statsB.wrong - statsB.correct
          return performanceB - performanceA
        }
      })
    }

    // Apply display count limit
    if (displayCount !== 'all') {
      result = result.slice(0, displayCount)
    }

    return result
  }, [
    items,
    filterSnapshot,
    filterSnapshotInitialized,
    initialFilteredIds,
    filterFn,
    sortOption,
    displayCount,
    sortingSnapshot,
    randomSeed,
  ])

  const handleRefresh = useCallback(() => {
    // Always capture snapshot to update filter (e.g., remove newly mastered items)
    captureSnapshot()
    // Also refetch from backend if available
    refetchStatistics?.()

    if (sortOption === 'random') {
      // Update random seed to reshuffle
      setRandomSeed(Date.now())
    }
  }, [sortOption, captureSnapshot, refetchStatistics])

  const handleSortChange = useCallback(
    (newSort: SortOption) => {
      setSortOption(newSort)
      // Always capture snapshot when changing sort to update filter
      captureSnapshot()

      if (newSort === 'random') {
        setRandomSeed(Date.now())
      }
    },
    [captureSnapshot]
  )

  const shouldShowRefreshButton =
    sortOption === 'random' ||
    sortOption === 'most-errors' ||
    sortOption === 'worst-performance'

  return {
    sortOption,
    displayCount,
    filteredAndSortedItems,
    statisticsMap,
    handleRefresh,
    handleSortChange,
    setDisplayCount,
    shouldShowRefreshButton,
  }
}
