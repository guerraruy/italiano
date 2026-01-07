import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { withAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { adjectiveIdSchema } from '@/lib/validation/adjectives'

// DELETE /api/adjectives/statistics/[adjectiveId] - Reset adjective statistics
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ adjectiveId: string }> }
) {
  return withAuth(async (request: NextRequest, userId: string) => {
    try {
      const { adjectiveId } = await context.params

      // Validate adjectiveId
      adjectiveIdSchema.parse({ adjectiveId })

      // Verify adjective exists
      const adjective = await prisma.adjective.findUnique({
        where: { id: adjectiveId },
      })

      if (!adjective) {
        return NextResponse.json(
          { error: 'Adjective not found' },
          { status: 404 }
        )
      }

      // Delete the adjective statistics for this user and adjective
      await prisma.adjectiveStatistic.deleteMany({
        where: {
          userId,
          adjectiveId,
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
