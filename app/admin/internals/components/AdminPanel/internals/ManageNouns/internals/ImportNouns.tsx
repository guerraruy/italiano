'use client'
import { useState } from 'react'

import { CloudUpload } from '@mui/icons-material'
import { Box, Typography, IconButton, Tooltip } from '@mui/material'

import { useImportNounsMutation, type ConflictNoun } from '@/app/store/api'

import {
  ImportDialog,
  ConflictResolutionDialog,
  type ConflictResolutions,
} from '../../shared'

interface ImportNounsProps {
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

const FORMAT_DESCRIPTION =
  'Upload a JSON file with Italian nouns and their translations in singular and plural forms. Expected format:'

const FORMAT_EXAMPLE = `{
  "orologio": {
    "singolare": {
      "it": "l'orologio",
      "pt": "o relógio",
      "en": "the watch"
    },
    "plurale": {
      "it": "gli orologi",
      "pt": "os relógios",
      "en": "the clocks"
    }
  },
  "libro": {
    "singolare": {
      "it": "il libro",
      "pt": "o livro",
      "en": "the book"
    },
    "plurale": {
      "it": "i libri",
      "pt": "os livros",
      "en": "the books"
    }
  }
}`

export default function ImportNouns({ onError, onSuccess }: ImportNounsProps) {
  const [importNouns, { isLoading }] = useImportNounsMutation()

  const [jsonContent, setJsonContent] = useState<string>('')
  const [conflicts, setConflicts] = useState<ConflictNoun[]>([])
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
          'JSON file loaded successfully. Click "Import Nouns" to proceed.'
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
      const result = await importNouns({
        nouns: data,
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
        data?: { conflicts?: ConflictNoun[]; error?: string }
      }
      if (error?.status === 409 && error?.data?.conflicts) {
        setConflicts(error.data.conflicts)
        setShowConflictDialog(true)
      } else {
        onError(error?.data?.error || 'Error importing nouns')
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

  const renderExistingData = (conflict: ConflictNoun) => (
    <>
      <Typography variant="body2" fontWeight="bold">
        Singular:
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        IT: {conflict.existing.singolare.it}
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        PT: {conflict.existing.singolare.pt}
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        EN: {conflict.existing.singolare.en}
      </Typography>
      <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
        Plural:
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        IT: {conflict.existing.plurale.it}
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        PT: {conflict.existing.plurale.pt}
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        EN: {conflict.existing.plurale.en}
      </Typography>
    </>
  )

  const renderNewData = (conflict: ConflictNoun) => (
    <>
      <Typography variant="body2" fontWeight="bold">
        Singular:
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        IT: {conflict.new.singolare.it}
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        PT: {conflict.new.singolare.pt}
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        EN: {conflict.new.singolare.en}
      </Typography>
      <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
        Plural:
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        IT: {conflict.new.plurale.it}
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        PT: {conflict.new.plurale.pt}
      </Typography>
      <Typography variant="body2" sx={{ ml: 1 }}>
        EN: {conflict.new.plurale.en}
      </Typography>
    </>
  )

  const previewContent = jsonContent ? (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Preview: {Object.keys(JSON.parse(jsonContent)).length} nouns ready to
        import
      </Typography>
    </Box>
  ) : undefined

  return (
    <>
      <Tooltip title="Import Nouns from JSON">
        <span>
          <IconButton
            color="primary"
            onClick={() => setShowImportDialog(true)}
            disabled={isLoading}
            aria-label="Import Nouns from JSON"
          >
            <CloudUpload />
          </IconButton>
        </span>
      </Tooltip>

      <ImportDialog
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        title="Import Nouns from JSON"
        entityName="Nouns"
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
        entityName="noun"
        getConflictKey={(c) => c.italian}
        renderConflictTitle={(c) => c.italian}
        renderExistingData={renderExistingData}
        renderNewData={renderNewData}
      />
    </>
  )
}
