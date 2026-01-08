'use client'
import { Typography } from '@mui/material'

import {
  AdjectiveGenderForms,
  ImportedAdjective,
  useDeleteAdjectiveMutation,
} from '@/app/store/api'

import DeleteConfirmationDialog from '../../shared/DeleteConfirmationDialog'

interface DeleteAdjectiveDialogProps {
  open: boolean
  adjective: ImportedAdjective | null
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export default function DeleteAdjectiveDialog({
  open,
  adjective,
  onClose,
  onSuccess,
  onError,
}: DeleteAdjectiveDialogProps) {
  const [deleteAdjective, { isLoading: deletingAdjective }] =
    useDeleteAdjectiveMutation()

  const renderAdjectiveDetails = (adjective: ImportedAdjective) => (
    <>
      <Typography variant='h6' gutterBottom>
        {adjective.italian}
      </Typography>
      <Typography variant='body2'>
        <strong>Masculine Singular:</strong>{' '}
        {(adjective.maschile as AdjectiveGenderForms).singolare.it} /{' '}
        {(adjective.maschile as AdjectiveGenderForms).singolare.pt} /{' '}
        {(adjective.maschile as AdjectiveGenderForms).singolare.en}
      </Typography>
      <Typography variant='body2'>
        <strong>Masculine Plural:</strong>{' '}
        {(adjective.maschile as AdjectiveGenderForms).plurale.it} /{' '}
        {(adjective.maschile as AdjectiveGenderForms).plurale.pt} /{' '}
        {(adjective.maschile as AdjectiveGenderForms).plurale.en}
      </Typography>
      <Typography variant='body2' sx={{ mt: 1 }}>
        <strong>Feminine Singular:</strong>{' '}
        {(adjective.femminile as AdjectiveGenderForms).singolare.it} /{' '}
        {(adjective.femminile as AdjectiveGenderForms).singolare.pt} /{' '}
        {(adjective.femminile as AdjectiveGenderForms).singolare.en}
      </Typography>
      <Typography variant='body2'>
        <strong>Feminine Plural:</strong>{' '}
        {(adjective.femminile as AdjectiveGenderForms).plurale.it} /{' '}
        {(adjective.femminile as AdjectiveGenderForms).plurale.pt} /{' '}
        {(adjective.femminile as AdjectiveGenderForms).plurale.en}
      </Typography>
    </>
  )

  return (
    <DeleteConfirmationDialog
      open={open}
      item={adjective}
      entityName='adjective'
      onClose={onClose}
      onSuccess={onSuccess}
      onError={onError}
      deleteMutation={(id) => deleteAdjective(id).unwrap()}
      isDeleting={deletingAdjective}
      renderItemDetails={renderAdjectiveDetails}
      warningMessage='This action cannot be undone. All associated statistics will also be deleted.'
    />
  )
}
