import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { withAdmin } from '@/lib/auth'
import { updateConjugationSchema } from '@/lib/validation/verbs'
import { z } from 'zod'

interface ConjugationData {
  [mood: string]: {
    [tense: string]:
      | {
          [person: string]: string
        }
      | string // For simple forms like Participio Presente/Passato
  }
}

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

      // Check if conjugation exists
      const existing = await prisma.verbConjugation.findUnique({
        where: { id: conjugationId },
        include: { verb: true },
      })

      if (!existing) {
        return NextResponse.json(
          { error: 'Conjugation not found' },
          { status: 404 }
        )
      }

      // Update conjugation
      const updated = await prisma.verbConjugation.update({
        where: { id: conjugationId },
        data: {
          conjugation: conjugation as Prisma.JsonObject,
        },
        include: { verb: true },
      })

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

      // Check if conjugation exists
      const conjugation = await prisma.verbConjugation.findUnique({
        where: { id: conjugationId },
        include: { verb: true },
      })

      if (!conjugation) {
        return NextResponse.json(
          { error: 'Conjugation not found' },
          { status: 404 }
        )
      }

      // Delete conjugation
      await prisma.verbConjugation.delete({
        where: { id: conjugationId },
      })

      return NextResponse.json({
        message: 'Conjugation deleted successfully',
      })
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to delete conjugation' },
        { status: 500 }
      )
    }
  })(request)
}
