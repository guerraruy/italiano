import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { withAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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
      const { italian, regular, reflexive, tr_ptBR, tr_en } = validatedData

      // Check if verb exists
      const existingVerb = await prisma.verb.findUnique({
        where: { id: verbId },
      })

      if (!existingVerb) {
        return NextResponse.json({ error: 'Verb not found' }, { status: 404 })
      }

      // Check if the new italian name conflicts with another verb
      if (italian !== existingVerb.italian) {
        const conflictVerb = await prisma.verb.findUnique({
          where: { italian },
        })

        if (conflictVerb) {
          return NextResponse.json(
            { error: 'A verb with this Italian name already exists' },
            { status: 409 }
          )
        }
      }

      // Update verb
      const updatedVerb = await prisma.verb.update({
        where: { id: verbId },
        data: {
          italian,
          regular,
          reflexive,
          tr_ptBR,
          tr_en: tr_en || null,
        },
      })

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

      // Check if verb exists
      const verb = await prisma.verb.findUnique({
        where: { id: verbId },
      })

      if (!verb) {
        return NextResponse.json({ error: 'Verb not found' }, { status: 404 })
      }

      // Delete verb (will cascade delete statistics and conjugations)
      await prisma.verb.delete({
        where: { id: verbId },
      })

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

      return NextResponse.json(
        { error: 'Failed to delete verb' },
        { status: 500 }
      )
    }
  })(request)
}
