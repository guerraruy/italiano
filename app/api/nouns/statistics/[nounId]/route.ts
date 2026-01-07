import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { withAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { nounIdSchema } from '@/lib/validation/nouns'

// DELETE /api/nouns/statistics/[nounId] - Reset noun statistics for a specific noun
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ nounId: string }> }
) {
  return withAuth(async (request: NextRequest, userId: string) => {
    try {
      const { nounId } = await context.params

      // Validate nounId
      nounIdSchema.parse({ nounId })

      // Verify noun exists
      const noun = await prisma.noun.findUnique({
        where: { id: nounId },
      })

      if (!noun) {
        return NextResponse.json({ error: 'Noun not found' }, { status: 404 })
      }

      // Delete the noun statistics for this user and noun
      await prisma.nounStatistic.deleteMany({
        where: {
          userId,
          nounId,
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
