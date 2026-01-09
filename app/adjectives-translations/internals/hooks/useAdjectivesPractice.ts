import { useState, useRef, useCallback, useMemo, useTransition } from 'react'

import {
  useGetAdjectivesForPracticeQuery,
  useGetAdjectiveStatisticsQuery,
  useResetAdjectiveStatisticMutation,
  useUpdateAdjectiveStatisticMutation,
} from '@/app/store/api'
import {
  useStatisticsError,
  useResetDialog,
  useSortingAndFiltering,
} from '@/lib/hooks'

import { InputValues, ValidationState } from '../types'
import { validateAnswer } from '../utils'

interface Adjective {
  id: string
  translation: string
  masculineSingular: string
  masculinePlural: string
  feminineSingular: string
  femininePlural: string
}

type AdjectiveField = keyof InputValues[string]

export const useAdjectivesPractice = () => {
  const { data, isLoading, error } = useGetAdjectivesForPracticeQuery()
  const { data: statisticsData, refetch: refetchStatistics } =
    useGetAdjectiveStatisticsQuery(undefined, {
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
    })
  const [updateAdjectiveStatistic] = useUpdateAdjectiveStatisticMutation()
  const [resetAdjectiveStatisticMutation] = useResetAdjectiveStatisticMutation()

  const [inputValues, setInputValues] = useState<InputValues>({})
  const [validationState, setValidationState] = useState<ValidationState>({})
  const [, startTransition] = useTransition()

  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
  const lastValidatedRef = useRef<{ [key: string]: number }>({})

  // Use shared statistics error hook
  const { statisticsError, showError } = useStatisticsError()

  // Memoize adjectives array to prevent unnecessary re-renders
  const adjectives = useMemo(() => data?.adjectives || [], [data?.adjectives])

  // Get statistics callback
  const getStatistics = useCallback(
    (adjectiveId: string) => {
      const stats = statisticsData?.statistics[adjectiveId]
      return {
        correct: stats?.correctAttempts || 0,
        wrong: stats?.wrongAttempts || 0,
      }
    },
    [statisticsData?.statistics]
  )

  // Use shared reset dialog hook
  const resetStatistic = useCallback(
    async (adjectiveId: string) => {
      await resetAdjectiveStatisticMutation(adjectiveId).unwrap()
    },
    [resetAdjectiveStatisticMutation]
  )

  const {
    resetDialog: resetDialogState,
    isResetting,
    handleOpenResetDialog: openResetDialog,
    handleCloseResetDialog,
    handleConfirmReset,
  } = useResetDialog<Adjective>({
    getItemLabel: (adjective) => adjective.translation,
    resetStatistic,
  })

  // Transform reset dialog state to match expected interface
  const resetDialog = useMemo(
    () => ({
      open: resetDialogState.open,
      adjectiveId: resetDialogState.itemId,
      adjectiveTranslation: resetDialogState.itemLabel,
      error: resetDialogState.error,
    }),
    [resetDialogState]
  )

  // Use shared sorting and filtering hook
  const {
    sortOption,
    displayCount,
    filteredAndSortedItems: filteredAndSortedAdjectives,
    handleRefresh,
    handleSortChange,
    setDisplayCount,
    shouldShowRefreshButton,
  } = useSortingAndFiltering({
    items: adjectives as Adjective[],
    getStatistics,
    refetchStatistics,
  })

  const handleInputChange = useCallback(
    (adjectiveId: string, field: AdjectiveField, value: string) => {
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
    (adjectiveId: string, field: AdjectiveField, correctAnswer: string) => {
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
      const allFields: AdjectiveField[] = [
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

        // Save statistics to backend asynchronously
        updateAdjectiveStatistic({ adjectiveId, correct: allCorrect }).catch(
          (err) => {
            console.error('Failed to update statistics:', err)
            showError(
              'Failed to save statistics. Your progress may not be saved.'
            )
          }
        )
      }
    },
    [inputValues, validationState, updateAdjectiveStatistic, showError]
  )

  const handleClearInput = useCallback(
    (adjectiveId: string, field?: AdjectiveField) => {
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
        openResetDialog(adjective as Adjective)
      }
    },
    [data?.adjectives, openResetDialog]
  )

  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent,
      adjectiveId: string,
      field: AdjectiveField,
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
        const fields: AdjectiveField[] = [
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
    statisticsError,

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
