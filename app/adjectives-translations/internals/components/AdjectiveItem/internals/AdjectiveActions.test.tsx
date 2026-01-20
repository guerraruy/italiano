import { fireEvent, render, screen } from '@testing-library/react'

import AdjectiveActions from './AdjectiveActions'

describe('AdjectiveActions', () => {
  const mockOnShowAnswer = jest.fn()
  const mockOnClearInput = jest.fn()
  const mockOnResetStatistics = jest.fn()

  const defaultProps = {
    adjectiveId: 'test-adjective-123',
    hasStatistics: true,
    onShowAnswer: mockOnShowAnswer,
    onClearInput: mockOnClearInput,
    onResetStatistics: mockOnResetStatistics,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render all three action buttons by default', () => {
      render(<AdjectiveActions {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(3)
    })

    it('should render show answer button with correct tooltip', () => {
      render(<AdjectiveActions {...defaultProps} />)

      expect(screen.getByLabelText('Show all answers')).toBeInTheDocument()
    })

    it('should render clear input button with correct tooltip', () => {
      render(<AdjectiveActions {...defaultProps} />)

      expect(screen.getByLabelText('Clear all fields')).toBeInTheDocument()
    })

    it('should render reset statistics button with correct tooltip', () => {
      render(<AdjectiveActions {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: 'Reset statistics' })
      ).toBeInTheDocument()
    })

    it('should render show answer button with lightbulb icon', () => {
      render(<AdjectiveActions {...defaultProps} />)

      const button = screen.getByLabelText('Show all answers')
      expect(button.querySelector('svg')).toBeInTheDocument()
    })

    it('should render clear input button with clear icon', () => {
      render(<AdjectiveActions {...defaultProps} />)

      const button = screen.getByLabelText('Clear all fields')
      expect(button.querySelector('svg')).toBeInTheDocument()
    })

    it('should render reset statistics button with delete sweep icon', () => {
      render(<AdjectiveActions {...defaultProps} />)

      const button = screen.getByRole('button', { name: 'Reset statistics' })
      expect(button.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Button Clicks', () => {
    it('should call onShowAnswer with correct adjectiveId when show answer is clicked', () => {
      render(<AdjectiveActions {...defaultProps} />)

      fireEvent.click(screen.getByLabelText('Show all answers'))

      expect(mockOnShowAnswer).toHaveBeenCalledTimes(1)
      expect(mockOnShowAnswer).toHaveBeenCalledWith('test-adjective-123')
    })

    it('should call onClearInput with correct adjectiveId when clear is clicked', () => {
      render(<AdjectiveActions {...defaultProps} />)

      fireEvent.click(screen.getByLabelText('Clear all fields'))

      expect(mockOnClearInput).toHaveBeenCalledTimes(1)
      expect(mockOnClearInput).toHaveBeenCalledWith('test-adjective-123')
    })

    it('should call onResetStatistics with correct adjectiveId when reset is clicked', () => {
      render(<AdjectiveActions {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: 'Reset statistics' }))

      expect(mockOnResetStatistics).toHaveBeenCalledTimes(1)
      expect(mockOnResetStatistics).toHaveBeenCalledWith('test-adjective-123')
    })

    it('should handle multiple clicks on show answer button', () => {
      render(<AdjectiveActions {...defaultProps} />)

      const button = screen.getByLabelText('Show all answers')
      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)

      expect(mockOnShowAnswer).toHaveBeenCalledTimes(3)
    })

    it('should handle multiple clicks on clear input button', () => {
      render(<AdjectiveActions {...defaultProps} />)

      const button = screen.getByLabelText('Clear all fields')
      fireEvent.click(button)
      fireEvent.click(button)

      expect(mockOnClearInput).toHaveBeenCalledTimes(2)
    })
  })

  describe('Conditional Rendering', () => {
    it('should hide reset button when showResetButton is false', () => {
      render(<AdjectiveActions {...defaultProps} showResetButton={false} />)

      expect(
        screen.queryByLabelText('Reset statistics')
      ).not.toBeInTheDocument()
    })

    it('should show reset button when showResetButton is true', () => {
      render(<AdjectiveActions {...defaultProps} showResetButton={true} />)

      expect(
        screen.getByRole('button', { name: 'Reset statistics' })
      ).toBeInTheDocument()
    })

    it('should show reset button by default when showResetButton is not provided', () => {
      render(<AdjectiveActions {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: 'Reset statistics' })
      ).toBeInTheDocument()
    })

    it('should render only two buttons when showResetButton is false', () => {
      render(<AdjectiveActions {...defaultProps} showResetButton={false} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(2)
    })
  })

  describe('Disabled State', () => {
    it('should disable reset button when hasStatistics is false', () => {
      render(<AdjectiveActions {...defaultProps} hasStatistics={false} />)

      const resetButton = screen.getByRole('button', {
        name: 'Reset statistics',
      })
      expect(resetButton).toBeDisabled()
    })

    it('should enable reset button when hasStatistics is true', () => {
      render(<AdjectiveActions {...defaultProps} hasStatistics={true} />)

      const resetButton = screen.getByRole('button', {
        name: 'Reset statistics',
      })
      expect(resetButton).not.toBeDisabled()
    })

    it('should not call onResetStatistics when disabled button is clicked', () => {
      render(<AdjectiveActions {...defaultProps} hasStatistics={false} />)

      const resetButton = screen.getByRole('button', {
        name: 'Reset statistics',
      })
      fireEvent.click(resetButton)

      expect(mockOnResetStatistics).not.toHaveBeenCalled()
    })

    it('should keep show answer button enabled regardless of hasStatistics', () => {
      render(<AdjectiveActions {...defaultProps} hasStatistics={false} />)

      const showAnswerButton = screen.getByLabelText('Show all answers')
      expect(showAnswerButton).not.toBeDisabled()
    })

    it('should keep clear input button enabled regardless of hasStatistics', () => {
      render(<AdjectiveActions {...defaultProps} hasStatistics={false} />)

      const clearButton = screen.getByLabelText('Clear all fields')
      expect(clearButton).not.toBeDisabled()
    })
  })

  describe('Different Adjective IDs', () => {
    it('should handle different adjectiveId values correctly', () => {
      const customProps = { ...defaultProps, adjectiveId: 'custom-id-456' }
      render(<AdjectiveActions {...customProps} />)

      fireEvent.click(screen.getByLabelText('Show all answers'))
      fireEvent.click(screen.getByLabelText('Clear all fields'))
      fireEvent.click(screen.getByRole('button', { name: 'Reset statistics' }))

      expect(mockOnShowAnswer).toHaveBeenCalledWith('custom-id-456')
      expect(mockOnClearInput).toHaveBeenCalledWith('custom-id-456')
      expect(mockOnResetStatistics).toHaveBeenCalledWith('custom-id-456')
    })
  })

  describe('Button Sizes', () => {
    it('should render all buttons with small size', () => {
      render(<AdjectiveActions {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        expect(button).toHaveClass('MuiIconButton-sizeSmall')
      })
    })
  })

  describe('Button Colors', () => {
    it('should render show answer button with primary color', () => {
      render(<AdjectiveActions {...defaultProps} />)

      const button = screen.getByLabelText('Show all answers')
      expect(button).toHaveClass('MuiIconButton-colorPrimary')
    })

    it('should render clear input button with default color', () => {
      render(<AdjectiveActions {...defaultProps} />)

      const button = screen.getByLabelText('Clear all fields')
      expect(button).not.toHaveClass('MuiIconButton-colorPrimary')
    })

    it('should render reset statistics button with default color', () => {
      render(<AdjectiveActions {...defaultProps} />)

      const button = screen.getByRole('button', { name: 'Reset statistics' })
      expect(button).not.toHaveClass('MuiIconButton-colorPrimary')
    })
  })

  describe('Accessibility', () => {
    it('should have all buttons with accessible roles', () => {
      render(<AdjectiveActions {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(3)
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('type', 'button')
      })
    })

    it('should have tooltips with descriptive text', () => {
      render(<AdjectiveActions {...defaultProps} />)

      expect(screen.getByLabelText('Show all answers')).toBeInTheDocument()
      expect(screen.getByLabelText('Clear all fields')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Reset statistics' })
      ).toBeInTheDocument()
    })

    it('should maintain focus on buttons when clicked', () => {
      render(<AdjectiveActions {...defaultProps} />)

      const button = screen.getByLabelText('Show all answers')
      button.focus()

      expect(document.activeElement).toBe(button)
    })
  })

  describe('Component Structure', () => {
    it('should render buttons in a flex container with gap', () => {
      const { container } = render(<AdjectiveActions {...defaultProps} />)

      const box = container.querySelector('.MuiBox-root')
      expect(box).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string as adjectiveId', () => {
      const customProps = { ...defaultProps, adjectiveId: '' }
      render(<AdjectiveActions {...customProps} />)

      fireEvent.click(screen.getByLabelText('Show all answers'))

      expect(mockOnShowAnswer).toHaveBeenCalledWith('')
    })

    it('should handle special characters in adjectiveId', () => {
      const customProps = { ...defaultProps, adjectiveId: 'id-with-@#$-chars' }
      render(<AdjectiveActions {...customProps} />)

      fireEvent.click(screen.getByLabelText('Clear all fields'))

      expect(mockOnClearInput).toHaveBeenCalledWith('id-with-@#$-chars')
    })
  })

  describe('React.memo Behavior', () => {
    it('should not re-render when props do not change', () => {
      const { rerender } = render(<AdjectiveActions {...defaultProps} />)

      const firstButton = screen.getByLabelText('Show all answers')

      rerender(<AdjectiveActions {...defaultProps} />)

      const secondButton = screen.getByLabelText('Show all answers')

      expect(firstButton).toBe(secondButton)
    })
  })
})
