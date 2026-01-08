import { NextRequest, NextResponse } from 'next/server'

import { withAdmin } from '@/lib/auth'
import { handleApiError, ValidationError } from '@/lib/errors'
import { verbService } from '@/lib/services'
import { updateConjugationSchema } from '@/lib/validation/verbs'

// PATCH /api/admin/verbs/conjugations/[conjugationId] - Update a conjugation
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ conjugationId: string }> }
) {
  return withAdmin(async () => {
    try {
      const { conjugationId } = await context.params

      if (!conjugationId) {
        throw new ValidationError('Conjugation ID is required')
      }

      const body = await request.json()

      // Validate input
      const validatedData = updateConjugationSchema.parse(body)
      const { conjugation } = validatedData

      // Use verb service to update conjugation
      const updated = await verbService.updateConjugation(
        conjugationId,
        conjugation
      )

      return NextResponse.json({
        message: 'Conjugation updated successfully',
        conjugation: updated,
      })
    } catch (error) {
      return handleApiError(error)
    }
  })(request)
}

// DELETE /api/admin/verbs/conjugations/[conjugationId] - Delete a conjugation
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ conjugationId: string }> }
) {
  return withAdmin(async () => {
    try {
      const { conjugationId } = await context.params

      if (!conjugationId) {
        throw new ValidationError('Conjugation ID is required')
      }

      // Use verb service to delete conjugation
      await verbService.deleteConjugation(conjugationId)

      return NextResponse.json({
        message: 'Conjugation deleted successfully',
      })
    } catch (error) {
      return handleApiError(error)
    }
  })(request)
}
