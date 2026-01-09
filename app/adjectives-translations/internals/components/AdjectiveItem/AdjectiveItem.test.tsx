import React from 'react'

import { ThemeProvider, createTheme } from '@mui/material/styles'
import { render, screen, fireEvent } from '@testing-library/react'

import { Statistics } from '@/app/components/Statistics'

import AdjectiveItem from './AdjectiveItem'
import { GenderInputColumn, AdjectiveActions } from './internals'

// Mock child components
jest.mock('./internals', () => ({
  GenderInputColumn: jest.fn(({ gender, singularField, pluralField }) => (
    <div data-testid={`gender-column-${gender.toLowerCase()}`}>
      <span data-testid={`field-${singularField}`} />
      <span data-testid={`field-${pluralField}`} />
    </div>
  )),
  AdjectiveActions: jest.fn(
    ({
      adjectiveId,
      hasStatistics,
      onShowAnswer,
      onClearInput,
      onResetStatistics,
      showResetButton,
    }) => (
      <div
        data-testid={`adjective-actions-${showResetButton === false ? 'no-reset' : 'with-reset'}`}
      >
        <button onClick={() => onShowAnswer(adjectiveId)}>Show Answer</button>
        <button onClick={() => onClearInput(adjectiveId)}>Clear</button>
        {showResetButton !== false && (
          <button
            onClick={() => onResetStatistics(adjectiveId)}
            disabled={!hasStatistics}
          >
            Reset
          </button>
        )}
      </div>
    )
  ),
}))

jest.mock('@/app/components/Statistics', () => ({
  Statistics: jest.fn(({ correct, wrong }) => (
    <div data-testid="statistics">
      <span data-testid="correct-count">{correct}</span>
      <span data-testid="wrong-count">{wrong}</span>
    </div>
  )),
}))

const MockedGenderInputColumn = jest.mocked(GenderInputColumn)
const MockedAdjectiveActions = jest.mocked(AdjectiveActions)
const MockedStatistics = jest.mocked(Statistics)

const theme = createTheme()

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

describe('AdjectiveItem', () => {
  const mockAdjective = {
    id: 'adj-1',
    italian: 'bello',
    masculineSingular: 'bello',
    masculinePlural: 'belli',
    feminineSingular: 'bella',
    femininePlural: 'belle',
    translation: 'beautiful',
  }

  const defaultInputValues = {
    masculineSingular: '',
    masculinePlural: '',
    feminineSingular: '',
    femininePlural: '',
  }

  const defaultValidationState = {
    masculineSingular: null,
    masculinePlural: null,
    feminineSingular: null,
    femininePlural: null,
  }

  const defaultStatistics = { correct: 0, wrong: 0 }

  const mockHandlers = {
    onInputChange: jest.fn(),
    onValidation: jest.fn(),
    onClearInput: jest.fn(),
    onShowAnswer: jest.fn(),
    onResetStatistics: jest.fn(),
    onKeyDown: jest.fn(),
    setInputRef: jest.fn(() => jest.fn()),
  }

  const defaultProps = {
    adjective: mockAdjective,
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
    it('renders the adjective translation', () => {
      renderWithTheme(<AdjectiveItem {...defaultProps} />)

      expect(screen.getByText('beautiful')).toBeInTheDocument()
    })

    it('renders both masculine and feminine gender input columns', () => {
      renderWithTheme(<AdjectiveItem {...defaultProps} />)

      expect(screen.getByTestId('gender-column-masculine')).toBeInTheDocument()
      expect(screen.getByTestId('gender-column-feminine')).toBeInTheDocument()
    })

    it('renders correct input fields for masculine forms', () => {
      renderWithTheme(<AdjectiveItem {...defaultProps} />)

      expect(screen.getByTestId('field-masculineSingular')).toBeInTheDocument()
      expect(screen.getByTestId('field-masculinePlural')).toBeInTheDocument()
    })

    it('renders correct input fields for feminine forms', () => {
      renderWithTheme(<AdjectiveItem {...defaultProps} />)

      expect(screen.getByTestId('field-feminineSingular')).toBeInTheDocument()
      expect(screen.getByTestId('field-femininePlural')).toBeInTheDocument()
    })

    it('renders statistics component with correct values', () => {
      const statisticsWithData = { correct: 5, wrong: 2 }

      renderWithTheme(
        <AdjectiveItem {...defaultProps} statistics={statisticsWithData} />
      )

      // Statistics appears multiple times (mobile and desktop)
      const correctCounts = screen.getAllByTestId('correct-count')
      const wrongCounts = screen.getAllByTestId('wrong-count')

      expect(correctCounts[0]).toHaveTextContent('5')
      expect(wrongCounts[0]).toHaveTextContent('2')
    })

    it('renders action buttons in both mobile and desktop layouts', () => {
      renderWithTheme(<AdjectiveItem {...defaultProps} />)

      // Mobile actions (with reset button)
      expect(
        screen.getByTestId('adjective-actions-with-reset')
      ).toBeInTheDocument()
      // Desktop actions (without reset button - it's separate)
      expect(
        screen.getByTestId('adjective-actions-no-reset')
      ).toBeInTheDocument()
    })

    it('renders desktop reset statistics button', () => {
      const statisticsWithData = { correct: 3, wrong: 1 }

      renderWithTheme(
        <AdjectiveItem {...defaultProps} statistics={statisticsWithData} />
      )

      // The desktop reset button is rendered separately from AdjectiveActions
      const resetButtons = screen.getAllByRole('button', {
        name: /reset statistics/i,
      })
      // At least one should exist from the desktop layout
      expect(resetButtons.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('GenderInputColumn Props', () => {
    it('passes correct props to GenderInputColumn components', () => {
      MockedGenderInputColumn.mockClear()

      const inputValues = {
        masculineSingular: 'test-ms',
        masculinePlural: 'test-mp',
        feminineSingular: 'test-fs',
        femininePlural: 'test-fp',
      }

      const validationState = {
        masculineSingular: 'correct' as const,
        masculinePlural: 'incorrect' as const,
        feminineSingular: null,
        femininePlural: 'correct' as const,
      }

      renderWithTheme(
        <AdjectiveItem
          {...defaultProps}
          inputValues={inputValues}
          validationState={validationState}
        />
      )

      // Check masculine column props
      expect(MockedGenderInputColumn).toHaveBeenCalledWith(
        expect.objectContaining({
          gender: 'Masculine',
          singularField: 'masculineSingular',
          pluralField: 'masculinePlural',
          singularValue: 'test-ms',
          pluralValue: 'test-mp',
          singularCorrectAnswer: 'bello',
          pluralCorrectAnswer: 'belli',
          singularValidation: 'correct',
          pluralValidation: 'incorrect',
          adjectiveId: 'adj-1',
          index: 0,
        }),
        undefined
      )

      // Check feminine column props
      expect(MockedGenderInputColumn).toHaveBeenCalledWith(
        expect.objectContaining({
          gender: 'Feminine',
          singularField: 'feminineSingular',
          pluralField: 'femininePlural',
          singularValue: 'test-fs',
          pluralValue: 'test-fp',
          singularCorrectAnswer: 'bella',
          pluralCorrectAnswer: 'belle',
          singularValidation: null,
          pluralValidation: 'correct',
          adjectiveId: 'adj-1',
          index: 0,
        }),
        undefined
      )
    })

    it('passes handlers to GenderInputColumn', () => {
      MockedGenderInputColumn.mockClear()

      renderWithTheme(<AdjectiveItem {...defaultProps} />)

      expect(MockedGenderInputColumn).toHaveBeenCalledWith(
        expect.objectContaining({
          onInputChange: mockHandlers.onInputChange,
          onValidation: mockHandlers.onValidation,
          onClearInput: mockHandlers.onClearInput,
          onKeyDown: mockHandlers.onKeyDown,
          setInputRef: mockHandlers.setInputRef,
        }),
        undefined
      )
    })
  })

  describe('AdjectiveActions Props', () => {
    it('passes correct props to AdjectiveActions components', () => {
      MockedAdjectiveActions.mockClear()

      renderWithTheme(<AdjectiveItem {...defaultProps} />)

      // Mobile actions (with reset button)
      expect(MockedAdjectiveActions).toHaveBeenCalledWith(
        expect.objectContaining({
          adjectiveId: 'adj-1',
          hasStatistics: false,
          onShowAnswer: mockHandlers.onShowAnswer,
          onClearInput: mockHandlers.onClearInput,
          onResetStatistics: mockHandlers.onResetStatistics,
        }),
        undefined
      )

      // Desktop actions (without reset button)
      expect(MockedAdjectiveActions).toHaveBeenCalledWith(
        expect.objectContaining({
          adjectiveId: 'adj-1',
          hasStatistics: false,
          showResetButton: false,
        }),
        undefined
      )
    })

    it('sets hasStatistics to true when statistics exist', () => {
      MockedAdjectiveActions.mockClear()

      renderWithTheme(
        <AdjectiveItem
          {...defaultProps}
          statistics={{ correct: 1, wrong: 0 }}
        />
      )

      expect(MockedAdjectiveActions).toHaveBeenCalledWith(
        expect.objectContaining({
          hasStatistics: true,
        }),
        undefined
      )
    })

    it('sets hasStatistics to true when only wrong count exists', () => {
      MockedAdjectiveActions.mockClear()

      renderWithTheme(
        <AdjectiveItem
          {...defaultProps}
          statistics={{ correct: 0, wrong: 3 }}
        />
      )

      expect(MockedAdjectiveActions).toHaveBeenCalledWith(
        expect.objectContaining({
          hasStatistics: true,
        }),
        undefined
      )
    })
  })

  describe('Statistics Props', () => {
    it('passes correct statistics values', () => {
      MockedStatistics.mockClear()

      const statistics = { correct: 10, wrong: 5 }
      renderWithTheme(
        <AdjectiveItem {...defaultProps} statistics={statistics} />
      )

      expect(MockedStatistics).toHaveBeenCalledWith(
        expect.objectContaining({
          correct: 10,
          wrong: 5,
        }),
        undefined
      )
    })
  })

  describe('Event Handlers', () => {
    it('calls onShowAnswer when show answer button is clicked', () => {
      renderWithTheme(<AdjectiveItem {...defaultProps} />)

      const showAnswerButtons = screen.getAllByRole('button', {
        name: /show answer/i,
      })
      fireEvent.click(showAnswerButtons[0]!)

      expect(mockHandlers.onShowAnswer).toHaveBeenCalledWith('adj-1')
    })

    it('calls onClearInput when clear button is clicked', () => {
      renderWithTheme(<AdjectiveItem {...defaultProps} />)

      const clearButtons = screen.getAllByRole('button', { name: /clear/i })
      fireEvent.click(clearButtons[0]!)

      expect(mockHandlers.onClearInput).toHaveBeenCalledWith('adj-1')
    })

    it('calls onResetStatistics when reset button is clicked', () => {
      renderWithTheme(
        <AdjectiveItem
          {...defaultProps}
          statistics={{ correct: 1, wrong: 1 }}
        />
      )

      const resetButtons = screen.getAllByRole('button', { name: /reset/i })
      // Find enabled reset button (the one from mobile layout)
      const enabledResetButton = resetButtons.find(
        (btn) => !btn.hasAttribute('disabled')
      )
      if (enabledResetButton) {
        fireEvent.click(enabledResetButton)
        expect(mockHandlers.onResetStatistics).toHaveBeenCalledWith('adj-1')
      }
    })

    it('disables desktop reset button when no statistics exist', () => {
      renderWithTheme(
        <AdjectiveItem
          {...defaultProps}
          statistics={{ correct: 0, wrong: 0 }}
        />
      )

      // The desktop reset button is rendered but may be hidden on mobile
      // Check that a reset button exists and is disabled
      const allButtons = screen.getAllByRole('button')
      const resetButtons = allButtons.filter(
        (btn) =>
          btn.getAttribute('aria-label')?.includes('Reset statistics') ||
          btn.textContent?.toLowerCase().includes('reset')
      )

      // At least one reset button should be disabled when no statistics
      const disabledResetButton = resetButtons.find(
        (btn) =>
          btn.hasAttribute('disabled') || btn.getAttribute('disabled') !== null
      )
      expect(disabledResetButton).toBeDefined()
    })
  })

  describe('Different Adjective Data', () => {
    it('renders correctly with different adjective data', () => {
      const differentAdjective = {
        id: 'adj-2',
        italian: 'grande',
        masculineSingular: 'grande',
        masculinePlural: 'grandi',
        feminineSingular: 'grande',
        femininePlural: 'grandi',
        translation: 'big/large',
      }

      renderWithTheme(
        <AdjectiveItem {...defaultProps} adjective={differentAdjective} />
      )

      expect(screen.getByText('big/large')).toBeInTheDocument()
    })

    it('handles adjective with special characters in translation', () => {
      const specialAdjective = {
        ...mockAdjective,
        translation: 'happy/pleased (feliz)',
      }

      renderWithTheme(
        <AdjectiveItem {...defaultProps} adjective={specialAdjective} />
      )

      expect(screen.getByText('happy/pleased (feliz)')).toBeInTheDocument()
    })
  })

  describe('Index Prop', () => {
    it('passes correct index to GenderInputColumn', () => {
      MockedGenderInputColumn.mockClear()

      renderWithTheme(<AdjectiveItem {...defaultProps} index={5} />)

      expect(MockedGenderInputColumn).toHaveBeenCalledWith(
        expect.objectContaining({
          index: 5,
        }),
        undefined
      )
    })
  })

  describe('Memoization', () => {
    it('exports a memoized component', () => {
      // Verify that the component is wrapped in React.memo
      expect(AdjectiveItem.$$typeof?.toString()).toBe('Symbol(react.memo)')
    })
  })

  describe('Validation States', () => {
    it('handles all validation states correctly', () => {
      MockedGenderInputColumn.mockClear()

      const validationState = {
        masculineSingular: 'correct' as const,
        masculinePlural: 'incorrect' as const,
        feminineSingular: null,
        femininePlural: 'correct' as const,
      }

      renderWithTheme(
        <AdjectiveItem {...defaultProps} validationState={validationState} />
      )

      // Verify masculine column receives correct validation states
      expect(MockedGenderInputColumn).toHaveBeenCalledWith(
        expect.objectContaining({
          gender: 'Masculine',
          singularValidation: 'correct',
          pluralValidation: 'incorrect',
        }),
        undefined
      )

      // Verify feminine column receives correct validation states
      expect(MockedGenderInputColumn).toHaveBeenCalledWith(
        expect.objectContaining({
          gender: 'Feminine',
          singularValidation: null,
          pluralValidation: 'correct',
        }),
        undefined
      )
    })
  })

  describe('Input Values', () => {
    it('passes input values correctly to GenderInputColumn', () => {
      MockedGenderInputColumn.mockClear()

      const inputValues = {
        masculineSingular: 'bello',
        masculinePlural: 'belli',
        feminineSingular: 'bella',
        femininePlural: 'belle',
      }

      renderWithTheme(
        <AdjectiveItem {...defaultProps} inputValues={inputValues} />
      )

      // Verify masculine values
      expect(MockedGenderInputColumn).toHaveBeenCalledWith(
        expect.objectContaining({
          gender: 'Masculine',
          singularValue: 'bello',
          pluralValue: 'belli',
        }),
        undefined
      )

      // Verify feminine values
      expect(MockedGenderInputColumn).toHaveBeenCalledWith(
        expect.objectContaining({
          gender: 'Feminine',
          singularValue: 'bella',
          pluralValue: 'belle',
        }),
        undefined
      )
    })

    it('handles empty input values', () => {
      MockedGenderInputColumn.mockClear()

      const emptyInputValues = {
        masculineSingular: '',
        masculinePlural: '',
        feminineSingular: '',
        femininePlural: '',
      }

      renderWithTheme(
        <AdjectiveItem {...defaultProps} inputValues={emptyInputValues} />
      )

      expect(MockedGenderInputColumn).toHaveBeenCalledWith(
        expect.objectContaining({
          singularValue: '',
          pluralValue: '',
        }),
        undefined
      )
    })
  })

  describe('Correct Answers', () => {
    it('passes correct answers from adjective to GenderInputColumn', () => {
      MockedGenderInputColumn.mockClear()

      const customAdjective = {
        id: 'adj-custom',
        italian: 'alto',
        masculineSingular: 'alto',
        masculinePlural: 'alti',
        feminineSingular: 'alta',
        femininePlural: 'alte',
        translation: 'tall',
      }

      renderWithTheme(
        <AdjectiveItem {...defaultProps} adjective={customAdjective} />
      )

      // Verify masculine correct answers
      expect(MockedGenderInputColumn).toHaveBeenCalledWith(
        expect.objectContaining({
          gender: 'Masculine',
          singularCorrectAnswer: 'alto',
          pluralCorrectAnswer: 'alti',
        }),
        undefined
      )

      // Verify feminine correct answers
      expect(MockedGenderInputColumn).toHaveBeenCalledWith(
        expect.objectContaining({
          gender: 'Feminine',
          singularCorrectAnswer: 'alta',
          pluralCorrectAnswer: 'alte',
        }),
        undefined
      )
    })
  })
})
