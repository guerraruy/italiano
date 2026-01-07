import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { withAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateNounSchema } from '@/lib/validation/nouns'

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
      const { italian, singolare, plurale } = validatedData

      // Check if noun exists
      const existingNoun = await prisma.noun.findUnique({
        where: { id: nounId },
      })

      if (!existingNoun) {
        return NextResponse.json({ error: 'Noun not found' }, { status: 404 })
      }

      // Check if the new italian name conflicts with another noun
      if (italian !== existingNoun.italian) {
        const conflictNoun = await prisma.noun.findUnique({
          where: { italian },
        })

        if (conflictNoun) {
          return NextResponse.json(
            { error: 'A noun with this Italian name already exists' },
            { status: 409 }
          )
        }
      }

      // Update noun
      const updatedNoun = await prisma.noun.update({
        where: { id: nounId },
        data: {
          italian,
          singolare: singolare as Prisma.JsonObject,
          plurale: plurale as Prisma.JsonObject,
        },
      })

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

      // Check if noun exists
      const noun = await prisma.noun.findUnique({
        where: { id: nounId },
      })

      if (!noun) {
        return NextResponse.json({ error: 'Noun not found' }, { status: 404 })
      }

      // Delete noun (will cascade delete statistics)
      await prisma.noun.delete({
        where: { id: nounId },
      })

      return NextResponse.json({
        message: 'Noun deleted successfully',
      })
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to delete noun' },
        { status: 500 }
      )
    }
  })(request)
}
