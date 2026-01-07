import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/auth'
import { nounService } from '@/lib/services'
import { updateNounSchema } from '@/lib/validation/nouns'
import { z } from 'zod'

// PATCH /api/admin/nouns/[nounId] - Update a noun
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ nounId: string }> }
) {
  return withAdmin(async (request: NextRequest, userId: string) => {
    try {
      const { nounId } = await context.params

      if (!nounId) {
        return NextResponse.json(
          { error: 'Noun ID is required' },
          { status: 400 }
        )
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
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.issues },
          { status: 400 }
        )
      }

      if (error instanceof Error) {
        if (error.message === 'Noun not found') {
          return NextResponse.json({ error: 'Noun not found' }, { status: 404 })
        }
        if (error.message === 'A noun with this Italian name already exists') {
          return NextResponse.json(
            { error: 'A noun with this Italian name already exists' },
            { status: 409 }
          )
        }
      }

      return NextResponse.json(
        { error: 'Failed to update noun' },
        { status: 500 }
      )
    }
  })(request)
}

// DELETE /api/admin/nouns/[nounId] - Delete a noun
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ nounId: string }> }
) {
  return withAdmin(async (request: NextRequest, userId: string) => {
    try {
      const { nounId } = await context.params

      if (!nounId) {
        return NextResponse.json(
          { error: 'Noun ID is required' },
          { status: 400 }
        )
      }

      // Use noun service to delete noun
      await nounService.deleteNoun(nounId)

      return NextResponse.json({
        message: 'Noun deleted successfully',
      })
    } catch (error) {
      if (error instanceof Error && error.message === 'Noun not found') {
        return NextResponse.json({ error: 'Noun not found' }, { status: 404 })
      }

      return NextResponse.json(
        { error: 'Failed to delete noun' },
        { status: 500 }
      )
    }
  })(request)
}
