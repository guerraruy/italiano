import { fireEvent, render, screen } from '@testing-library/react'

import TenseCategory from './TenseCategory'

describe('TenseCategory', () => {
  const mockOnTenseToggle = jest.fn()
  const mockOnCategoryToggle = jest.fn()

  const defaultProps = {
    category: 'Indicativo',
    tenses: ['Presente', 'Passato Prossimo', 'Futuro Semplice'],
    enabledTenses: [] as string[],
    onTenseToggle: mockOnTenseToggle,
    onCategoryToggle: mockOnCategoryToggle,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the category name', () => {
      render(<TenseCategory {...defaultProps} />)

      expect(screen.getByText('Indicativo')).toBeInTheDocument()
    })

    it('should render all tenses', () => {
      render(<TenseCategory {...defaultProps} />)

      expect(screen.getByText('Presente')).toBeInTheDocument()
      expect(screen.getByText('Passato Prossimo')).toBeInTheDocument()
      expect(screen.getByText('Futuro Semplice')).toBeInTheDocument()
    })

    it('should render checkboxes for category and each tense', () => {
      render(<TenseCategory {...defaultProps} />)

      const checkboxes = screen.getAllByRole('checkbox')
      // 1 category checkbox + 3 tense checkboxes
      expect(checkboxes).toHaveLength(4)
    })

    it('should render with different category name', () => {
      render(<TenseCategory {...defaultProps} category="Congiuntivo" />)

      expect(screen.getByText('Congiuntivo')).toBeInTheDocument()
    })
  })

  describe('Checkbox States - None Selected', () => {
    it('should have category checkbox unchecked when no tenses are enabled', () => {
      render(<TenseCategory {...defaultProps} enabledTenses={[]} />)

      const categoryCheckbox = screen.getByRole('checkbox', {
        name: /indicativo/i,
      })
      expect(categoryCheckbox).not.toBeChecked()
    })

    it('should have all tense checkboxes unchecked when no tenses are enabled', () => {
      render(<TenseCategory {...defaultProps} enabledTenses={[]} />)

      const presenteCheckbox = screen.getByRole('checkbox', {
        name: /presente/i,
      })
      const passatoCheckbox = screen.getByRole('checkbox', {
        name: /passato prossimo/i,
      })
      const futuroCheckbox = screen.getByRole('checkbox', {
        name: /futuro semplice/i,
      })

      expect(presenteCheckbox).not.toBeChecked()
      expect(passatoCheckbox).not.toBeChecked()
      expect(futuroCheckbox).not.toBeChecked()
    })

    it('should not have indeterminate state when no tenses are enabled', () => {
      render(<TenseCategory {...defaultProps} enabledTenses={[]} />)

      const categoryCheckbox = screen.getByRole('checkbox', {
        name: /indicativo/i,
      })
      expect(categoryCheckbox).not.toHaveAttribute('data-indeterminate', 'true')
    })
  })

  describe('Checkbox States - All Selected', () => {
    const allEnabledTenses = [
      'Indicativo.Presente',
      'Indicativo.Passato Prossimo',
      'Indicativo.Futuro Semplice',
    ]

    it('should have category checkbox checked when all tenses are enabled', () => {
      render(
        <TenseCategory {...defaultProps} enabledTenses={allEnabledTenses} />
      )

      const categoryCheckbox = screen.getByRole('checkbox', {
        name: /indicativo/i,
      })
      expect(categoryCheckbox).toBeChecked()
    })

    it('should have all tense checkboxes checked when all are enabled', () => {
      render(
        <TenseCategory {...defaultProps} enabledTenses={allEnabledTenses} />
      )

      const presenteCheckbox = screen.getByRole('checkbox', {
        name: /presente/i,
      })
      const passatoCheckbox = screen.getByRole('checkbox', {
        name: /passato prossimo/i,
      })
      const futuroCheckbox = screen.getByRole('checkbox', {
        name: /futuro semplice/i,
      })

      expect(presenteCheckbox).toBeChecked()
      expect(passatoCheckbox).toBeChecked()
      expect(futuroCheckbox).toBeChecked()
    })
  })

  describe('Checkbox States - Some Selected (Indeterminate)', () => {
    const someEnabledTenses = ['Indicativo.Presente']

    it('should have category checkbox in indeterminate state when some tenses are enabled', () => {
      render(
        <TenseCategory {...defaultProps} enabledTenses={someEnabledTenses} />
      )

      const categoryCheckbox = screen.getByRole('checkbox', {
        name: /indicativo/i,
      })
      // MUI sets data-indeterminate attribute for indeterminate state
      expect(categoryCheckbox).toHaveAttribute('data-indeterminate', 'true')
    })

    it('should have only enabled tenses checked', () => {
      render(
        <TenseCategory {...defaultProps} enabledTenses={someEnabledTenses} />
      )

      const presenteCheckbox = screen.getByRole('checkbox', {
        name: /presente/i,
      })
      const passatoCheckbox = screen.getByRole('checkbox', {
        name: /passato prossimo/i,
      })
      const futuroCheckbox = screen.getByRole('checkbox', {
        name: /futuro semplice/i,
      })

      expect(presenteCheckbox).toBeChecked()
      expect(passatoCheckbox).not.toBeChecked()
      expect(futuroCheckbox).not.toBeChecked()
    })

    it('should show indeterminate with multiple but not all tenses selected', () => {
      render(
        <TenseCategory
          {...defaultProps}
          enabledTenses={['Indicativo.Presente', 'Indicativo.Passato Prossimo']}
        />
      )

      const categoryCheckbox = screen.getByRole('checkbox', {
        name: /indicativo/i,
      })
      expect(categoryCheckbox).toHaveAttribute('data-indeterminate', 'true')
    })
  })

  describe('User Interaction - Category Toggle', () => {
    it('should call onCategoryToggle with category name when category checkbox is clicked', () => {
      render(<TenseCategory {...defaultProps} />)

      const categoryCheckbox = screen.getByRole('checkbox', {
        name: /indicativo/i,
      })
      fireEvent.click(categoryCheckbox)

      expect(mockOnCategoryToggle).toHaveBeenCalledWith('Indicativo')
      expect(mockOnCategoryToggle).toHaveBeenCalledTimes(1)
    })

    it('should call onCategoryToggle when clicking category label', () => {
      render(<TenseCategory {...defaultProps} />)

      const categoryLabel = screen.getByText('Indicativo')
      fireEvent.click(categoryLabel)

      expect(mockOnCategoryToggle).toHaveBeenCalledWith('Indicativo')
    })
  })

  describe('User Interaction - Tense Toggle', () => {
    it('should call onTenseToggle with correct tense key when tense checkbox is clicked', () => {
      render(<TenseCategory {...defaultProps} />)

      const presenteCheckbox = screen.getByRole('checkbox', {
        name: /presente/i,
      })
      fireEvent.click(presenteCheckbox)

      expect(mockOnTenseToggle).toHaveBeenCalledWith('Indicativo.Presente')
      expect(mockOnTenseToggle).toHaveBeenCalledTimes(1)
    })

    it('should call onTenseToggle with correct key for Passato Prossimo', () => {
      render(<TenseCategory {...defaultProps} />)

      const passatoCheckbox = screen.getByRole('checkbox', {
        name: /passato prossimo/i,
      })
      fireEvent.click(passatoCheckbox)

      expect(mockOnTenseToggle).toHaveBeenCalledWith(
        'Indicativo.Passato Prossimo'
      )
    })

    it('should call onTenseToggle with correct key for Futuro Semplice', () => {
      render(<TenseCategory {...defaultProps} />)

      const futuroCheckbox = screen.getByRole('checkbox', {
        name: /futuro semplice/i,
      })
      fireEvent.click(futuroCheckbox)

      expect(mockOnTenseToggle).toHaveBeenCalledWith(
        'Indicativo.Futuro Semplice'
      )
    })

    it('should call onTenseToggle when clicking tense label', () => {
      render(<TenseCategory {...defaultProps} />)

      const presenteLabel = screen.getByText('Presente')
      fireEvent.click(presenteLabel)

      expect(mockOnTenseToggle).toHaveBeenCalledWith('Indicativo.Presente')
    })
  })

  describe('Different Categories', () => {
    it('should generate correct tense keys for Congiuntivo category', () => {
      render(
        <TenseCategory
          {...defaultProps}
          category="Congiuntivo"
          tenses={['Presente', 'Passato']}
          enabledTenses={[]}
        />
      )

      const presenteCheckbox = screen.getByRole('checkbox', {
        name: /presente/i,
      })
      fireEvent.click(presenteCheckbox)

      expect(mockOnTenseToggle).toHaveBeenCalledWith('Congiuntivo.Presente')
    })

    it('should correctly identify enabled tenses for different category', () => {
      render(
        <TenseCategory
          {...defaultProps}
          category="Congiuntivo"
          tenses={['Presente', 'Passato']}
          enabledTenses={['Congiuntivo.Presente']}
        />
      )

      const presenteCheckbox = screen.getByRole('checkbox', {
        name: /presente/i,
      })
      const passatoCheckbox = screen.getByRole('checkbox', { name: /passato/i })

      expect(presenteCheckbox).toBeChecked()
      expect(passatoCheckbox).not.toBeChecked()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty tenses array', () => {
      render(<TenseCategory {...defaultProps} tenses={[]} />)

      // Should render category checkbox
      expect(
        screen.getByRole('checkbox', { name: /indicativo/i })
      ).toBeInTheDocument()
      // Should have only 1 checkbox (the category)
      expect(screen.getAllByRole('checkbox')).toHaveLength(1)
    })

    it('should handle single tense', () => {
      render(<TenseCategory {...defaultProps} tenses={['Presente']} />)

      expect(screen.getAllByRole('checkbox')).toHaveLength(2)
      expect(screen.getByText('Presente')).toBeInTheDocument()
    })

    it('should not affect other category tenses in enabledTenses', () => {
      render(
        <TenseCategory
          {...defaultProps}
          enabledTenses={['Congiuntivo.Presente', 'Condizionale.Presente']}
        />
      )

      // None of the Indicativo tenses should be checked
      const presenteCheckbox = screen.getByRole('checkbox', {
        name: /presente/i,
      })
      expect(presenteCheckbox).not.toBeChecked()

      // Category should be unchecked (not indeterminate)
      const categoryCheckbox = screen.getByRole('checkbox', {
        name: /indicativo/i,
      })
      expect(categoryCheckbox).not.toBeChecked()
      expect(categoryCheckbox).not.toHaveAttribute('data-indeterminate', 'true')
    })
  })

  describe('Accessibility', () => {
    it('should have accessible checkbox labels', () => {
      render(<TenseCategory {...defaultProps} />)

      expect(
        screen.getByRole('checkbox', { name: /indicativo/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('checkbox', { name: /presente/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('checkbox', { name: /passato prossimo/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('checkbox', { name: /futuro semplice/i })
      ).toBeInTheDocument()
    })

    it('should render tenses in a nested structure under category', () => {
      render(<TenseCategory {...defaultProps} />)

      // All tense checkboxes should be present alongside the category checkbox
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes).toHaveLength(4) // 1 category + 3 tenses
    })
  })
})
