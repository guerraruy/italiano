import { NextRequest, NextResponse } from 'next/server'

import { withAdmin } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'
import { verbService } from '@/lib/services'
import { updateVerbSchema, verbIdSchema } from '@/lib/validation/verbs'

// PATCH /api/admin/verbs/[verbId] - Update a verb
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ verbId: string }> }
) {
  return withAdmin(async () => {
    try {
      const { verbId } = await context.params

      // Validate verbId
      verbIdSchema.parse({ verbId })

      const body = await request.json()

      // Validate input
      const validatedData = updateVerbSchema.parse(body)

      // Use verb service to update verb
      const updatedVerb = await verbService.updateVerb(verbId, validatedData)

      return NextResponse.json({
        message: 'Verb updated successfully',
        verb: updatedVerb,
      })
    } catch (error) {
      return handleApiError(error)
    }
  })(request)
}

// DELETE /api/admin/verbs/[verbId] - Delete a verb
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ verbId: string }> }
) {
  return withAdmin(async () => {
    try {
      const { verbId } = await context.params

      // Validate verbId
      verbIdSchema.parse({ verbId })

      // Use verb service to delete verb
      await verbService.deleteVerb(verbId)

      return NextResponse.json({
        message: 'Verb deleted successfully',
      })
    } catch (error) {
      return handleApiError(error)
    }
  })(request)
}
