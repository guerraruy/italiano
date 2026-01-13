import React from 'react'

import { render, screen, fireEvent } from '@testing-library/react'

import '@testing-library/jest-dom'

import FormatInfoDialog from './FormatInfoDialog'

describe('FormatInfoDialog', () => {
  const mockOnClose = jest.fn()

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    description: 'This is the format description.',
    formatExample: '{\n  "key": "value"\n}',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders the dialog when open is true', () => {
      render(<FormatInfoDialog {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('does not render the dialog content when open is false', () => {
      render(<FormatInfoDialog {...defaultProps} open={false} />)

      expect(
        screen.queryByText('JSON Format Information')
      ).not.toBeInTheDocument()
    })

    it('displays the default title when no title is provided', () => {
      render(<FormatInfoDialog {...defaultProps} />)

      expect(screen.getByText('JSON Format Information')).toBeInTheDocument()
    })

    it('displays a custom title when provided', () => {
      const customTitle = 'Custom Format Title'
      render(<FormatInfoDialog {...defaultProps} title={customTitle} />)

      expect(screen.getByText(customTitle)).toBeInTheDocument()
      expect(
        screen.queryByText('JSON Format Information')
      ).not.toBeInTheDocument()
    })

    it('displays the description', () => {
      render(<FormatInfoDialog {...defaultProps} />)

      expect(
        screen.getByText('This is the format description.')
      ).toBeInTheDocument()
    })

    it('displays the format example', () => {
      render(<FormatInfoDialog {...defaultProps} />)

      expect(screen.getByText(/"key": "value"/)).toBeInTheDocument()
    })

    it('renders the info icon', () => {
      render(<FormatInfoDialog {...defaultProps} />)

      expect(screen.getByTestId('InfoIcon')).toBeInTheDocument()
    })

    it('renders the Close button', () => {
      render(<FormatInfoDialog {...defaultProps} />)

      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
    })
  })

  describe('button interactions', () => {
    it('calls onClose when Close button is clicked', () => {
      render(<FormatInfoDialog {...defaultProps} />)

      const closeButton = screen.getByRole('button', { name: /close/i })
      fireEvent.click(closeButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when Escape key is pressed', () => {
      render(<FormatInfoDialog {...defaultProps} />)

      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })

      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('has proper dialog role', () => {
      render(<FormatInfoDialog {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('has accessible dialog title', () => {
      render(<FormatInfoDialog {...defaultProps} />)

      expect(
        screen.getByRole('heading', { name: /json format information/i })
      ).toBeInTheDocument()
    })

    it('has accessible dialog title with custom title', () => {
      const customTitle = 'Import Format Help'
      render(<FormatInfoDialog {...defaultProps} title={customTitle} />)

      expect(
        screen.getByRole('heading', { name: /import format help/i })
      ).toBeInTheDocument()
    })
  })

  describe('content formatting', () => {
    it('renders format example in a pre element for monospace formatting', () => {
      render(<FormatInfoDialog {...defaultProps} />)

      const preElement = screen.getByText(/"key": "value"/)
      expect(preElement.tagName.toLowerCase()).toBe('pre')
    })

    it('preserves whitespace in format example', () => {
      const multiLineExample = `{
  "italian": "cane",
  "english": "dog",
  "gender": "masculine"
}`
      render(
        <FormatInfoDialog {...defaultProps} formatExample={multiLineExample} />
      )

      expect(screen.getByText(/"italian": "cane"/)).toBeInTheDocument()
      expect(screen.getByText(/"gender": "masculine"/)).toBeInTheDocument()
    })
  })
})
