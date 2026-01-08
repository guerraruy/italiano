import { NextRequest, NextResponse } from 'next/server'

import { withAdmin } from '@/lib/auth'
import { handleApiError, ValidationError } from '@/lib/errors'
import { nounService } from '@/lib/services'
import { updateNounSchema } from '@/lib/validation/nouns'

// PATCH /api/admin/nouns/[nounId] - Update a noun
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ nounId: string }> }
) {
  return withAdmin(async () => {
    try {
      const { nounId } = await context.params

      if (!nounId) {
        throw new ValidationError('Noun ID is required')
      }

      const body = await request.json()

      // Validate input
      const validatedData = updateNounSchema.parse(body)

      // Use noun service to update noun
      const updatedNoun = await nounService.updateNoun(nounId, validatedData)

      return NextResponse.json({
        message: 'Noun updated successfully',
        noun: updatedNoun,
      })
    } catch (error) {
      return handleApiError(error)
    }
  })(request)
}

// DELETE /api/admin/nouns/[nounId] - Delete a noun
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ nounId: string }> }
) {
  return withAdmin(async () => {
    try {
      const { nounId } = await context.params

      if (!nounId) {
        throw new ValidationError('Noun ID is required')
      }

      // Use noun service to delete noun
      await nounService.deleteNoun(nounId)

      return NextResponse.json({
        message: 'Noun deleted successfully',
      })
    } catch (error) {
      return handleApiError(error)
    }
  })(request)
}
