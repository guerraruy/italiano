import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { withAdmin } from '@/lib/auth'
import { verbService } from '@/lib/services'
import { updateVerbSchema, verbIdSchema } from '@/lib/validation/verbs'

// PATCH /api/admin/verbs/[verbId] - Update a verb
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ verbId: string }> }
) {
  return withAdmin(async (request: NextRequest, userId: string) => {
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
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.issues },
          { status: 400 }
        )
      }

      if (error instanceof Error) {
        if (error.message === 'Verb not found') {
          return NextResponse.json({ error: 'Verb not found' }, { status: 404 })
        }
        if (error.message === 'A verb with this Italian name already exists') {
          return NextResponse.json(
            { error: 'A verb with this Italian name already exists' },
            { status: 409 }
          )
        }
      }

      return NextResponse.json(
        { error: 'Failed to update verb' },
        { status: 500 }
      )
    }
  })(request)
}

// DELETE /api/admin/verbs/[verbId] - Delete a verb
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ verbId: string }> }
) {
  return withAdmin(async (request: NextRequest, userId: string) => {
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
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.issues },
          { status: 400 }
        )
      }

      if (error instanceof Error && error.message === 'Verb not found') {
        return NextResponse.json({ error: 'Verb not found' }, { status: 404 })
      }

      return NextResponse.json(
        { error: 'Failed to delete verb' },
        { status: 500 }
      )
    }
  })(request)
}
