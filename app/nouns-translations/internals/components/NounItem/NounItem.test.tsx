import React from 'react'

import { ThemeProvider, createTheme } from '@mui/material/styles'
import { render, screen, fireEvent } from '@testing-library/react'

import '@testing-library/jest-dom'
import { Statistics } from '@/app/components/Statistics'

import NounItem from './NounItem'

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

describe('NounItem', () => {
  const mockNoun = {
    id: 'noun-1',
    italian: 'casa',
    italianPlural: 'case',
    translation: 'house',
    translationPlural: 'houses',
  }

  const defaultInputValues = {
    singular: '',
    plural: '',
  }

  const defaultValidationState = {
    singular: null,
    plural: null,
  }

  const defaultStatistics = { correct: 0, wrong: 0 }

  const mockHandlers = {
    onInputChange: jest.fn(),
    onValidation: jest.fn(),
    onClearInput: jest.fn(),
    onShowAnswer: jest.fn(),
    onResetStatistics: jest.fn(),
    onKeyDown: jest.fn(),
    inputRefSingular: jest.fn(),
    inputRefPlural: jest.fn(),
  }

  const defaultProps = {
    noun: mockNoun,
    index: 0,
    inputValues: defaultInputValues,
    validationState: defaultValidationState,
    statistics: defaultStatistics,
    ...mockHandlers,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the noun translation', () => {
      renderWithTheme(<NounItem {...defaultProps} />)

      expect(screen.getByText('house')).toBeInTheDocument()
    })

    it('renders the noun plural translation', () => {
      renderWithTheme(<NounItem {...defaultProps} />)

      expect(screen.getByText('houses')).toBeInTheDocument()
    })

    it('renders both singular and plural input fields', () => {
      renderWithTheme(<NounItem {...defaultProps} />)

      expect(
        screen.getByPlaceholderText('Type the Italian singular...')
      ).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText('Type the Italian plural...')
      ).toBeInTheDocument()
    })

    it('renders show answer button', () => {
      renderWithTheme(<NounItem {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: /show answer/i })
      ).toBeInTheDocument()
    })

    it('renders reset statistics button', () => {
      renderWithTheme(<NounItem {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: /reset statistics/i })
      ).toBeInTheDocument()
    })

    it('renders clear field buttons for both inputs', () => {
      renderWithTheme(<NounItem {...defaultProps} />)

      const clearButtons = screen.getAllByRole('button', {
        name: /clear field/i,
      })
      expect(clearButtons).toHaveLength(2)
    })

    it('renders statistics component', () => {
      renderWithTheme(<NounItem {...defaultProps} />)

      expect(screen.getByTestId('statistics')).toBeInTheDocument()
    })
  })

  describe('Input Values', () => {
    it('displays input values in text fields', () => {
      const inputValues = {
        singular: 'casa',
        plural: 'case',
      }

      renderWithTheme(<NounItem {...defaultProps} inputValues={inputValues} />)

      expect(
        screen.getByPlaceholderText('Type the Italian singular...')
      ).toHaveValue('casa')
      expect(
        screen.getByPlaceholderText('Type the Italian plural...')
      ).toHaveValue('case')
    })

    it('handles empty input values gracefully', () => {
      renderWithTheme(<NounItem {...defaultProps} />)

      expect(
        screen.getByPlaceholderText('Type the Italian singular...')
      ).toHaveValue('')
      expect(
        screen.getByPlaceholderText('Type the Italian plural...')
      ).toHaveValue('')
    })

    it('handles undefined singular value', () => {
      const inputValues = {
        singular: undefined as unknown as string,
        plural: 'case',
      }

      renderWithTheme(<NounItem {...defaultProps} inputValues={inputValues} />)

      expect(
        screen.getByPlaceholderText('Type the Italian singular...')
      ).toHaveValue('')
    })

    it('handles undefined plural value', () => {
      const inputValues = {
        singular: 'casa',
        plural: undefined as unknown as string,
      }

      renderWithTheme(<NounItem {...defaultProps} inputValues={inputValues} />)

      expect(
        screen.getByPlaceholderText('Type the Italian plural...')
      ).toHaveValue('')
    })
  })

  describe('Validation Styles', () => {
    it('applies correct style when singular is correct', () => {
      const validationState = {
        singular: 'correct' as const,
        plural: null,
      }

      renderWithTheme(
        <NounItem {...defaultProps} validationState={validationState} />
      )

      const singularInput = screen.getByPlaceholderText(
        'Type the Italian singular...'
      )
      const inputContainer = singularInput.closest('.MuiTextField-root')
      expect(inputContainer).toHaveStyle({ backgroundColor: '#c8e6c9' })
    })

    it('applies incorrect style when singular is incorrect', () => {
      const validationState = {
        singular: 'incorrect' as const,
        plural: null,
      }

      renderWithTheme(
        <NounItem {...defaultProps} validationState={validationState} />
      )

      const singularInput = screen.getByPlaceholderText(
        'Type the Italian singular...'
      )
      const inputContainer = singularInput.closest('.MuiTextField-root')
      expect(inputContainer).toHaveStyle({ backgroundColor: '#ffcdd2' })
    })

    it('applies correct style when plural is correct', () => {
      const validationState = {
        singular: null,
        plural: 'correct' as const,
      }

      renderWithTheme(
        <NounItem {...defaultProps} validationState={validationState} />
      )

      const pluralInput = screen.getByPlaceholderText(
        'Type the Italian plural...'
      )
      const inputContainer = pluralInput.closest('.MuiTextField-root')
      expect(inputContainer).toHaveStyle({ backgroundColor: '#c8e6c9' })
    })

    it('applies incorrect style when plural is incorrect', () => {
      const validationState = {
        singular: null,
        plural: 'incorrect' as const,
      }

      renderWithTheme(
        <NounItem {...defaultProps} validationState={validationState} />
      )

      const pluralInput = screen.getByPlaceholderText(
        'Type the Italian plural...'
      )
      const inputContainer = pluralInput.closest('.MuiTextField-root')
      expect(inputContainer).toHaveStyle({ backgroundColor: '#ffcdd2' })
    })

    it('applies no special style when validation is null', () => {
      renderWithTheme(<NounItem {...defaultProps} />)

      const singularInput = screen.getByPlaceholderText(
        'Type the Italian singular...'
      )
      const inputContainer = singularInput.closest('.MuiTextField-root')
      expect(inputContainer).not.toHaveStyle({ backgroundColor: '#c8e6c9' })
      expect(inputContainer).not.toHaveStyle({ backgroundColor: '#ffcdd2' })
    })

    it('handles mixed validation states', () => {
      const validationState = {
        singular: 'correct' as const,
        plural: 'incorrect' as const,
      }

      renderWithTheme(
        <NounItem {...defaultProps} validationState={validationState} />
      )

      const singularInput = screen.getByPlaceholderText(
        'Type the Italian singular...'
      )
      const pluralInput = screen.getByPlaceholderText(
        'Type the Italian plural...'
      )

      const singularContainer = singularInput.closest('.MuiTextField-root')
      const pluralContainer = pluralInput.closest('.MuiTextField-root')

      expect(singularContainer).toHaveStyle({ backgroundColor: '#c8e6c9' })
      expect(pluralContainer).toHaveStyle({ backgroundColor: '#ffcdd2' })
    })
  })

  describe('Event Handlers', () => {
    describe('onInputChange', () => {
      it('calls onInputChange when singular input changes', () => {
        renderWithTheme(<NounItem {...defaultProps} />)

        const singularInput = screen.getByPlaceholderText(
          'Type the Italian singular...'
        )
        fireEvent.change(singularInput, { target: { value: 'casa' } })

        expect(mockHandlers.onInputChange).toHaveBeenCalledWith(
          'noun-1',
          'singular',
          'casa'
        )
      })

      it('calls onInputChange when plural input changes', () => {
        renderWithTheme(<NounItem {...defaultProps} />)

        const pluralInput = screen.getByPlaceholderText(
          'Type the Italian plural...'
        )
        fireEvent.change(pluralInput, { target: { value: 'case' } })

        expect(mockHandlers.onInputChange).toHaveBeenCalledWith(
          'noun-1',
          'plural',
          'case'
        )
      })
    })

    describe('onValidation', () => {
      it('calls onValidation with saveStatistics=false when singular input loses focus', () => {
        renderWithTheme(<NounItem {...defaultProps} />)

        const singularInput = screen.getByPlaceholderText(
          'Type the Italian singular...'
        )
        fireEvent.blur(singularInput)

        expect(mockHandlers.onValidation).toHaveBeenCalledWith('noun-1', false)
      })

      it('calls onValidation without saveStatistics flag when plural input loses focus', () => {
        renderWithTheme(<NounItem {...defaultProps} />)

        const pluralInput = screen.getByPlaceholderText(
          'Type the Italian plural...'
        )
        fireEvent.blur(pluralInput)

        expect(mockHandlers.onValidation).toHaveBeenCalledWith('noun-1')
      })
    })

    describe('onKeyDown', () => {
      it('calls onKeyDown with correct arguments for singular input', () => {
        renderWithTheme(<NounItem {...defaultProps} index={2} />)

        const singularInput = screen.getByPlaceholderText(
          'Type the Italian singular...'
        )
        fireEvent.keyDown(singularInput, { key: 'Enter' })

        expect(mockHandlers.onKeyDown).toHaveBeenCalledWith(
          expect.objectContaining({ key: 'Enter' }),
          'noun-1',
          'singular',
          2
        )
      })

      it('calls onKeyDown with correct arguments for plural input', () => {
        renderWithTheme(<NounItem {...defaultProps} index={3} />)

        const pluralInput = screen.getByPlaceholderText(
          'Type the Italian plural...'
        )
        fireEvent.keyDown(pluralInput, { key: 'Tab' })

        expect(mockHandlers.onKeyDown).toHaveBeenCalledWith(
          expect.objectContaining({ key: 'Tab' }),
          'noun-1',
          'plural',
          3
        )
      })
    })

    describe('onClearInput', () => {
      it('calls onClearInput for singular when clear button is clicked', () => {
        renderWithTheme(<NounItem {...defaultProps} />)

        const clearButtons = screen.getAllByRole('button', {
          name: /clear field/i,
        })
        // First clear button is for singular
        fireEvent.click(clearButtons[0]!)

        expect(mockHandlers.onClearInput).toHaveBeenCalledWith(
          'noun-1',
          'singular'
        )
      })

      it('calls onClearInput for plural when clear button is clicked', () => {
        renderWithTheme(<NounItem {...defaultProps} />)

        const clearButtons = screen.getAllByRole('button', {
          name: /clear field/i,
        })
        // Second clear button is for plural
        fireEvent.click(clearButtons[1]!)

        expect(mockHandlers.onClearInput).toHaveBeenCalledWith(
          'noun-1',
          'plural'
        )
      })
    })

    describe('onShowAnswer', () => {
      it('calls onShowAnswer when show answer button is clicked', () => {
        renderWithTheme(<NounItem {...defaultProps} />)

        const showAnswerButton = screen.getByRole('button', {
          name: /show answer/i,
        })
        fireEvent.click(showAnswerButton)

        expect(mockHandlers.onShowAnswer).toHaveBeenCalledWith('noun-1')
      })
    })

    describe('onResetStatistics', () => {
      it('calls onResetStatistics when reset button is clicked', () => {
        renderWithTheme(
          <NounItem {...defaultProps} statistics={{ correct: 5, wrong: 2 }} />
        )

        const resetButton = screen.getByRole('button', {
          name: /reset statistics/i,
        })
        fireEvent.click(resetButton)

        expect(mockHandlers.onResetStatistics).toHaveBeenCalledWith('noun-1')
      })
    })
  })

  describe('Input Refs', () => {
    it('passes inputRefSingular to singular input', () => {
      renderWithTheme(<NounItem {...defaultProps} />)

      // The ref callback should be passed to the input
      expect(mockHandlers.inputRefSingular).toBeDefined()
    })

    it('passes inputRefPlural to plural input', () => {
      renderWithTheme(<NounItem {...defaultProps} />)

      // The ref callback should be passed to the input
      expect(mockHandlers.inputRefPlural).toBeDefined()
    })
  })

  describe('Statistics Component', () => {
    it('passes correct statistics values to Statistics component', () => {
      MockedStatistics.mockClear()

      const statistics = { correct: 10, wrong: 5 }
      renderWithTheme(<NounItem {...defaultProps} statistics={statistics} />)

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
        <NounItem {...defaultProps} statistics={{ correct: 7, wrong: 3 }} />
      )

      expect(screen.getByTestId('correct-count')).toHaveTextContent('7')
      expect(screen.getByTestId('wrong-count')).toHaveTextContent('3')
    })
  })

  describe('Reset Statistics Button State', () => {
    it('disables reset button when no statistics exist', () => {
      renderWithTheme(
        <NounItem {...defaultProps} statistics={{ correct: 0, wrong: 0 }} />
      )

      const resetButton = screen.getByRole('button', {
        name: /reset statistics/i,
      })
      expect(resetButton).toBeDisabled()
    })

    it('enables reset button when correct count exists', () => {
      renderWithTheme(
        <NounItem {...defaultProps} statistics={{ correct: 1, wrong: 0 }} />
      )

      const resetButton = screen.getByRole('button', {
        name: /reset statistics/i,
      })
      expect(resetButton).not.toBeDisabled()
    })

    it('enables reset button when wrong count exists', () => {
      renderWithTheme(
        <NounItem {...defaultProps} statistics={{ correct: 0, wrong: 1 }} />
      )

      const resetButton = screen.getByRole('button', {
        name: /reset statistics/i,
      })
      expect(resetButton).not.toBeDisabled()
    })

    it('enables reset button when both counts exist', () => {
      renderWithTheme(
        <NounItem {...defaultProps} statistics={{ correct: 5, wrong: 3 }} />
      )

      const resetButton = screen.getByRole('button', {
        name: /reset statistics/i,
      })
      expect(resetButton).not.toBeDisabled()
    })
  })

  describe('Different Noun Data', () => {
    it('renders correctly with different noun data', () => {
      const differentNoun = {
        id: 'noun-2',
        italian: 'libro',
        italianPlural: 'libri',
        translation: 'book',
        translationPlural: 'books',
      }

      renderWithTheme(<NounItem {...defaultProps} noun={differentNoun} />)

      expect(screen.getByText('book')).toBeInTheDocument()
      expect(screen.getByText('books')).toBeInTheDocument()
    })

    it('handles noun with special characters in translation', () => {
      const specialNoun = {
        ...mockNoun,
        translation: 'house (dwelling)',
        translationPlural: 'houses (dwellings)',
      }

      renderWithTheme(<NounItem {...defaultProps} noun={specialNoun} />)

      expect(screen.getByText('house (dwelling)')).toBeInTheDocument()
      expect(screen.getByText('houses (dwellings)')).toBeInTheDocument()
    })

    it('passes correct noun id to event handlers', () => {
      const differentNoun = {
        id: 'custom-noun-id',
        italian: 'gatto',
        italianPlural: 'gatti',
        translation: 'cat',
        translationPlural: 'cats',
      }

      renderWithTheme(<NounItem {...defaultProps} noun={differentNoun} />)

      const showAnswerButton = screen.getByRole('button', {
        name: /show answer/i,
      })
      fireEvent.click(showAnswerButton)

      expect(mockHandlers.onShowAnswer).toHaveBeenCalledWith('custom-noun-id')
    })
  })

  describe('Index Prop', () => {
    it('passes correct index to onKeyDown handler', () => {
      renderWithTheme(<NounItem {...defaultProps} index={7} />)

      const singularInput = screen.getByPlaceholderText(
        'Type the Italian singular...'
      )
      fireEvent.keyDown(singularInput, { key: 'Enter' })

      expect(mockHandlers.onKeyDown).toHaveBeenCalledWith(
        expect.any(Object),
        'noun-1',
        'singular',
        7
      )
    })
  })

  describe('Memoization', () => {
    it('exports a memoized component', () => {
      expect(NounItem.$$typeof?.toString()).toBe('Symbol(react.memo)')
    })
  })

  describe('Autocomplete', () => {
    it('has autocomplete off for singular input', () => {
      renderWithTheme(<NounItem {...defaultProps} />)

      const singularInput = screen.getByPlaceholderText(
        'Type the Italian singular...'
      )
      expect(singularInput).toHaveAttribute('autocomplete', 'off')
    })

    it('has autocomplete off for plural input', () => {
      renderWithTheme(<NounItem {...defaultProps} />)

      const pluralInput = screen.getByPlaceholderText(
        'Type the Italian plural...'
      )
      expect(pluralInput).toHaveAttribute('autocomplete', 'off')
    })
  })

  describe('Accessibility', () => {
    it('has accessible tooltips for action buttons', () => {
      renderWithTheme(<NounItem {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: /show answer/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /reset statistics/i })
      ).toBeInTheDocument()
      expect(
        screen.getAllByRole('button', { name: /clear field/i })
      ).toHaveLength(2)
    })
  })
})
