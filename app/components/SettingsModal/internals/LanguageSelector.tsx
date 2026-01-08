'use client'
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
} from '@mui/material'

type NativeLanguage = 'pt-BR' | 'en'

interface LanguageSelectorProps {
  value: NativeLanguage
  onChange: (value: NativeLanguage) => void
}

export default function LanguageSelector({
  value,
  onChange,
}: LanguageSelectorProps) {
  return (
    <FormControl component="fieldset" fullWidth>
      <FormLabel
        component="legend"
        sx={{ mb: 1, fontWeight: 'bold', fontSize: '16px' }}
      >
        Native Language
      </FormLabel>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 1, fontSize: '14px' }}
      >
        Select your native language to see translations in your preferred
        language.
      </Typography>
      <RadioGroup
        value={value}
        onChange={(e) => onChange(e.target.value as NativeLanguage)}
      >
        <FormControlLabel
          value="pt-BR"
          control={<Radio size="small" sx={{ py: 0.5 }} />}
          label={
            <Typography sx={{ fontSize: '16px' }}>
              Português (Brasil)
            </Typography>
          }
          sx={{ mb: 0, my: 0.25 }}
        />
        <FormControlLabel
          value="en"
          control={<Radio size="small" sx={{ py: 0.5 }} />}
          label={<Typography sx={{ fontSize: '16px' }}>English</Typography>}
          sx={{ mb: 0, my: 0.25 }}
        />
      </RadioGroup>
    </FormControl>
  )
}
