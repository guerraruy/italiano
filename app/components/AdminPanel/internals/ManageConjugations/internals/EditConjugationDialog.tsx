'use client'
import { useState } from 'react'
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  TextField,
} from '@mui/material'
import { Info } from '@mui/icons-material'
import {
  useUpdateConjugationMutation,
  type VerbConjugation,
  type ConjugationData,
} from '../../../../../store/api'

interface EditConjugationDialogProps {
  open: boolean
  conjugation: VerbConjugation | null
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

interface EditFormContentProps {
  conjugation: VerbConjugation
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

function EditFormContent({
  conjugation,
  onClose,
  onSuccess,
  onError,
}: EditFormContentProps) {
  const [updateConjugation, { isLoading: updatingConjugation }] =
    useUpdateConjugationMutation()

  const [jsonContent, setJsonContent] = useState(
    JSON.stringify(conjugation.conjugation, null, 2)
  )
  const [jsonError, setJsonError] = useState<string | null>(null)

  const handleUpdateConjugation = async () => {
    try {
      // Validate JSON
      let parsedConjugation: ConjugationData
      try {
        parsedConjugation = JSON.parse(jsonContent)
      } catch (err) {
        setJsonError('Invalid JSON format. Please check your syntax.')
        return
      }

      const result = await updateConjugation({
        conjugationId: conjugation.id,
        conjugation: parsedConjugation,
      }).unwrap()

      onSuccess(result.message)
      onClose()
    } catch (err: unknown) {
      const error = err as { data?: { error?: string } }
      onError(error?.data?.error || 'Error updating conjugation')
    }
  }

  const handleJsonChange = (value: string) => {
    setJsonContent(value)
    setJsonError(null)
    // Try to parse to validate
    try {
      JSON.parse(value)
    } catch {
      setJsonError('Invalid JSON syntax')
    }
  }

  return (
    <>
      <DialogTitle>
        Edit Conjugation for {conjugation.verb.italian}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Alert severity='info' icon={<Info />}>
            Edit the conjugation data in JSON format. Be careful with the
            structure to ensure all tenses and forms are correctly defined.
          </Alert>
        </Box>

        <TextField
          label='Conjugation Data (JSON)'
          value={jsonContent}
          onChange={(e) => handleJsonChange(e.target.value)}
          multiline
          rows={20}
          fullWidth
          error={!!jsonError}
          helperText={jsonError || 'Edit the conjugation data in JSON format'}
          sx={{
            '& .MuiInputBase-root': {
              fontFamily: 'monospace',
              fontSize: '0.875rem',
            },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={updatingConjugation}>
          Cancel
        </Button>
        <Button
          onClick={handleUpdateConjugation}
          variant='contained'
          disabled={updatingConjugation || !!jsonError}
        >
          {updatingConjugation ? 'Updating...' : 'Update'}
        </Button>
      </DialogActions>
    </>
  )
}

export default function EditConjugationDialog({
  open,
  conjugation,
  onClose,
  onSuccess,
  onError,
}: EditConjugationDialogProps) {
  if (!conjugation) {
    return null
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <EditFormContent
        key={conjugation.id}
        conjugation={conjugation}
        onClose={onClose}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Dialog>
  )
}

