import React from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material'

interface ResetStatisticsDialogProps {
  open: boolean
  nounTranslation: string | null
  isResetting: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function ResetStatisticsDialog({
  open,
  nounTranslation,
  isResetting,
  onClose,
  onConfirm,
}: ResetStatisticsDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="reset-dialog-title"
      aria-describedby="reset-dialog-description"
    >
      <DialogTitle id="reset-dialog-title">Reset Statistics</DialogTitle>
      <DialogContent>
        <DialogContentText id="reset-dialog-description">
          Are you sure you want to reset all statistics for the noun &quot;
          {nounTranslation}&quot;? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isResetting}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={isResetting}
          autoFocus
        >
          {isResetting ? 'Resetting...' : 'Reset'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
