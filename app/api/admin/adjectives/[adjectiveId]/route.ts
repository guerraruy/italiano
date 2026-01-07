import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { withAdmin } from '@/lib/auth'
import { adjectiveService } from '@/lib/services'
import { updateAdjectiveSchema } from '@/lib/validation/adjectives'

// PATCH endpoint to update an adjective
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ adjectiveId: string }> }
) {
  return withAdmin(async (request: NextRequest, userId: string) => {
    try {
      const { adjectiveId } = await context.params

      if (!adjectiveId) {
        return NextResponse.json(
          { error: 'Adjective ID is required' },
          { status: 400 }
        )
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
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.issues },
          { status: 400 }
        )
      }

      if (error instanceof Error) {
        if (error.message === 'Adjective not found') {
          return NextResponse.json(
            { error: 'Adjective not found' },
            { status: 404 }
          )
        }
        if (
          error.message === 'An adjective with this Italian name already exists'
        ) {
          return NextResponse.json(
            { error: 'An adjective with this Italian name already exists' },
            { status: 409 }
          )
        }
      }

      return NextResponse.json(
        { error: 'Failed to update adjective' },
        { status: 500 }
      )
    }
  })(request)
}

// DELETE endpoint to delete an adjective
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ adjectiveId: string }> }
) {
  return withAdmin(async (request: NextRequest, userId: string) => {
    try {
      const { adjectiveId } = await context.params

      if (!adjectiveId) {
        return NextResponse.json(
          { error: 'Adjective ID is required' },
          { status: 400 }
        )
      }

      // Use adjective service to delete adjective
      await adjectiveService.deleteAdjective(adjectiveId)

      return NextResponse.json({
        message: 'Adjective deleted successfully',
      })
    } catch (error) {
      if (error instanceof Error && error.message === 'Adjective not found') {
        return NextResponse.json(
          { error: 'Adjective not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to delete adjective' },
        { status: 500 }
      )
    }
  })(request)
}
