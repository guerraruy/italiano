import { NextRequest, NextResponse } from 'next/server'

import { withAuth } from '@/lib/auth'
import { handleApiError, NotFoundError } from '@/lib/errors'
import { adjectiveService, statisticsService } from '@/lib/services'
import { adjectiveIdSchema } from '@/lib/validation/adjectives'

// DELETE /api/adjectives/statistics/[adjectiveId] - Reset adjective statistics for a specific adjective
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ adjectiveId: string }> }
) {
  return withAuth(async (_request: NextRequest, userId: string) => {
    try {
      const { adjectiveId } = await context.params

      // Validate adjectiveId
      adjectiveIdSchema.parse({ adjectiveId })

      // Verify adjective exists
      const adjective = await adjectiveService.getAdjectiveById(adjectiveId)

      if (!adjective) {
        throw new NotFoundError('Adjective')
      }

      // Use statistics service to reset adjective statistics
      await statisticsService.resetAdjectiveStatistics(userId, adjectiveId)

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
