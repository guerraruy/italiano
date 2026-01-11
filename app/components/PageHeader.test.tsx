import { render, screen } from '@testing-library/react'

import { PageHeader } from './PageHeader'

describe('PageHeader', () => {
  describe('Rendering', () => {
    it('should render the title text', () => {
      render(<PageHeader title="Test Title" />)

      expect(screen.getByText('Test Title')).toBeInTheDocument()
    })

    it('should render title as h1 element', () => {
      render(<PageHeader title="Test Title" />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Test Title')
    })

    it('should render title with uppercase transformation', () => {
      render(<PageHeader title="test title" />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveStyle({ textTransform: 'uppercase' })
    })

    it('should apply h5 variant typography', () => {
      render(<PageHeader title="Test Title" />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveClass('MuiTypography-h5')
    })

    it('should render with Typography component', () => {
      render(<PageHeader title="Test Title" />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveClass('MuiTypography-root')
    })
  })

  describe('Different Titles', () => {
    it('should handle empty string title', () => {
      render(<PageHeader title="" />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('')
    })

    it('should handle title with special characters', () => {
      render(<PageHeader title="Test & Title!" />)

      expect(screen.getByText('Test & Title!')).toBeInTheDocument()
    })

    it('should handle title with numbers', () => {
      render(<PageHeader title="Title 123" />)

      expect(screen.getByText('Title 123')).toBeInTheDocument()
    })

    it('should handle long title text', () => {
      const longTitle =
        'This is a very long title that might wrap to multiple lines'
      render(<PageHeader title={longTitle} />)

      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('should handle title with Unicode characters', () => {
      render(<PageHeader title="Italiano 🇮🇹" />)

      expect(screen.getByText('Italiano 🇮🇹')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading role', () => {
      render(<PageHeader title="Accessible Title" />)

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })

    it('should use semantic h1 element for main heading', () => {
      const { container } = render(<PageHeader title="Main Title" />)

      const h1 = container.querySelector('h1')
      expect(h1).toBeInTheDocument()
      expect(h1).toHaveTextContent('Main Title')
    })
  })

  describe('Styling', () => {
    it('should render with flex container', () => {
      const { container } = render(<PageHeader title="Test" />)

      // HeaderBox should be the first child
      const headerBox = container.firstChild
      expect(headerBox).toBeInTheDocument()
    })
  })
})
