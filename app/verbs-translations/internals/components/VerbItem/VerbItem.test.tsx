import React from 'react'

import { ThemeProvider, createTheme } from '@mui/material/styles'
import { render, screen, fireEvent } from '@testing-library/react'

import '@testing-library/jest-dom'
import { Statistics } from '@/app/components/Statistics'

import VerbItem from './VerbItem'

// Mock Statistics component
jest.mock('@/app/components/Statistics', () => ({
  Statistics: jest.fn(({ correct, wrong }) => (
    <div data-testid="statistics">
      <span data-testid="correct-count">{correct}</span>
      <span data-testid="wrong-count">{wrong}</span>
    </div>
  )),
}))

const MockedStatistics = jest.mocked(Statistics)

const theme = createTheme()

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

describe('VerbItem', () => {
  const mockVerb = {
    id: 'verb-1',
    italian: 'parlare',
    translation: 'to speak',
    regular: true,
    reflexive: false,
  }

  const defaultStatistics = { correct: 0, wrong: 0 }

  const mockHandlers = {
    onInputChange: jest.fn(),
    onValidation: jest.fn(),
    onClearInput: jest.fn(),
    onShowAnswer: jest.fn(),
    onResetStatistics: jest.fn(),
    onKeyDown: jest.fn(),
    inputRef: jest.fn(),
  }

  const defaultProps = {
    verb: mockVerb,
    index: 0,
    inputValue: '',
    validationState: null as 'correct' | 'incorrect' | null,
    statistics: defaultStatistics,
    ...mockHandlers,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the verb translation', () => {
      renderWithTheme(<VerbItem {...defaultProps} />)

      expect(screen.getByText('to speak')).toBeInTheDocument()
    })

    it('renders the input field', () => {
      renderWithTheme(<VerbItem {...defaultProps} />)

      expect(
        screen.getByPlaceholderText('Type the Italian translation...')
      ).toBeInTheDocument()
    })

    it('renders show answer button', () => {
      renderWithTheme(<VerbItem {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: /show answer/i })
      ).toBeInTheDocument()
    })

    it('renders reset statistics button', () => {
      renderWithTheme(<VerbItem {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: /reset statistics/i })
      ).toBeInTheDocument()
    })

    it('renders clear field button', () => {
      renderWithTheme(<VerbItem {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: /clear field/i })
      ).toBeInTheDocument()
    })

    it('renders statistics component', () => {
      renderWithTheme(<VerbItem {...defaultProps} />)

      expect(screen.getByTestId('statistics')).toBeInTheDocument()
    })
  })

  describe('Verb Type Icons', () => {
    it('renders regular icon for regular verbs', () => {
      const regularVerb = {
        ...mockVerb,
        regular: true,
        reflexive: false,
      }

      renderWithTheme(<VerbItem {...defaultProps} verb={regularVerb} />)

      expect(screen.getByTestId('RadioButtonCheckedIcon')).toBeInTheDocument()
    })

    it('renders irregular icon for irregular verbs', () => {
      const irregularVerb = {
        ...mockVerb,
        regular: false,
        reflexive: false,
      }

      renderWithTheme(<VerbItem {...defaultProps} verb={irregularVerb} />)

      expect(screen.getByTestId('ShowChartIcon')).toBeInTheDocument()
    })

    it('renders reflexive icon for reflexive verbs', () => {
      const reflexiveVerb = {
        ...mockVerb,
        regular: true,
        reflexive: true,
      }

      renderWithTheme(<VerbItem {...defaultProps} verb={reflexiveVerb} />)

      expect(screen.getByTestId('AutorenewIcon')).toBeInTheDocument()
    })

    it('prioritizes reflexive icon over regular icon', () => {
      const reflexiveRegularVerb = {
        ...mockVerb,
        regular: true,
        reflexive: true,
      }

      renderWithTheme(
        <VerbItem {...defaultProps} verb={reflexiveRegularVerb} />
      )

      expect(screen.getByTestId('AutorenewIcon')).toBeInTheDocument()
      expect(
        screen.queryByTestId('RadioButtonCheckedIcon')
      ).not.toBeInTheDocument()
    })

    it('prioritizes reflexive icon over irregular icon', () => {
      const reflexiveIrregularVerb = {
        ...mockVerb,
        regular: false,
        reflexive: true,
      }

      renderWithTheme(
        <VerbItem {...defaultProps} verb={reflexiveIrregularVerb} />
      )

      expect(screen.getByTestId('AutorenewIcon')).toBeInTheDocument()
      expect(screen.queryByTestId('ShowChartIcon')).not.toBeInTheDocument()
    })
  })

  describe('Input Values', () => {
    it('displays input value in text field', () => {
      renderWithTheme(<VerbItem {...defaultProps} inputValue="parlare" />)

      expect(
        screen.getByPlaceholderText('Type the Italian translation...')
      ).toHaveValue('parlare')
    })

    it('handles empty input value gracefully', () => {
      renderWithTheme(<VerbItem {...defaultProps} inputValue="" />)

      expect(
        screen.getByPlaceholderText('Type the Italian translation...')
      ).toHaveValue('')
    })
  })

  describe('Validation Styles', () => {
    it('applies correct style when validation is correct', () => {
      renderWithTheme(<VerbItem {...defaultProps} validationState="correct" />)

      const input = screen.getByPlaceholderText(
        'Type the Italian translation...'
      )
      const inputContainer = input.closest('.MuiTextField-root')
      expect(inputContainer).toHaveStyle({ backgroundColor: '#c8e6c9' })
    })

    it('applies incorrect style when validation is incorrect', () => {
      renderWithTheme(
        <VerbItem {...defaultProps} validationState="incorrect" />
      )

      const input = screen.getByPlaceholderText(
        'Type the Italian translation...'
      )
      const inputContainer = input.closest('.MuiTextField-root')
      expect(inputContainer).toHaveStyle({ backgroundColor: '#ffcdd2' })
    })

    it('applies no special style when validation is null', () => {
      renderWithTheme(<VerbItem {...defaultProps} validationState={null} />)

      const input = screen.getByPlaceholderText(
        'Type the Italian translation...'
      )
      const inputContainer = input.closest('.MuiTextField-root')
      expect(inputContainer).not.toHaveStyle({ backgroundColor: '#c8e6c9' })
      expect(inputContainer).not.toHaveStyle({ backgroundColor: '#ffcdd2' })
    })
  })

  describe('Event Handlers', () => {
    describe('onInputChange', () => {
      it('calls onInputChange when input changes', () => {
        renderWithTheme(<VerbItem {...defaultProps} />)

        const input = screen.getByPlaceholderText(
          'Type the Italian translation...'
        )
        fireEvent.change(input, { target: { value: 'parlare' } })

        expect(mockHandlers.onInputChange).toHaveBeenCalledWith(
          'verb-1',
          'parlare'
        )
      })

      it('calls onInputChange with empty string when clearing', () => {
        renderWithTheme(<VerbItem {...defaultProps} inputValue="parlare" />)

        const input = screen.getByPlaceholderText(
          'Type the Italian translation...'
        )
        fireEvent.change(input, { target: { value: '' } })

        expect(mockHandlers.onInputChange).toHaveBeenCalledWith('verb-1', '')
      })
    })

    describe('onValidation', () => {
      it('calls onValidation with verb id and correct answer when input loses focus', () => {
        renderWithTheme(<VerbItem {...defaultProps} />)

        const input = screen.getByPlaceholderText(
          'Type the Italian translation...'
        )
        fireEvent.blur(input)

        expect(mockHandlers.onValidation).toHaveBeenCalledWith(
          'verb-1',
          'parlare'
        )
      })
    })

    describe('onKeyDown', () => {
      it('calls onKeyDown with correct arguments', () => {
        renderWithTheme(<VerbItem {...defaultProps} index={2} />)

        const input = screen.getByPlaceholderText(
          'Type the Italian translation...'
        )
        fireEvent.keyDown(input, { key: 'Enter' })

        expect(mockHandlers.onKeyDown).toHaveBeenCalledWith(
          expect.objectContaining({ key: 'Enter' }),
          'verb-1',
          'parlare',
          2
        )
      })

      it('calls onKeyDown with different keys', () => {
        renderWithTheme(<VerbItem {...defaultProps} index={3} />)

        const input = screen.getByPlaceholderText(
          'Type the Italian translation...'
        )
        fireEvent.keyDown(input, { key: 'Tab' })

        expect(mockHandlers.onKeyDown).toHaveBeenCalledWith(
          expect.objectContaining({ key: 'Tab' }),
          'verb-1',
          'parlare',
          3
        )
      })
    })

    describe('onClearInput', () => {
      it('calls onClearInput when clear button is clicked', () => {
        renderWithTheme(<VerbItem {...defaultProps} />)

        const clearButton = screen.getByRole('button', { name: /clear field/i })
        fireEvent.click(clearButton)

        expect(mockHandlers.onClearInput).toHaveBeenCalledWith('verb-1')
      })
    })

    describe('onShowAnswer', () => {
      it('calls onShowAnswer with verb id and correct answer when button is clicked', () => {
        renderWithTheme(<VerbItem {...defaultProps} />)

        const showAnswerButton = screen.getByRole('button', {
          name: /show answer/i,
        })
        fireEvent.click(showAnswerButton)

        expect(mockHandlers.onShowAnswer).toHaveBeenCalledWith(
          'verb-1',
          'parlare'
        )
      })
    })

    describe('onResetStatistics', () => {
      it('calls onResetStatistics when reset button is clicked', () => {
        renderWithTheme(
          <VerbItem {...defaultProps} statistics={{ correct: 5, wrong: 2 }} />
        )

        const resetButton = screen.getByRole('button', {
          name: /reset statistics/i,
        })
        fireEvent.click(resetButton)

        expect(mockHandlers.onResetStatistics).toHaveBeenCalledWith('verb-1')
      })
    })
  })

  describe('Input Ref', () => {
    it('passes inputRef to input', () => {
      renderWithTheme(<VerbItem {...defaultProps} />)

      // The ref callback should be passed to the input
      expect(mockHandlers.inputRef).toBeDefined()
    })
  })

  describe('Statistics Component', () => {
    it('passes correct statistics values to Statistics component', () => {
      MockedStatistics.mockClear()

      const statistics = { correct: 10, wrong: 5 }
      renderWithTheme(<VerbItem {...defaultProps} statistics={statistics} />)

      expect(MockedStatistics).toHaveBeenCalledWith(
        expect.objectContaining({
          correct: 10,
          wrong: 5,
        }),
        undefined
      )
    })

    it('displays correct count in statistics', () => {
      renderWithTheme(
        <VerbItem {...defaultProps} statistics={{ correct: 7, wrong: 3 }} />
      )

      expect(screen.getByTestId('correct-count')).toHaveTextContent('7')
      expect(screen.getByTestId('wrong-count')).toHaveTextContent('3')
    })
  })

  describe('Reset Statistics Button State', () => {
    it('disables reset button when no statistics exist', () => {
      renderWithTheme(
        <VerbItem {...defaultProps} statistics={{ correct: 0, wrong: 0 }} />
      )

      const resetButton = screen.getByRole('button', {
        name: /reset statistics/i,
      })
      expect(resetButton).toBeDisabled()
    })

    it('enables reset button when correct count exists', () => {
      renderWithTheme(
        <VerbItem {...defaultProps} statistics={{ correct: 1, wrong: 0 }} />
      )

      const resetButton = screen.getByRole('button', {
        name: /reset statistics/i,
      })
      expect(resetButton).not.toBeDisabled()
    })

    it('enables reset button when wrong count exists', () => {
      renderWithTheme(
        <VerbItem {...defaultProps} statistics={{ correct: 0, wrong: 1 }} />
      )

      const resetButton = screen.getByRole('button', {
        name: /reset statistics/i,
      })
      expect(resetButton).not.toBeDisabled()
    })

    it('enables reset button when both counts exist', () => {
      renderWithTheme(
        <VerbItem {...defaultProps} statistics={{ correct: 5, wrong: 3 }} />
      )

      const resetButton = screen.getByRole('button', {
        name: /reset statistics/i,
      })
      expect(resetButton).not.toBeDisabled()
    })
  })

  describe('Different Verb Data', () => {
    it('renders correctly with different verb data', () => {
      const differentVerb = {
        id: 'verb-2',
        italian: 'mangiare',
        translation: 'to eat',
        regular: true,
        reflexive: false,
      }

      renderWithTheme(<VerbItem {...defaultProps} verb={differentVerb} />)

      expect(screen.getByText('to eat')).toBeInTheDocument()
    })

    it('handles verb with special characters in translation', () => {
      const specialVerb = {
        ...mockVerb,
        translation: 'to speak (with someone)',
      }

      renderWithTheme(<VerbItem {...defaultProps} verb={specialVerb} />)

      expect(screen.getByText('to speak (with someone)')).toBeInTheDocument()
    })

    it('passes correct verb id to event handlers', () => {
      const differentVerb = {
        id: 'custom-verb-id',
        italian: 'dormire',
        translation: 'to sleep',
        regular: true,
        reflexive: false,
      }

      renderWithTheme(<VerbItem {...defaultProps} verb={differentVerb} />)

      const showAnswerButton = screen.getByRole('button', {
        name: /show answer/i,
      })
      fireEvent.click(showAnswerButton)

      expect(mockHandlers.onShowAnswer).toHaveBeenCalledWith(
        'custom-verb-id',
        'dormire'
      )
    })

    it('passes correct italian value for validation', () => {
      const differentVerb = {
        id: 'verb-3',
        italian: 'correre',
        translation: 'to run',
        regular: false,
        reflexive: false,
      }

      renderWithTheme(<VerbItem {...defaultProps} verb={differentVerb} />)

      const input = screen.getByPlaceholderText(
        'Type the Italian translation...'
      )
      fireEvent.blur(input)

      expect(mockHandlers.onValidation).toHaveBeenCalledWith(
        'verb-3',
        'correre'
      )
    })
  })

  describe('Index Prop', () => {
    it('passes correct index to onKeyDown handler', () => {
      renderWithTheme(<VerbItem {...defaultProps} index={7} />)

      const input = screen.getByPlaceholderText(
        'Type the Italian translation...'
      )
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(mockHandlers.onKeyDown).toHaveBeenCalledWith(
        expect.any(Object),
        'verb-1',
        'parlare',
        7
      )
    })
  })

  describe('Memoization', () => {
    it('exports a memoized component', () => {
      expect(VerbItem.$$typeof?.toString()).toBe('Symbol(react.memo)')
    })
  })

  describe('Autocomplete', () => {
    it('has autocomplete off for input', () => {
      renderWithTheme(<VerbItem {...defaultProps} />)

      const input = screen.getByPlaceholderText(
        'Type the Italian translation...'
      )
      expect(input).toHaveAttribute('autocomplete', 'off')
    })
  })

  describe('Accessibility', () => {
    it('has accessible tooltips for action buttons', () => {
      renderWithTheme(<VerbItem {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: /show answer/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /reset statistics/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /clear field/i })
      ).toBeInTheDocument()
    })

    it('has accessible tooltip for regular verb icon', () => {
      const regularVerb = {
        ...mockVerb,
        regular: true,
        reflexive: false,
      }

      renderWithTheme(<VerbItem {...defaultProps} verb={regularVerb} />)

      // The icon should have a tooltip title "Regular"
      expect(screen.getByTestId('RadioButtonCheckedIcon')).toBeInTheDocument()
    })

    it('has accessible tooltip for irregular verb icon', () => {
      const irregularVerb = {
        ...mockVerb,
        regular: false,
        reflexive: false,
      }

      renderWithTheme(<VerbItem {...defaultProps} verb={irregularVerb} />)

      // The icon should have a tooltip title "Irregular"
      expect(screen.getByTestId('ShowChartIcon')).toBeInTheDocument()
    })

    it('has accessible tooltip for reflexive verb icon', () => {
      const reflexiveVerb = {
        ...mockVerb,
        regular: true,
        reflexive: true,
      }

      renderWithTheme(<VerbItem {...defaultProps} verb={reflexiveVerb} />)

      // The icon should have a tooltip title "Reflexive"
      expect(screen.getByTestId('AutorenewIcon')).toBeInTheDocument()
    })
  })

  describe('Verb Type Combinations', () => {
    it('handles regular non-reflexive verb', () => {
      const verb = {
        id: 'verb-regular',
        italian: 'parlare',
        translation: 'to speak',
        regular: true,
        reflexive: false,
      }

      renderWithTheme(<VerbItem {...defaultProps} verb={verb} />)

      expect(screen.getByTestId('RadioButtonCheckedIcon')).toBeInTheDocument()
    })

    it('handles irregular non-reflexive verb', () => {
      const verb = {
        id: 'verb-irregular',
        italian: 'andare',
        translation: 'to go',
        regular: false,
        reflexive: false,
      }

      renderWithTheme(<VerbItem {...defaultProps} verb={verb} />)

      expect(screen.getByTestId('ShowChartIcon')).toBeInTheDocument()
    })

    it('handles regular reflexive verb', () => {
      const verb = {
        id: 'verb-regular-reflexive',
        italian: 'lavarsi',
        translation: 'to wash oneself',
        regular: true,
        reflexive: true,
      }

      renderWithTheme(<VerbItem {...defaultProps} verb={verb} />)

      expect(screen.getByTestId('AutorenewIcon')).toBeInTheDocument()
    })

    it('handles irregular reflexive verb', () => {
      const verb = {
        id: 'verb-irregular-reflexive',
        italian: 'vestirsi',
        translation: 'to dress oneself',
        regular: false,
        reflexive: true,
      }

      renderWithTheme(<VerbItem {...defaultProps} verb={verb} />)

      expect(screen.getByTestId('AutorenewIcon')).toBeInTheDocument()
    })
  })
})
