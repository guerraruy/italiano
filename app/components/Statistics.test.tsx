import { render, screen } from '@testing-library/react'

import { Statistics } from './Statistics'

describe('Statistics', () => {
  describe('Rendering', () => {
    it('should render correct and wrong statistics', () => {
      render(<Statistics correct={5} wrong={3} />)

      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('should render with zero values', () => {
      render(<Statistics correct={0} wrong={0} />)

      expect(screen.getAllByText('0')).toHaveLength(2)
    })

    it('should render with large numbers', () => {
      render(<Statistics correct={999} wrong={888} />)

      expect(screen.getByText('999')).toBeInTheDocument()
      expect(screen.getByText('888')).toBeInTheDocument()
    })

    it('should render correct icon', () => {
      const { container } = render(<Statistics correct={1} wrong={1} />)

      const checkIcon = container.querySelector('[data-testid="CheckIcon"]')
      expect(checkIcon).toBeInTheDocument()
    })

    it('should render wrong icon', () => {
      const { container } = render(<Statistics correct={1} wrong={1} />)

      const closeIcon = container.querySelector('[data-testid="CloseIcon"]')
      expect(closeIcon).toBeInTheDocument()
    })
  })

  describe('Tooltips', () => {
    it('should have tooltip for correct attempts', () => {
      render(<Statistics correct={5} wrong={3} />)

      const tooltip = screen.getByLabelText('Correct attempts')
      expect(tooltip).toBeInTheDocument()
    })

    it('should have tooltip for wrong attempts', () => {
      render(<Statistics correct={5} wrong={3} />)

      const tooltip = screen.getByLabelText('Wrong attempts')
      expect(tooltip).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should apply success color to correct attempts', () => {
      const { container } = render(<Statistics correct={5} wrong={3} />)

      const correctBox = screen.getByText('5').parentElement
      // Material-UI resolves success.main to rgb(46, 125, 50)
      expect(correctBox).toHaveStyle({ color: 'rgb(46, 125, 50)' })
    })

    it('should apply error color to wrong attempts', () => {
      const { container } = render(<Statistics correct={5} wrong={3} />)

      const wrongBox = screen.getByText('3').parentElement
      // Material-UI resolves error.main to rgb(211, 47, 47)
      expect(wrongBox).toHaveStyle({ color: 'rgb(211, 47, 47)' })
    })

    it('should render both statistics in vertical layout', () => {
      const { container } = render(<Statistics correct={5} wrong={3} />)

      const statisticsBox = container.firstChild as HTMLElement
      expect(statisticsBox).toHaveStyle({
        display: 'flex',
        flexDirection: 'column',
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle only correct attempts', () => {
      render(<Statistics correct={10} wrong={0} />)

      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should handle only wrong attempts', () => {
      render(<Statistics correct={0} wrong={15} />)

      expect(screen.getByText('0')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument()
    })

    it('should render with same values for both statistics', () => {
      render(<Statistics correct={7} wrong={7} />)

      expect(screen.getAllByText('7')).toHaveLength(2)
    })
  })

  describe('Accessibility', () => {
    it('should have meaningful text content for screen readers', () => {
      render(<Statistics correct={5} wrong={3} />)

      expect(screen.getByText('5')).toBeVisible()
      expect(screen.getByText('3')).toBeVisible()
    })

    it('should have aria-labels for accessibility', () => {
      render(<Statistics correct={5} wrong={3} />)

      expect(screen.getByLabelText('Correct attempts')).toBeInTheDocument()
      expect(screen.getByLabelText('Wrong attempts')).toBeInTheDocument()
    })
  })
})
