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
  Typography,
} from '@mui/material'

import {
  useUpdateNounMutation,
  type ImportedNoun,
  type NounTranslations,
} from '@/app/store/api'

interface EditNounDialogProps {
  open: boolean
  noun: ImportedNoun | null
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

interface EditFormContentProps {
  noun: ImportedNoun
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

function EditFormContent({
  noun,
  onClose,
  onSuccess,
  onError,
}: EditFormContentProps) {
  const [updateNoun, { isLoading: updatingNoun }] = useUpdateNounMutation()

  const [editForm, setEditForm] = useState({
    italian: noun.italian,
    singolare: noun.singolare as NounTranslations,
    plurale: noun.plurale as NounTranslations,
  })

  const handleEditFormChange = (
    field: string,
    value: string,
    group?: 'singolare' | 'plurale',
    lang?: 'it' | 'pt' | 'en'
  ) => {
    if (group && lang) {
      setEditForm((prev) => ({
        ...prev,
        [group]: {
          ...prev[group],
          [lang]: value,
        },
      }))
    } else {
      setEditForm((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleUpdateNoun = async () => {
    try {
      const result = await updateNoun({
        nounId: noun.id,
        italian: editForm.italian,
        singolare: editForm.singolare,
        plurale: editForm.plurale,
      }).unwrap()

      onSuccess(result.message)
      onClose()
    } catch (err: unknown) {
      const error = err as { data?: { error?: string } }
      onError(error?.data?.error || 'Error updating noun')
    }
  }

  return (
    <>
      <DialogTitle>Edit Noun</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            label="Italian (base form)"
            value={editForm.italian}
            onChange={(e) => handleEditFormChange('italian', e.target.value)}
            fullWidth
            size="small"
          />

          <Box display="flex" gap={3}>
            <Box flex={1}>
              <Typography variant="subtitle2" gutterBottom>
                Singular Forms
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Italian"
                  value={editForm.singolare.it}
                  onChange={(e) =>
                    handleEditFormChange(
                      'it',
                      e.target.value,
                      'singolare',
                      'it'
                    )
                  }
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Portuguese"
                  value={editForm.singolare.pt}
                  onChange={(e) =>
                    handleEditFormChange(
                      'pt',
                      e.target.value,
                      'singolare',
                      'pt'
                    )
                  }
                  fullWidth
                  size="small"
                />
                <TextField
                  label="English"
                  value={editForm.singolare.en}
                  onChange={(e) =>
                    handleEditFormChange(
                      'en',
                      e.target.value,
                      'singolare',
                      'en'
                    )
                  }
                  fullWidth
                  size="small"
                />
              </Stack>
            </Box>

            <Box flex={1}>
              <Typography variant="subtitle2" gutterBottom>
                Plural Forms
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Italian"
                  value={editForm.plurale.it}
                  onChange={(e) =>
                    handleEditFormChange('it', e.target.value, 'plurale', 'it')
                  }
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Portuguese"
                  value={editForm.plurale.pt}
                  onChange={(e) =>
                    handleEditFormChange('pt', e.target.value, 'plurale', 'pt')
                  }
                  fullWidth
                  size="small"
                />
                <TextField
                  label="English"
                  value={editForm.plurale.en}
                  onChange={(e) =>
                    handleEditFormChange('en', e.target.value, 'plurale', 'en')
                  }
                  fullWidth
                  size="small"
                />
              </Stack>
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={updatingNoun}>
          Cancel
        </Button>
        <Button
          onClick={handleUpdateNoun}
          variant="contained"
          disabled={updatingNoun}
        >
          {updatingNoun ? 'Updating...' : 'Update'}
        </Button>
      </DialogActions>
    </>
  )
}

export default function EditNounDialog({
  open,
  noun,
  onClose,
  onSuccess,
  onError,
}: EditNounDialogProps) {
  if (!noun) {
    return null
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <EditFormContent
        key={noun.id}
        noun={noun}
        onClose={onClose}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Dialog>
  )
}
