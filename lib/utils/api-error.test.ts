import { extractApiErrorMessage } from './api-error'

describe('extractApiErrorMessage', () => {
  describe('with valid RTK Query error shape', () => {
    it('should extract error message from RTK Query error', () => {
      const error = { data: { error: 'Invalid credentials' } }
      const result = extractApiErrorMessage(error, 'Default message')

      expect(result).toBe('Invalid credentials')
    })

    it('should handle empty error message', () => {
      const error = { data: { error: '' } }
      const result = extractApiErrorMessage(error, 'Default message')

      expect(result).toBe('')
    })

    it('should preserve special characters in error message', () => {
      const error = {
        data: { error: 'Error: "Something" went <wrong> & failed!' },
      }
      const result = extractApiErrorMessage(error, 'Default message')

      expect(result).toBe('Error: "Something" went <wrong> & failed!')
    })

    it('should handle error with additional properties in data', () => {
      const error = {
        data: {
          error: 'Validation failed',
          statusCode: 400,
          details: ['field1', 'field2'],
        },
      }
      const result = extractApiErrorMessage(error, 'Default message')

      expect(result).toBe('Validation failed')
    })

    it('should handle error with additional top-level properties', () => {
      const error = {
        data: { error: 'Not found' },
        status: 404,
        originalStatus: 404,
      }
      const result = extractApiErrorMessage(error, 'Default message')

      expect(result).toBe('Not found')
    })
  })

  describe('with invalid error shapes', () => {
    it('should return default message for null error', () => {
      const result = extractApiErrorMessage(null, 'Default message')

      expect(result).toBe('Default message')
    })

    it('should return default message for undefined error', () => {
      const result = extractApiErrorMessage(undefined, 'Default message')

      expect(result).toBe('Default message')
    })

    it('should return default message for primitive values', () => {
      expect(extractApiErrorMessage('string error', 'Default')).toBe('Default')
      expect(extractApiErrorMessage(123, 'Default')).toBe('Default')
      expect(extractApiErrorMessage(true, 'Default')).toBe('Default')
    })

    it('should return default message when data property is missing', () => {
      const error = { message: 'Error without data' }
      const result = extractApiErrorMessage(error, 'Default message')

      expect(result).toBe('Default message')
    })

    it('should return default message when data is null', () => {
      const error = { data: null }
      const result = extractApiErrorMessage(error, 'Default message')

      expect(result).toBe('Default message')
    })

    it('should return default message when data is not an object', () => {
      expect(extractApiErrorMessage({ data: 'string' }, 'Default')).toBe(
        'Default'
      )
      expect(extractApiErrorMessage({ data: 123 }, 'Default')).toBe('Default')
      expect(extractApiErrorMessage({ data: true }, 'Default')).toBe('Default')
      expect(extractApiErrorMessage({ data: [] }, 'Default')).toBe('Default')
    })

    it('should return default message when error property is missing from data', () => {
      const error = { data: { message: 'Wrong property name' } }
      const result = extractApiErrorMessage(error, 'Default message')

      expect(result).toBe('Default message')
    })

    it('should return default message when error property is not a string', () => {
      expect(extractApiErrorMessage({ data: { error: 123 } }, 'Default')).toBe(
        'Default'
      )
      expect(extractApiErrorMessage({ data: { error: null } }, 'Default')).toBe(
        'Default'
      )
      expect(
        extractApiErrorMessage({ data: { error: undefined } }, 'Default')
      ).toBe('Default')
      expect(
        extractApiErrorMessage(
          { data: { error: { nested: 'object' } } },
          'Default'
        )
      ).toBe('Default')
      expect(
        extractApiErrorMessage({ data: { error: ['array'] } }, 'Default')
      ).toBe('Default')
    })

    it('should return default message for regular Error objects', () => {
      const error = new Error('Standard error')
      const result = extractApiErrorMessage(error, 'Default message')

      expect(result).toBe('Default message')
    })

    it('should return default message for empty objects', () => {
      expect(extractApiErrorMessage({}, 'Default')).toBe('Default')
      expect(extractApiErrorMessage({ data: {} }, 'Default')).toBe('Default')
    })
  })

  describe('default message handling', () => {
    it('should return different default messages as specified', () => {
      const error = null

      expect(extractApiErrorMessage(error, 'Login failed')).toBe('Login failed')
      expect(extractApiErrorMessage(error, 'Registration error')).toBe(
        'Registration error'
      )
      expect(extractApiErrorMessage(error, '')).toBe('')
    })

    it('should work with empty string as default message', () => {
      const error = { invalid: 'shape' }
      const result = extractApiErrorMessage(error, '')

      expect(result).toBe('')
    })
  })
})
