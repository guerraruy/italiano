import { ZodError, z } from 'zod'

import { AppError } from './AppError'
import { handleApiError, isAppError, isOperationalError } from './errorHandler'

// Mock the logger to avoid console output during tests
jest.mock('../logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock NextResponse.json since it's not available in Jest environment
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}))

describe('errorHandler', () => {
  describe('handleApiError', () => {
    describe('with AppError instances', () => {
      it('should return correct status code and body for AppError', () => {
        const error = new AppError('Not found', 404, 'NOT_FOUND')
        const response = handleApiError(error)

        expect(response.status).toBe(404)
      })

      it('should include error message and code in response body', async () => {
        const error = new AppError(
          'Resource not found',
          404,
          'RESOURCE_NOT_FOUND'
        )
        const response = handleApiError(error)
        const body = await response.json()

        expect(body).toEqual({
          error: 'Resource not found',
          code: 'RESOURCE_NOT_FOUND',
          statusCode: 404,
        })
      })

      it('should handle different status codes', async () => {
        const badRequest = new AppError('Invalid input', 400, 'BAD_REQUEST')
        const unauthorized = new AppError('Not authorized', 401, 'UNAUTHORIZED')
        const forbidden = new AppError('Access denied', 403, 'FORBIDDEN')

        expect(handleApiError(badRequest).status).toBe(400)
        expect(handleApiError(unauthorized).status).toBe(401)
        expect(handleApiError(forbidden).status).toBe(403)
      })
    })

    describe('with ZodError instances', () => {
      it('should return 400 status for validation errors', () => {
        const schema = z.object({ name: z.string() })
        let zodError: ZodError

        try {
          schema.parse({ name: 123 })
        } catch (e) {
          zodError = e as ZodError
        }

        const response = handleApiError(zodError!)
        expect(response.status).toBe(400)
      })

      it('should include validation issues in response body', async () => {
        const schema = z.object({
          name: z.string(),
          age: z.number(),
        })
        let zodError: ZodError

        try {
          schema.parse({ name: 123, age: 'invalid' })
        } catch (e) {
          zodError = e as ZodError
        }

        const response = handleApiError(zodError!)
        const body = await response.json()

        expect(body.error).toBe('Validation failed')
        expect(body.code).toBe('VALIDATION_ERROR')
        expect(body.issues).toBeInstanceOf(Array)
        expect(body.issues.length).toBe(2)
        expect(body.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ field: 'name' }),
            expect.objectContaining({ field: 'age' }),
          ])
        )
      })

      it('should handle nested field paths', async () => {
        const schema = z.object({
          user: z.object({
            profile: z.object({
              email: z.string().email(),
            }),
          }),
        })
        let zodError: ZodError

        try {
          schema.parse({ user: { profile: { email: 'invalid' } } })
        } catch (e) {
          zodError = e as ZodError
        }

        const response = handleApiError(zodError!)
        const body = await response.json()

        expect(body.issues[0].field).toBe('user.profile.email')
      })
    })

    describe('with unknown errors', () => {
      it('should return 500 status for unknown errors', () => {
        const error = new Error('Something went wrong')
        const response = handleApiError(error)

        expect(response.status).toBe(500)
      })

      it('should return generic error message without exposing details', async () => {
        const error = new Error(
          'Database connection failed: password incorrect'
        )
        const response = handleApiError(error)
        const body = await response.json()

        expect(body.error).toBe('Internal server error')
        expect(body.code).toBe('INTERNAL_ERROR')
        expect(body).not.toHaveProperty('stack')
        expect(body.error).not.toContain('Database')
        expect(body.error).not.toContain('password')
      })

      it('should include requestId for debugging', async () => {
        const error = new Error('Unexpected error')
        const response = handleApiError(error)
        const body = await response.json()

        expect(body.requestId).toBeDefined()
        expect(typeof body.requestId).toBe('string')
        expect(body.requestId).toMatch(/^req_[a-z0-9]+_[a-z0-9]+$/)
      })

      it('should generate unique requestIds for different errors', async () => {
        const error1 = new Error('Error 1')
        const error2 = new Error('Error 2')

        const response1 = handleApiError(error1)
        const response2 = handleApiError(error2)

        const body1 = await response1.json()
        const body2 = await response2.json()

        expect(body1.requestId).not.toBe(body2.requestId)
      })

      it('should handle non-Error objects', async () => {
        const error = { custom: 'error object' }
        const response = handleApiError(error)
        const body = await response.json()

        expect(response.status).toBe(500)
        expect(body.error).toBe('Internal server error')
        expect(body.requestId).toBeDefined()
      })

      it('should handle string errors', async () => {
        const error = 'Something went wrong'
        const response = handleApiError(error)
        const body = await response.json()

        expect(response.status).toBe(500)
        expect(body.error).toBe('Internal server error')
        expect(body.requestId).toBeDefined()
      })

      it('should handle null and undefined', async () => {
        const nullResponse = handleApiError(null)
        const undefinedResponse = handleApiError(undefined)

        expect(nullResponse.status).toBe(500)
        expect(undefinedResponse.status).toBe(500)

        const nullBody = await nullResponse.json()
        const undefinedBody = await undefinedResponse.json()

        expect(nullBody.error).toBe('Internal server error')
        expect(undefinedBody.error).toBe('Internal server error')
      })
    })
  })

  describe('isAppError', () => {
    it('should return true for AppError instances', () => {
      const error = new AppError('Test error', 400, 'TEST_ERROR')
      expect(isAppError(error)).toBe(true)
    })

    it('should return false for regular Error instances', () => {
      const error = new Error('Regular error')
      expect(isAppError(error)).toBe(false)
    })

    it('should return false for ZodError instances', () => {
      const schema = z.string()
      let zodError: ZodError

      try {
        schema.parse(123)
      } catch (e) {
        zodError = e as ZodError
      }

      expect(isAppError(zodError!)).toBe(false)
    })

    it('should return false for non-error objects', () => {
      expect(isAppError({ message: 'fake error' })).toBe(false)
      expect(isAppError('string error')).toBe(false)
      expect(isAppError(null)).toBe(false)
      expect(isAppError(undefined)).toBe(false)
    })
  })

  describe('isOperationalError', () => {
    it('should return true for operational AppErrors', () => {
      const error = new AppError('User not found', 404, 'USER_NOT_FOUND', true)
      expect(isOperationalError(error)).toBe(true)
    })

    it('should return true by default for AppErrors', () => {
      const error = new AppError('Not found', 404, 'NOT_FOUND')
      expect(isOperationalError(error)).toBe(true)
    })

    it('should return false for non-operational AppErrors', () => {
      const error = new AppError('Database crashed', 500, 'DB_ERROR', false)
      expect(isOperationalError(error)).toBe(false)
    })

    it('should return false for regular Error instances', () => {
      const error = new Error('Regular error')
      expect(isOperationalError(error)).toBe(false)
    })

    it('should return false for non-error values', () => {
      expect(isOperationalError('string')).toBe(false)
      expect(isOperationalError(null)).toBe(false)
      expect(isOperationalError(undefined)).toBe(false)
      expect(isOperationalError({ isOperational: true })).toBe(false)
    })
  })
})
