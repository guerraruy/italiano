import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { withAuth } from '@/lib/auth'
import { statisticsService, nounService } from '@/lib/services'
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
      const noun = await nounService.getNounById(nounId)

      if (!noun) {
        return NextResponse.json({ error: 'Noun not found' }, { status: 404 })
      }

      // Use statistics service to reset noun statistics
      await statisticsService.resetNounStatistics(userId, nounId)

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
