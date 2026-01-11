import React from 'react'

import { ThemeProvider, createTheme } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'

import GenderInputColumn from './GenderInputColumn'
import { InputValues } from '../../../types'

type FieldKey = keyof InputValues[string]
type ValidationStatus = 'correct' | 'incorrect' | null

interface AdjectiveInputFieldProps {
  label: string
  placeholder: string
  value: string
  validationStatus: ValidationStatus
  adjectiveId: string
  field: FieldKey
  index: number
  correctAnswer: string
  onInputChange: (adjectiveId: string, field: FieldKey, value: string) => void
  onValidation: (
    adjectiveId: string,
    field: FieldKey,
    correctAnswer: string
  ) => void
  onClearInput: (adjectiveId: string, field?: FieldKey) => void
  onKeyDown: (
    e: React.KeyboardEvent,
    adjectiveId: string,
    field: FieldKey,
    index: number
  ) => void
  setInputRef: (
    adjectiveId: string,
    field: FieldKey
  ) => (el: HTMLInputElement | null) => void
}

const theme = createTheme()

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

jest.mock('./AdjectiveInputField', () => {
  return function MockAdjectiveInputField(props: AdjectiveInputFieldProps) {
    return (
      <div data-testid={`adjective-input-${props.field}`}>
        <label>{props.label}</label>
        <input
          placeholder={props.placeholder}
          value={props.value}
          data-validation={props.validationStatus}
          data-adjective-id={props.adjectiveId}
          data-field={props.field}
          data-index={props.index}
          data-correct-answer={props.correctAnswer}
        />
      </div>
    )
  }
})

describe('GenderInputColumn', () => {
  const mockHandlers = {
    onInputChange: jest.fn(),
    onValidation: jest.fn(),
    onClearInput: jest.fn(),
    onKeyDown: jest.fn(),
    setInputRef: jest.fn(() => jest.fn()),
  }

  const defaultProps = {
    gender: 'Masculine' as const,
    singularField: 'masculineSingular' as const,
    pluralField: 'masculinePlural' as const,
    singularValue: '',
    pluralValue: '',
    singularCorrectAnswer: 'bello',
    pluralCorrectAnswer: 'belli',
    singularValidation: null as 'correct' | 'incorrect' | null,
    pluralValidation: null as 'correct' | 'incorrect' | null,
    adjectiveId: 'adj-1',
    index: 0,
    ...mockHandlers,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders gender header with correct text', () => {
      renderWithTheme(<GenderInputColumn {...defaultProps} />)

      expect(screen.getByText('Masculine')).toBeInTheDocument()
    })

    it('renders gender header for feminine', () => {
      const props = {
        ...defaultProps,
        gender: 'Feminine' as const,
        singularField: 'feminineSingular' as const,
        pluralField: 'femininePlural' as const,
      }

      renderWithTheme(<GenderInputColumn {...props} />)

      expect(screen.getByText('Feminine')).toBeInTheDocument()
    })

    it('renders both singular and plural input fields', () => {
      renderWithTheme(<GenderInputColumn {...defaultProps} />)

      expect(
        screen.getByTestId('adjective-input-masculineSingular')
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('adjective-input-masculinePlural')
      ).toBeInTheDocument()
    })

    it('renders with correct structure and gap', () => {
      const { container } = renderWithTheme(
        <GenderInputColumn {...defaultProps} />
      )

      const columnBox = container.firstChild?.firstChild as HTMLElement
      expect(columnBox).toBeInTheDocument()
    })
  })

  describe('Singular Field Props', () => {
    it('renders singular field with correct label', () => {
      renderWithTheme(<GenderInputColumn {...defaultProps} />)

      expect(screen.getByText('Singular')).toBeInTheDocument()
    })

    it('renders singular field with lowercase gender in placeholder', () => {
      renderWithTheme(<GenderInputColumn {...defaultProps} />)

      expect(
        screen.getByPlaceholderText('Type the masculine singular form...')
      ).toBeInTheDocument()
    })

    it('passes correct singular value to singular field', () => {
      renderWithTheme(
        <GenderInputColumn {...defaultProps} singularValue="bello" />
      )

      const input = screen.getByPlaceholderText(
        'Type the masculine singular form...'
      )
      expect(input).toHaveValue('bello')
    })

    it('passes correct singular validation status to singular field', () => {
      renderWithTheme(
        <GenderInputColumn {...defaultProps} singularValidation="correct" />
      )

      const input = screen.getByPlaceholderText(
        'Type the masculine singular form...'
      )
      expect(input).toHaveAttribute('data-validation', 'correct')
    })

    it('passes correct singular field name', () => {
      renderWithTheme(<GenderInputColumn {...defaultProps} />)

      const input = screen.getByPlaceholderText(
        'Type the masculine singular form...'
      )
      expect(input).toHaveAttribute('data-field', 'masculineSingular')
    })

    it('passes correct singular correct answer', () => {
      renderWithTheme(<GenderInputColumn {...defaultProps} />)

      const input = screen.getByPlaceholderText(
        'Type the masculine singular form...'
      )
      expect(input).toHaveAttribute('data-correct-answer', 'bello')
    })
  })

  describe('Plural Field Props', () => {
    it('renders plural field with correct label', () => {
      renderWithTheme(<GenderInputColumn {...defaultProps} />)

      expect(screen.getByText('Plural')).toBeInTheDocument()
    })

    it('renders plural field with lowercase gender in placeholder', () => {
      renderWithTheme(<GenderInputColumn {...defaultProps} />)

      expect(
        screen.getByPlaceholderText('Type the masculine plural form...')
      ).toBeInTheDocument()
    })

    it('passes correct plural value to plural field', () => {
      renderWithTheme(
        <GenderInputColumn {...defaultProps} pluralValue="belli" />
      )

      const input = screen.getByPlaceholderText(
        'Type the masculine plural form...'
      )
      expect(input).toHaveValue('belli')
    })

    it('passes correct plural validation status to plural field', () => {
      renderWithTheme(
        <GenderInputColumn {...defaultProps} pluralValidation="incorrect" />
      )

      const input = screen.getByPlaceholderText(
        'Type the masculine plural form...'
      )
      expect(input).toHaveAttribute('data-validation', 'incorrect')
    })

    it('passes correct plural field name', () => {
      renderWithTheme(<GenderInputColumn {...defaultProps} />)

      const input = screen.getByPlaceholderText(
        'Type the masculine plural form...'
      )
      expect(input).toHaveAttribute('data-field', 'masculinePlural')
    })

    it('passes correct plural correct answer', () => {
      renderWithTheme(<GenderInputColumn {...defaultProps} />)

      const input = screen.getByPlaceholderText(
        'Type the masculine plural form...'
      )
      expect(input).toHaveAttribute('data-correct-answer', 'belli')
    })
  })

  describe('Shared Props Passed to Both Fields', () => {
    it('passes adjectiveId to both fields', () => {
      renderWithTheme(
        <GenderInputColumn {...defaultProps} adjectiveId="adj-test-123" />
      )

      const singularInput = screen.getByPlaceholderText(
        'Type the masculine singular form...'
      )
      const pluralInput = screen.getByPlaceholderText(
        'Type the masculine plural form...'
      )

      expect(singularInput).toHaveAttribute('data-adjective-id', 'adj-test-123')
      expect(pluralInput).toHaveAttribute('data-adjective-id', 'adj-test-123')
    })

    it('passes index to both fields', () => {
      renderWithTheme(<GenderInputColumn {...defaultProps} index={5} />)

      const singularInput = screen.getByPlaceholderText(
        'Type the masculine singular form...'
      )
      const pluralInput = screen.getByPlaceholderText(
        'Type the masculine plural form...'
      )

      expect(singularInput).toHaveAttribute('data-index', '5')
      expect(pluralInput).toHaveAttribute('data-index', '5')
    })
  })

  describe('Feminine Gender', () => {
    const feminineProps = {
      ...defaultProps,
      gender: 'Feminine' as const,
      singularField: 'feminineSingular' as const,
      pluralField: 'femininePlural' as const,
      singularCorrectAnswer: 'bella',
      pluralCorrectAnswer: 'belle',
    }

    it('renders Feminine header', () => {
      renderWithTheme(<GenderInputColumn {...feminineProps} />)

      expect(screen.getByText('Feminine')).toBeInTheDocument()
    })

    it('renders feminine singular placeholder', () => {
      renderWithTheme(<GenderInputColumn {...feminineProps} />)

      expect(
        screen.getByPlaceholderText('Type the feminine singular form...')
      ).toBeInTheDocument()
    })

    it('renders feminine plural placeholder', () => {
      renderWithTheme(<GenderInputColumn {...feminineProps} />)

      expect(
        screen.getByPlaceholderText('Type the feminine plural form...')
      ).toBeInTheDocument()
    })

    it('passes correct feminine singular field', () => {
      renderWithTheme(<GenderInputColumn {...feminineProps} />)

      const input = screen.getByPlaceholderText(
        'Type the feminine singular form...'
      )
      expect(input).toHaveAttribute('data-field', 'feminineSingular')
    })

    it('passes correct feminine plural field', () => {
      renderWithTheme(<GenderInputColumn {...feminineProps} />)

      const input = screen.getByPlaceholderText(
        'Type the feminine plural form...'
      )
      expect(input).toHaveAttribute('data-field', 'femininePlural')
    })
  })

  describe('Validation Status', () => {
    it('handles null validation for both fields', () => {
      renderWithTheme(
        <GenderInputColumn
          {...defaultProps}
          singularValidation={null}
          pluralValidation={null}
        />
      )

      const singularInput = screen.getByPlaceholderText(
        'Type the masculine singular form...'
      )
      const pluralInput = screen.getByPlaceholderText(
        'Type the masculine plural form...'
      )

      expect(singularInput.getAttribute('data-validation')).toBe(null)
      expect(pluralInput.getAttribute('data-validation')).toBe(null)
    })

    it('handles correct validation for singular field', () => {
      renderWithTheme(
        <GenderInputColumn {...defaultProps} singularValidation="correct" />
      )

      const singularInput = screen.getByPlaceholderText(
        'Type the masculine singular form...'
      )
      expect(singularInput).toHaveAttribute('data-validation', 'correct')
    })

    it('handles incorrect validation for plural field', () => {
      renderWithTheme(
        <GenderInputColumn {...defaultProps} pluralValidation="incorrect" />
      )

      const pluralInput = screen.getByPlaceholderText(
        'Type the masculine plural form...'
      )
      expect(pluralInput).toHaveAttribute('data-validation', 'incorrect')
    })

    it('handles mixed validation states', () => {
      renderWithTheme(
        <GenderInputColumn
          {...defaultProps}
          singularValidation="correct"
          pluralValidation="incorrect"
        />
      )

      const singularInput = screen.getByPlaceholderText(
        'Type the masculine singular form...'
      )
      const pluralInput = screen.getByPlaceholderText(
        'Type the masculine plural form...'
      )

      expect(singularInput).toHaveAttribute('data-validation', 'correct')
      expect(pluralInput).toHaveAttribute('data-validation', 'incorrect')
    })
  })

  describe('Values', () => {
    it('handles empty values for both fields', () => {
      renderWithTheme(
        <GenderInputColumn {...defaultProps} singularValue="" pluralValue="" />
      )

      const singularInput = screen.getByPlaceholderText(
        'Type the masculine singular form...'
      )
      const pluralInput = screen.getByPlaceholderText(
        'Type the masculine plural form...'
      )

      expect(singularInput).toHaveValue('')
      expect(pluralInput).toHaveValue('')
    })

    it('handles non-empty values for both fields', () => {
      renderWithTheme(
        <GenderInputColumn
          {...defaultProps}
          singularValue="bello"
          pluralValue="belli"
        />
      )

      const singularInput = screen.getByPlaceholderText(
        'Type the masculine singular form...'
      )
      const pluralInput = screen.getByPlaceholderText(
        'Type the masculine plural form...'
      )

      expect(singularInput).toHaveValue('bello')
      expect(pluralInput).toHaveValue('belli')
    })

    it('handles different values for each field', () => {
      renderWithTheme(
        <GenderInputColumn
          {...defaultProps}
          singularValue="partial"
          pluralValue=""
        />
      )

      const singularInput = screen.getByPlaceholderText(
        'Type the masculine singular form...'
      )
      const pluralInput = screen.getByPlaceholderText(
        'Type the masculine plural form...'
      )

      expect(singularInput).toHaveValue('partial')
      expect(pluralInput).toHaveValue('')
    })
  })

  describe('Correct Answers', () => {
    it('passes different correct answers to each field', () => {
      renderWithTheme(
        <GenderInputColumn
          {...defaultProps}
          singularCorrectAnswer="grande"
          pluralCorrectAnswer="grandi"
        />
      )

      const singularInput = screen.getByPlaceholderText(
        'Type the masculine singular form...'
      )
      const pluralInput = screen.getByPlaceholderText(
        'Type the masculine plural form...'
      )

      expect(singularInput).toHaveAttribute('data-correct-answer', 'grande')
      expect(pluralInput).toHaveAttribute('data-correct-answer', 'grandi')
    })

    it('handles empty correct answers', () => {
      renderWithTheme(
        <GenderInputColumn
          {...defaultProps}
          singularCorrectAnswer=""
          pluralCorrectAnswer=""
        />
      )

      const singularInput = screen.getByPlaceholderText(
        'Type the masculine singular form...'
      )
      const pluralInput = screen.getByPlaceholderText(
        'Type the masculine plural form...'
      )

      expect(singularInput).toHaveAttribute('data-correct-answer', '')
      expect(pluralInput).toHaveAttribute('data-correct-answer', '')
    })
  })

  describe('Memoization', () => {
    it('exports a memoized component', () => {
      expect(GenderInputColumn.$$typeof?.toString()).toBe('Symbol(react.memo)')
    })
  })

  describe('Multiple Adjectives', () => {
    it('renders with different adjective IDs', () => {
      const { rerender } = renderWithTheme(
        <GenderInputColumn {...defaultProps} adjectiveId="adj-1" />
      )

      let singularInput = screen.getByPlaceholderText(
        'Type the masculine singular form...'
      )
      expect(singularInput).toHaveAttribute('data-adjective-id', 'adj-1')

      rerender(
        <ThemeProvider theme={theme}>
          <GenderInputColumn {...defaultProps} adjectiveId="adj-2" />
        </ThemeProvider>
      )

      singularInput = screen.getByPlaceholderText(
        'Type the masculine singular form...'
      )
      expect(singularInput).toHaveAttribute('data-adjective-id', 'adj-2')
    })

    it('renders with different indices', () => {
      const { rerender } = renderWithTheme(
        <GenderInputColumn {...defaultProps} index={0} />
      )

      let singularInput = screen.getByPlaceholderText(
        'Type the masculine singular form...'
      )
      expect(singularInput).toHaveAttribute('data-index', '0')

      rerender(
        <ThemeProvider theme={theme}>
          <GenderInputColumn {...defaultProps} index={10} />
        </ThemeProvider>
      )

      singularInput = screen.getByPlaceholderText(
        'Type the masculine singular form...'
      )
      expect(singularInput).toHaveAttribute('data-index', '10')
    })
  })

  describe('Edge Cases', () => {
    it('handles special characters in values', () => {
      renderWithTheme(
        <GenderInputColumn
          {...defaultProps}
          singularValue="àèéìòù"
          pluralValue="ÀÈÉÌÒÙ"
        />
      )

      const singularInput = screen.getByPlaceholderText(
        'Type the masculine singular form...'
      )
      const pluralInput = screen.getByPlaceholderText(
        'Type the masculine plural form...'
      )

      expect(singularInput).toHaveValue('àèéìòù')
      expect(pluralInput).toHaveValue('ÀÈÉÌÒÙ')
    })

    it('handles special characters in correct answers', () => {
      renderWithTheme(
        <GenderInputColumn
          {...defaultProps}
          singularCorrectAnswer="perché"
          pluralCorrectAnswer="città"
        />
      )

      const singularInput = screen.getByPlaceholderText(
        'Type the masculine singular form...'
      )
      const pluralInput = screen.getByPlaceholderText(
        'Type the masculine plural form...'
      )

      expect(singularInput).toHaveAttribute('data-correct-answer', 'perché')
      expect(pluralInput).toHaveAttribute('data-correct-answer', 'città')
    })

    it('handles long values', () => {
      const longValue = 'a'.repeat(100)
      renderWithTheme(
        <GenderInputColumn
          {...defaultProps}
          singularValue={longValue}
          pluralValue={longValue}
        />
      )

      const singularInput = screen.getByPlaceholderText(
        'Type the masculine singular form...'
      )
      const pluralInput = screen.getByPlaceholderText(
        'Type the masculine plural form...'
      )

      expect(singularInput).toHaveValue(longValue)
      expect(pluralInput).toHaveValue(longValue)
    })
  })

  describe('Typography Styling', () => {
    it('renders gender label with subtitle2 variant', () => {
      renderWithTheme(<GenderInputColumn {...defaultProps} />)

      const label = screen.getByText('Masculine')
      expect(label).toHaveClass('MuiTypography-subtitle2')
    })
  })
})
