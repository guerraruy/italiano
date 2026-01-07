import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { withAdmin } from '@/lib/auth'
import { verbService } from '@/lib/services'
import { updateConjugationSchema } from '@/lib/validation/verbs'

// PATCH /api/admin/verbs/conjugations/[conjugationId] - Update a conjugation
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ conjugationId: string }> }
) {
  return withAdmin(async (request: NextRequest, userId: string) => {
    try {
      const { conjugationId } = await context.params

      if (!conjugationId) {
        return NextResponse.json(
          { error: 'Conjugation ID is required' },
          { status: 400 }
        )
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
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.issues },
          { status: 400 }
        )
      }

      if (error instanceof Error && error.message === 'Conjugation not found') {
        return NextResponse.json(
          { error: 'Conjugation not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to update conjugation' },
        { status: 500 }
      )
    }
  })(request)
}

// DELETE /api/admin/verbs/conjugations/[conjugationId] - Delete a conjugation
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ conjugationId: string }> }
) {
  return withAdmin(async (request: NextRequest, userId: string) => {
    try {
      const { conjugationId } = await context.params

      if (!conjugationId) {
        return NextResponse.json(
          { error: 'Conjugation ID is required' },
          { status: 400 }
        )
      }

      // Use verb service to delete conjugation
      await verbService.deleteConjugation(conjugationId)

      return NextResponse.json({
        message: 'Conjugation deleted successfully',
      })
    } catch (error) {
      if (error instanceof Error && error.message === 'Conjugation not found') {
        return NextResponse.json(
          { error: 'Conjugation not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to delete conjugation' },
        { status: 500 }
      )
    }
  })(request)
}
