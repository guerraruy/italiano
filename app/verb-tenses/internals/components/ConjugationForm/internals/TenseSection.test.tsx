import React from 'react'

import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TenseSection } from './TenseSection'

// Mock the Statistics component
jest.mock('@/app/components/Statistics', () => ({
  Statistics: jest.fn(({ correct, wrong }) => (
    <div data-testid="statistics">
      <span data-testid="correct-count">{correct}</span>
      <span data-testid="wrong-count">{wrong}</span>
    </div>
  )),
}))

describe('TenseSection', () => {
  const mockGetStatistics = jest.fn().mockReturnValue({ correct: 5, wrong: 2 })
  const mockOnInputChange = jest.fn()
  const mockOnValidation = jest.fn()
  const mockOnClearInput = jest.fn()
  const mockOnShowAnswer = jest.fn()
  const mockOnKeyDown = jest.fn()
  const mockInputRefs = {
    current: {} as { [key: string]: HTMLInputElement | null },
  }

  const defaultProps = {
    mood: 'Indicativo',
    tense: 'Presente',
    verbId: 'verb-1',
    inputValues: {},
    validationState: {},
    inputRefs: mockInputRefs,
    getStatistics: mockGetStatistics,
    onInputChange: mockOnInputChange,
    onValidation: mockOnValidation,
    onClearInput: mockOnClearInput,
    onShowAnswer: mockOnShowAnswer,
    onKeyDown: mockOnKeyDown,
  }

  const personBasedTenseData = {
    io: 'mangio',
    tu: 'mangi',
    'lui/lei': 'mangia',
    noi: 'mangiamo',
    voi: 'mangiate',
    loro: 'mangiano',
  }

  const stringTenseData = 'mangiando'

  beforeEach(() => {
    jest.clearAllMocks()
    mockInputRefs.current = {}
  })

  describe('Rendering with person-based tense data', () => {
    it('renders the tense section with correct title', () => {
      render(
        <TenseSection {...defaultProps} tenseData={personBasedTenseData} />
      )

      expect(screen.getByText('Presente (Indicativo)')).toBeInTheDocument()
    })

    it('renders input fields for all persons in the correct order', () => {
      render(
        <TenseSection {...defaultProps} tenseData={personBasedTenseData} />
      )

      const personLabels = ['io', 'tu', 'lui/lei', 'noi', 'voi', 'loro']
      personLabels.forEach((person) => {
        expect(screen.getByText(person)).toBeInTheDocument()
      })
    })

    it('renders persons in correct Italian conjugation order', () => {
      const unorderedTenseData = {
        loro: 'mangiano',
        io: 'mangio',
        voi: 'mangiate',
        tu: 'mangi',
        noi: 'mangiamo',
        'lui/lei': 'mangia',
      }

      render(<TenseSection {...defaultProps} tenseData={unorderedTenseData} />)

      const personElements = screen.getAllByRole('textbox')
      expect(personElements).toHaveLength(6)

      // Verify order by checking labels appear before their inputs
      const allText = document.body.textContent || ''
      const ioIndex = allText.indexOf('io')
      const tuIndex = allText.indexOf('tu')
      const luiIndex = allText.indexOf('lui/lei')
      const noiIndex = allText.indexOf('noi')
      const voiIndex = allText.indexOf('voi')
      const loroIndex = allText.indexOf('loro')

      expect(ioIndex).toBeLessThan(tuIndex)
      expect(tuIndex).toBeLessThan(luiIndex)
      expect(luiIndex).toBeLessThan(noiIndex)
      expect(noiIndex).toBeLessThan(voiIndex)
      expect(voiIndex).toBeLessThan(loroIndex)
    })

    it('renders the correct number of input fields', () => {
      render(
        <TenseSection {...defaultProps} tenseData={personBasedTenseData} />
      )

      const inputs = screen.getAllByPlaceholderText('Type the conjugation...')
      expect(inputs).toHaveLength(6)
    })

    it('renders statistics for each person', () => {
      render(
        <TenseSection {...defaultProps} tenseData={personBasedTenseData} />
      )

      const statisticsElements = screen.getAllByTestId('statistics')
      expect(statisticsElements).toHaveLength(6)
    })

    it('calls getStatistics with correct arguments for each person', () => {
      render(
        <TenseSection {...defaultProps} tenseData={personBasedTenseData} />
      )

      expect(mockGetStatistics).toHaveBeenCalledWith(
        'verb-1',
        'Indicativo',
        'Presente',
        'io'
      )
      expect(mockGetStatistics).toHaveBeenCalledWith(
        'verb-1',
        'Indicativo',
        'Presente',
        'tu'
      )
      expect(mockGetStatistics).toHaveBeenCalledWith(
        'verb-1',
        'Indicativo',
        'Presente',
        'lui/lei'
      )
      expect(mockGetStatistics).toHaveBeenCalledWith(
        'verb-1',
        'Indicativo',
        'Presente',
        'noi'
      )
      expect(mockGetStatistics).toHaveBeenCalledWith(
        'verb-1',
        'Indicativo',
        'Presente',
        'voi'
      )
      expect(mockGetStatistics).toHaveBeenCalledWith(
        'verb-1',
        'Indicativo',
        'Presente',
        'loro'
      )
    })
  })

  describe('Rendering with string tense data (simple forms)', () => {
    it('renders the tense section with correct title for simple form', () => {
      render(<TenseSection {...defaultProps} tenseData={stringTenseData} />)

      expect(screen.getByText('Presente (Indicativo)')).toBeInTheDocument()
    })

    it('renders a single input field for simple form', () => {
      render(<TenseSection {...defaultProps} tenseData={stringTenseData} />)

      const inputs = screen.getAllByPlaceholderText('Type the conjugation...')
      expect(inputs).toHaveLength(1)
    })

    it('renders statistics for simple form', () => {
      render(<TenseSection {...defaultProps} tenseData={stringTenseData} />)

      const statisticsElements = screen.getAllByTestId('statistics')
      expect(statisticsElements).toHaveLength(1)
    })

    it('calls getStatistics with "form" as person for simple form', () => {
      render(<TenseSection {...defaultProps} tenseData={stringTenseData} />)

      expect(mockGetStatistics).toHaveBeenCalledWith(
        'verb-1',
        'Indicativo',
        'Presente',
        'form'
      )
    })
  })

  describe('Input field interactions', () => {
    it('calls onInputChange when typing in an input field', async () => {
      const user = userEvent.setup()

      render(
        <TenseSection {...defaultProps} tenseData={personBasedTenseData} />
      )

      const inputs = screen.getAllByPlaceholderText('Type the conjugation...')
      await user.type(inputs[0]!, 'm')

      expect(mockOnInputChange).toHaveBeenCalledWith(
        'Indicativo:Presente:io',
        'm'
      )
    })

    it('calls onValidation when input loses focus', () => {
      render(
        <TenseSection {...defaultProps} tenseData={personBasedTenseData} />
      )

      const inputs = screen.getAllByPlaceholderText('Type the conjugation...')
      fireEvent.blur(inputs[0]!)

      expect(mockOnValidation).toHaveBeenCalledWith(
        'Indicativo:Presente:io',
        'mangio',
        'verb-1',
        'Indicativo',
        'Presente',
        'io'
      )
    })

    it('calls onKeyDown when pressing a key in an input field', () => {
      render(
        <TenseSection {...defaultProps} tenseData={personBasedTenseData} />
      )

      const inputs = screen.getAllByPlaceholderText('Type the conjugation...')
      fireEvent.keyDown(inputs[0]!, { key: 'Enter' })

      expect(mockOnKeyDown).toHaveBeenCalledWith(
        expect.any(Object),
        'Indicativo:Presente:io',
        'mangio',
        'verb-1',
        'Indicativo',
        'Presente',
        'io'
      )
    })

    it('displays the input value from inputValues prop', () => {
      const inputValues = {
        'Indicativo:Presente:io': 'mangio',
        'Indicativo:Presente:tu': 'mangi',
      }

      render(
        <TenseSection
          {...defaultProps}
          tenseData={personBasedTenseData}
          inputValues={inputValues}
        />
      )

      const inputs = screen.getAllByPlaceholderText('Type the conjugation...')
      expect(inputs[0]).toHaveValue('mangio')
      expect(inputs[1]).toHaveValue('mangi')
    })
  })

  describe('Clear button', () => {
    it('renders clear button for each input', () => {
      render(
        <TenseSection {...defaultProps} tenseData={personBasedTenseData} />
      )

      const clearButtons = screen.getAllByRole('button', {
        name: /clear field/i,
      })
      expect(clearButtons).toHaveLength(6)
    })

    it('calls onClearInput when clear button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <TenseSection {...defaultProps} tenseData={personBasedTenseData} />
      )

      const clearButtons = screen.getAllByRole('button', {
        name: /clear field/i,
      })
      await user.click(clearButtons[0]!)

      expect(mockOnClearInput).toHaveBeenCalledWith('Indicativo:Presente:io')
    })
  })

  describe('Show answer button', () => {
    it('renders show answer button for each input', () => {
      render(
        <TenseSection {...defaultProps} tenseData={personBasedTenseData} />
      )

      const showAnswerButtons = screen.getAllByRole('button', {
        name: /show answer/i,
      })
      expect(showAnswerButtons).toHaveLength(6)
    })

    it('calls onShowAnswer when show answer button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <TenseSection {...defaultProps} tenseData={personBasedTenseData} />
      )

      const showAnswerButtons = screen.getAllByRole('button', {
        name: /show answer/i,
      })
      await user.click(showAnswerButtons[0]!)

      expect(mockOnShowAnswer).toHaveBeenCalledWith(
        'Indicativo:Presente:io',
        'mangio'
      )
    })
  })

  describe('Validation state styling', () => {
    it('applies correct styling when validation state is "correct"', () => {
      const validationState = {
        'Indicativo:Presente:io': 'correct' as const,
      }

      render(
        <TenseSection
          {...defaultProps}
          tenseData={personBasedTenseData}
          validationState={validationState}
        />
      )

      const inputs = screen.getAllByPlaceholderText('Type the conjugation...')
      const inputContainer = inputs[0]!.closest('.MuiTextField-root')
      expect(inputContainer).toHaveStyle({ backgroundColor: '#c8e6c9' })
    })

    it('applies incorrect styling when validation state is "incorrect"', () => {
      const validationState = {
        'Indicativo:Presente:io': 'incorrect' as const,
      }

      render(
        <TenseSection
          {...defaultProps}
          tenseData={personBasedTenseData}
          validationState={validationState}
        />
      )

      const inputs = screen.getAllByPlaceholderText('Type the conjugation...')
      const inputContainer = inputs[0]!.closest('.MuiTextField-root')
      expect(inputContainer).toHaveStyle({ backgroundColor: '#ffcdd2' })
    })

    it('does not apply special styling when validation state is null', () => {
      render(
        <TenseSection {...defaultProps} tenseData={personBasedTenseData} />
      )

      const inputs = screen.getAllByPlaceholderText('Type the conjugation...')
      const inputContainer = inputs[0]!.closest('.MuiTextField-root')
      // When null, no background color should be applied
      expect(inputContainer).not.toHaveStyle({ backgroundColor: '#c8e6c9' })
      expect(inputContainer).not.toHaveStyle({ backgroundColor: '#ffcdd2' })
    })
  })

  describe('Input refs', () => {
    it('sets input refs correctly for person-based tense data', () => {
      render(
        <TenseSection {...defaultProps} tenseData={personBasedTenseData} />
      )

      expect(mockInputRefs.current['Indicativo:Presente:io']).toBeDefined()
      expect(mockInputRefs.current['Indicativo:Presente:tu']).toBeDefined()
      expect(mockInputRefs.current['Indicativo:Presente:lui/lei']).toBeDefined()
      expect(mockInputRefs.current['Indicativo:Presente:noi']).toBeDefined()
      expect(mockInputRefs.current['Indicativo:Presente:voi']).toBeDefined()
      expect(mockInputRefs.current['Indicativo:Presente:loro']).toBeDefined()
    })

    it('sets input ref correctly for simple form', () => {
      render(<TenseSection {...defaultProps} tenseData={stringTenseData} />)

      expect(mockInputRefs.current['Indicativo:Presente:form']).toBeDefined()
    })
  })

  describe('Simple form interactions', () => {
    it('calls onValidation with correct arguments for simple form on blur', () => {
      render(<TenseSection {...defaultProps} tenseData={stringTenseData} />)

      const input = screen.getByPlaceholderText('Type the conjugation...')
      fireEvent.blur(input)

      expect(mockOnValidation).toHaveBeenCalledWith(
        'Indicativo:Presente:form',
        'mangiando',
        'verb-1',
        'Indicativo',
        'Presente',
        'form'
      )
    })

    it('calls onShowAnswer with correct arguments for simple form', async () => {
      const user = userEvent.setup()

      render(<TenseSection {...defaultProps} tenseData={stringTenseData} />)

      const showAnswerButton = screen.getByRole('button', {
        name: /show answer/i,
      })
      await user.click(showAnswerButton)

      expect(mockOnShowAnswer).toHaveBeenCalledWith(
        'Indicativo:Presente:form',
        'mangiando'
      )
    })

    it('calls onClearInput with correct key for simple form', async () => {
      const user = userEvent.setup()

      render(<TenseSection {...defaultProps} tenseData={stringTenseData} />)

      const clearButton = screen.getByRole('button', { name: /clear field/i })
      await user.click(clearButton)

      expect(mockOnClearInput).toHaveBeenCalledWith('Indicativo:Presente:form')
    })

    it('calls onKeyDown with correct arguments for simple form', () => {
      render(<TenseSection {...defaultProps} tenseData={stringTenseData} />)

      const input = screen.getByPlaceholderText('Type the conjugation...')
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(mockOnKeyDown).toHaveBeenCalledWith(
        expect.any(Object),
        'Indicativo:Presente:form',
        'mangiando',
        'verb-1',
        'Indicativo',
        'Presente',
        'form'
      )
    })
  })

  describe('Different moods and tenses', () => {
    it('renders correctly with Congiuntivo mood', () => {
      render(
        <TenseSection
          {...defaultProps}
          mood="Congiuntivo"
          tense="Presente"
          tenseData={personBasedTenseData}
        />
      )

      expect(screen.getByText('Presente (Congiuntivo)')).toBeInTheDocument()
    })

    it('renders correctly with Imperfetto tense', () => {
      render(
        <TenseSection
          {...defaultProps}
          mood="Indicativo"
          tense="Imperfetto"
          tenseData={personBasedTenseData}
        />
      )

      expect(screen.getByText('Imperfetto (Indicativo)')).toBeInTheDocument()
    })

    it('renders correctly with Gerundio (simple form)', () => {
      render(
        <TenseSection
          {...defaultProps}
          mood="Gerundio"
          tense="Presente"
          tenseData="mangiando"
        />
      )

      expect(screen.getByText('Presente (Gerundio)')).toBeInTheDocument()
    })

    it('renders correctly with Participio Passato (simple form)', () => {
      render(
        <TenseSection
          {...defaultProps}
          mood="Participio"
          tense="Passato"
          tenseData="mangiato"
        />
      )

      expect(screen.getByText('Passato (Participio)')).toBeInTheDocument()
    })
  })

  describe('Empty and edge cases', () => {
    it('handles empty person in tense data gracefully', () => {
      const tenseDataWithEmpty = {
        io: 'mangio',
        tu: '',
        'lui/lei': 'mangia',
      }

      render(<TenseSection {...defaultProps} tenseData={tenseDataWithEmpty} />)

      // Should only render inputs for non-empty values
      const inputs = screen.getAllByPlaceholderText('Type the conjugation...')
      expect(inputs).toHaveLength(2)
    })

    it('handles undefined person value gracefully', () => {
      const tenseDataWithUndefined = {
        io: 'mangio',
        tu: undefined as unknown as string,
        'lui/lei': 'mangia',
      }

      render(
        <TenseSection {...defaultProps} tenseData={tenseDataWithUndefined} />
      )

      // Should only render inputs for defined values
      const inputs = screen.getAllByPlaceholderText('Type the conjugation...')
      expect(inputs).toHaveLength(2)
    })

    it('handles persons not in the standard order', () => {
      const nonStandardPersons = {
        io: 'mangio',
        customPerson: 'mangi custom',
      }

      render(<TenseSection {...defaultProps} tenseData={nonStandardPersons} />)

      expect(screen.getByText('io')).toBeInTheDocument()
      expect(screen.getByText('customPerson')).toBeInTheDocument()
    })
  })

  describe('Statistics display', () => {
    it('displays statistics with correct values', () => {
      mockGetStatistics.mockReturnValue({ correct: 10, wrong: 3 })

      render(
        <TenseSection {...defaultProps} tenseData={personBasedTenseData} />
      )

      const correctCounts = screen.getAllByTestId('correct-count')
      const wrongCounts = screen.getAllByTestId('wrong-count')

      // Each person row should have its statistics
      expect(correctCounts[0]).toHaveTextContent('10')
      expect(wrongCounts[0]).toHaveTextContent('3')
    })

    it('displays zero statistics correctly', () => {
      mockGetStatistics.mockReturnValue({ correct: 0, wrong: 0 })

      render(
        <TenseSection {...defaultProps} tenseData={personBasedTenseData} />
      )

      const correctCounts = screen.getAllByTestId('correct-count')
      const wrongCounts = screen.getAllByTestId('wrong-count')

      expect(correctCounts[0]).toHaveTextContent('0')
      expect(wrongCounts[0]).toHaveTextContent('0')
    })
  })

  describe('Autocomplete behavior', () => {
    it('has autocomplete disabled on input fields', () => {
      render(
        <TenseSection {...defaultProps} tenseData={personBasedTenseData} />
      )

      const inputs = screen.getAllByPlaceholderText('Type the conjugation...')
      inputs.forEach((input) => {
        expect(input).toHaveAttribute('autocomplete', 'off')
      })
    })
  })

  describe('Input values prop', () => {
    it('displays empty string when inputValues key does not exist', () => {
      render(
        <TenseSection
          {...defaultProps}
          tenseData={personBasedTenseData}
          inputValues={{}}
        />
      )

      const inputs = screen.getAllByPlaceholderText('Type the conjugation...')
      inputs.forEach((input) => {
        expect(input).toHaveValue('')
      })
    })

    it('displays correct values for multiple inputs', () => {
      const inputValues = {
        'Indicativo:Presente:io': 'mangio',
        'Indicativo:Presente:tu': 'mangi',
        'Indicativo:Presente:lui/lei': 'mangia',
        'Indicativo:Presente:noi': 'mangiamo',
        'Indicativo:Presente:voi': 'mangiate',
        'Indicativo:Presente:loro': 'mangiano',
      }

      render(
        <TenseSection
          {...defaultProps}
          tenseData={personBasedTenseData}
          inputValues={inputValues}
        />
      )

      const inputs = screen.getAllByPlaceholderText('Type the conjugation...')
      expect(inputs[0]).toHaveValue('mangio')
      expect(inputs[1]).toHaveValue('mangi')
      expect(inputs[2]).toHaveValue('mangia')
      expect(inputs[3]).toHaveValue('mangiamo')
      expect(inputs[4]).toHaveValue('mangiate')
      expect(inputs[5]).toHaveValue('mangiano')
    })
  })
})
