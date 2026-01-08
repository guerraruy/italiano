'use client'
import { Box, Typography, Chip } from '@mui/material'

import { ImportedVerb, useDeleteVerbMutation } from '@/app/store/api'
import DeleteConfirmationDialog from '../../shared/DeleteConfirmationDialog'

interface DeleteVerbDialogProps {
  open: boolean
  verb: ImportedVerb | null
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export default function DeleteVerbDialog({
  open,
  verb,
  onClose,
  onSuccess,
  onError,
}: DeleteVerbDialogProps) {
  const [deleteVerb, { isLoading: deletingVerb }] = useDeleteVerbMutation()

  const renderVerbDetails = (verb: ImportedVerb) => (
    <>
      <Typography variant='h6' gutterBottom>
        {verb.italian}
      </Typography>
      <Typography variant='body2'>
        <strong>Portuguese:</strong> {verb.tr_ptBR}
      </Typography>
      <Typography variant='body2'>
        <strong>English:</strong> {verb.tr_en || 'N/A'}
      </Typography>
      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
        {verb.regular ? (
          <Chip label='Regular' size='small' color='success' />
        ) : (
          <Chip label='Irregular' size='small' color='warning' />
        )}
        {verb.reflexive && <Chip label='Reflexive' size='small' color='info' />}
      </Box>
    </>
  )

  return (
    <DeleteConfirmationDialog
      open={open}
      item={verb}
      entityName='verb'
      onClose={onClose}
      onSuccess={onSuccess}
      onError={onError}
      deleteMutation={(id) => deleteVerb(id).unwrap()}
      isDeleting={deletingVerb}
      renderItemDetails={renderVerbDetails}
      warningMessage='This action cannot be undone. All associated conjugations and statistics will also be deleted.'
    />
  )
}
