import React from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
} from '@mui/material'

interface ResetStatisticsDialogProps {
  open: boolean
  verbName: string | null
  isResetting: boolean
  error?: string | null
  onClose: () => void
  onConfirm: () => void
}

export const ResetStatisticsDialog: React.FC<ResetStatisticsDialogProps> = ({
  open,
  verbName,
  isResetting,
  error,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="reset-dialog-title"
      aria-describedby="reset-dialog-description"
    >
      <DialogTitle id="reset-dialog-title">Reset Statistics</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <DialogContentText id="reset-dialog-description">
          Are you sure you want to reset all conjugation statistics for the verb
          &quot;
          {verbName}&quot;? This action cannot be undone.
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
