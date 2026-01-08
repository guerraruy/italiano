import { NextRequest, NextResponse } from 'next/server'

import { withAuth } from '@/lib/auth'
import { handleApiError, NotFoundError } from '@/lib/errors'
import { nounService, statisticsService } from '@/lib/services'
import { nounIdSchema } from '@/lib/validation/nouns'

// DELETE /api/nouns/statistics/[nounId] - Reset noun statistics for a specific noun
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ nounId: string }> }
) {
  return withAuth(async (_request: NextRequest, userId: string) => {
    try {
      const { nounId } = await context.params

      // Validate nounId
      nounIdSchema.parse({ nounId })

      // Verify noun exists
      const noun = await nounService.getNounById(nounId)

      if (!noun) {
        throw new NotFoundError('Noun')
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
      return handleApiError(error)
    }
  })(request)
}
