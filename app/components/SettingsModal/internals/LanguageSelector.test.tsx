import { fireEvent, render, screen } from '@testing-library/react'

import LanguageSelector from './LanguageSelector'

describe('LanguageSelector', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the component with title and description', () => {
      render(<LanguageSelector value="pt-BR" onChange={mockOnChange} />)

      expect(screen.getByText('Native Language')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Select your native language to see translations in your preferred language.'
        )
      ).toBeInTheDocument()
    })

    it('should render both language options', () => {
      render(<LanguageSelector value="pt-BR" onChange={mockOnChange} />)

      expect(screen.getByText('Português (Brasil)')).toBeInTheDocument()
      expect(screen.getByText('English')).toBeInTheDocument()
    })

    it('should render radio buttons for each language', () => {
      render(<LanguageSelector value="pt-BR" onChange={mockOnChange} />)

      const radioButtons = screen.getAllByRole('radio')
      expect(radioButtons).toHaveLength(2)
    })
  })

  describe('Selection State', () => {
    it('should have Portuguese selected when value is pt-BR', () => {
      render(<LanguageSelector value="pt-BR" onChange={mockOnChange} />)

      const ptRadio = screen.getByRole('radio', { name: /português/i })
      const enRadio = screen.getByRole('radio', { name: /english/i })

      expect(ptRadio).toBeChecked()
      expect(enRadio).not.toBeChecked()
    })

    it('should have English selected when value is en', () => {
      render(<LanguageSelector value="en" onChange={mockOnChange} />)

      const ptRadio = screen.getByRole('radio', { name: /português/i })
      const enRadio = screen.getByRole('radio', { name: /english/i })

      expect(ptRadio).not.toBeChecked()
      expect(enRadio).toBeChecked()
    })
  })

  describe('User Interaction', () => {
    it('should call onChange with "en" when English is selected', () => {
      render(<LanguageSelector value="pt-BR" onChange={mockOnChange} />)

      const enRadio = screen.getByRole('radio', { name: /english/i })
      fireEvent.click(enRadio)

      expect(mockOnChange).toHaveBeenCalledWith('en')
      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    it('should call onChange with "pt-BR" when Portuguese is selected', () => {
      render(<LanguageSelector value="en" onChange={mockOnChange} />)

      const ptRadio = screen.getByRole('radio', { name: /português/i })
      fireEvent.click(ptRadio)

      expect(mockOnChange).toHaveBeenCalledWith('pt-BR')
      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    it('should call onChange when clicking on the label text', () => {
      render(<LanguageSelector value="pt-BR" onChange={mockOnChange} />)

      const englishLabel = screen.getByText('English')
      fireEvent.click(englishLabel)

      expect(mockOnChange).toHaveBeenCalledWith('en')
    })
  })

  describe('Accessibility', () => {
    it('should have a fieldset with legend for accessibility', () => {
      render(<LanguageSelector value="pt-BR" onChange={mockOnChange} />)

      expect(screen.getByRole('group')).toBeInTheDocument()
      expect(
        screen.getByRole('group', { name: /native language/i })
      ).toBeInTheDocument()
    })

    it('should have a radiogroup role', () => {
      render(<LanguageSelector value="pt-BR" onChange={mockOnChange} />)

      expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    })

    it('should have accessible radio button names', () => {
      render(<LanguageSelector value="pt-BR" onChange={mockOnChange} />)

      expect(
        screen.getByRole('radio', { name: /português \(brasil\)/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('radio', { name: /english/i })
      ).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should not call onChange when clicking already selected option', () => {
      render(<LanguageSelector value="pt-BR" onChange={mockOnChange} />)

      const ptRadio = screen.getByRole('radio', { name: /português/i })
      fireEvent.click(ptRadio)

      // MUI RadioGroup doesn't fire onChange for already selected value
      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })
})
