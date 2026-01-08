'use client'
import { useState } from 'react'

import { CloudUpload } from '@mui/icons-material'
import { Box, Typography, IconButton, Tooltip } from '@mui/material'

import { ConflictVerb, useImportVerbsMutation } from '@/app/store/api'

import {
  ImportDialog,
  ConflictResolutionDialog,
  type ConflictResolutions,
} from '../../shared'

interface ImportVerbsProps {
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

const FORMAT_DESCRIPTION =
  'Upload a JSON file with Italian verbs and their translations. Expected format:'

const FORMAT_EXAMPLE = `{
  "accendere": {
    "regular": false,
    "reflexive": false,
    "tr_ptBR": "acender",
    "tr_en": "to light"
  },
  "accettare": {
    "regular": true,
    "reflexive": false,
    "tr_ptBR": "aceitar",
    "tr_en": "to accept"
  }
}`

export default function ImportVerbs({ onError, onSuccess }: ImportVerbsProps) {
  const [importVerbs, { isLoading }] = useImportVerbsMutation()

  const [jsonContent, setJsonContent] = useState<string>('')
  const [conflicts, setConflicts] = useState<ConflictVerb[]>([])
  const [resolutions, setResolutions] = useState<ConflictResolutions>({})
  const [showConflictDialog, setShowConflictDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        JSON.parse(content)
        setJsonContent(content)
        onSuccess(
          'JSON file loaded successfully. Click "Import Verbs" to proceed.'
        )
      } catch {
        onError('Invalid JSON file. Please check the format.')
        setJsonContent('')
      }
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!jsonContent) {
      onError('Please load a JSON file first.')
      return
    }

    try {
      const data = JSON.parse(jsonContent)
      const result = await importVerbs({
        verbs: data,
        resolveConflicts:
          Object.keys(resolutions).length > 0 ? resolutions : undefined,
      }).unwrap()

      onSuccess(result.message)
      setJsonContent('')
      setConflicts([])
      setResolutions({})
    } catch (err: unknown) {
      const error = err as {
        status?: number
        data?: { conflicts?: ConflictVerb[]; error?: string }
      }
      if (error?.status === 409 && error?.data?.conflicts) {
        setConflicts(error.data.conflicts)
        setShowConflictDialog(true)
      } else {
        onError(error?.data?.error || 'Error importing verbs')
      }
    }
  }

  const handleResolve = (key: string, action: 'keep' | 'replace') => {
    setResolutions((prev) => ({ ...prev, [key]: action }))
  }

  const handleContinueImport = () => {
    setShowConflictDialog(false)
    handleImport()
  }

  const renderExistingData = (conflict: ConflictVerb) => (
    <>
      <Typography variant="body2">
        Portuguese: {conflict.existing.tr_ptBR}
      </Typography>
      <Typography variant="body2">
        English: {conflict.existing.tr_en || 'N/A'}
      </Typography>
      <Typography variant="body2">
        Regular: {conflict.existing.regular ? 'Yes' : 'No'}
      </Typography>
      <Typography variant="body2">
        Reflexive: {conflict.existing.reflexive ? 'Yes' : 'No'}
      </Typography>
    </>
  )

  const renderNewData = (conflict: ConflictVerb) => (
    <>
      <Typography variant="body2">
        Portuguese: {conflict.new.tr_ptBR}
      </Typography>
      <Typography variant="body2">
        English: {conflict.new.tr_en || 'N/A'}
      </Typography>
      <Typography variant="body2">
        Regular: {conflict.new.regular ? 'Yes' : 'No'}
      </Typography>
      <Typography variant="body2">
        Reflexive: {conflict.new.reflexive ? 'Yes' : 'No'}
      </Typography>
    </>
  )

  const previewContent = jsonContent ? (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Preview: {Object.keys(JSON.parse(jsonContent)).length} verbs ready to
        import
      </Typography>
    </Box>
  ) : undefined

  return (
    <>
      <Tooltip title="Import Verbs from JSON">
        <IconButton
          color="primary"
          onClick={() => setShowImportDialog(true)}
          disabled={isLoading}
        >
          <CloudUpload />
        </IconButton>
      </Tooltip>

      <ImportDialog
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        title="Import Verbs from JSON"
        entityName="Verbs"
        isLoading={isLoading}
        hasContent={!!jsonContent}
        onFileUpload={handleFileUpload}
        onImport={handleImport}
        formatDescription={FORMAT_DESCRIPTION}
        formatExample={FORMAT_EXAMPLE}
        previewContent={previewContent}
      />

      <ConflictResolutionDialog
        open={showConflictDialog}
        onClose={() => setShowConflictDialog(false)}
        conflicts={conflicts}
        resolutions={resolutions}
        onResolve={handleResolve}
        onContinue={handleContinueImport}
        entityName="verb"
        getConflictKey={(c) => c.italian}
        renderConflictTitle={(c) => c.italian}
        renderExistingData={renderExistingData}
        renderNewData={renderNewData}
      />
    </>
  )
}
