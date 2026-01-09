import { useState, useCallback } from 'react'

import { ResetDialogState } from './types'

interface UseResetDialogOptions<TItem> {
  /** Function to get the item label (e.g., translation) for display */
  getItemLabel: (item: TItem) => string
  /** Function to reset the statistic */
  resetStatistic: (itemId: string) => Promise<unknown>
  /** Optional callback after successful reset */
  onResetSuccess?: () => void
}

/**
 * Generic hook for managing reset dialog state and actions
 */
export function useResetDialog<TItem extends { id: string }>({
  getItemLabel,
  resetStatistic,
  onResetSuccess,
}: UseResetDialogOptions<TItem>) {
  const [resetDialog, setResetDialog] = useState<ResetDialogState>({
    open: false,
    itemId: null,
    itemLabel: null,
    error: null,
  })
  const [isResetting, setIsResetting] = useState(false)

  const handleOpenResetDialog = useCallback(
    (item: TItem) => {
      setResetDialog({
        open: true,
        itemId: item.id,
        itemLabel: getItemLabel(item),
        error: null,
      })
    },
    [getItemLabel]
  )

  const handleCloseResetDialog = useCallback(() => {
    setResetDialog({
      open: false,
      itemId: null,
      itemLabel: null,
      error: null,
    })
  }, [])

  const handleConfirmReset = useCallback(async () => {
    if (!resetDialog.itemId) return

    setIsResetting(true)
    try {
      await resetStatistic(resetDialog.itemId)
      handleCloseResetDialog()
      onResetSuccess?.()
    } catch (err) {
      console.error('Failed to reset statistics:', err)
      setResetDialog((prev) => ({
        ...prev,
        error: 'Failed to reset statistics. Please try again.',
      }))
    } finally {
      setIsResetting(false)
    }
  }, [
    resetDialog.itemId,
    resetStatistic,
    handleCloseResetDialog,
    onResetSuccess,
  ])

  return {
    resetDialog,
    isResetting,
    handleOpenResetDialog,
    handleCloseResetDialog,
    handleConfirmReset,
  }
}
