'use client'
import { Typography } from '@mui/material'

import {
  useDeleteNounMutation,
  type ImportedNoun,
  type NounTranslations,
} from '@/app/store/api'

import DeleteConfirmationDialog from '../../shared/DeleteConfirmationDialog'

interface DeleteNounDialogProps {
  open: boolean
  noun: ImportedNoun | null
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export default function DeleteNounDialog({
  open,
  noun,
  onClose,
  onSuccess,
  onError,
}: DeleteNounDialogProps) {
  const [deleteNoun, { isLoading: deletingNoun }] = useDeleteNounMutation()

  const renderNounDetails = (noun: ImportedNoun) => (
    <>
      <Typography variant="h6" gutterBottom>
        {noun.italian}
      </Typography>
      <Typography variant="body2">
        <strong>Singular:</strong> {(noun.singolare as NounTranslations).it} /{' '}
        {(noun.singolare as NounTranslations).pt} /{' '}
        {(noun.singolare as NounTranslations).en}
      </Typography>
      <Typography variant="body2">
        <strong>Plural:</strong> {(noun.plurale as NounTranslations).it} /{' '}
        {(noun.plurale as NounTranslations).pt} /{' '}
        {(noun.plurale as NounTranslations).en}
      </Typography>
    </>
  )

  return (
    <DeleteConfirmationDialog
      open={open}
      item={noun}
      entityName="noun"
      onClose={onClose}
      onSuccess={onSuccess}
      onError={onError}
      deleteMutation={(id) => deleteNoun(id).unwrap()}
      isDeleting={deletingNoun}
      renderItemDetails={renderNounDetails}
      warningMessage="This action cannot be undone. All associated statistics will also be deleted."
    />
  )
}
