'use client'
import { ReactNode } from 'react'

import { Warning } from '@mui/icons-material'
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  Stack,
  Typography,
} from '@mui/material'

export interface ConflictResolutions {
  [key: string]: 'keep' | 'replace'
}

interface ConflictResolutionDialogProps<T> {
  open: boolean
  onClose: () => void
  conflicts: T[]
  resolutions: ConflictResolutions
  onResolve: (key: string, action: 'keep' | 'replace') => void
  onContinue: () => void
  entityName: string
  getConflictKey: (conflict: T) => string
  renderConflictTitle: (conflict: T) => ReactNode
  renderExistingData: (conflict: T) => ReactNode
  renderNewData: (conflict: T) => ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function ConflictResolutionDialog<T>({
  open,
  onClose,
  conflicts,
  resolutions,
  onResolve,
  onContinue,
  entityName,
  getConflictKey,
  renderConflictTitle,
  renderExistingData,
  renderNewData,
  maxWidth = 'md',
}: ConflictResolutionDialogProps<T>) {
  const allResolved = Object.keys(resolutions).length === conflicts.length

  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Warning color="warning" />
          Resolve Conflicts ({conflicts.length} {entityName}
          {conflicts.length !== 1 ? 's' : ''})
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          The following {entityName}s already exist in the database. Choose
          whether to keep the existing data or replace it with the new data.
        </Typography>

        {conflicts.map((conflict) => {
          const key = getConflictKey(conflict)
          return (
            <Paper key={key} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                {renderConflictTitle(conflict)}
              </Typography>

              <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
                <Box flex={1}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Existing Data
                  </Typography>
                  {renderExistingData(conflict)}
                </Box>

                <Box flex={1}>
                  <Typography
                    variant="subtitle2"
                    color="secondary"
                    gutterBottom
                  >
                    New Data
                  </Typography>
                  {renderNewData(conflict)}
                </Box>
              </Stack>

              <Stack direction="row" spacing={2}>
                <Button
                  size="small"
                  variant={
                    resolutions[key] === 'keep' ? 'contained' : 'outlined'
                  }
                  onClick={() => onResolve(key, 'keep')}
                >
                  Keep Existing
                </Button>
                <Button
                  size="small"
                  variant={
                    resolutions[key] === 'replace' ? 'contained' : 'outlined'
                  }
                  color="secondary"
                  onClick={() => onResolve(key, 'replace')}
                >
                  Replace with New
                </Button>
              </Stack>
            </Paper>
          )
        })}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onContinue}
          variant="contained"
          disabled={!allResolved}
        >
          Continue Import
        </Button>
      </DialogActions>
    </Dialog>
  )
}
