import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { withAdmin } from '@/lib/auth'
import { updateAdjectiveSchema } from '@/lib/validation/adjectives'
import { z } from 'zod'

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
      const { italian, maschile, femminile } = validatedData

      // Check if adjective exists
      const existingAdjective = await prisma.adjective.findUnique({
        where: { id: adjectiveId },
      })

      if (!existingAdjective) {
        return NextResponse.json(
          { error: 'Adjective not found' },
          { status: 404 }
        )
      }

      // Check if the italian name is being changed and if it conflicts with another adjective
      if (italian !== existingAdjective.italian) {
        const conflictingAdjective = await prisma.adjective.findUnique({
          where: { italian },
        })

        if (conflictingAdjective && conflictingAdjective.id !== adjectiveId) {
          return NextResponse.json(
            { error: 'An adjective with this Italian name already exists' },
            { status: 409 }
          )
        }
      }

      // Update the adjective
      const updatedAdjective = await prisma.adjective.update({
        where: { id: adjectiveId },
        data: {
          italian,
          maschile: maschile as Prisma.JsonObject,
          femminile: femminile as Prisma.JsonObject,
        },
      })

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

      // Check if adjective exists
      const adjective = await prisma.adjective.findUnique({
        where: { id: adjectiveId },
      })

      if (!adjective) {
        return NextResponse.json(
          { error: 'Adjective not found' },
          { status: 404 }
        )
      }

      // Delete the adjective (will cascade delete statistics)
      await prisma.adjective.delete({
        where: { id: adjectiveId },
      })

      return NextResponse.json({
        message: 'Adjective deleted successfully',
      })
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to delete adjective' },
        { status: 500 }
      )
    }
  })(request)
}
