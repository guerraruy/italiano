import { useState, useRef, useCallback, useMemo, useTransition } from 'react'

import {
  useGetAdjectivesForPracticeQuery,
  useGetAdjectiveStatisticsQuery,
  useResetAdjectiveStatisticMutation,
  useUpdateAdjectiveStatisticMutation,
} from '@/app/store/api'

import { SortOption, DisplayCount } from '../components/AdjectiveItem/internals'
import { InputValues, ResetDialogState, ValidationState } from '../types'
import { validateAnswer } from '../utils'

export const useAdjectivesPractice = () => {
  const { data, isLoading, error } = useGetAdjectivesForPracticeQuery()
  const { data: statisticsData, refetch: refetchStatistics } =
    useGetAdjectiveStatisticsQuery(undefined, {
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
    })
  const [updateAdjectiveStatistic] = useUpdateAdjectiveStatisticMutation()
  const [resetAdjectiveStatistic, { isLoading: isResetting }] =
    useResetAdjectiveStatisticMutation()

  const [inputValues, setInputValues] = useState<InputValues>({})
  const [validationState, setValidationState] = useState<ValidationState>({})
  const [resetDialog, setResetDialog] = useState<ResetDialogState>({
    open: false,
    adjectiveId: null,
    adjectiveTranslation: null,
  })
  const [sortOption, setSortOption] = useState<SortOption>('none')
  const [displayCount, setDisplayCount] = useState<DisplayCount>(10)
  const [randomSeed, setRandomSeed] = useState(0)
  const [, startTransition] = useTransition()

  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
  const lastValidatedRef = useRef<{ [key: string]: number }>({})

  const handleInputChange = useCallback(
    (adjectiveId: string, field: keyof InputValues[string], value: string) => {
      setInputValues((prev) => ({
        ...prev,
        [adjectiveId]: {
          ...(prev[adjectiveId] || {
            masculineSingular: '',
            masculinePlural: '',
            feminineSingular: '',
            femininePlural: '',
          }),
          [field]: value,
        },
      }))
      // Clear validation visual feedback when user starts typing again
      setValidationState((prev) => {
        if (!prev[adjectiveId]) return prev
        return {
          ...prev,
          [adjectiveId]: {
            ...prev[adjectiveId],
            [field]: null,
          },
        }
      })
    },
    []
  )

  const handleValidation = useCallback(
    (
      adjectiveId: string,
      field: keyof InputValues[string],
      correctAnswer: string
    ) => {
      const userInput = inputValues[adjectiveId]?.[field] || ''
      if (!userInput.trim()) return

      // Prevent duplicate validation within 100ms
      const now = Date.now()
      const key = `${adjectiveId}-${field}`
      const lastValidated = lastValidatedRef.current[key] || 0
      if (now - lastValidated < 100) {
        return
      }
      lastValidatedRef.current[key] = now

      const isCorrect = validateAnswer(userInput, correctAnswer)

      // Use startTransition to defer non-urgent state updates
      startTransition(() => {
        setValidationState((prev) => ({
          ...prev,
          [adjectiveId]: {
            ...(prev[adjectiveId] || {
              masculineSingular: null,
              masculinePlural: null,
              feminineSingular: null,
              femininePlural: null,
            }),
            [field]: isCorrect ? 'correct' : 'incorrect',
          },
        }))
      })

      // Check if all fields are validated
      const currentState = validationState[adjectiveId] || {
        masculineSingular: null,
        masculinePlural: null,
        feminineSingular: null,
        femininePlural: null,
      }
      const updatedState = {
        ...currentState,
        [field]: isCorrect ? 'correct' : 'incorrect',
      }

      // Check if all fields are filled and validated
      const allFields: (keyof InputValues[string])[] = [
        'masculineSingular',
        'masculinePlural',
        'feminineSingular',
        'femininePlural',
      ]
      const allFilled = allFields.every((f) =>
        f === field ? userInput.trim() : inputValues[adjectiveId]?.[f]?.trim()
      )
      const allValidated = allFields.every((f) =>
        f === field ? (isCorrect ? 'correct' : 'incorrect') : updatedState[f]
      )

      // Only save statistics if all fields are validated
      if (allFilled && allValidated) {
        const allCorrect = allFields.every((f) =>
          f === field ? isCorrect : updatedState[f] === 'correct'
        )

        // Save statistics to backend asynchronously (fire and forget)
        updateAdjectiveStatistic({ adjectiveId, correct: allCorrect }).catch(
          (error) => {
            console.error('Failed to update statistics:', error)
          }
        )
      }
    },
    [inputValues, validationState, updateAdjectiveStatistic, startTransition]
  )

  const handleClearInput = useCallback(
    (adjectiveId: string, field?: keyof InputValues[string]) => {
      if (field) {
        // Clear specific field
        setInputValues((prev) => ({
          ...prev,
          [adjectiveId]: {
            ...(prev[adjectiveId] || {
              masculineSingular: '',
              masculinePlural: '',
              feminineSingular: '',
              femininePlural: '',
            }),
            [field]: '',
          },
        }))
        setValidationState((prev) => ({
          ...prev,
          [adjectiveId]: {
            ...(prev[adjectiveId] || {
              masculineSingular: null,
              masculinePlural: null,
              feminineSingular: null,
              femininePlural: null,
            }),
            [field]: null,
          },
        }))
        // Focus the input
        setTimeout(() => {
          const input = inputRefs.current[`${adjectiveId}-${field}`]
          if (input) {
            input.focus()
          }
        }, 0)
      } else {
        // Clear all fields
        setInputValues((prev) => ({
          ...prev,
          [adjectiveId]: {
            masculineSingular: '',
            masculinePlural: '',
            feminineSingular: '',
            femininePlural: '',
          },
        }))
        setValidationState((prev) => ({
          ...prev,
          [adjectiveId]: {
            masculineSingular: null,
            masculinePlural: null,
            feminineSingular: null,
            femininePlural: null,
          },
        }))
      }
    },
    []
  )

  const handleShowAnswer = useCallback(
    (adjectiveId: string) => {
      const adjective = data?.adjectives.find((a) => a.id === adjectiveId)
      if (adjective) {
        setInputValues((prev) => ({
          ...prev,
          [adjectiveId]: {
            masculineSingular: adjective.masculineSingular || '',
            masculinePlural: adjective.masculinePlural || '',
            feminineSingular: adjective.feminineSingular || '',
            femininePlural: adjective.femininePlural || '',
          },
        }))
        setValidationState((prev) => ({
          ...prev,
          [adjectiveId]: {
            masculineSingular: 'correct',
            masculinePlural: 'correct',
            feminineSingular: 'correct',
            femininePlural: 'correct',
          },
        }))
      }
    },
    [data?.adjectives]
  )

  const handleOpenResetDialog = useCallback(
    (adjectiveId: string) => {
      const adjective = data?.adjectives.find((a) => a.id === adjectiveId)
      if (adjective) {
        setResetDialog({
          open: true,
          adjectiveId,
          adjectiveTranslation: adjective.translation,
        })
      }
    },
    [data?.adjectives]
  )

  const handleCloseResetDialog = useCallback(() => {
    setResetDialog({
      open: false,
      adjectiveId: null,
      adjectiveTranslation: null,
    })
  }, [])

  const handleConfirmReset = useCallback(async () => {
    if (!resetDialog.adjectiveId) return

    try {
      await resetAdjectiveStatistic(resetDialog.adjectiveId).unwrap()
      handleCloseResetDialog()
    } catch (error) {
      console.error('Failed to reset statistics:', error)
    }
  }, [resetDialog.adjectiveId, resetAdjectiveStatistic, handleCloseResetDialog])

  // Memoize adjectives array to prevent unnecessary re-renders
  const adjectives = useMemo(() => data?.adjectives || [], [data?.adjectives])

  // Pre-calculate all statistics once to avoid repeated calls during sorting
  const statisticsMap = useMemo(() => {
    const map = new Map<string, { correct: number; wrong: number }>()
    adjectives.forEach((adj) => {
      const stats = statisticsData?.statistics[adj.id]
      map.set(adj.id, {
        correct: stats?.correctAttempts || 0,
        wrong: stats?.wrongAttempts || 0,
      })
    })
    return map
  }, [adjectives, statisticsData?.statistics])

  const getStatistics = useCallback(
    (adjectiveId: string) => {
      return statisticsMap.get(adjectiveId) || { correct: 0, wrong: 0 }
    },
    [statisticsMap]
  )

  // Apply filters, sorting, and limit
  const filteredAndSortedAdjectives = useMemo(() => {
    let result = [...adjectives]

    // Apply sorting
    if (sortOption === 'alphabetical') {
      result.sort((a, b) => a.translation.localeCompare(b.translation))
    } else if (sortOption === 'random') {
      // Use Fisher-Yates shuffle with a seeded random
      const shuffled = [...result]
      let seed = randomSeed
      const seededRandom = () => {
        seed = (seed * 9301 + 49297) % 233280
        return seed / 233280
      }
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom() * (i + 1))
        const iItem = shuffled[i]
        const jItem = shuffled[j]
        if (iItem !== undefined && jItem !== undefined) {
          ;[shuffled[i], shuffled[j]] = [jItem, iItem]
        }
      }
      result = shuffled
    } else if (
      sortOption === 'most-errors' ||
      sortOption === 'worst-performance'
    ) {
      result.sort((a, b) => {
        const statsA = statisticsMap.get(a.id) || { correct: 0, wrong: 0 }
        const statsB = statisticsMap.get(b.id) || { correct: 0, wrong: 0 }

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
  }, [adjectives, sortOption, displayCount, statisticsMap, randomSeed])

  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent,
      adjectiveId: string,
      field: keyof InputValues[string],
      currentIndex: number
    ) => {
      if (e.key === 'Enter') {
        e.preventDefault()

        const adjective = filteredAndSortedAdjectives[currentIndex]
        if (!adjective) return

        const correctAnswers = {
          masculineSingular: adjective.masculineSingular,
          masculinePlural: adjective.masculinePlural,
          feminineSingular: adjective.feminineSingular,
          femininePlural: adjective.femininePlural,
        }

        handleValidation(adjectiveId, field, correctAnswers[field])

        // Move to next field or next adjective
        const fields: (keyof InputValues[string])[] = [
          'masculineSingular',
          'masculinePlural',
          'feminineSingular',
          'femininePlural',
        ]
        const currentFieldIndex = fields.indexOf(field)

        if (currentFieldIndex < fields.length - 1) {
          // Move to next field
          const nextField = fields[currentFieldIndex + 1]
          const nextInput = inputRefs.current[`${adjectiveId}-${nextField}`]
          if (nextInput) {
            nextInput.focus()
          }
        } else if (currentIndex < filteredAndSortedAdjectives.length - 1) {
          // Move to first field of next adjective
          const nextAdjective = filteredAndSortedAdjectives[currentIndex + 1]
          if (nextAdjective) {
            const nextInput =
              inputRefs.current[`${nextAdjective.id}-masculineSingular`]
            if (nextInput) {
              nextInput.focus()
            }
          }
        }
      }
    },
    [filteredAndSortedAdjectives, handleValidation]
  )

  const handleRefresh = useCallback(() => {
    if (sortOption === 'random') {
      // Update random seed to reshuffle
      setRandomSeed(Date.now())
    } else if (
      sortOption === 'most-errors' ||
      sortOption === 'worst-performance'
    ) {
      // Refetch statistics to get latest data
      refetchStatistics()
    }
  }, [sortOption, refetchStatistics])

  const handleSortChange = useCallback((newSort: SortOption) => {
    setSortOption(newSort)
    if (newSort === 'random') {
      setRandomSeed(Date.now())
    }
  }, [])

  const shouldShowRefreshButton =
    sortOption === 'random' ||
    sortOption === 'most-errors' ||
    sortOption === 'worst-performance'

  return {
    // Data
    isLoading,
    error,
    adjectives,
    filteredAndSortedAdjectives,

    // State
    inputValues,
    validationState,
    sortOption,
    displayCount,
    resetDialog,
    isResetting,

    // Refs
    inputRefs,

    // Handlers
    handleInputChange,
    handleValidation,
    handleClearInput,
    handleShowAnswer,
    handleOpenResetDialog,
    handleCloseResetDialog,
    handleConfirmReset,
    handleKeyDown,
    handleRefresh,
    handleSortChange,
    setDisplayCount,

    // Computed
    getStatistics,
    shouldShowRefreshButton,
  }
}
