'use client'
import { Info } from '@mui/icons-material'
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  Typography,
} from '@mui/material'

interface FormatInfoDialogProps {
  open: boolean
  onClose: () => void
  title?: string
  description: string
  formatExample: string
}

export default function FormatInfoDialog({
  open,
  onClose,
  title = 'JSON Format Information',
  description,
  formatExample,
}: FormatInfoDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Info color="primary" />
          {title}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
        <Paper sx={{ p: 2, backgroundColor: 'grey.100' }}>
          <Typography
            variant="body2"
            component="pre"
            sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
          >
            {formatExample}
          </Typography>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
