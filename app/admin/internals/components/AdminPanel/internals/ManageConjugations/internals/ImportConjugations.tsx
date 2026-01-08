'use client'
import { useState } from 'react'

import { CloudUpload, Delete as DeleteIcon } from '@mui/icons-material'
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'

import {
  ConflictConjugation,
  ConjugationData,
  useImportConjugationsMutation,
} from '@/app/store/api'

import {
  ImportDialog,
  ConflictResolutionDialog,
  type ConflictResolutions,
} from '../../shared'

interface FileWithContent {
  file: File
  verbName: string
  content: ConjugationData
}

interface ImportConjugationsProps {
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

const FORMAT_DESCRIPTION =
  'Upload one or multiple JSON files with Italian verb conjugations. The filename (without .json extension) will be used as the verb name. Expected format (example for "aiutare.json"):'

const FORMAT_EXAMPLE = `{
  "Indicativo": {
    "Presente": {
      "io": "aiuto",
      "tu": "aiuti",
      "lui/lei": "aiuta",
      "noi": "aiutiamo",
      "voi": "aiutate",
      "loro": "aiutano"
    },
    ...
  },
  "Congiuntivo": { ... },
  ...
}`

export default function ImportConjugations({
  onError,
  onSuccess,
}: ImportConjugationsProps) {
  const [importConjugations, { isLoading }] = useImportConjugationsMutation()

  const [selectedFiles, setSelectedFiles] = useState<FileWithContent[]>([])
  const [conflicts, setConflicts] = useState<ConflictConjugation[]>([])
  const [resolutions, setResolutions] = useState<ConflictResolutions>({})
  const [showConflictDialog, setShowConflictDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const newFiles: FileWithContent[] = []
    const errors: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file) continue
      const verbName = file.name.replace('.json', '')

      try {
        const content = await file.text()
        const parsed = JSON.parse(content) as ConjugationData
        newFiles.push({ file, verbName, content: parsed })
      } catch {
        errors.push(`${file.name}: Invalid JSON format`)
      }
    }

    if (errors.length > 0) {
      onError(`Errors loading files:\n${errors.join('\n')}`)
    } else {
      onSuccess(
        `${newFiles.length} file(s) loaded successfully. Click "Import Conjugations" to proceed.`
      )
    }

    setSelectedFiles((prev) => [...prev, ...newFiles])
  }

  const handleRemoveFile = (verbName: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.verbName !== verbName))
  }

  const handleImport = async () => {
    if (selectedFiles.length === 0) {
      onError('Please load at least one JSON file first.')
      return
    }

    try {
      const conjugationsData: Record<string, ConjugationData> = {}
      selectedFiles.forEach((fileData) => {
        conjugationsData[fileData.verbName] = fileData.content
      })

      const result = await importConjugations({
        conjugations: conjugationsData,
        resolveConflicts:
          Object.keys(resolutions).length > 0 ? resolutions : undefined,
      }).unwrap()

      onSuccess(result.message)
      setSelectedFiles([])
      setConflicts([])
      setResolutions({})
    } catch (err: unknown) {
      const error = err as {
        status?: number
        data?: { conflicts?: ConflictConjugation[]; error?: string }
      }
      if (error?.status === 409 && error?.data?.conflicts) {
        setConflicts(error.data.conflicts)
        setShowConflictDialog(true)
      } else {
        onError(error?.data?.error || 'Error importing conjugations')
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

  const renderConjugationData = (conjugation: ConjugationData) => (
    <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
      <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
        {Object.entries(conjugation).map(([mood, tenses]) => (
          <Box key={mood} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              {mood}
            </Typography>
            {Object.entries(tenses).map(([tense, forms]) => (
              <Box key={tense} sx={{ ml: 2, mb: 1 }}>
                <Typography variant="body2" fontWeight="medium">
                  {tense}
                </Typography>
                {typeof forms === 'string' ? (
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    {forms}
                  </Typography>
                ) : (
                  <Box sx={{ ml: 2 }}>
                    {Object.entries(forms).map(([person, form]) => (
                      <Typography key={person} variant="body2">
                        {person}: {form}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  )

  const previewContent =
    selectedFiles.length > 0 ? (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Selected Files:
        </Typography>
        <List dense>
          {selectedFiles.map((fileData) => (
            <ListItem
              key={fileData.verbName}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleRemoveFile(fileData.verbName)}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={fileData.file.name}
                secondary={`Verb: ${fileData.verbName}`}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    ) : undefined

  return (
    <>
      <Tooltip title="Import Conjugations from JSON">
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
        title="Import Verb Conjugations from JSON Files"
        entityName="Conjugations"
        isLoading={isLoading}
        hasContent={selectedFiles.length > 0}
        onFileUpload={handleFileUpload}
        onImport={handleImport}
        formatDescription={FORMAT_DESCRIPTION}
        formatExample={FORMAT_EXAMPLE}
        previewContent={previewContent}
        multiple
        fileLoadedLabel={`${selectedFiles.length} file(s) loaded`}
      />

      <ConflictResolutionDialog
        open={showConflictDialog}
        onClose={() => setShowConflictDialog(false)}
        conflicts={conflicts}
        resolutions={resolutions}
        onResolve={handleResolve}
        onContinue={handleContinueImport}
        entityName="verb"
        getConflictKey={(c) => c.verbName}
        renderConflictTitle={(c) => c.verbName}
        renderExistingData={(c) => renderConjugationData(c.existing)}
        renderNewData={(c) => renderConjugationData(c.new)}
        maxWidth="lg"
      />
    </>
  )
}
