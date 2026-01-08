import { NextRequest, NextResponse } from 'next/server'

import { withAuth } from '@/lib/auth'
import { handleApiError, NotFoundError } from '@/lib/errors'
import { statisticsService, verbService } from '@/lib/services'
import { verbIdSchema } from '@/lib/validation/verbs'

// DELETE /api/verbs/statistics/[verbId] - Reset verb statistics for a specific verb
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ verbId: string }> }
) {
  return withAuth(async (_request: NextRequest, userId: string) => {
    try {
      const { verbId } = await context.params

      // Validate verbId
      verbIdSchema.parse({ verbId })

      // Verify verb exists
      const verb = await verbService.getVerbById(verbId)

      if (!verb) {
        throw new NotFoundError('Verb')
      }

      // Use statistics service to reset verb statistics
      await statisticsService.resetVerbStatistics(userId, verbId)

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
