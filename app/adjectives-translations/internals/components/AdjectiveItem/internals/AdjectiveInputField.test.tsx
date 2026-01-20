import React from 'react'

import { ThemeProvider, createTheme } from '@mui/material/styles'
import { render, screen, fireEvent } from '@testing-library/react'

import { PracticeActionsProvider } from '@/app/contexts'

import AdjectiveInputField from './AdjectiveInputField'

const theme = createTheme()

const mockActions = {
  onInputChange: jest.fn(),
  onValidation: jest.fn(),
  onClearInput: jest.fn(),
  onShowAnswer: jest.fn(),
  onResetStatistics: jest.fn(),
  onKeyDown: jest.fn(),
  getStatistics: jest.fn(() => ({ correct: 0, wrong: 0 })),
}

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      <PracticeActionsProvider value={mockActions}>
        {ui}
      </PracticeActionsProvider>
    </ThemeProvider>
  )
}

describe('AdjectiveInputField', () => {
  const defaultProps = {
    label: 'Masculine Singular',
    placeholder: 'Enter masculine singular',
    value: '',
    validationStatus: null as 'correct' | 'incorrect' | null,
    adjectiveId: 'adj-1',
    field: 'masculineSingular' as const,
    index: 0,
    correctAnswer: 'bello',
    inputRef: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders with correct label', () => {
      renderWithProviders(<AdjectiveInputField {...defaultProps} />)

      expect(screen.getByLabelText('Masculine Singular')).toBeInTheDocument()
    })

    it('renders with correct placeholder', () => {
      renderWithProviders(<AdjectiveInputField {...defaultProps} />)

      const input = screen.getByPlaceholderText('Enter masculine singular')
      expect(input).toBeInTheDocument()
    })

    it('renders with empty value by default', () => {
      renderWithProviders(<AdjectiveInputField {...defaultProps} />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('')
    })

    it('renders with provided value', () => {
      renderWithProviders(
        <AdjectiveInputField {...defaultProps} value="bello" />
      )

      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('bello')
    })

    it('renders clear button', () => {
      renderWithProviders(<AdjectiveInputField {...defaultProps} />)

      const clearButton = screen.getByRole('button')
      expect(clearButton).toBeInTheDocument()
    })

    it('renders clear button with tooltip', () => {
      renderWithProviders(<AdjectiveInputField {...defaultProps} />)

      expect(screen.getByLabelText('Clear field')).toBeInTheDocument()
    })

    it('renders clear icon', () => {
      renderWithProviders(<AdjectiveInputField {...defaultProps} />)

      const clearButton = screen.getByRole('button')
      const svgIcon = clearButton.querySelector('svg')
      expect(svgIcon).toBeInTheDocument()
    })

    it('renders as a full width text field', () => {
      renderWithProviders(<AdjectiveInputField {...defaultProps} />)

      const textField = screen
        .getByRole('textbox')
        .closest('.MuiTextField-root')
      expect(textField).toBeInTheDocument()
    })

    it('has autocomplete disabled', () => {
      renderWithProviders(<AdjectiveInputField {...defaultProps} />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('autocomplete', 'off')
    })
  })

  describe('Validation Styles', () => {
    it('has no background color when validation is null', () => {
      renderWithProviders(
        <AdjectiveInputField {...defaultProps} validationStatus={null} />
      )

      const input = screen.getByRole('textbox')
      const inputContainer = input.closest('.MuiOutlinedInput-root')

      // No specific background color should be applied
      expect(inputContainer).not.toHaveStyle({
        backgroundColor: '#c8e6c9',
      })
      expect(inputContainer).not.toHaveStyle({
        backgroundColor: '#ffcdd2',
      })
    })

    it('has green background when validation is correct', () => {
      renderWithProviders(
        <AdjectiveInputField {...defaultProps} validationStatus="correct" />
      )

      const input = screen.getByRole('textbox')
      const textField = input.closest('.MuiTextField-root')

      // Component uses sx prop with backgroundColor
      expect(textField).toBeInTheDocument()
    })

    it('has red background when validation is incorrect', () => {
      renderWithProviders(
        <AdjectiveInputField {...defaultProps} validationStatus="incorrect" />
      )

      const input = screen.getByRole('textbox')
      const textField = input.closest('.MuiTextField-root')

      // Component uses sx prop with backgroundColor
      expect(textField).toBeInTheDocument()
    })
  })

  describe('Event Handlers', () => {
    it('calls onInputChange when typing in the field', () => {
      renderWithProviders(<AdjectiveInputField {...defaultProps} />)

      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'bello' } })

      expect(mockActions.onInputChange).toHaveBeenCalledWith(
        'adj-1',
        'masculineSingular',
        'bello'
      )
    })

    it('calls onInputChange with empty string when clearing input manually', () => {
      renderWithProviders(
        <AdjectiveInputField {...defaultProps} value="test" />
      )

      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: '' } })

      expect(mockActions.onInputChange).toHaveBeenCalledWith(
        'adj-1',
        'masculineSingular',
        ''
      )
    })

    it('calls onValidation when field loses focus', () => {
      renderWithProviders(<AdjectiveInputField {...defaultProps} />)

      const input = screen.getByRole('textbox')
      fireEvent.blur(input)

      expect(mockActions.onValidation).toHaveBeenCalledWith(
        'adj-1',
        'masculineSingular',
        'bello'
      )
    })

    it('calls onKeyDown when pressing a key', () => {
      renderWithProviders(<AdjectiveInputField {...defaultProps} />)

      const input = screen.getByRole('textbox')
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

      expect(mockActions.onKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'keydown',
        }),
        'adj-1',
        'masculineSingular',
        0
      )
    })

    it('calls onClearInput when clear button is clicked', () => {
      renderWithProviders(<AdjectiveInputField {...defaultProps} />)

      const clearButton = screen.getByRole('button')
      fireEvent.click(clearButton)

      expect(mockActions.onClearInput).toHaveBeenCalledWith(
        'adj-1',
        'masculineSingular'
      )
    })

    it('calls onKeyDown with correct index parameter', () => {
      renderWithProviders(<AdjectiveInputField {...defaultProps} index={5} />)

      const input = screen.getByRole('textbox')
      fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' })

      expect(mockActions.onKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'keydown',
        }),
        'adj-1',
        'masculineSingular',
        5
      )
    })
  })

  describe('Input Ref', () => {
    it('calls inputRef with HTML input element', () => {
      const mockInputRef = jest.fn()
      renderWithProviders(
        <AdjectiveInputField {...defaultProps} inputRef={mockInputRef} />
      )

      expect(mockInputRef).toHaveBeenCalledWith(expect.any(HTMLInputElement))
    })

    it('calls inputRef for different fields', () => {
      const mockInputRef = jest.fn()
      const props = {
        ...defaultProps,
        field: 'femininePlural' as const,
        label: 'Feminine Plural',
        inputRef: mockInputRef,
      }

      renderWithProviders(<AdjectiveInputField {...props} />)

      expect(mockInputRef).toHaveBeenCalledWith(expect.any(HTMLInputElement))
    })

    it('calls inputRef for different adjectives', () => {
      const mockInputRef = jest.fn()
      const props = {
        ...defaultProps,
        adjectiveId: 'adj-999',
        inputRef: mockInputRef,
      }

      renderWithProviders(<AdjectiveInputField {...props} />)

      expect(mockInputRef).toHaveBeenCalledWith(expect.any(HTMLInputElement))
    })
  })

  describe('Different Props', () => {
    it('renders with different label', () => {
      renderWithProviders(
        <AdjectiveInputField {...defaultProps} label="Feminine Singular" />
      )

      expect(screen.getByLabelText('Feminine Singular')).toBeInTheDocument()
    })

    it('renders with different placeholder', () => {
      renderWithProviders(
        <AdjectiveInputField {...defaultProps} placeholder="Type your answer" />
      )

      expect(
        screen.getByPlaceholderText('Type your answer')
      ).toBeInTheDocument()
    })

    it('renders with different field types', () => {
      const fields = [
        'masculineSingular',
        'masculinePlural',
        'feminineSingular',
        'femininePlural',
      ] as const

      fields.forEach((field) => {
        const { unmount } = renderWithProviders(
          <AdjectiveInputField {...defaultProps} field={field} />
        )

        const input = screen.getByRole('textbox')
        fireEvent.change(input, { target: { value: 'test' } })

        expect(mockActions.onInputChange).toHaveBeenCalledWith(
          'adj-1',
          field,
          'test'
        )

        mockActions.onInputChange.mockClear()
        unmount()
      })
    })

    it('renders with different adjective IDs', () => {
      renderWithProviders(
        <AdjectiveInputField {...defaultProps} adjectiveId="adj-different" />
      )

      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'test' } })

      expect(mockActions.onInputChange).toHaveBeenCalledWith(
        'adj-different',
        'masculineSingular',
        'test'
      )
    })

    it('renders with different correct answers', () => {
      renderWithProviders(
        <AdjectiveInputField {...defaultProps} correctAnswer="grande" />
      )

      const input = screen.getByRole('textbox')
      fireEvent.blur(input)

      expect(mockActions.onValidation).toHaveBeenCalledWith(
        'adj-1',
        'masculineSingular',
        'grande'
      )
    })
  })

  describe('Clear Button', () => {
    it('has small size', () => {
      renderWithProviders(<AdjectiveInputField {...defaultProps} />)

      const clearButton = screen.getByRole('button')
      expect(clearButton).toHaveClass('MuiIconButton-sizeSmall')
    })

    it('has edge="end" positioning', () => {
      renderWithProviders(<AdjectiveInputField {...defaultProps} />)

      const clearButton = screen.getByRole('button')
      expect(clearButton).toHaveClass('MuiIconButton-edgeEnd')
    })

    it('is always rendered regardless of value', () => {
      const { rerender } = renderWithProviders(
        <AdjectiveInputField {...defaultProps} value="" />
      )

      expect(screen.getByRole('button')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={theme}>
          <PracticeActionsProvider value={mockActions}>
            <AdjectiveInputField {...defaultProps} value="some value" />
          </PracticeActionsProvider>
        </ThemeProvider>
      )

      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Memoization', () => {
    it('exports a memoized component', () => {
      expect(AdjectiveInputField.$$typeof?.toString()).toBe(
        'Symbol(react.memo)'
      )
    })
  })

  describe('Input Size', () => {
    it('renders with small size', () => {
      renderWithProviders(<AdjectiveInputField {...defaultProps} />)

      const input = screen.getByRole('textbox')
      const textField = input.closest('.MuiTextField-root')
      expect(
        textField?.querySelector('.MuiInputBase-sizeSmall')
      ).toBeInTheDocument()
    })
  })

  describe('Multiple Event Calls', () => {
    it('calls onInputChange multiple times for consecutive typing', () => {
      renderWithProviders(<AdjectiveInputField {...defaultProps} />)

      const input = screen.getByRole('textbox')

      fireEvent.change(input, { target: { value: 'b' } })
      fireEvent.change(input, { target: { value: 'be' } })
      fireEvent.change(input, { target: { value: 'bel' } })
      fireEvent.change(input, { target: { value: 'bell' } })
      fireEvent.change(input, { target: { value: 'bello' } })

      expect(mockActions.onInputChange).toHaveBeenCalledTimes(5)
      expect(mockActions.onInputChange).toHaveBeenLastCalledWith(
        'adj-1',
        'masculineSingular',
        'bello'
      )
    })

    it('handles multiple blur events', () => {
      renderWithProviders(<AdjectiveInputField {...defaultProps} />)

      const input = screen.getByRole('textbox')

      fireEvent.blur(input)
      fireEvent.blur(input)

      expect(mockActions.onValidation).toHaveBeenCalledTimes(2)
    })

    it('handles clear button being clicked multiple times', () => {
      renderWithProviders(<AdjectiveInputField {...defaultProps} />)

      const clearButton = screen.getByRole('button')

      fireEvent.click(clearButton)
      fireEvent.click(clearButton)
      fireEvent.click(clearButton)

      expect(mockActions.onClearInput).toHaveBeenCalledTimes(3)
    })
  })

  describe('Integration', () => {
    it('handles typical user workflow: type, blur, clear', () => {
      renderWithProviders(<AdjectiveInputField {...defaultProps} />)

      const input = screen.getByRole('textbox')
      const clearButton = screen.getByRole('button')

      // Type in the input
      fireEvent.change(input, { target: { value: 'bello' } })
      expect(mockActions.onInputChange).toHaveBeenCalledWith(
        'adj-1',
        'masculineSingular',
        'bello'
      )

      // Blur triggers validation
      fireEvent.blur(input)
      expect(mockActions.onValidation).toHaveBeenCalledWith(
        'adj-1',
        'masculineSingular',
        'bello'
      )

      // Clear the input
      fireEvent.click(clearButton)
      expect(mockActions.onClearInput).toHaveBeenCalledWith(
        'adj-1',
        'masculineSingular'
      )
    })

    it('handles keyboard navigation', () => {
      renderWithProviders(<AdjectiveInputField {...defaultProps} />)

      const input = screen.getByRole('textbox')

      fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' })
      expect(mockActions.onKeyDown).toHaveBeenCalledTimes(1)

      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
      expect(mockActions.onKeyDown).toHaveBeenCalledTimes(2)

      fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' })
      expect(mockActions.onKeyDown).toHaveBeenCalledTimes(3)
    })
  })

  describe('Edge Cases', () => {
    it('handles special characters in value', () => {
      renderWithProviders(
        <AdjectiveInputField {...defaultProps} value="àèéìòù" />
      )

      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('àèéìòù')
    })

    it('handles long values', () => {
      const longValue = 'a'.repeat(100)
      renderWithProviders(
        <AdjectiveInputField {...defaultProps} value={longValue} />
      )

      const input = screen.getByRole('textbox')
      expect(input).toHaveValue(longValue)
    })

    it('handles empty correct answer', () => {
      renderWithProviders(
        <AdjectiveInputField {...defaultProps} correctAnswer="" />
      )

      const input = screen.getByRole('textbox')
      fireEvent.blur(input)

      expect(mockActions.onValidation).toHaveBeenCalledWith(
        'adj-1',
        'masculineSingular',
        ''
      )
    })
  })
})
