import { NextRequest, NextResponse } from 'next/server'

import { withAdmin } from '@/lib/auth'
import { handleApiError, ValidationError } from '@/lib/errors'
import { adjectiveService } from '@/lib/services'
import { updateAdjectiveSchema } from '@/lib/validation/adjectives'

// PATCH endpoint to update an adjective
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ adjectiveId: string }> }
) {
  return withAdmin(async () => {
    try {
      const { adjectiveId } = await context.params

      if (!adjectiveId) {
        throw new ValidationError('Adjective ID is required')
      }

      const body = await request.json()

      // Validate input
      const validatedData = updateAdjectiveSchema.parse(body)

      // Use adjective service to update adjective
      const updatedAdjective = await adjectiveService.updateAdjective(
        adjectiveId,
        validatedData
      )

      return NextResponse.json({
        message: 'Adjective updated successfully',
        adjective: updatedAdjective,
      })
    } catch (error) {
      return handleApiError(error)
    }
  })(request)
}

// DELETE endpoint to delete an adjective
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ adjectiveId: string }> }
) {
  return withAdmin(async () => {
    try {
      const { adjectiveId } = await context.params

      if (!adjectiveId) {
        throw new ValidationError('Adjective ID is required')
      }

      // Use adjective service to delete adjective
      await adjectiveService.deleteAdjective(adjectiveId)

      return NextResponse.json({
        message: 'Adjective deleted successfully',
      })
    } catch (error) {
      return handleApiError(error)
    }
  })(request)
}
