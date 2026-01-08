'use client'
import { Box, Typography, Chip } from '@mui/material'

import {
  ConjugationData,
  useDeleteConjugationMutation,
  VerbConjugation,
} from '@/app/store/api'
import DeleteConfirmationDialog from '../../shared/DeleteConfirmationDialog'

interface DeleteConjugationDialogProps {
  open: boolean
  conjugation: VerbConjugation | null
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export default function DeleteConjugationDialog({
  open,
  conjugation,
  onClose,
  onSuccess,
  onError,
}: DeleteConjugationDialogProps) {
  const [deleteConjugation, { isLoading: deletingConjugation }] =
    useDeleteConjugationMutation()

  const renderConjugationDetails = (conjugation: VerbConjugation) => {
    const conjugationData = conjugation.conjugation as ConjugationData
    const moods = Object.keys(conjugationData)
    const totalTenses = Object.values(conjugationData).reduce(
      (total, tenses) => total + Object.keys(tenses).length,
      0
    )

    return (
      <>
        <Typography variant='h6' gutterBottom>
          {conjugation.verb.italian}
        </Typography>
        <Box sx={{ mb: 1, display: 'flex', gap: 1 }}>
          {conjugation.verb.regular ? (
            <Chip label='Regular' size='small' color='success' />
          ) : (
            <Chip label='Irregular' size='small' color='warning' />
          )}
          {conjugation.verb.reflexive && (
            <Chip label='Reflexive' size='small' color='info' />
          )}
        </Box>
        <Typography variant='body2'>
          <strong>Moods:</strong> {moods.join(', ')}
        </Typography>
        <Typography variant='body2'>
          <strong>Total Tenses:</strong> {totalTenses}
        </Typography>
      </>
    )
  }

  return (
    <DeleteConfirmationDialog
      open={open}
      item={conjugation}
      entityName='conjugation'
      onClose={onClose}
      onSuccess={onSuccess}
      onError={onError}
      deleteMutation={(id) => deleteConjugation(id).unwrap()}
      isDeleting={deletingConjugation}
      renderItemDetails={renderConjugationDetails}
      warningMessage='This action cannot be undone. The conjugation data will be permanently deleted from the database.'
    />
  )
}
