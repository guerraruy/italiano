'use client'
import { useState } from 'react'

import { CloudUpload } from '@mui/icons-material'
import { Box, Typography, IconButton, Tooltip } from '@mui/material'

import { ConflictAdjective, useImportAdjectivesMutation } from '@/app/store/api'

import {
  ImportDialog,
  ConflictResolutionDialog,
  type ConflictResolutions,
} from '../../shared'

interface ImportAdjectivesProps {
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

const FORMAT_DESCRIPTION =
  'Upload a JSON file with Italian adjectives and their translations in masculine/feminine and singular/plural forms. Expected format:'

const FORMAT_EXAMPLE = `{
  "basso": {
    "maschile": {
      "singolare": {
        "it": "basso",
        "pt": "baixo",
        "en": "short"
      },
      "plurale": {
        "it": "bassi",
        "pt": "baixos",
        "en": "short"
      }
    },
    "femminile": {
      "singolare": {
        "it": "bassa",
        "pt": "baixa",
        "en": "short"
      },
      "plurale": {
        "it": "basse",
        "pt": "baixas",
        "en": "short"
      }
    }
  }
}`

export default function ImportAdjectives({
  onError,
  onSuccess,
}: ImportAdjectivesProps) {
  const [importAdjectives, { isLoading }] = useImportAdjectivesMutation()

  const [jsonContent, setJsonContent] = useState<string>('')
  const [conflicts, setConflicts] = useState<ConflictAdjective[]>([])
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
          'JSON file loaded successfully. Click "Import Adjectives" to proceed.'
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
      const result = await importAdjectives({
        adjectives: data,
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
        data?: { conflicts?: ConflictAdjective[]; error?: string }
      }
      if (error?.status === 409 && error?.data?.conflicts) {
        setConflicts(error.data.conflicts)
        setShowConflictDialog(true)
      } else {
        onError(error?.data?.error || 'Error importing adjectives')
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

  const renderExistingData = (conflict: ConflictAdjective) => (
    <>
      <Typography variant="body2" fontWeight="bold">
        Masculine Singular:
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        IT: {conflict.existing.maschile.singolare.it}
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        PT: {conflict.existing.maschile.singolare.pt}
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        EN: {conflict.existing.maschile.singolare.en}
      </Typography>
      <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
        Masculine Plural:
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        IT: {conflict.existing.maschile.plurale.it}
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        PT: {conflict.existing.maschile.plurale.pt}
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        EN: {conflict.existing.maschile.plurale.en}
      </Typography>
      <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
        Feminine Singular:
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        IT: {conflict.existing.femminile.singolare.it}
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        PT: {conflict.existing.femminile.singolare.pt}
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        EN: {conflict.existing.femminile.singolare.en}
      </Typography>
      <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
        Feminine Plural:
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        IT: {conflict.existing.femminile.plurale.it}
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        PT: {conflict.existing.femminile.plurale.pt}
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        EN: {conflict.existing.femminile.plurale.en}
      </Typography>
    </>
  )

  const renderNewData = (conflict: ConflictAdjective) => (
    <>
      <Typography variant="body2" fontWeight="bold">
        Masculine Singular:
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        IT: {conflict.new.maschile.singolare.it}
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        PT: {conflict.new.maschile.singolare.pt}
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        EN: {conflict.new.maschile.singolare.en}
      </Typography>
      <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
        Masculine Plural:
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        IT: {conflict.new.maschile.plurale.it}
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        PT: {conflict.new.maschile.plurale.pt}
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        EN: {conflict.new.maschile.plurale.en}
      </Typography>
      <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
        Feminine Singular:
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        IT: {conflict.new.femminile.singolare.it}
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        PT: {conflict.new.femminile.singolare.pt}
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        EN: {conflict.new.femminile.singolare.en}
      </Typography>
      <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
        Feminine Plural:
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        IT: {conflict.new.femminile.plurale.it}
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        PT: {conflict.new.femminile.plurale.pt}
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        EN: {conflict.new.femminile.plurale.en}
      </Typography>
    </>
  )

  const previewContent = jsonContent ? (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Preview: {Object.keys(JSON.parse(jsonContent)).length} adjectives ready
        to import
      </Typography>
    </Box>
  ) : undefined

  return (
    <>
      <Tooltip title="Import Adjectives from JSON">
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
        title="Import Adjectives from JSON"
        entityName="Adjectives"
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
        entityName="adjective"
        getConflictKey={(c) => c.italian}
        renderConflictTitle={(c) => c.italian}
        renderExistingData={renderExistingData}
        renderNewData={renderNewData}
      />
    </>
  )
}
