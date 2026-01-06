import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'
import { verbIdSchema } from '@/lib/validation/verbs'
import { z } from 'zod'

// DELETE /api/verbs/conjugations/statistics/[verbId] - Reset conjugation statistics for a verb
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ verbId: string }> }
) {
  return withAuth(async (request: NextRequest, userId: string) => {
    try {
      const { verbId} = await context.params

      // Validate verbId
      verbIdSchema.parse({ verbId })

      // Delete all conjugation statistics for this user and verb
      await prisma.conjugationStatistic.deleteMany({
        where: {
          userId,
          verbId,
        },
      })

      return NextResponse.json(
        {
          message: 'Conjugation statistics reset successfully',
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
