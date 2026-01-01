'use client'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Divider,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Typography variant='h6' component='div'>
            Configurações
          </Typography>
          <IconButton aria-label='close' onClick={onClose} size='small'>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant='body1' color='text.secondary'>
            Os parâmetros de configuração serão adicionados aqui.
          </Typography>
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant='outlined'>
          Cancelar
        </Button>
        <Button onClick={onClose} variant='contained'>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
