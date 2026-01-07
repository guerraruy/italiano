'use client'
import { useState } from 'react'

import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material'

import { ImportedVerb, useUpdateVerbMutation } from '@/app/store/api'

interface EditVerbDialogProps {
  open: boolean
  verb: ImportedVerb | null
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

interface EditFormContentProps {
  verb: ImportedVerb
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

function EditFormContent({
  verb,
  onClose,
  onSuccess,
  onError,
}: EditFormContentProps) {
  const [updateVerb, { isLoading: updatingVerb }] = useUpdateVerbMutation()

  const [editForm, setEditForm] = useState({
    italian: verb.italian,
    regular: verb.regular,
    reflexive: verb.reflexive,
    tr_ptBR: verb.tr_ptBR,
    tr_en: verb.tr_en || '',
  })

  const handleEditFormChange = (field: string, value: string | boolean) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleUpdateVerb = async () => {
    try {
      const result = await updateVerb({
        verbId: verb.id,
        italian: editForm.italian,
        regular: editForm.regular,
        reflexive: editForm.reflexive,
        tr_ptBR: editForm.tr_ptBR,
        tr_en: editForm.tr_en,
      }).unwrap()

      onSuccess(result.message)
      onClose()
    } catch (err: unknown) {
      const error = err as { data?: { error?: string } }
      onError(error?.data?.error || 'Error updating verb')
    }
  }

  return (
    <>
      <DialogTitle>Edit Verb</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            label='Italian (infinitive form)'
            value={editForm.italian}
            onChange={(e) => handleEditFormChange('italian', e.target.value)}
            fullWidth
            size='small'
          />

          <TextField
            label='Portuguese (BR) Translation'
            value={editForm.tr_ptBR}
            onChange={(e) => handleEditFormChange('tr_ptBR', e.target.value)}
            fullWidth
            size='small'
          />

          <TextField
            label='English Translation (optional)'
            value={editForm.tr_en}
            onChange={(e) => handleEditFormChange('tr_en', e.target.value)}
            fullWidth
            size='small'
          />

          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={editForm.regular}
                  onChange={(e) =>
                    handleEditFormChange('regular', e.target.checked)
                  }
                />
              }
              label='Regular verb'
            />
          </Box>

          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={editForm.reflexive}
                  onChange={(e) =>
                    handleEditFormChange('reflexive', e.target.checked)
                  }
                />
              }
              label='Reflexive verb'
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={updatingVerb}>
          Cancel
        </Button>
        <Button
          onClick={handleUpdateVerb}
          variant='contained'
          disabled={updatingVerb}
        >
          {updatingVerb ? 'Updating...' : 'Update'}
        </Button>
      </DialogActions>
    </>
  )
}

export default function EditVerbDialog({
  open,
  verb,
  onClose,
  onSuccess,
  onError,
}: EditVerbDialogProps) {
  if (!verb) {
    return null
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <EditFormContent
        key={verb.id}
        verb={verb}
        onClose={onClose}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Dialog>
  )
}
