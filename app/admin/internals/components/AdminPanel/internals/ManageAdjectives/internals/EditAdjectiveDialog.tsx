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
  AdjectiveGenderForms,
  ImportedAdjective,
  useUpdateAdjectiveMutation,
} from '@/app/store/api'

interface EditAdjectiveDialogProps {
  open: boolean
  adjective: ImportedAdjective | null
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

interface EditFormContentProps {
  adjective: ImportedAdjective
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

function EditFormContent({
  adjective,
  onClose,
  onSuccess,
  onError,
}: EditFormContentProps) {
  const [updateAdjective, { isLoading: updatingAdjective }] =
    useUpdateAdjectiveMutation()

  const [editForm, setEditForm] = useState({
    italian: adjective.italian,
    maschile: adjective.maschile as AdjectiveGenderForms,
    femminile: adjective.femminile as AdjectiveGenderForms,
  })

  const handleEditFormChange = (
    field: string,
    value: string,
    gender?: 'maschile' | 'femminile',
    number?: 'singolare' | 'plurale',
    lang?: 'it' | 'pt' | 'en'
  ) => {
    if (gender && number && lang) {
      setEditForm((prev) => ({
        ...prev,
        [gender]: {
          ...prev[gender],
          [number]: {
            ...prev[gender][number],
            [lang]: value,
          },
        },
      }))
    } else {
      setEditForm((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleUpdateAdjective = async () => {
    try {
      const result = await updateAdjective({
        adjectiveId: adjective.id,
        italian: editForm.italian,
        maschile: editForm.maschile,
        femminile: editForm.femminile,
      }).unwrap()

      onSuccess(result.message)
      onClose()
    } catch (err: unknown) {
      const error = err as { data?: { error?: string } }
      onError(error?.data?.error || 'Error updating adjective')
    }
  }

  return (
    <>
      <DialogTitle>Edit Adjective</DialogTitle>
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
            {/* Masculine Forms */}
            <Box flex={1}>
              <Typography variant="subtitle2" gutterBottom>
                Masculine Forms
              </Typography>
              <Stack spacing={2}>
                <Typography variant="caption" fontWeight="bold">
                  Singular:
                </Typography>
                <TextField
                  label="Italian"
                  value={editForm.maschile.singolare.it}
                  onChange={(e) =>
                    handleEditFormChange(
                      'it',
                      e.target.value,
                      'maschile',
                      'singolare',
                      'it'
                    )
                  }
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Portuguese"
                  value={editForm.maschile.singolare.pt}
                  onChange={(e) =>
                    handleEditFormChange(
                      'pt',
                      e.target.value,
                      'maschile',
                      'singolare',
                      'pt'
                    )
                  }
                  fullWidth
                  size="small"
                />
                <TextField
                  label="English"
                  value={editForm.maschile.singolare.en}
                  onChange={(e) =>
                    handleEditFormChange(
                      'en',
                      e.target.value,
                      'maschile',
                      'singolare',
                      'en'
                    )
                  }
                  fullWidth
                  size="small"
                />
                <Typography variant="caption" fontWeight="bold" sx={{ mt: 1 }}>
                  Plural:
                </Typography>
                <TextField
                  label="Italian"
                  value={editForm.maschile.plurale.it}
                  onChange={(e) =>
                    handleEditFormChange(
                      'it',
                      e.target.value,
                      'maschile',
                      'plurale',
                      'it'
                    )
                  }
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Portuguese"
                  value={editForm.maschile.plurale.pt}
                  onChange={(e) =>
                    handleEditFormChange(
                      'pt',
                      e.target.value,
                      'maschile',
                      'plurale',
                      'pt'
                    )
                  }
                  fullWidth
                  size="small"
                />
                <TextField
                  label="English"
                  value={editForm.maschile.plurale.en}
                  onChange={(e) =>
                    handleEditFormChange(
                      'en',
                      e.target.value,
                      'maschile',
                      'plurale',
                      'en'
                    )
                  }
                  fullWidth
                  size="small"
                />
              </Stack>
            </Box>

            {/* Feminine Forms */}
            <Box flex={1}>
              <Typography variant="subtitle2" gutterBottom>
                Feminine Forms
              </Typography>
              <Stack spacing={2}>
                <Typography variant="caption" fontWeight="bold">
                  Singular:
                </Typography>
                <TextField
                  label="Italian"
                  value={editForm.femminile.singolare.it}
                  onChange={(e) =>
                    handleEditFormChange(
                      'it',
                      e.target.value,
                      'femminile',
                      'singolare',
                      'it'
                    )
                  }
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Portuguese"
                  value={editForm.femminile.singolare.pt}
                  onChange={(e) =>
                    handleEditFormChange(
                      'pt',
                      e.target.value,
                      'femminile',
                      'singolare',
                      'pt'
                    )
                  }
                  fullWidth
                  size="small"
                />
                <TextField
                  label="English"
                  value={editForm.femminile.singolare.en}
                  onChange={(e) =>
                    handleEditFormChange(
                      'en',
                      e.target.value,
                      'femminile',
                      'singolare',
                      'en'
                    )
                  }
                  fullWidth
                  size="small"
                />
                <Typography variant="caption" fontWeight="bold" sx={{ mt: 1 }}>
                  Plural:
                </Typography>
                <TextField
                  label="Italian"
                  value={editForm.femminile.plurale.it}
                  onChange={(e) =>
                    handleEditFormChange(
                      'it',
                      e.target.value,
                      'femminile',
                      'plurale',
                      'it'
                    )
                  }
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Portuguese"
                  value={editForm.femminile.plurale.pt}
                  onChange={(e) =>
                    handleEditFormChange(
                      'pt',
                      e.target.value,
                      'femminile',
                      'plurale',
                      'pt'
                    )
                  }
                  fullWidth
                  size="small"
                />
                <TextField
                  label="English"
                  value={editForm.femminile.plurale.en}
                  onChange={(e) =>
                    handleEditFormChange(
                      'en',
                      e.target.value,
                      'femminile',
                      'plurale',
                      'en'
                    )
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
        <Button onClick={onClose} disabled={updatingAdjective}>
          Cancel
        </Button>
        <Button
          onClick={handleUpdateAdjective}
          variant="contained"
          disabled={updatingAdjective}
        >
          {updatingAdjective ? 'Updating...' : 'Update'}
        </Button>
      </DialogActions>
    </>
  )
}

export default function EditAdjectiveDialog({
  open,
  adjective,
  onClose,
  onSuccess,
  onError,
}: EditAdjectiveDialogProps) {
  if (!adjective) {
    return null
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <EditFormContent
        key={adjective.id}
        adjective={adjective}
        onClose={onClose}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Dialog>
  )
}
