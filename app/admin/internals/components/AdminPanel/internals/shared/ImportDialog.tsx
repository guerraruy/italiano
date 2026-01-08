'use client'
import { ReactNode, useState } from 'react'

import { CloudUpload, CheckCircle, InfoOutlined } from '@mui/icons-material'
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material'

import FormatInfoDialog from './FormatInfoDialog'

interface ImportDialogProps {
  open: boolean
  onClose: () => void
  title: string
  entityName: string
  isLoading: boolean
  hasContent: boolean
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onImport: () => void
  formatDescription: string
  formatExample: string
  previewContent?: ReactNode
  multiple?: boolean
  fileLoadedLabel?: string
}

export default function ImportDialog({
  open,
  onClose,
  title,
  entityName,
  isLoading,
  hasContent,
  onFileUpload,
  onImport,
  formatDescription,
  formatExample,
  previewContent,
  multiple = false,
  fileLoadedLabel = 'File loaded',
}: ImportDialogProps) {
  const [showFormatInfo, setShowFormatInfo] = useState(false)

  const handleImport = () => {
    onImport()
    onClose()
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            {title}
            <Tooltip title="View JSON Format Information">
              <IconButton
                size="small"
                onClick={() => setShowFormatInfo(true)}
                color="primary"
              >
                <InfoOutlined />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUpload />}
              disabled={isLoading}
            >
              Choose JSON File{multiple ? '(s)' : ''}
              <input
                type="file"
                accept=".json"
                hidden
                multiple={multiple}
                onChange={onFileUpload}
              />
            </Button>
            {hasContent && (
              <Chip
                icon={<CheckCircle />}
                label={fileLoadedLabel}
                color="success"
                size="small"
              />
            )}
          </Stack>

          {previewContent}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          {hasContent && (
            <Button
              variant="contained"
              onClick={handleImport}
              disabled={isLoading}
              startIcon={
                isLoading ? <CircularProgress size={20} /> : <CloudUpload />
              }
            >
              {isLoading ? 'Importing...' : `Import ${entityName}`}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <FormatInfoDialog
        open={showFormatInfo}
        onClose={() => setShowFormatInfo(false)}
        description={formatDescription}
        formatExample={formatExample}
      />
    </>
  )
}
