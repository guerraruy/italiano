import { render, screen } from '@testing-library/react'

import VerbTenseSelector, { VERB_TENSES } from './VerbTenseSelector'

// Mock TenseCategory to isolate VerbTenseSelector tests
jest.mock('./TenseCategory', () => {
  return function MockTenseCategory({
    category,
    tenses,
    enabledTenses,
    onTenseToggle,
    onCategoryToggle,
  }: {
    category: string
    tenses: string[]
    enabledTenses: string[]
    onTenseToggle: (tenseKey: string) => void
    onCategoryToggle: (category: string) => void
  }) {
    return (
      <div data-testid={`tense-category-${category}`}>
        <span data-testid={`category-name-${category}`}>{category}</span>
        <span data-testid={`tenses-count-${category}`}>{tenses.length}</span>
        <span data-testid={`enabled-count-${category}`}>
          {enabledTenses.filter((t) => t.startsWith(`${category}.`)).length}
        </span>
        <button
          data-testid={`toggle-tense-${category}`}
          onClick={() => onTenseToggle(`${category}.Test`)}
        >
          Toggle Tense
        </button>
        <button
          data-testid={`toggle-category-${category}`}
          onClick={() => onCategoryToggle(category)}
        >
          Toggle Category
        </button>
      </div>
    )
  }
})

describe('VerbTenseSelector', () => {
  const mockOnTenseToggle = jest.fn()
  const mockOnCategoryToggle = jest.fn()

  const defaultProps = {
    enabledTenses: [] as string[],
    onTenseToggle: mockOnTenseToggle,
    onCategoryToggle: mockOnCategoryToggle,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the title', () => {
      render(<VerbTenseSelector {...defaultProps} />)

      expect(screen.getByText('Enabled Verb Tenses')).toBeInTheDocument()
    })

    it('should render the description', () => {
      render(<VerbTenseSelector {...defaultProps} />)

      expect(
        screen.getByText(
          'Select which verb tenses you want to practice. Only selected tenses will be shown in conjugation exercises.'
        )
      ).toBeInTheDocument()
    })

    it('should render all verb tense categories', () => {
      render(<VerbTenseSelector {...defaultProps} />)

      expect(
        screen.getByTestId('tense-category-Indicativo')
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('tense-category-Congiuntivo')
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('tense-category-Condizionale')
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('tense-category-Imperativo')
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('tense-category-Participio')
      ).toBeInTheDocument()
      expect(screen.getByTestId('tense-category-Gerundio')).toBeInTheDocument()
      expect(screen.getByTestId('tense-category-Infinito')).toBeInTheDocument()
    })

    it('should render exactly 7 categories', () => {
      render(<VerbTenseSelector {...defaultProps} />)

      const categories = screen.getAllByTestId(/^tense-category-/)
      expect(categories).toHaveLength(7)
    })
  })

  describe('Props Passing', () => {
    it('should pass correct tense count to Indicativo category', () => {
      render(<VerbTenseSelector {...defaultProps} />)

      expect(screen.getByTestId('tenses-count-Indicativo')).toHaveTextContent(
        '6'
      )
    })

    it('should pass correct tense count to Congiuntivo category', () => {
      render(<VerbTenseSelector {...defaultProps} />)

      expect(screen.getByTestId('tenses-count-Congiuntivo')).toHaveTextContent(
        '4'
      )
    })

    it('should pass correct tense count to Condizionale category', () => {
      render(<VerbTenseSelector {...defaultProps} />)

      expect(screen.getByTestId('tenses-count-Condizionale')).toHaveTextContent(
        '2'
      )
    })

    it('should pass enabledTenses to each category', () => {
      render(
        <VerbTenseSelector
          {...defaultProps}
          enabledTenses={[
            'Indicativo.Presente',
            'Indicativo.Futuro Semplice',
            'Congiuntivo.Presente',
          ]}
        />
      )

      expect(screen.getByTestId('enabled-count-Indicativo')).toHaveTextContent(
        '2'
      )
      expect(screen.getByTestId('enabled-count-Congiuntivo')).toHaveTextContent(
        '1'
      )
      expect(
        screen.getByTestId('enabled-count-Condizionale')
      ).toHaveTextContent('0')
    })

    it('should pass onTenseToggle callback to categories', () => {
      render(<VerbTenseSelector {...defaultProps} />)

      screen.getByTestId('toggle-tense-Indicativo').click()

      expect(mockOnTenseToggle).toHaveBeenCalledWith('Indicativo.Test')
    })

    it('should pass onCategoryToggle callback to categories', () => {
      render(<VerbTenseSelector {...defaultProps} />)

      screen.getByTestId('toggle-category-Congiuntivo').click()

      expect(mockOnCategoryToggle).toHaveBeenCalledWith('Congiuntivo')
    })
  })

  describe('VERB_TENSES Export', () => {
    it('should export VERB_TENSES constant', () => {
      expect(VERB_TENSES).toBeDefined()
      expect(Array.isArray(VERB_TENSES)).toBe(true)
    })

    it('should have 7 categories in VERB_TENSES', () => {
      expect(VERB_TENSES).toHaveLength(7)
    })

    it('should have correct Indicativo tenses', () => {
      const indicativo = VERB_TENSES.find((vt) => vt.category === 'Indicativo')
      expect(indicativo).toBeDefined()
      expect(indicativo?.tenses).toEqual([
        'Presente',
        'Passato Prossimo',
        'Imperfetto',
        'Trapassato Prossimo',
        'Futuro Semplice',
        'Passato Remoto',
      ])
    })

    it('should have correct Congiuntivo tenses', () => {
      const congiuntivo = VERB_TENSES.find(
        (vt) => vt.category === 'Congiuntivo'
      )
      expect(congiuntivo).toBeDefined()
      expect(congiuntivo?.tenses).toEqual([
        'Presente',
        'Passato',
        'Imperfetto',
        'Trapassato',
      ])
    })

    it('should have correct Condizionale tenses', () => {
      const condizionale = VERB_TENSES.find(
        (vt) => vt.category === 'Condizionale'
      )
      expect(condizionale).toBeDefined()
      expect(condizionale?.tenses).toEqual(['Presente', 'Passato'])
    })

    it('should have correct Imperativo tenses', () => {
      const imperativo = VERB_TENSES.find((vt) => vt.category === 'Imperativo')
      expect(imperativo).toBeDefined()
      expect(imperativo?.tenses).toEqual(['Affirmativo', 'Negativo'])
    })

    it('should have correct Participio tenses', () => {
      const participio = VERB_TENSES.find((vt) => vt.category === 'Participio')
      expect(participio).toBeDefined()
      expect(participio?.tenses).toEqual(['Presente', 'Passato'])
    })

    it('should have correct Gerundio tenses', () => {
      const gerundio = VERB_TENSES.find((vt) => vt.category === 'Gerundio')
      expect(gerundio).toBeDefined()
      expect(gerundio?.tenses).toEqual(['Presente', 'Passato'])
    })

    it('should have correct Infinito tenses', () => {
      const infinito = VERB_TENSES.find((vt) => vt.category === 'Infinito')
      expect(infinito).toBeDefined()
      expect(infinito?.tenses).toEqual(['Presente', 'Passato'])
    })

    it('should have unique category names', () => {
      const categoryNames = VERB_TENSES.map((vt) => vt.category)
      const uniqueNames = new Set(categoryNames)
      expect(uniqueNames.size).toBe(categoryNames.length)
    })
  })

  describe('Accessibility', () => {
    it('should have a fieldset with legend for accessibility', () => {
      render(<VerbTenseSelector {...defaultProps} />)

      expect(screen.getByRole('group')).toBeInTheDocument()
      expect(
        screen.getByRole('group', { name: /enabled verb tenses/i })
      ).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty enabledTenses array', () => {
      render(<VerbTenseSelector {...defaultProps} enabledTenses={[]} />)

      // All enabled counts should be 0
      expect(screen.getByTestId('enabled-count-Indicativo')).toHaveTextContent(
        '0'
      )
      expect(screen.getByTestId('enabled-count-Congiuntivo')).toHaveTextContent(
        '0'
      )
    })

    it('should handle all tenses enabled', () => {
      const allTenses = VERB_TENSES.flatMap(({ category, tenses }) =>
        tenses.map((tense) => `${category}.${tense}`)
      )

      render(<VerbTenseSelector {...defaultProps} enabledTenses={allTenses} />)

      expect(screen.getByTestId('enabled-count-Indicativo')).toHaveTextContent(
        '6'
      )
      expect(screen.getByTestId('enabled-count-Congiuntivo')).toHaveTextContent(
        '4'
      )
    })

    it('should handle tenses from non-existent categories in enabledTenses', () => {
      render(
        <VerbTenseSelector
          {...defaultProps}
          enabledTenses={['NonExistent.Tense', 'Indicativo.Presente']}
        />
      )

      // Should still work, just ignoring non-existent category
      expect(screen.getByTestId('enabled-count-Indicativo')).toHaveTextContent(
        '1'
      )
    })
  })

  describe('Category Order', () => {
    it('should render categories in the correct order', () => {
      render(<VerbTenseSelector {...defaultProps} />)

      const categories = screen.getAllByTestId(/^category-name-/)
      const categoryNames = categories.map((el) => el.textContent)

      expect(categoryNames).toEqual([
        'Indicativo',
        'Congiuntivo',
        'Condizionale',
        'Imperativo',
        'Participio',
        'Gerundio',
        'Infinito',
      ])
    })
  })
})
