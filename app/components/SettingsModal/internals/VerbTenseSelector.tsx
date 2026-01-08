'use client'
import { Box, FormControl, FormLabel, Typography } from '@mui/material'

import TenseCategory from './TenseCategory'

const VERB_TENSES = [
  {
    category: 'Indicativo',
    tenses: [
      'Presente',
      'Passato Prossimo',
      'Imperfetto',
      'Trapassato Prossimo',
      'Futuro Semplice',
      'Passato Remoto',
    ],
  },
  {
    category: 'Congiuntivo',
    tenses: ['Presente', 'Passato', 'Imperfetto', 'Trapassato'],
  },
  { category: 'Condizionale', tenses: ['Presente', 'Passato'] },
  { category: 'Imperativo', tenses: ['Affirmativo', 'Negativo'] },
  { category: 'Participio', tenses: ['Presente', 'Passato'] },
  { category: 'Gerundio', tenses: ['Presente', 'Passato'] },
  { category: 'Infinito', tenses: ['Presente', 'Passato'] },
]

interface VerbTenseSelectorProps {
  enabledTenses: string[]
  onTenseToggle: (tenseKey: string) => void
  onCategoryToggle: (category: string) => void
}

export default function VerbTenseSelector({
  enabledTenses,
  onTenseToggle,
  onCategoryToggle,
}: VerbTenseSelectorProps) {
  return (
    <FormControl component="fieldset" fullWidth>
      <FormLabel
        component="legend"
        sx={{ mb: 1, fontWeight: 'bold', fontSize: '16px' }}
      >
        Enabled Verb Tenses
      </FormLabel>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 1, fontSize: '14px' }}
      >
        Select which verb tenses you want to practice. Only selected tenses will
        be shown in conjugation exercises.
      </Typography>
      <Box>
        {VERB_TENSES.map(({ category, tenses }) => (
          <TenseCategory
            key={category}
            category={category}
            tenses={tenses}
            enabledTenses={enabledTenses}
            onTenseToggle={onTenseToggle}
            onCategoryToggle={onCategoryToggle}
          />
        ))}
      </Box>
    </FormControl>
  )
}

export { VERB_TENSES }
