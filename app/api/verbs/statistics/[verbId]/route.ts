import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'
import { verbIdSchema } from '@/lib/validation/verbs'
import { z } from 'zod'

// DELETE /api/verbs/statistics/[verbId] - Reset verb statistics for a specific verb
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ verbId: string }> }
) {
  return withAuth(async (request: NextRequest, userId: string) => {
    try {
      const { verbId } = await context.params

      // Validate verbId
      verbIdSchema.parse({ verbId })

      // Verify verb exists
      const verb = await prisma.verb.findUnique({
        where: { id: verbId },
      })

      if (!verb) {
        return NextResponse.json({ error: 'Verb not found' }, { status: 404 })
      }

      // Delete the verb statistics for this user and verb
      await prisma.verbStatistic.deleteMany({
        where: {
          userId,
          verbId,
        },
      })

      return NextResponse.json(
        {
          message: 'Statistics reset successfully',
        },
        { status: 200 }
      )
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.issues },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })(request)
}
